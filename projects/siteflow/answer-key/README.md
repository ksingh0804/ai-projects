# Answer key

Worked SiteFlow backend, tests, IAM policy, eval questions, and the React client.

Open this only after a step in `../MENTOR.md` fails twice. Read the one file that matches the step, type it into `projects/siteflow/backend/` yourself, and run that step’s check.

The tests here are the checks. From this folder’s `backend/`:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
pytest -q
```

The React files in `frontend/src` drop into the Vite app you create in Step 13. They are not a full `npm` project on their own.
