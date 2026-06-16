# FreshCart data platform — container image.
# Built in CI, pushed to ECR, and run as the task image by MWAA/ECS in production.
# Pinned base + deps for reproducible builds.
FROM python:3.11-slim

WORKDIR /app

# Install deps first for layer caching.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source, contracts, tests.
COPY src/ ./src/
COPY contracts/ ./contracts/
COPY tests/ ./tests/

# Default: run the full orchestrated pipeline. Override the command in the
# orchestrator to run a single task (e.g. python src/run_pipeline.py).
CMD ["python", "src/orchestrate.py"]
