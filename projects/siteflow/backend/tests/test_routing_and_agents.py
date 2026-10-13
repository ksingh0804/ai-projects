import json

from app.agents.materials_agent import answer_materials
from app.agents.review import apply_human_decision
from app.agents.risk_agent import assess_risk
from app.agents.spec_agent import (
    compose_spec_answer,
    maybe_paraphrase,
    paraphrase_is_faithful,
    spec_update,
)
from app.agents.supervisor import route_message, score_routes
from app.config import SITEFLOW_ROOT
from app.rag.retriever import Chunk, ScoredChunk
from app.tools.inventory import load_materials_csv

CSV = """sku,description,on_hand,lead_days,unit_cost,annual_demand,order_cost
REBAR-5,Grade 60 number 5 rebar,800,21,4.10,12000,50
STEEL-A,Wide flange steel one,10,10,1,100,10
STEEL-B,Wide flange steel two,10,10,1,200,20
AB-34,Anchor bolt 3/4 inch,120,14,6.50,2000,40
"""


def test_gold_questions_all_route_correctly():
    questions = json.loads((SITEFLOW_ROOT / "eval" / "questions.json").read_text())
    buckets = {}
    for item in questions:
        buckets[item["bucket"]] = buckets.get(item["bucket"], 0) + 1
    assert buckets == {"spec": 4, "materials": 4, "risk": 2, "out_of_scope": 2}
    score = score_routes(questions)
    assert score["accuracy"] == 1
    assert score["correct"] == 12


def test_document_question_about_eoq_stays_on_spec():
    decision = route_message("What does the spec say about EOQ?")
    assert decision.route == "spec"


def test_hold_is_not_matched_inside_threshold():
    decision = route_message("What is the vapor barrier threshold in the spec?")
    assert decision.route == "spec"


def test_spec_refusal_has_no_outside_fact():
    answer = compose_spec_answer([])
    assert "general construction knowledge" in answer
    assert "7 days" not in answer


def test_spec_update_cites_only_this_project():
    chunks = [
        Chunk("Curing: keep concrete wet for 7 days.", "Division 03", 1, "demo", "d.pdf"),
        Chunk("Curing: some other job says 99 days.", "Other", 1, "other", "o.pdf"),
    ]
    state = spec_update(
        {"message": "curing", "project_id": "demo", "agents_used": ["supervisor"]},
        chunks,
        model=None,
    )
    assert state["needs_approval"] is False
    assert "7 days" in state["answer"]
    assert "99 days" not in state["answer"]
    assert state["sources"][0]["page"] == 1
    assert state["agents_used"] == ["supervisor", "spec_rag"]


def test_eoq_uses_order_cost_from_the_one_matching_sku_and_not_unit_cost():
    inventory = load_materials_csv(CSV)
    outcome = answer_materials(
        "If rebar demand is 12,000 units and holding cost is $4, what EOQ should we use?",
        inventory,
    )
    assert outcome.needs_approval is True
    assert outcome.tool_result["eoq"] == 547.72
    assert outcome.tool_result["holding_cost"] == 4
    assert outcome.tool_result["order_cost"] == 50
    assert "4.10" not in outcome.answer
    assert "REBAR-5" in outcome.answer
    assert "did not include it" in outcome.answer


def test_eoq_refuses_to_guess_when_two_skus_match():
    inventory = load_materials_csv(CSV)
    outcome = answer_materials(
        "What EOQ should we use for steel if holding cost is $4?",
        inventory,
    )
    assert outcome.needs_approval is False
    assert outcome.tool_result["error"] == "ambiguous_sku"
    assert "STEEL-A" in outcome.answer and "STEEL-B" in outcome.answer


def test_eoq_refuses_when_order_cost_and_sku_are_both_missing():
    outcome = answer_materials(
        "What EOQ should we use if demand is 100 and holding cost is $2?",
        {},
    )
    assert outcome.needs_approval is False
    assert "order cost" in outcome.answer.lower()


def test_safety_stock_states_the_default_z_score():
    outcome = answer_materials(
        "Estimate safety stock with demand std 10 and lead time 4 days.",
        {},
    )
    assert outcome.tool_result["safety_stock"] == 33.0
    assert outcome.needs_approval is True
    assert "1.65" in outcome.answer


def test_sku_lookup_is_not_an_approval():
    inventory = load_materials_csv(CSV)
    outcome = answer_materials("Look up SKU REBAR-5 and tell me the on-hand quantity.", inventory)
    assert outcome.needs_approval is False
    assert outcome.recommendation is None
    assert outcome.tool_result["on_hand"] == 800
    assert "lookup, not an order" in outcome.answer


def test_anchor_bolt_lookup_reads_the_table():
    inventory = load_materials_csv(CSV)
    outcome = answer_materials(
        "What is the annual demand and order cost for anchor bolts?",
        inventory,
    )
    assert outcome.needs_approval is False
    assert outcome.tool_result["sku"] == "AB-34"
    assert outcome.tool_result["annual_demand"] == 2000
    assert outcome.tool_result["order_cost"] == 40


def test_risk_levels_come_from_explicit_lines():
    blocked = ScoredChunk(
        Chunk(
            "Response: No. The pour stays on hold.\nBlocked activity: slab on grade foundation pour",
            "RFI-014",
            1,
            "demo",
            "rfi.pdf",
        ),
        1.0,
    )
    weather = ScoredChunk(
        Chunk(
            "Weather limit: do not place concrete when the air temperature is below 40 F.",
            "Division 03",
            1,
            "demo",
            "div.pdf",
        ),
        1.0,
    )
    high = assess_risk([blocked])
    assert high.level == "high"
    assert high.blocked_activities == ["slab on grade foundation pour"]
    assert high.needs_approval is True
    medium = assess_risk([weather])
    assert medium.level == "medium"
    assert medium.needs_approval is True
    assert assess_risk([]).level == "unknown"
    assert assess_risk([]).needs_approval is False


def test_human_decision_does_not_claim_a_write_happened():
    updated = apply_human_decision(
        {"answer": "EOQ is 547.72 units.", "agents_used": ["supervisor", "materials"]},
        {"approved": False, "note": "too early"},
    )
    assert updated["needs_approval"] is False
    assert updated["approval"]["approved"] is False
    assert "Decision: rejected." in updated["answer"]
    assert "does not place orders" in updated["answer"]
    assert "human_review" in updated["agents_used"]


class _FakeModel:
    def __init__(self, text=None, error=None):
        self.text = text
        self.error = error

    def invoke(self, messages):
        if self.error:
            raise self.error
        return self.text


def test_paraphrase_keeps_the_draft_when_the_model_adds_a_number():
    draft = "EOQ is 547.72 units. Formula with D=12000, S=50, H=4."
    assert paraphrase_is_faithful("Buy 99999 units now.", draft) is False
    assert maybe_paraphrase(draft, _FakeModel("Buy 99999 units immediately.")) == draft


def test_paraphrase_accepts_a_faithful_rephrase_and_survives_a_model_outage():
    draft = "EOQ is 547.72 units, about 21.91 orders per year from the materials table."
    faithful = "The materials table gives an EOQ of 547.72 units, about 21.91 orders per year."
    assert maybe_paraphrase(draft, _FakeModel(faithful)) == faithful
    assert maybe_paraphrase(draft, _FakeModel(error=RuntimeError("ollama down"))) == draft
