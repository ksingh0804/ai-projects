import { useCallback, useMemo, useRef, useState } from "react";
import type { Game, VoicePhase } from "../lib/api";

interface Props {
  activeGame: Game | null;
  phase: VoicePhase;
  lastUserText: string;
  lastReply: string;
  previewKey: number;
  readyHint: string;
}

const CONTROL_HINTS: Record<string, string> = {
  platformer: "Arrows + Space to jump",
  shooter: "Arrows + Space to shoot",
  snake: "Arrow keys to steer",
  dodge: "Arrow keys to dodge",
  collector: "Arrows to move & collect",
  pong: "Mouse to move paddle",
  racer: "Arrows to steer",
  flappy: "Space / click to flap",
  archery: "Up/down aim, Space to shoot",
  arcade: "Arrows + Space",
};

export default function MainStage({
  activeGame,
  phase,
  lastUserText,
  lastReply,
  previewKey,
  readyHint,
}: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [needsClick, setNeedsClick] = useState(true);

  const activateGame = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    try {
      const doc = iframe.contentDocument;
      const win = iframe.contentWindow;
      if (!doc || !win) return;

      const start = doc.getElementById("start");
      if (start instanceof HTMLElement) {
        start.click();
      } else {
        doc.getElementById("c")?.focus();
      }
      win.focus();
      setNeedsClick(false);
    } catch {
      /* fallback: open game directly */
      window.open(`/games/${activeGame?.id}/index.html?v=${previewKey}`, "_blank");
    }
  }, [activeGame?.id, previewKey]);

  const handleIframeLoad = useCallback(() => {
    setNeedsClick(true);
  }, [previewKey]);

  const previewVersion = useMemo(
    () => `${previewKey}-${activeGame?.updatedAt ?? "0"}`,
    [previewKey, activeGame?.updatedAt]
  );

  const controlHint = activeGame?.lastBuild
    ? CONTROL_HINTS[activeGame.lastBuild] || "Click to play"
    : "Click to play";

  const previewCaption = activeGame?.buildSummary || activeGame?.description || "Tell VoxForge what to build";
  const typeLabel = activeGame?.lastBuildLabel || "Not built yet";

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
                ? 'Describe the game you want: "flappy bird", "archery", "jump game", "snake", "racing", etc. Check the transcript to confirm what I heard.'
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
            <div className="preview__meta">
              <span className="preview__title">Preview — {activeGame.name}</span>
              <span className="preview__type">{typeLabel}</span>
              <span className="preview__brief">{previewCaption}</span>
            </div>
            <button type="button" className="preview__play-btn" onClick={activateGame}>
              Click to play ↗
            </button>
          </div>
          <div className="preview__body">
            {needsClick && (
              <button type="button" className="preview__overlay" onClick={activateGame}>
                Click here to play
                <span>{controlHint}</span>
              </button>
            )}
            <iframe
              ref={iframeRef}
              title={`Preview ${activeGame.name}`}
              src={`/games/${activeGame.id}/index.html?v=${previewVersion}`}
              className="preview__frame"
              onLoad={handleIframeLoad}
            />
          </div>
        </div>
      )}
    </main>
  );
}
