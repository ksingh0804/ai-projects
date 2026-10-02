import shutil

from fastapi.testclient import TestClient

from app.main import app
from app.paths import siteflow_root

client = TestClient(app)


def test_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_upload_lists_file_and_rejects_exe():
    project = "pytest-demo"
    folder = siteflow_root() / "data" / "projects" / project
    sample = siteflow_root() / "data" / "sample" / "division-03-concrete.txt"
    try:
        with sample.open("rb") as handle:
            uploaded = client.post(
                f"/api/projects/{project}/documents",
                files={"file": ("division-03-concrete.txt", handle, "text/plain")},
            )
        assert uploaded.status_code == 200
        listed = client.get(f"/api/projects/{project}/documents")
        names = [item["filename"] for item in listed.json()["documents"]]
        assert "division-03-concrete.txt" in names

        rejected = client.post(
            f"/api/projects/{project}/documents",
            files={"file": ("virus.exe", b"MZ", "application/octet-stream")},
        )
        assert rejected.status_code == 400
    finally:
        shutil.rmtree(folder, ignore_errors=True)


def test_empty_message_never_reaches_the_graph():
    response = client.post(
        "/api/chat",
        json={"project_id": "demo", "thread_id": "empty-1", "message": ""},
    )
    assert response.status_code == 422


def test_eoq_pauses_for_approval_then_resumes():
    thread = "eoq-thread-1"
    chat = client.post(
        "/api/chat",
        json={
            "project_id": "demo",
            "thread_id": thread,
            "message": "EOQ D=12000 S=50 H=4",
        },
    )
    assert chat.status_code == 200, chat.text
    body = chat.json()
    assert body["needs_approval"] is True
    assert "547.72" in body["answer"]

    decision = client.post(
        f"/api/approvals/{thread}",
        json={"approved": True, "note": "order it"},
    )
    assert decision.status_code == 200, decision.text
    assert decision.json()["needs_approval"] is False
    assert "547.72" in decision.json()["answer"]


def test_out_of_scope_question_is_refused():
    response = client.post(
        "/api/chat",
        json={
            "project_id": "demo",
            "thread_id": "france-1",
            "message": "What is the capital of France?",
        },
    )
    assert response.status_code == 200, response.text
    body = response.json()
    assert body["needs_approval"] is False
    assert "project documents" in body["answer"]
