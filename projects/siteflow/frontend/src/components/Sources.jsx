export default function Sources({ sources }) {
  if (!sources?.length) return null;
  return (
    <ul className="sources">
      {sources.map((source) => (
        <li key={`${source.title}-${source.page}-${source.snippet.slice(0, 24)}`}>
          <strong>
            {source.title}
            {source.page ? `, p. ${source.page}` : ""}
          </strong>
          <p>{source.snippet}</p>
        </li>
      ))}
    </ul>
  );
}
