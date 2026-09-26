// The UI talks only to FastAPI. It does not call S3 or the agent graph.

async function read(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.detail || data.error || "Request failed");
    error.status = response.status;
    error.body = data;
    throw error;
  }
  return data;
}

export function uploadDocument(projectId, file) {
  const body = new FormData();
  body.append("file", file);
  return fetch(`/api/projects/${encodeURIComponent(projectId)}/documents`, {
    method: "POST",
    body,
  }).then(read);
}

export function listDocuments(projectId) {
  return fetch(`/api/projects/${encodeURIComponent(projectId)}/documents`).then(read);
}

export function sendChat({ projectId, threadId, message }) {
  return fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      project_id: projectId,
      thread_id: threadId,
      message,
    }),
  }).then(read);
}

export function submitApproval(threadId, approved, note) {
  return fetch(`/api/approvals/${encodeURIComponent(threadId)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ approved, note }),
  }).then(read);
}
