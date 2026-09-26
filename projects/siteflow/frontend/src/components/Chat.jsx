import { useState } from "react";
import Sources from "./Sources";

export default function Chat({ messages, busy, locked, onSend }) {
  const [draft, setDraft] = useState("");

  function submit(event) {
    event.preventDefault();
    const message = draft.trim();
    if (!message || busy || locked) return;
    setDraft("");
    onSend(message);
  }

  return (
    <section className="panel chat">
      <header className="panel-head">
        <h2>Ask the job</h2>
        <p>Specs and RFIs, materials math, or schedule risk. One question at a time.</p>
      </header>
      <ol className="messages">
        {messages.length === 0 && (
          <li className="empty">
            Try “What is the lead time language for structural steel?” or the EOQ question in the study guide.
          </li>
        )}
        {messages.map((message, index) => (
          <li key={index} className={message.role}>
            <span className="who">{message.role === "user" ? "You" : message.route || "SiteFlow"}</span>
            <p>{message.content}</p>
            {message.agents?.length > 0 && (
              <p className="meta">Agents: {message.agents.join(" → ")}</p>
            )}
            <Sources sources={message.sources} />
          </li>
        ))}
      </ol>
      <form onSubmit={submit} className="composer">
        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Ask about a spec, a SKU, EOQ, or a hold"
          rows={3}
          disabled={busy || locked}
        />
        <button type="submit" disabled={busy || locked || !draft.trim()}>
          {busy ? "Working…" : "Send"}
        </button>
        {locked && (
          <p className="fine">Approve or reject the open recommendation before asking another question.</p>
        )}
      </form>
    </section>
  );
}
