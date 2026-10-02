from app.agents.materials_agent import run_materials
from app.agents.risk_agent import run_risk
from app.agents.spec_agent import run_spec
from app.agents.state import fresh_state


def test_spec_refuses_when_nothing_is_retrieved():
    state = fresh_state("demo", "What is the curing time?")

    def no_docs(project_id, query, k=4):
        return []

    result = run_spec(state, retrieve_fn=no_docs)
    assert result["recommendation"] == "I cannot find that in the project documents."
    assert result["needs_approval"] is False


def test_materials_eoq_needs_approval():
    state = fresh_state("demo", "EOQ D=12000 S=50 H=4")
    result = run_materials(state)
    assert result["tool_result"]["eoq"] == 547.72
    assert result["needs_approval"] is True


def test_risk_open_rfi_is_high():
    state = fresh_state("demo", "Which open RFI blocks the foundation pour?")

    def fake_retrieve(project_id, query, k=4):
        return [
            {
                "title": "rfi-014-foundation-pour-hold.txt",
                "page": 1,
                "snippet": "RFI-014 is an open RFI. This RFI blocks the foundation pour.",
            }
        ]

    result = run_risk(state, retrieve_fn=fake_retrieve)
    assert result["tool_result"]["risk_level"] == "high"
    assert result["needs_approval"] is True
    assert "RFI-014" in result["recommendation"]
