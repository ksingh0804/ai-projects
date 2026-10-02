import pytest

from app.agents.supervisor import choose_route


@pytest.mark.parametrize(
    ("message", "route"),
    [
        ("What is the curing time for concrete?", "spec"),
        ("EOQ D=12000 S=50 H=4", "materials"),
        ("Which open RFI blocks the foundation pour?", "risk"),
        ("What is the capital of France?", "chat"),
    ],
)
def test_choose_route(message, route):
    assert choose_route(message) == route
