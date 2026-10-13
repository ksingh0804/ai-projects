import logging
from pathlib import Path

from fastapi.testclient import TestClient

from app.config import Settings
from app.engine import build_engine
from app.main import create_app
from app.pdfutil import build_text_pdf
from app.rag.ingest import extract_pages
from app.rag.sample_docs import MATERIALS_CSV, SAMPLE_PDFS, write_sample_pack


def _upload(client, project_id, filename, data, content_type):
    return client.post(
        f"/api/projects/{project_id}/documents",
        files={"file": (filename, data, content_type)},
    )


def test_health_and_cors(client):
    health = client.get("/api/health")
    assert health.status_code == 200
    assert health.json() == {"status": "ok", "mode": "local", "use_aws": False}
    assert health.headers["x-request-id"]
    cors = client.options(
        "/api/health",
        headers={
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "GET",
        },
    )
    assert cors.headers["access-control-allow-origin"] == "http://localhost:5173"


def test_upload_list_and_reject_bad_files(client, settings):
    spec = build_text_pdf([["Division 03 Cast-in-Place Concrete", "Curing: keep concrete wet for 7 days."]])
    saved = _upload(client, "demo", "Division 03.pdf", spec, "application/pdf")
    assert saved.status_code == 200
    body = saved.json()
    assert body["filename"] == "Division_03.pdf"
    assert body["chunks"] >= 1
    listed = client.get("/api/projects/demo/documents")
    assert listed.json()["documents"][0]["filename"] == "Division_03.pdf"

    empty_project = client.get("/api/projects/newjob/documents")
    assert empty_project.status_code == 200
    assert empty_project.json()["documents"] == []

    bad_type = _upload(client, "demo", "photo.exe", b"MZ", "application/octet-stream")
    assert bad_type.status_code == 400
    assert bad_type.json()["error"] == "unsupported_file_type"

    empty = _upload(client, "demo", "empty.txt", b"", "text/plain")
    assert empty.status_code == 400
    assert empty.json()["error"] == "empty_file"

    corrupt = _upload(client, "demo", "scan.pdf", b"this is not a pdf", "application/pdf")
    assert corrupt.status_code == 400
    assert "Traceback" not in corrupt.text
    names = [item["filename"] for item in client.get("/api/projects/demo/documents").json()["documents"]]
    assert names == ["Division_03.pdf"]

    traversal = _upload(client, "demo", "../../secrets.txt", b"secret curing note", "text/plain")
    assert traversal.status_code == 200
    assert traversal.json()["filename"] == "secrets.txt"
    stored = list((settings.data_dir / "projects" / "demo" / "docs").iterdir())
    assert {path.name for path in stored} == {"Division_03.pdf", "secrets.txt"}
    assert not (settings.data_dir.parent / "secrets.txt").exists()


def test_upload_size_limit_is_enforced_while_reading(tmp_path):
    settings = Settings(
        data_dir=tmp_path / "data",
        checkpoint_path=tmp_path / "c.sqlite",
        sample_dir=tmp_path / "sample",
        seed_demo=False,
        max_upload_bytes=8,
    )
    with TestClient(create_app(settings)) as client:
        response = _upload(client, "demo", "big.txt", b"0123456789", "text/plain")
    assert response.status_code == 413
    assert response.json()["error"] == "file_too_large"


def test_sample_pdf_text_survives_a_round_trip(tmp_path):
    write_sample_pack(tmp_path)
    data = (tmp_path / "Division_05_Structural_Steel.pdf").read_bytes()
    pages = extract_pages("Division_05_Structural_Steel.pdf", data)
    assert "8 to 12 weeks" in pages[0]
    assert "Blocked activity: slab on grade foundation pour" in extract_pages(
        "RFI-014_Foundation_Pour_Hold.pdf",
        (tmp_path / "RFI-014_Foundation_Pour_Hold.pdf").read_bytes(),
    )[0]


def test_chat_contract_spec_materials_risk_and_out_of_scope(client, caplog):
    caplog.set_level(logging.INFO, logger="siteflow")
    _seed(client)
    spec = client.post(
        "/api/chat",
        json={
            "project_id": "demo",
            "thread_id": "spec-thread",
            "message": "What is the lead time language for structural steel?",
        },
    )
    assert spec.status_code == 200
    spec_body = spec.json()
    assert spec_body["route"] == "spec"
    assert spec_body["needs_approval"] is False
    assert "8 to 12 weeks" in spec_body["answer"]
    assert spec_body["sources"][0]["title"]
    assert spec_body["sources"][0]["page"] == 1
    assert "general construction knowledge" not in spec_body["answer"]
    assert any("route=spec" in record.message for record in caplog.records)

    blank = client.post(
        "/api/chat",
        json={"project_id": "demo", "thread_id": "spec-thread", "message": "   "},
    )
    assert blank.status_code == 422
    assert blank.json()["error"] == "invalid_request"
    assert "Traceback" not in blank.text

    materials = client.post(
        "/api/chat",
        json={
            "project_id": "demo",
            "thread_id": "buy-thread",
            "message": "If rebar demand is 12,000 units and holding cost is $4, what EOQ should we use?",
        },
    )
    assert materials.status_code == 200
    buy = materials.json()
    assert buy["route"] == "materials"
    assert buy["needs_approval"] is True
    assert buy["status"] == "awaiting_approval"
    assert buy["tool_result"]["eoq"] == 547.72
    assert "human_review" in buy["agents_used"]
    assert buy["sources"] == []

    blocked = client.post(
        "/api/chat",
        json={
            "project_id": "demo",
            "thread_id": "buy-thread",
            "message": "Which open RFIs block the foundation pour?",
        },
    )
    assert blocked.status_code == 409
    assert blocked.json()["error"] == "approval_pending"

    rejected = client.post(
        "/api/approvals/buy-thread",
        json={"approved": False, "note": "check the mill first"},
    )
    assert rejected.status_code == 200
    assert rejected.json()["needs_approval"] is False
    assert rejected.json()["status"] == "resolved"
    assert "Decision: rejected." in rejected.json()["answer"]
    assert "respond" in rejected.json()["agents_used"]

    again = client.post(
        "/api/approvals/buy-thread",
        json={"approved": True, "note": ""},
    )
    assert again.status_code == 409
    assert again.json()["error"] == "not_awaiting_approval"

    missing = client.post("/api/approvals/missing-thread", json={"approved": True, "note": ""})
    assert missing.status_code == 404

    risk = client.post(
        "/api/chat",
        json={
            "project_id": "demo",
            "thread_id": "risk-thread",
            "message": "Which open RFIs block the foundation pour?",
        },
    )
    risk_body = risk.json()
    assert risk_body["route"] == "risk"
    assert risk_body["needs_approval"] is True
    assert "slab on grade foundation pour" in risk_body["answer"]
    assert risk_body["tool_result"]["risk_level"] == "high"

    poem = client.post(
        "/api/chat",
        json={
            "project_id": "demo",
            "thread_id": "poem-thread",
            "message": "Write a poem about the Golden Gate Bridge.",
        },
    )
    poem_body = poem.json()
    assert poem_body["route"] == "chat"
    assert poem_body["needs_approval"] is False
    assert poem_body["sources"] == []
    assert "will not answer from general knowledge" in poem_body["answer"]


def test_projects_do_not_share_documents_or_threads(client):
    _seed(client)
    other = client.post(
        "/api/chat",
        json={
            "project_id": "other",
            "thread_id": "isolated",
            "message": "What is the lead time language for structural steel?",
        },
    )
    assert "8 to 12 weeks" not in other.json()["answer"]
    assert "cannot find that" in other.json()["answer"].lower()

    stolen = client.post(
        "/api/chat",
        json={
            "project_id": "other",
            "thread_id": "spec-owner",
            "message": "What is the lead time language for structural steel?",
        },
    )
    # First message on this thread is for `other`. A second project cannot reuse it.
    client.post(
        "/api/chat",
        json={
            "project_id": "demo",
            "thread_id": "spec-owner",
            "message": "What is the lead time language for structural steel?",
        },
    )
    assert stolen.status_code == 200
    mismatch = client.post(
        "/api/chat",
        json={
            "project_id": "demo",
            "thread_id": "spec-owner",
            "message": "What curing rules are in Division 03?",
        },
    )
    assert mismatch.status_code == 409
    assert mismatch.json()["error"] == "thread_project_mismatch"


def test_replacing_a_file_drops_the_old_sentence(client):
    first = build_text_pdf([["Old spec", "Curing takes 99 days in the old note."]])
    _upload(client, "demo", "note.txt", b"Curing takes 99 days in the old note.", "text/plain")
    seen = client.post(
        "/api/chat",
        json={"project_id": "demo", "thread_id": "t", "message": "What curing rules are in the spec?"},
    )
    assert "99 days" in seen.json()["answer"]
    _upload(client, "demo", "note.txt", b"Curing: keep concrete wet for 7 days.", "text/plain")
    replaced = client.post(
        "/api/chat",
        json={"project_id": "demo", "thread_id": "t2", "message": "What curing rules are in the spec?"},
    )
    assert "7 days" in replaced.json()["answer"]
    assert "99 days" not in replaced.json()["answer"]
    assert first  # the pdf helper stays available for the upload test above


def test_checkpoint_survives_a_new_process(tmp_path):
    settings = Settings(
        data_dir=tmp_path / "data",
        checkpoint_path=tmp_path / "checkpoints.sqlite",
        sample_dir=tmp_path / "sample",
        seed_demo=False,
    )
    write_sample_pack(settings.sample_dir)
    engine = build_engine(settings)
    for path in sorted(settings.sample_dir.iterdir()):
        if path.suffix.lower() in {".pdf", ".csv"}:
            engine.upload("demo", path.name, path.read_bytes())
    paused = engine.chat(
        "demo",
        "durable",
        "If rebar demand is 12,000 units and holding cost is $4, what EOQ should we use?",
    )
    assert paused["needs_approval"] is True
    engine.close()

    resumed_engine = build_engine(settings)
    try:
        decision = resumed_engine.approve("durable", True, "place it next week")
    finally:
        resumed_engine.close()
    assert decision["status"] == "resolved"
    assert "Decision: approved." in decision["answer"]
    assert "547.72" in decision["answer"]


def test_internal_errors_hide_the_exception_text(settings):
    application = create_app(settings)

    @application.get("/api/_boom")
    def boom():
        raise RuntimeError("secret stack token")

    with TestClient(application, raise_server_exceptions=False) as client:
        response = client.get("/api/_boom")
    assert response.status_code == 500
    assert response.json()["error"] == "internal_error"
    assert "secret stack token" not in response.text
    assert "Traceback" not in response.text


def test_bad_csv_is_rejected(client):
    response = _upload(client, "demo", "materials.csv", b"sku,description\nA,bolt\n", "text/csv")
    assert response.status_code == 400
    assert response.json()["error"] == "invalid_document"
    assert client.get("/api/projects/demo/documents").json()["documents"] == []


def _seed(client):
    sample = Path(client.app.state.settings.sample_dir)
    write_sample_pack(sample)
    # The running app has its own sample_dir from the fixture, which is empty
    # until this write. Upload those bytes through the API.
    for filename, lines in SAMPLE_PDFS.items():
        data = (sample / filename).read_bytes()
        response = _upload(client, "demo", filename, data, "application/pdf")
        assert response.status_code == 200, response.text
    csv_response = _upload(client, "demo", "materials.csv", MATERIALS_CSV.encode(), "text/csv")
    assert csv_response.status_code == 200, csv_response.text
