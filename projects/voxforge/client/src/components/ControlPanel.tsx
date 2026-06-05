import { useCallback, useEffect, useState } from "react";
import type { Game, VoicePhase } from "../lib/api";
import { checkHealth, createGame, fetchGames } from "../lib/api";
import { isVoiceSupported } from "../lib/speech";

interface Props {
  games: Game[];
  activeGameId: string | null;
  onSelectGame: (id: string | null) => void;
  onGamesChange: (games: Game[]) => void;
  phase: VoicePhase;
  statusHint: string;
  onAsk: () => void;
  error: string | null;
}

export default function ControlPanel({
  games,
  activeGameId,
  onSelectGame,
  onGamesChange,
  phase,
  statusHint,
  onAsk,
  error,
}: Props) {
  const [ready, setReady] = useState(false);
  const [apiMessage, setApiMessage] = useState("");

  useEffect(() => {
    setReady(isVoiceSupported());
    checkHealth().then((h) => setApiMessage(h.message));
  }, []);

  const handleNewGame = useCallback(async () => {
    const name = prompt("Name your new game:");
    if (!name?.trim()) return;
    try {
      const game = await createGame(name.trim());
      const updated = await fetchGames();
      onGamesChange(updated);
      onSelectGame(game.id);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Could not create game");
    }
  }, [onGamesChange, onSelectGame]);

  const askLabel =
    phase === "listening"
      ? "Listening… (click to send)"
      : phase === "loading"
        ? "Transcribing…"
        : phase === "thinking"
          ? "Thinking…"
          : phase === "speaking"
            ? "Speaking… (click to skip)"
            : "Ask me";

  return (
    <aside className="panel">
      <header className="panel__brand">
        <div className="panel__logo">VF</div>
        <div>
          <h1>VoxForge</h1>
          <p>Voice Game Studio</p>
        </div>
      </header>

      <section className="panel__section">
        <h2>Voice</h2>
        <button
          className={`ask-btn ${phase !== "idle" ? "ask-btn--active" : ""}`}
          onClick={onAsk}
          disabled={!ready || phase === "loading" || phase === "thinking"}
        >
          <span className="ask-btn__icon">{phase === "listening" ? "◉" : "🎙"}</span>
          <span>{askLabel}</span>
        </button>
        {!ready && (
          <p className="panel__hint panel__hint--warn">
            Voice needs a browser with mic support (Chrome recommended).
          </p>
        )}
        {statusHint && <p className="panel__hint">{statusHint}</p>}
        {error && <p className="panel__hint panel__hint--error">{error}</p>}
        <p className="panel__hint">{apiMessage}</p>
      </section>

      <section className="panel__section panel__section--grow">
        <div className="panel__section-head">
          <h2>Games</h2>
          <button className="ghost-btn" onClick={handleNewGame} title="New game">
            +
          </button>
        </div>

        <ul className="game-list">
          <li>
            <button
              className={`game-item ${activeGameId === null ? "game-item--active" : ""}`}
              onClick={() => onSelectGame(null)}
            >
              <span className="game-item__name">Studio Home</span>
              <span className="game-item__meta">No game selected</span>
            </button>
          </li>
          {games.map((g) => (
            <li key={g.id}>
              <button
                className={`game-item ${activeGameId === g.id ? "game-item--active" : ""}`}
                onClick={() => onSelectGame(g.id)}
              >
                <span className="game-item__name">{g.name}</span>
                <span className="game-item__meta">
                  {g.lastBuildLabel || g.id}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <footer className="panel__footer">
        Click <strong>Ask me</strong>, speak, then click again to send. Speech runs on your Mac — free, no API key.
      </footer>
    </aside>
  );
}
