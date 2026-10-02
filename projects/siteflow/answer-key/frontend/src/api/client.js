async function readError(response) {
  let detail = response.statusText;
  try {
    const body = await response.json();
    detail = body.detail || detail;
  } catch {
    // The body was not JSON. Keep the status text.
  }
  throw new Error(typeof detail === "string" ? detail : JSON.stringify(detail));
}

export async function uploadDocument(projectId, file) {
  const form = new FormData();
  form.append("file", file);
  const response = await fetch(`/api/projects/${projectId}/documents`, {
    method: "POST",
    body: form,
  });
  if (!response.ok) {
    await readError(response);
  }
  return response.json();
}

export async function listDocuments(projectId) {
  const response = await fetch(`/api/projects/${projectId}/documents`);
  if (!response.ok) {
    await readError(response);
  }
  return response.json();
}

export async function sendChat(projectId, threadId, message) {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ project_id: projectId, thread_id: threadId, message }),
  });
  if (!response.ok) {
    await readError(response);
  }
  return response.json();
}

export async function submitApproval(threadId, approved, note) {
  const response = await fetch(`/api/approvals/${threadId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ approved, note }),
  });
  if (!response.ok) {
    await readError(response);
  }
  return response.json();
}
