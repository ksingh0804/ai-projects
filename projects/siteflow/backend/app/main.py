"""FastAPI application.

The UI on port 5173 may call only this process. It does not call S3,
LangGraph, or a model directly. That split is the platform boundary:
product on one side, agent runtime on the other.
"""

from __future__ import annotations

import logging
import time
import uuid
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.api.approvals import router as approvals_router
from app.api.chat import router as chat_router
from app.api.docs import router as docs_router
from app.config import Settings
from app.engine import Engine, build_engine, request_id_var
from app.errors import SiteflowError
from app.rag.sample_docs import write_sample_pack

logger = logging.getLogger("siteflow")


def create_app(settings: Settings | None = None, engine: Engine | None = None) -> FastAPI:
    settings = settings or Settings(seed_demo=True)

    @asynccontextmanager
    async def lifespan(app: FastAPI):
        yield
        app.state.engine.close()

    app = FastAPI(title="SiteFlow", version="0.1.0", lifespan=lifespan)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.include_router(docs_router)
    app.include_router(chat_router)
    app.include_router(approvals_router)

    if engine is None:
        if settings.seed_demo and not settings.sample_dir.exists():
            write_sample_pack(settings.sample_dir)
        engine = build_engine(settings)
        if settings.seed_demo and not engine.store.list_files("demo"):
            _seed_demo(engine)
    app.state.engine = engine
    app.state.settings = settings

    @app.middleware("http")
    async def access_log(request: Request, call_next):
        request_id = request.headers.get("x-request-id") or str(uuid.uuid4())
        token = request_id_var.set(request_id)
        started = time.perf_counter()
        try:
            response = await call_next(request)
        except Exception:
            request_id_var.reset(token)
            raise
        request_id_var.reset(token)
        elapsed_ms = (time.perf_counter() - started) * 1000
        logger.info(
            "request_id=%s method=%s path=%s status=%s latency_ms=%.1f",
            request_id,
            request.method,
            request.url.path,
            getattr(response, "status_code", 0),
            elapsed_ms,
        )
        response.headers["X-Request-ID"] = request_id
        return response

    @app.get("/api/health")
    def health() -> dict:
        return {"status": "ok", "mode": settings.mode, "use_aws": settings.use_aws}

    @app.exception_handler(SiteflowError)
    async def siteflow_error(_request: Request, exc: SiteflowError) -> JSONResponse:
        return JSONResponse(
            status_code=exc.status,
            content={"error": exc.code, "detail": exc.detail},
        )

    @app.exception_handler(RequestValidationError)
    async def validation_error(_request: Request, exc: RequestValidationError) -> JSONResponse:
        detail = "; ".join(str(err.get("msg", "invalid")) for err in exc.errors())
        return JSONResponse(
            status_code=422,
            content={"error": "invalid_request", "detail": detail},
        )

    @app.exception_handler(StarletteHTTPException)
    async def http_error(_request: Request, exc: StarletteHTTPException) -> JSONResponse:
        return JSONResponse(
            status_code=exc.status_code,
            content={"error": "http_error", "detail": str(exc.detail)},
        )

    @app.exception_handler(Exception)
    async def unexpected(_request: Request, exc: Exception) -> JSONResponse:
        logger.exception("unhandled error")
        return JSONResponse(
            status_code=500,
            content={"error": "internal_error", "detail": "The request failed."},
        )

    return app


def _seed_demo(engine: Engine) -> None:
    sample_dir = engine.settings.sample_dir
    if not any(sample_dir.glob("*.pdf")):
        write_sample_pack(sample_dir)
    for path in sorted(sample_dir.iterdir()):
        if path.suffix.lower() not in {".pdf", ".csv", ".txt"} or not path.is_file():
            continue
        engine.upload("demo", path.name, path.read_bytes())


app = create_app()
