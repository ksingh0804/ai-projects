import { useCallback, useEffect, useMemo, useState } from "react";
import ControlPanel from "./components/ControlPanel";
import MainStage from "./components/MainStage";
import { fetchGames } from "./lib/api";
import type { Game } from "./lib/api";
import { useVoiceAgent } from "./hooks/useVoiceAgent";

export default function App() {
  const [games, setGames] = useState<Game[]>([]);
  const [activeGameId, setActiveGameId] = useState<string | null>(null);
  const [previewKey, setPreviewKey] = useState(0);

  const activeGame = useMemo(
    () => games.find((g) => g.id === activeGameId) ?? null,
    [games, activeGameId]
  );

  const loadGames = useCallback(async () => {
    try {
      setGames(await fetchGames());
    } catch {
      /* server may not be up yet */
    }
  }, []);

  const handleSelectGame = useCallback((id: string | null) => {
    setActiveGameId(id);
    setPreviewKey((k) => k + 1);
  }, []);

  const handleGameBuilt = useCallback(
    async (gameId: string) => {
      setActiveGameId(gameId);
      await loadGames();
      setPreviewKey((k) => k + 1);
    },
    [loadGames]
  );

  const { phase, statusHint, readyHint, lastUserText, lastReply, error, toggleAsk } = useVoiceAgent(
    activeGameId,
    handleGameBuilt
  );

  useEffect(() => {
    loadGames();
  }, [loadGames]);

  return (
    <div className="app">
      <ControlPanel
        games={games}
        activeGameId={activeGameId}
        onSelectGame={handleSelectGame}
        onGamesChange={setGames}
        phase={phase}
        statusHint={statusHint || readyHint}
        onAsk={toggleAsk}
        error={error}
      />
      <MainStage
        activeGame={activeGame}
        phase={phase}
        lastUserText={lastUserText}
        lastReply={lastReply}
        previewKey={previewKey}
        readyHint={readyHint}
      />
    </div>
  );
}
