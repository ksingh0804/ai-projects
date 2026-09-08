"""Mock interview practice for the logistics RAG agent project.

Run:
    ./rag-env/bin/streamlit run mock_interview.py
"""

from __future__ import annotations

import random
import time
from typing import Any

import streamlit as st

from docs.interview_qa_bank import CATEGORIES, QUESTIONS, InterviewQuestion

PACE_SECONDS = {"Relaxed (60s)": 60, "Interview (45s)": 45, "Rapid (30s)": 30}


def init_state() -> None:
    defaults: dict[str, Any] = {
        "mi_index": 0,
        "mi_deck": [q.id for q in QUESTIONS],
        "mi_revealed": False,
        "mi_deep": False,
        "mi_timer_start": None,
        "mi_practiced": set(),
        "mi_notes": {},
    }
    for key, value in defaults.items():
        if key not in st.session_state:
            st.session_state[key] = value


def current_question() -> InterviewQuestion | None:
    deck: list[str] = st.session_state.mi_deck
    if not deck or st.session_state.mi_index >= len(deck):
        return None
    qid = deck[st.session_state.mi_index]
    return next(q for q in QUESTIONS if q.id == qid)


def filter_deck(category: str | None, shuffle: bool) -> list[str]:
    pool = QUESTIONS if not category or category == "All" else [q for q in QUESTIONS if q.category == category]
    ids = [q.id for q in pool]
    if shuffle:
        random.shuffle(ids)
    return ids


def reset_round(category: str | None, shuffle: bool) -> None:
    st.session_state.mi_deck = filter_deck(category, shuffle)
    st.session_state.mi_index = 0
    st.session_state.mi_revealed = False
    st.session_state.mi_deep = False
    st.session_state.mi_timer_start = time.time()


def elapsed_seconds() -> int:
    start = st.session_state.mi_timer_start
    if start is None:
        return 0
    return int(time.time() - start)


def render_timer(pace_limit: int) -> None:
    elapsed = elapsed_seconds()
    remaining = max(0, pace_limit - elapsed)
    col_a, col_b, col_c = st.columns(3)
    col_a.metric("Elapsed", f"{elapsed}s")
    col_b.metric("Target", f"{pace_limit}s")
    if elapsed <= pace_limit:
        col_c.metric("Remaining", f"{remaining}s")
    else:
        col_c.metric("Over by", f"{elapsed - pace_limit}s")


def render_sidebar() -> tuple[str | None, bool, int]:
    with st.sidebar:
        st.title("Mock interview")
        st.caption("Practice out loud. One question at a time.")

        category = st.selectbox("Category", ["All", *CATEGORIES])
        shuffle = st.toggle("Shuffle deck", value=True)
        pace_label = st.selectbox("Answer pace", list(PACE_SECONDS.keys()), index=1)
        pace_limit = PACE_SECONDS[pace_label]

        if st.button("New round", width="stretch"):
            reset_round(category, shuffle)
            st.rerun()

        practiced = st.session_state.mi_practiced
        deck = st.session_state.mi_deck
        st.divider()
        st.metric("Progress", f"{min(st.session_state.mi_index, len(deck))} / {len(deck)}")
        st.metric("Practiced this session", len(practiced))

        st.divider()
        st.markdown("**60-second opener**")
        st.caption(
            "I built a logistics ops agent for DeCA-style work. "
            "Tools for numbers, RAG for SOPs. Phantom flour: system 48, shelf 0."
        )

        st.divider()
        st.markdown("**Soft landing**")
        for phrase in [
            "One second — I'll restart that line.",
            "Short version: …",
            "The key point is …",
        ]:
            st.markdown(f"- {phrase}")

    return category, shuffle, pace_limit


def render_question_card(q: InterviewQuestion, pace_limit: int) -> None:
    st.subheader(f"Question {st.session_state.mi_index + 1}")
    st.markdown(f"**{q.question}**")
    st.caption(f"Category: {q.category} · Tip: {q.tip}")

    render_timer(pace_limit)

    st.info("Cover your mouth if needed — **speak your answer now** before revealing.")

    if not st.session_state.mi_revealed:
        if st.button("Reveal answer", type="primary", width="stretch"):
            st.session_state.mi_revealed = True
            practiced: set[str] = st.session_state.mi_practiced
            practiced.add(q.id)
            st.session_state.mi_practiced = practiced
            st.rerun()
        return

    st.success("**Short answer (say this)**")
    st.markdown(q.short_answer)

    if st.session_state.mi_deep:
        st.warning("**Deep answer (if they push)**")
        st.markdown(q.deep_answer)
    else:
        if st.button("Show deep answer"):
            st.session_state.mi_deep = True
            st.rerun()

    st.divider()
    note_key = q.id
    st.session_state.mi_notes[note_key] = st.text_area(
        "Your notes (what to improve)",
        value=st.session_state.mi_notes.get(note_key, ""),
        height=100,
        key=f"note::{note_key}",
    )

    col_prev, col_next, col_skip = st.columns(3)
    with col_prev:
        if st.session_state.mi_index > 0 and st.button("Previous", width="stretch"):
            st.session_state.mi_index -= 1
            st.session_state.mi_revealed = False
            st.session_state.mi_deep = False
            st.session_state.mi_timer_start = time.time()
            st.rerun()
    with col_next:
        if st.button("Next question", type="primary", width="stretch"):
            st.session_state.mi_index += 1
            st.session_state.mi_revealed = False
            st.session_state.mi_deep = False
            st.session_state.mi_timer_start = time.time()
            st.rerun()
    with col_skip:
        if st.button("Skip", width="stretch"):
            st.session_state.mi_index += 1
            st.session_state.mi_revealed = False
            st.session_state.mi_deep = False
            st.session_state.mi_timer_start = time.time()
            st.rerun()


def render_study_mode() -> None:
    st.subheader("Study guide — all Q&A")
    for cat in CATEGORIES:
        with st.expander(cat, expanded=False):
            for q in [x for x in QUESTIONS if x.category == cat]:
                st.markdown(f"**Q:** {q.question}")
                st.markdown(f"**Short:** {q.short_answer}")
                st.markdown(f"**Deep:** {q.deep_answer}")
                st.caption(f"Tip: {q.tip}")
                st.divider()


def render_complete() -> None:
    st.balloons()
    st.success("Round complete.")
    practiced = st.session_state.mi_practiced
    st.markdown(f"You practiced **{len(practiced)}** question(s) this session.")
    if st.button("Start another round", type="primary"):
        reset_round("All", True)
        st.rerun()


def main() -> None:
    st.set_page_config(
        page_title="Mock Interview — Logistics RAG",
        page_icon="🎤",
        layout="wide",
    )
    init_state()

    if not st.session_state.mi_deck:
        reset_round("All", True)

    category, shuffle, pace_limit = render_sidebar()

    st.title("🎤 Logistics RAG — Mock Interview")
    st.markdown(
        "Practice answering like you're in the room: **read the question → speak → reveal → compare → next.**"
    )

    tab_practice, tab_study, tab_tdd = st.tabs(["Practice", "Study guide", "TDD verbal drill"])

    with tab_practice:
        q = current_question()
        if q is None:
            render_complete()
        else:
            render_question_card(q, pace_limit)

    with tab_study:
        render_study_mode()

    with tab_tdd:
        st.subheader("Verbal TDD drill (coding follow-ups)")
        st.markdown(
            """
When they ask you to implement something (inventory lookup, EOQ, ingest idempotency):

1. **Restate** the requirement + 2 edge cases out loud.
2. **Name the first failing test** — inputs and expected output.
3. **Implement minimum code** to pass (describe, don't over-build).
4. **Add the next failing test** — error path or boundary.
5. **Refactor** once green.

**Example opener:**  
*"I'd start with a happy-path test: lookup SKU-1002 returns REORDER because on_hand is below reorder_point. Then I'd test unknown SKU returns an error dict, not an exception. Only then wire the CSV loader."*
            """
        )
        st.markdown("**Connect to this repo:** `tools.py`, `ingest.py`, `rag.py`, `timing.py`.")


if __name__ == "__main__":
    main()
