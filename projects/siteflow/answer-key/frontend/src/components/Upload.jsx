import { useState } from "react";
import { uploadDocument } from "../api/client";

export default function Upload({ projectId, onUploaded }) {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(event) {
    event.preventDefault();
    if (!file) {
      return;
    }
    setBusy(true);
    setError("");
    try {
      await uploadDocument(projectId, file);
      setFile(null);
      await onUploaded();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <input type="file" onChange={(event) => setFile(event.target.files[0])} />
      <button type="submit" disabled={busy || !file}>
        {busy ? "Uploading…" : "Upload"}
      </button>
      {error ? <p style={{ color: "crimson" }}>{error}</p> : null}
    </form>
  );
}
