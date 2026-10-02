export default function Sources({ sources }) {
  if (!sources || sources.length === 0) {
    return null;
  }
  return (
    <div>
      {sources.map((source) => (
        <p key={`${source.title}-${source.page}`}>
          <strong>
            {source.title} p.{source.page}
          </strong>
          <br />
          {source.snippet}
        </p>
      ))}
    </div>
  );
}
