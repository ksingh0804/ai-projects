import { useEffect, useState } from "react";
import { listDocuments, sendChat, submitApproval, uploadDocument } from "./api/client";
import ApprovalCard from "./components/ApprovalCard";
import Chat from "./components/Chat";
import Upload from "./components/Upload";

function newThreadId() {
  const suffix = crypto.randomUUID().slice(0, 8);
  return `thread-${suffix}`;
}

export default function App() {
  const [projectId, setProjectId] = useState("demo");
  const [projectDraft, setProjectDraft] = useState("demo");
  const [threadId, setThreadId] = useState(newThreadId);
  const [documents, setDocuments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [pending, setPending] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    listDocuments(projectId)
      .then((data) => {
        if (!cancelled) setDocuments(data.documents);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  function commitProject() {
    const next = projectDraft.trim() || "demo";
    setProjectDraft(next);
    if (next === projectId) return;
    setProjectId(next);
    setThreadId(newThreadId());
    setMessages([]);
    setPending(null);
    setError("");
  }

  async function onUpload(file) {
    setError("");
    setLoading(true);
    try {
      await uploadDocument(projectId, file);
      const data = await listDocuments(projectId);
      setDocuments(data.documents);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function onSend(message) {
    setError("");
    setLoading(true);
    setMessages((current) => [...current, { role: "user", content: message }]);
    try {
      const result = await sendChat({ projectId, threadId, message });
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: result.answer,
          sources: result.sources,
          route: result.route,
          agents: result.agents_used,
        },
      ]);
      setPending(
        result.needs_approval
          ? { recommendation: result.recommendation, threadId }
          : null,
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function onDecide(approved, note) {
    setError("");
    setLoading(true);
    try {
      const result = await submitApproval(pending.threadId, approved, note);
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: result.answer,
          sources: result.sources,
          route: result.route,
          agents: result.agents_used,
        },
      ]);
      setPending(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <header className="top">
        <div>
          <p className="eyebrow">Project controls assistant</p>
          <h1>SiteFlow</h1>
        </div>
        <label className="project">
          Project
          <input
            value={projectDraft}
            onChange={(event) => setProjectDraft(event.target.value)}
            onBlur={commitProject}
            onKeyDown={(event) => {
              if (event.key === "Enter") event.currentTarget.blur();
            }}
          />
        </label>
      </header>
      {error && <p className="error">{error}</p>}
      <main className="layout">
        <Upload documents={documents} disabled={loading} onUpload={onUpload} />
        <div className="stack">
          {pending && (
            <ApprovalCard
              recommendation={pending.recommendation}
              disabled={loading}
              onDecide={onDecide}
            />
          )}
          <Chat messages={messages} busy={loading} locked={Boolean(pending)} onSend={onSend} />
        </div>
      </main>
    </div>
  );
}
