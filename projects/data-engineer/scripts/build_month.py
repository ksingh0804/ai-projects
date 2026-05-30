"""Build the month: render 30 daily reports, aggregate metrics, and emit the coach dashboard.

Run after the pipeline:
    python3 scripts/build_month.py

Outputs:
    logs/daily/day-01.md ... day-30.md   (reports filed to the manager)
    reviews/metrics.json                 (aggregated metrics for the dashboard)
    reviews/performance_dashboard.html   (Coach Ada's visual review)

Standard library only. The per-day content below is the simulated month of work for a
Junior Data Engineer at Meridian Asset Management, June 2026.
"""
from __future__ import annotations

import json
import os
from datetime import date, timedelta

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, "..")
LOGS = os.path.join(ROOT, "logs", "daily")
REVIEWS = os.path.join(ROOT, "reviews")

START = date(2026, 6, 1)
DAYS = 30

# Per working-day plan, keyed by ISO date.
# Fields: title, week, assignment, did[], evidence{}, blockers, nxt,
#         on_time(bool), dq_caught(int), runtime(float sec, prod-scale), tasks(int)
PLAN = {
    "2026-06-01": dict(
        title="Onboarding & first pipeline run", week=1, assignment="week-1.md",
        did=["Got warehouse + repo access; configured local env and secrets.",
             "Ran the existing EOD pipeline end-to-end locally to learn the stages.",
             "Read the EOD architecture + lineage docs; mapped where market data lands."],
        evidence={"pipeline_run": "ingest→transform→DQ→metrics OK",
                  "docs_read": "EOD arch, lineage, on-call runbook"},
        blockers="Warehouse role missing write grant for ~1h; Sarah unblocked it by 11am.",
        nxt="Start building the market-data ingestion task.",
        on_time=True, dq_caught=0, runtime=5.1, tasks=1),
    "2026-06-02": dict(
        title="First cut of market-data ingestion", week=1, assignment="week-1.md",
        did=["Wrote `ingest_market_data` to land the vendor EOD CSV (178 raw rows).",
             "Logged per-symbol row counts for visibility."],
        evidence={"rows_landed": 178, "symbols": 8},
        blockers="Re-running ingestion DOUBLED rows — not idempotent yet. EOD landed ~25 min "
                 "late while I debugged. Flagged to Sarah at 2pm.",
        nxt="Make ingestion idempotent (full-refresh the partition).",
        on_time=False, dq_caught=0, runtime=5.4, tasks=1),
    "2026-06-03": dict(
        title="Idempotent ingestion", week=1, assignment="week-1.md",
        did=["Refactored ingestion to full-refresh the landing partition before load.",
             "Verified two consecutive runs produce identical counts."],
        evidence={"run1_rows": 178, "run2_rows": 178, "idempotent": True},
        blockers="None.",
        nxt="Add row-count logging + a re-run runbook note.",
        on_time=True, dq_caught=0, runtime=5.0, tasks=1),
    "2026-06-04": dict(
        title="Logging + runbook", week=1, assignment="week-1.md",
        did=["Added structured run logging (row counts, elapsed).",
             "Wrote a short runbook: how to safely re-run ingestion on failure."],
        evidence={"runbook": "pipelines re-run steps", "first_clean_eod": True},
        blockers="None.",
        nxt="Demo Week-1 work to Sarah.",
        on_time=True, dq_caught=0, runtime=4.9, tasks=1),
    "2026-06-05": dict(
        title="Week-1 demo & wrap", week=1, assignment="week-1.md",
        did=["Demoed idempotent ingestion to Sarah; walked through the runbook.",
             "Captured feedback: add a uniqueness check next week."],
        evidence={"demo": "accepted", "feedback": "add uniqueness DQ check"},
        blockers="None.",
        nxt="Begin transformations: stg_transactions.",
        on_time=True, dq_caught=0, runtime=4.9, tasks=1),
    "2026-06-08": dict(
        title="Staging transactions model", week=2, assignment="week-2.md",
        did=["Built `stg_transactions`: typed columns, signed quantity (BUY +, SELL −).",
             "Parsed trade_date from timestamp for point-in-time joins."],
        evidence={"staged_rows": 309, "accounts": 3},
        blockers="None.",
        nxt="Normalize notional to USD via daily FX.",
        on_time=True, dq_caught=0, runtime=5.2, tasks=1),
    "2026-06-09": dict(
        title="USD normalization via FX", week=2, assignment="week-2.md",
        did=["Joined `fx_rates` on (currency, trade_date) to compute USD notional.",
             "Caught and fixed a bug: I was using today's FX for back-dated trades."],
        evidence={"currencies": "USD/GBP/EUR/JPY", "fx_join": "point-in-time"},
        blockers="None — the FX bug was caught by a hand-check, not a test (note for Week 3).",
        nxt="Build the positions mart.",
        on_time=True, dq_caught=0, runtime=5.0, tasks=1),
    "2026-06-10": dict(
        title="Positions mart + fan-out fix", week=2, assignment="week-2.md",
        did=["Built `positions` (net qty + gross USD notional) at account×symbol×date.",
             "Found a fan-out (duplicate join key) inflating notional; fixed the grain."],
        evidence={"positions_rows": 238, "grain": "account×symbol×date"},
        blockers="Fan-out debugging pushed EOD ~15 min late; flagged early at 1pm.",
        nxt="Reconcile 3 sample trades by hand.",
        on_time=False, dq_caught=0, runtime=5.3, tasks=1),
    "2026-06-11": dict(
        title="Reconciliation + PR", week=2, assignment="week-2.md",
        did=["Hand-reconciled 3 multi-currency trades to USD notional — matched.",
             "Opened PR with before/after counts and the reconciliation table."],
        evidence={"reconciled_trades": 3, "pr": "opened"},
        blockers="None.",
        nxt="Address PR review comments.",
        on_time=True, dq_caught=0, runtime=4.8, tasks=1),
    "2026-06-12": dict(
        title="PR merged with rollback note", week=2, assignment="week-2.md",
        did=["Addressed review comments; added a rollback note to the PR.",
             "Merged the positions model after Sarah's approval."],
        evidence={"pr": "merged", "rollback_note": True},
        blockers="None.",
        nxt="Start the data-quality suite.",
        on_time=True, dq_caught=0, runtime=4.8, tasks=1),
    "2026-06-15": dict(
        title="DQ suite — price & OHLC checks", week=3, assignment="week-3.md",
        did=["Authored checks: positive close, OHLC consistency, unique (symbol,date).",
             "Ran against the live feed — immediately caught 3 real issues."],
        evidence={"checks_added": 3, "issues_found": 3},
        blockers="None.",
        nxt="Add trade-level checks + referential integrity.",
        on_time=True, dq_caught=3, runtime=5.0, tasks=1),
    "2026-06-16": dict(
        title="DQ suite — trade & referential checks", week=3, assignment="week-3.md",
        did=["Added unique `trade_id`, non-null account, positions referential checks.",
             "Caught a DUPLICATE trade that would have double-counted exposure."],
        evidence={"checks_added": 3, "dup_trade_caught": 1, "null_account_caught": 1},
        blockers="None.",
        nxt="Wire the suite into the pipeline to fail loudly.",
        on_time=True, dq_caught=3, runtime=5.0, tasks=1),
    "2026-06-17": dict(
        title="Fail-loud wiring", week=3, assignment="week-3.md",
        did=["Wired blocking checks so the pipeline exits non-zero (pages on-call).",
             "Proved it: seeded a bad row, pipeline failed as designed, then reverted."],
        evidence={"blocking_checks": 4, "proven_failure": True},
        blockers="None.",
        nxt="Add quarantine tables + backfill known bad rows.",
        on_time=True, dq_caught=0, runtime=5.1, tasks=1),
    "2026-06-18": dict(
        title="Quarantine + backfill", week=3, assignment="week-3.md",
        did=["Routed bad rows to `quarantine_market_data` / `quarantine_transactions`.",
             "Backfilled: 2 known bad rows quarantined; clean tables now feed positions."],
        evidence={"quarantined": 2, "clean_path": "positions"},
        blockers="None.",
        nxt="Surface suite results in the run summary.",
        on_time=True, dq_caught=2, runtime=4.7, tasks=1),
    "2026-06-19": dict(
        title="DQ results in run summary + wrap", week=3, assignment="week-3.md",
        did=["Wrote DQ summary (pass/fail/blocking) into `last_run.json`.",
             "Week-3 wrap with Sarah — suite signed off as production-critical."],
        evidence={"summary_written": True, "checks_total": 6},
        blockers="None.",
        nxt="Profile the slow positions build.",
        on_time=True, dq_caught=0, runtime=4.6, tasks=1),
    "2026-06-22": dict(
        title="Profiling the slow build", week=4, assignment="week-4.md",
        did=["Profiled the positions build; baseline ~5.0s, dominated by row-by-row work.",
             "Identified set-based SQL + indexing as the fix."],
        evidence={"baseline_sec": 5.0, "hotspot": "row-by-row aggregation"},
        blockers="None.",
        nxt="Refactor to set-based SQL and add indexes.",
        on_time=True, dq_caught=0, runtime=5.0, tasks=1),
    "2026-06-23": dict(
        title="Performance refactor", week=4, assignment="week-4.md",
        did=["Replaced row-by-row aggregation with a single set-based SQL pass.",
             "Added indexes on (account, symbol, trade_date)."],
        evidence={"new_sec": 1.0, "speedup": "≈5×"},
        blockers="None.",
        nxt="Build portfolio_metrics for PMs.",
        on_time=True, dq_caught=0, runtime=1.0, tasks=1),
    "2026-06-24": dict(
        title="Portfolio metrics", week=4, assignment="week-4.md",
        did=["Built `portfolio_metrics`: gross exposure + #symbols per account/day.",
             "Reconciled totals back to `positions` — matched."],
        evidence={"gross_exposure_usd": 16999794.54, "accounts": 3},
        blockers="None.",
        nxt="Add freshness logging + runbook.",
        on_time=True, dq_caught=0, runtime=1.0, tasks=1),
    "2026-06-25": dict(
        title="Freshness logging + runbook", week=4, assignment="week-4.md",
        did=["Added elapsed + freshness logging to the run summary.",
             "Documented the full runbook (re-run, rollback, escalation)."],
        evidence={"freshness_logged": True, "runbook": "complete"},
        blockers="None.",
        nxt="Verify optimization holds under repeated runs.",
        on_time=True, dq_caught=0, runtime=0.9, tasks=1),
    "2026-06-26": dict(
        title="Optimization verified", week=4, assignment="week-4.md",
        did=["Ran the pipeline 10× — runtime stable at ~1.0s, all DQ checks green.",
             "Confirmed EOD landing time improved and stayed under cutoff."],
        evidence={"runs": 10, "stable_sec": 1.0, "dq": "6/6 pass"},
        blockers="None.",
        nxt="Write the month-end retro.",
        on_time=True, dq_caught=0, runtime=1.0, tasks=1),
    "2026-06-29": dict(
        title="Retro & handover", week=4, assignment="week-4.md",
        did=["Wrote a month-end retro: wins, misses, and lessons.",
             "Handed over open items (vendor late-file alerting) with owners."],
        evidence={"retro": "written", "open_items": 1},
        blockers="None.",
        nxt="Final month close + metrics summary.",
        on_time=True, dq_caught=0, runtime=1.0, tasks=1),
    "2026-06-30": dict(
        title="Month close", week=4, assignment="week-4.md",
        did=["Final pipeline run green (6/6 DQ, ~1.0s); summary sent to Sarah.",
             "Closed the month: ingestion, positions, DQ suite, metrics all in prod."],
        evidence={"final_dq": "6/6 pass", "final_sec": 1.0},
        blockers="None.",
        nxt="Next month: test-first DQ + vendor late-file alerting.",
        on_time=True, dq_caught=0, runtime=1.0, tasks=1),
}

WEEKEND_NOTE = {
    5: "Saturday — off. (On-call rotation not yet assigned to me.)",
    6: "Sunday — off. Did ~30 min of dbt + Snowflake reading.",
}


def daterange():
    for i in range(DAYS):
        yield START + timedelta(days=i)


def render_report(day_num: int, d: date, p: dict | None) -> str:
    human = d.strftime("%A, %B %-d, %Y")
    head = f"# Daily Report — Day {day_num:02d} · {human}\n\n"
    head += "**To:** Sarah Chen (Manager) · **From:** Junior Data Engineer · "
    head += "**Project:** Meridian EOD Data Platform\n\n"

    if p is None:  # weekend / non-working day
        note = WEEKEND_NOTE.get(d.weekday(), "Non-working day.")
        return head + f"_{note}_\n\n*(No assignment; no production work filed.)*\n"

    lines = [head]
    lines.append(f"**Week {p['week']} assignment:** "
                 f"[`assignments/{p['assignment']}`](../../assignments/{p['assignment']})\n")
    lines.append(f"## Today: {p['title']}\n")
    lines.append("### What I did")
    for item in p["did"]:
        lines.append(f"- {item}")
    lines.append("\n### Evidence")
    for k, v in p["evidence"].items():
        lines.append(f"- **{k}:** {v}")
    lines.append("")
    lines.append("### Metrics")
    lines.append(f"- EOD landed before 7:00pm ET cutoff: "
                 f"**{'yes' if p['on_time'] else 'NO — see blockers'}**")
    lines.append(f"- Pipeline runtime (prod-scale): **{p['runtime']}s**")
    lines.append(f"- Data-quality issues caught: **{p['dq_caught']}**")
    lines.append("")
    lines.append(f"### Blockers\n{p['blockers']}\n")
    lines.append(f"### Next\n{p['nxt']}\n")
    return "\n".join(lines)


def build_metrics() -> dict:
    labels, runtime, dq, on_time, cumulative = [], [], [], [], []
    tasks_total = 0
    breaches = 0
    working_days = 0
    for d in daterange():
        iso = d.isoformat()
        p = PLAN.get(iso)
        if not p:
            continue
        working_days += 1
        labels.append(d.strftime("%b %-d"))
        runtime.append(p["runtime"])
        dq.append(p["dq_caught"])
        on_time.append(1 if p["on_time"] else 0)
        if not p["on_time"]:
            breaches += 1
        tasks_total += p["tasks"]
        cumulative.append(tasks_total)

    return {
        "period": "June 2026",
        "working_days": working_days,
        "tasks_total": tasks_total,
        "sla_breaches": breaches,
        "sla_on_time_pct": round(100 * (working_days - breaches) / working_days, 1),
        "dq_issues_total": sum(dq),
        "runtime_baseline": max(runtime),
        "runtime_final": runtime[-1],
        "labels": labels,
        "runtime": runtime,
        "dq_caught": dq,
        "on_time": on_time,
        "cumulative_tasks": cumulative,
        # Coach-scored review lenses (0-10) and skills radar (start vs end).
        "review_scores": {
            "Delivery": 8, "Reliability": 7, "Quality": 8,
            "Craft": 7, "Communication": 9, "Growth": 9,
        },
        "skills_axes": ["SQL", "Python", "Pipelines", "Data Quality",
                        "Performance", "Communication"],
        "skills_start": [4, 5, 3, 3, 2, 6],
        "skills_end": [7, 7, 8, 8, 6, 9],
        "superpower": "Communication — cleanest daily reports on the team; blockers always "
                      "raised before noon, never after.",
        "biggest_lever": "Test-first data quality — 2 real bugs (FX date, fan-out) were caught "
                          "by hand-checks in Weeks 1–2. Writing the check BEFORE the transform "
                          "would have moved them left and prevented the 2 SLA breaches.",
    }


def render_dashboard(m: dict) -> str:
    data = json.dumps(m)
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Performance Review — Coach Ada · {m['period']}</title>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
<style>
  :root {{ --bg:#0b1020; --card:#141b30; --ink:#e8ecf5; --muted:#97a2c0;
           --good:#34d399; --warn:#fbbf24; --bad:#f87171; --accent:#60a5fa; }}
  * {{ box-sizing:border-box; }}
  body {{ margin:0; font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;
          background:linear-gradient(160deg,#0b1020,#0e1530); color:var(--ink); }}
  header {{ padding:32px 28px 8px; }}
  h1 {{ margin:0 0 4px; font-size:26px; }}
  .sub {{ color:var(--muted); font-size:14px; }}
  .wrap {{ padding:16px 28px 48px; }}
  .kpis {{ display:grid; grid-template-columns:repeat(auto-fit,minmax(160px,1fr));
           gap:14px; margin:18px 0 26px; }}
  .kpi {{ background:var(--card); border:1px solid #21294a; border-radius:14px; padding:16px; }}
  .kpi .n {{ font-size:28px; font-weight:700; }}
  .kpi .l {{ color:var(--muted); font-size:12px; margin-top:4px; text-transform:uppercase;
             letter-spacing:.04em; }}
  .grid {{ display:grid; grid-template-columns:1fr 1fr; gap:18px; }}
  @media (max-width:840px) {{ .grid {{ grid-template-columns:1fr; }} }}
  .panel {{ background:var(--card); border:1px solid #21294a; border-radius:14px; padding:18px; }}
  .panel h3 {{ margin:0 0 12px; font-size:15px; }}
  .note {{ border-radius:14px; padding:18px; margin-top:18px; line-height:1.5; }}
  .note.good {{ background:rgba(52,211,153,.08); border:1px solid rgba(52,211,153,.4); }}
  .note.lever {{ background:rgba(96,165,250,.08); border:1px solid rgba(96,165,250,.4); }}
  .note b {{ color:var(--ink); }}
  .tag {{ font-size:11px; padding:2px 8px; border-radius:999px; background:#1d264a;
          color:var(--accent); }}
  canvas {{ max-height:280px; }}
  footer {{ color:var(--muted); font-size:12px; padding:0 28px 28px; }}
</style>
</head>
<body>
<header>
  <span class="tag">Performance Coach · Coach Ada</span>
  <h1>How the job went — Junior Data Engineer</h1>
  <div class="sub">Meridian Asset Management · EOD Data Platform · {m['period']}</div>
</header>
<div class="wrap">
  <div class="kpis">
    <div class="kpi"><div class="n">{m['tasks_total']}</div><div class="l">Tasks shipped</div></div>
    <div class="kpi"><div class="n">{m['sla_on_time_pct']}%</div><div class="l">EOD on-time</div></div>
    <div class="kpi"><div class="n">{m['dq_issues_total']}</div><div class="l">DQ issues caught</div></div>
    <div class="kpi"><div class="n">{m['runtime_baseline']}s→{m['runtime_final']}s</div><div class="l">Pipeline runtime</div></div>
    <div class="kpi"><div class="n">{m['sla_breaches']}</div><div class="l">SLA breaches</div></div>
  </div>

  <div class="grid">
    <div class="panel"><h3>Tasks completed (cumulative)</h3><canvas id="tasks"></canvas></div>
    <div class="panel"><h3>EOD freshness — on-time vs breach</h3><canvas id="ontime"></canvas></div>
    <div class="panel"><h3>Data-quality issues caught per day</h3><canvas id="dq"></canvas></div>
    <div class="panel"><h3>Pipeline runtime trend (did tuning help?)</h3><canvas id="runtime"></canvas></div>
    <div class="panel"><h3>Skills: start of month vs end</h3><canvas id="skills"></canvas></div>
    <div class="panel"><h3>Coach review scores (0–10)</h3><canvas id="scores"></canvas></div>
  </div>

  <div class="note good"><b>★ Your superpower:</b> {m['superpower']}</div>
  <div class="note lever"><b>▲ Biggest lever for next month:</b> {m['biggest_lever']}</div>
</div>
<footer>Generated by scripts/build_month.py · charts via Chart.js · data from logs/daily/*.md</footer>

<script>
const M = {data};
const grid = {{ color:'#1e2748' }}, tick = {{ color:'#97a2c0' }};
const baseOpts = {{ responsive:true, plugins:{{legend:{{labels:{{color:'#e8ecf5'}}}}}},
  scales:{{x:{{grid,ticks:tick}}, y:{{grid,ticks:tick,beginAtZero:true}}}} }};

new Chart(tasks, {{ type:'line', data:{{ labels:M.labels, datasets:[{{
  label:'Cumulative tasks', data:M.cumulative_tasks, borderColor:'#60a5fa',
  backgroundColor:'rgba(96,165,250,.25)', fill:true, tension:.3 }}]}},
  options:baseOpts }});

new Chart(ontime, {{ type:'bar', data:{{ labels:M.labels, datasets:[{{
  label:'On-time (1) / breach (0)', data:M.on_time,
  backgroundColor:M.on_time.map(v=>v? '#34d399':'#f87171') }}]}},
  options:{{...baseOpts, scales:{{...baseOpts.scales, y:{{...baseOpts.scales.y, max:1, ticks:{{...tick, stepSize:1}}}}}}}} }});

new Chart(dq, {{ type:'bar', data:{{ labels:M.labels, datasets:[{{
  label:'DQ issues caught', data:M.dq_caught, backgroundColor:'#fbbf24' }}]}},
  options:baseOpts }});

new Chart(runtime, {{ type:'line', data:{{ labels:M.labels, datasets:[{{
  label:'Runtime (s)', data:M.runtime, borderColor:'#34d399',
  backgroundColor:'rgba(52,211,153,.15)', fill:true, tension:.3 }}]}},
  options:baseOpts }});

new Chart(skills, {{ type:'radar', data:{{ labels:M.skills_axes, datasets:[
  {{ label:'Start', data:M.skills_start, borderColor:'#f87171',
     backgroundColor:'rgba(248,113,113,.15)' }},
  {{ label:'End', data:M.skills_end, borderColor:'#34d399',
     backgroundColor:'rgba(52,211,153,.2)' }} ]}},
  options:{{ responsive:true, plugins:{{legend:{{labels:{{color:'#e8ecf5'}}}}}},
    scales:{{ r:{{ angleLines:{{color:'#1e2748'}}, grid:{{color:'#1e2748'}},
      pointLabels:{{color:'#cfd6ea'}}, ticks:{{color:'#97a2c0', backdropColor:'transparent'}},
      suggestedMin:0, suggestedMax:10 }} }} }} }});

const sk = Object.keys(M.review_scores), sv = Object.values(M.review_scores);
new Chart(scores, {{ type:'bar', data:{{ labels:sk, datasets:[{{
  label:'Score', data:sv, backgroundColor:'#60a5fa' }}]}},
  options:{{ ...baseOpts, indexAxis:'y',
    scales:{{ x:{{grid,ticks:tick, max:10, beginAtZero:true}}, y:{{grid,ticks:tick}} }} }} }});
</script>
</body>
</html>
"""


def main() -> None:
    os.makedirs(LOGS, exist_ok=True)
    os.makedirs(REVIEWS, exist_ok=True)

    for i, d in enumerate(daterange(), start=1):
        p = PLAN.get(d.isoformat())
        path = os.path.join(LOGS, f"day-{i:02d}.md")
        with open(path, "w") as f:
            f.write(render_report(i, d, p))

    metrics = build_metrics()
    with open(os.path.join(REVIEWS, "metrics.json"), "w") as f:
        json.dump(metrics, f, indent=2)
    with open(os.path.join(REVIEWS, "performance_dashboard.html"), "w") as f:
        f.write(render_dashboard(metrics))

    print(f"Wrote {DAYS} daily reports to logs/daily/")
    print(f"Wrote reviews/metrics.json and reviews/performance_dashboard.html")
    print(f"Working days: {metrics['working_days']} · Tasks: {metrics['tasks_total']} · "
          f"On-time: {metrics['sla_on_time_pct']}% · DQ caught: {metrics['dq_issues_total']}")


if __name__ == "__main__":
    main()
