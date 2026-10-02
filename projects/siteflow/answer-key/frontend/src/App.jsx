import { useEffect, useState } from "react";
import { listDocuments } from "./api/client";
import Chat from "./components/Chat";
import Upload from "./components/Upload";

const threadId = crypto.randomUUID();

export default function App() {
  const projectId = "demo";
  const [documents, setDocuments] = useState([]);
  const [error, setError] = useState("");

  async function refresh() {
    try {
      const body = await listDocuments(projectId);
      setDocuments(body.documents);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  return (
    <main>
      <h1>SiteFlow — {projectId}</h1>
      <Upload projectId={projectId} onUploaded={refresh} />
      {documents.length === 0 ? <p>Upload a spec or the materials CSV.</p> : null}
      <ul>
        {documents.map((doc) => (
          <li key={doc.filename}>
            {doc.filename} ({doc.bytes} bytes)
          </li>
        ))}
      </ul>
      {error ? <p style={{ color: "crimson" }}>{error}</p> : null}
      <Chat projectId={projectId} threadId={threadId} />
    </main>
  );
}
