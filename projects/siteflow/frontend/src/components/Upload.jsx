export default function Upload({ documents, disabled, onUpload }) {
  return (
    <section className="panel">
      <header className="panel-head">
        <h2>Project files</h2>
        <p>PDF specs, RFI text, and one materials CSV.</p>
      </header>
      <label className="upload">
        <input
          type="file"
          accept=".pdf,.csv,.txt,application/pdf,text/csv,text/plain"
          disabled={disabled}
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (file) onUpload(file);
          }}
        />
        <span>{disabled ? "Uploading…" : "Upload a PDF, CSV, or text file"}</span>
      </label>
      {documents.length === 0 ? (
        <p className="empty">No files yet. The demo project loads the sample pack on the server.</p>
      ) : (
        <ul className="file-list">
          {documents.map((doc) => (
            <li key={doc.filename}>
              <span>{doc.filename}</span>
              <span className="meta">{doc.size} bytes</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
