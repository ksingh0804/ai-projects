"""SiteFlow API. The browser's only door."""

from __future__ import annotations

import os

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.approvals import router as approvals_router
from app.api.chat import router as chat_router
from app.api.docs import router as docs_router

app = FastAPI(title="SiteFlow")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(docs_router, prefix="/api")
app.include_router(chat_router, prefix="/api")
app.include_router(approvals_router, prefix="/api")


@app.get("/api/health")
def health():
    return {"status": "ok", "mode": os.getenv("SITEFLOW_MODE", "local")}


@app.exception_handler(Exception)
async def unhandled(_request, exc):
    if isinstance(exc, HTTPException):
        return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})
    return JSONResponse(
        status_code=500,
        content={"detail": "Something went wrong. Please try again."},
    )
