import { useRef } from "react";
import type { Game, VoicePhase } from "../lib/api";

interface Props {
  activeGame: Game | null;
  phase: VoicePhase;
  lastUserText: string;
  lastReply: string;
  previewKey: number;
  readyHint: string;
}

export default function MainStage({
  activeGame,
  phase,
  lastUserText,
  lastReply,
  previewKey,
  readyHint,
}: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const focusGame = () => {
    iframeRef.current?.focus();
    try {
      iframeRef.current?.contentWindow?.focus();
    } catch {
      /* cross-origin safe */
    }
  };

  return (
    <main className="stage">
      <div className="stage__orb-wrap">
        <div className={`orb orb--${phase}`} aria-hidden />
        {phase === "listening" && <p className="stage__status">I'm listening… click Ask me when done</p>}
        {phase === "loading" && <p className="stage__status">Transcribing…</p>}
        {phase === "thinking" && <p className="stage__status">Building your game…</p>}
        {phase === "speaking" && (
          <p className="stage__status">Speaking… click Ask me to skip</p>
        )}
        {phase === "idle" && readyHint && <p className="stage__status stage__status--ready">{readyHint}</p>}
        {phase === "idle" && !lastReply && !readyHint && (
          <div className="stage__welcome">
            <h2>{activeGame ? activeGame.name : "Welcome to VoxForge"}</h2>
            <p>
              {activeGame
                ? 'Say "jump game", "shooter", or "snake" — then click the preview to play.'
                : "Create a game (+), select it, then tell me what to build."}
            </p>
          </div>
        )}
      </div>

      {(lastUserText || lastReply) && (
        <div className="transcript">
          {lastUserText && (
            <div className="transcript__line transcript__line--user">
              <span>You</span>
              <p>{lastUserText}</p>
            </div>
          )}
          {lastReply && (
            <div className="transcript__line transcript__line--bot">
              <span>VoxForge</span>
              <p>{lastReply}</p>
            </div>
          )}
        </div>
      )}

      {activeGame && (
        <div className="preview">
          <div className="preview__bar">
            <span>Preview — {activeGame.name}</span>
            <button type="button" className="preview__play-btn" onClick={focusGame}>
              Click to play ↗
            </button>
          </div>
          <iframe
            ref={iframeRef}
            title={`Preview ${activeGame.name}`}
            src={`/games/${activeGame.id}/index.html?v=${previewKey}`}
            className="preview__frame"
            tabIndex={0}
            onLoad={focusGame}
          />
        </div>
      )}
    </main>
  );
}
