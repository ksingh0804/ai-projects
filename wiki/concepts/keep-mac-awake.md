---
title: Keep Mac Awake Script
type: concept
tags: [macos, utility, caffeinate, scripts]
created: 2026-05-20
updated: 2026-05-20
---

# Keep Mac Awake Script

**Script:** [`scripts/keep-on.sh`](../../scripts/keep-on.sh)

Runs `caffeinate -d` to prevent the display from sleeping.

## User command

When the user says **"keep it on"**, run in background:

```bash
/Users/ilkay1/ai-projects/scripts/keep-on.sh &
```

To stop: `pkill caffeinate`
