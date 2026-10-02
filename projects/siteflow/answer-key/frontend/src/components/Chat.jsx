import { useState } from "react";
import { sendChat, submitApproval } from "../api/client";
import ApprovalCard from "./ApprovalCard";
import Sources from "./Sources";

export default function Chat({ projectId, threadId }) {
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState(null);

  async function onSend(event) {
    event.preventDefault();
    const message = draft.trim();
    if (!message) {
      return;
    }
    setMessages((current) => [...current, { role: "user", text: message }]);
    setDraft("");
    setBusy(true);
    setError("");
    try {
      const body = await sendChat(projectId, threadId, message);
      setMessages((current) => [...current, { role: "assistant", text: body.answer, sources: body.sources }]);
      setPending(body.needs_approval ? body : null);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function onDecide(approved) {
    setBusy(true);
    setError("");
    try {
      const body = await submitApproval(threadId, approved, "");
      setMessages((current) => [...current, { role: "assistant", text: body.answer, sources: body.sources }]);
      setPending(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section>
      {messages.length === 0 ? <p>Ask about a spec, an RFI, or an EOQ.</p> : null}
      {messages.map((message, index) => (
        <article key={index}>
          <strong>{message.role === "user" ? "You" : "SiteFlow"}</strong>
          <p>{message.text}</p>
          <Sources sources={message.sources} />
        </article>
      ))}
      {pending ? <ApprovalCard onDecide={onDecide} /> : null}
      {error ? <p style={{ color: "crimson" }}>{error}</p> : null}
      <form onSubmit={onSend}>
        <input value={draft} onChange={(event) => setDraft(event.target.value)} />
        <button type="submit" disabled={busy}>
          {busy ? "Working…" : "Send"}
        </button>
      </form>
    </section>
  );
}
