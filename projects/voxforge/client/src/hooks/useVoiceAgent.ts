import { useCallback, useRef, useState } from "react";
import type { ChatMessage, VoicePhase } from "../lib/api";
import { chat, transcribeAudio } from "../lib/api";
import { MicRecorder, speakText, stopSpeaking as cancelSpeech } from "../lib/speech";

export function useVoiceAgent(
  activeGameId: string | null,
  onGameBuilt?: (gameId: string) => void
) {
  const [phase, setPhase] = useState<VoicePhase>("idle");
  const [statusHint, setStatusHint] = useState("");
  const [lastUserText, setLastUserText] = useState("");
  const [lastReply, setLastReply] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [readyHint, setReadyHint] = useState("");
  const recorderRef = useRef<MicRecorder | null>(null);

  const processSpeech = useCallback(
    async (text: string) => {
      setPhase("thinking");
      setStatusHint("Building…");
      setReadyHint("");
      setError(null);

      if (!text.trim()) {
        setPhase("idle");
        setStatusHint("");
        setError("Didn't hear anything — try again.");
        return;
      }

      setLastUserText(text);

      try {
        const result = await chat(text, activeGameId, history);
        setLastReply(result.reply);
        setHistory((h) => [
          ...h,
          { role: "user", content: text },
          { role: "assistant", content: result.reply },
        ]);

        if (result.gameUpdated && result.activeGameId) {
          onGameBuilt?.(result.activeGameId);
        }

        setPhase("speaking");
        setStatusHint("");
        await speakText(result.reply);
        setPhase("idle");
        setReadyHint("Ready — click preview to play, or Ask me again.");
      } catch (err) {
        setPhase("idle");
        setStatusHint("");
        setError(err instanceof Error ? err.message : "Could not reach the server — is npm run dev running?");
      }
    },
    [activeGameId, history, onGameBuilt]
  );

  const toggleAsk = useCallback(async () => {
    if (phase === "speaking") {
      cancelSpeech();
      setPhase("idle");
      setReadyHint("Ready — Ask me again.");
      return;
    }

    if (phase === "listening") {
      const recorder = recorderRef.current;
      if (!recorder) return;

      try {
        setPhase("loading");
        setStatusHint("Transcribing…");
        const blob = await recorder.stop();
        recorderRef.current = null;
        const text = await transcribeAudio(blob);
        await processSpeech(text);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
        setPhase("idle");
        setStatusHint("");
      }
      return;
    }

    if (phase !== "idle") return;

    setError(null);
    setStatusHint("");
    setReadyHint("");
    cancelSpeech();

    try {
      const recorder = new MicRecorder();
      recorderRef.current = recorder;
      await recorder.start();
      setPhase("listening");
    } catch {
      setError("Microphone access denied. Allow mic in browser settings.");
    }
  }, [phase, processSpeech]);

  return {
    phase,
    statusHint,
    readyHint,
    lastUserText,
    lastReply,
    error,
    history,
    toggleAsk,
    stopSpeaking: cancelSpeech,
  };
}
