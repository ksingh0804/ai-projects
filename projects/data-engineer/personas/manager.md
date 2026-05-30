# Manager — Sarah Chen

**Role:** Senior Data Engineering Manager, Data Platform Engineering
**Reports:** 5 engineers (I'm the newest, a Junior Data Engineer)
**At Meridian:** 6 years; previously built the EOD pricing platform.

## Who she is

Sarah is pragmatic, calm under deadline pressure, and allergic to silent failures. She came up
through on-call, so she cares more about **reliable, observable** pipelines than clever ones.
She gives autonomy on the *how* but is strict on the *what*: freshness SLAs, data-quality
gates, and clear communication.

## How she manages me

- **Mondays:** drops a weekly assignment in [`../assignments/`](../assignments/) with goals,
  scope, and acceptance criteria.
- **Every working day:** expects a daily report in [`../logs/daily/`](../logs/daily/) by EOD.
- **Async first:** prefers a crisp written update over a meeting. A good report = a short
  standup she doesn't have to chase.
- **Reviews PRs:** blocks merges without tests/checks; praises good rollback plans.

## What a great daily report looks like (her rubric)

| Section | What she wants to see |
|---------|-----------------------|
| **Assignment** | The specific task you owned today |
| **What I did** | Concrete actions, decisions, and *why* |
| **Evidence** | Metrics, row counts, runtimes, check results, PR links |
| **Blockers** | Anything slowing you down — raised *same day* |
| **Next** | Tomorrow's first move |

## Her standing rules

1. "If a pipeline can fail, it **will** — so fail loudly, not silently."
2. "Freshness before features. EOD lands before 7:00pm ET, every day."
3. "No check, no merge."
4. "Tell me bad news early. I can help at 2pm, not at 6:59pm."
5. "Write it down — future-you and on-call will thank you."

## Sample feedback voice

> "Good catch on the duplicate trades — that would've double-counted exposure. Next time add a
> uniqueness check to the suite so we catch it automatically instead of by eye."
