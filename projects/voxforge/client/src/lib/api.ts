export interface Game {
  id: string;
  name: string;
  description: string;
  updatedAt: string | null;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export type VoicePhase = "idle" | "listening" | "loading" | "thinking" | "speaking";

const API = "/api";

export async function fetchGames(): Promise<Game[]> {
  const res = await fetch(`${API}/games`);
  if (!res.ok) throw new Error("Failed to load games");
  return res.json();
}

export async function createGame(name: string): Promise<Game> {
  const res = await fetch(`${API}/games`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to create game");
  }
  return res.json();
}

export async function checkHealth(): Promise<{ ok: boolean; voice: string; chat: string; message: string }> {
  const res = await fetch(`${API}/health`);
  return res.json();
}

export async function transcribeAudio(blob: Blob): Promise<string> {
  if (!blob.size) throw new Error("Empty recording — speak longer and try again.");

  const form = new FormData();
  form.append("audio", blob, blob.type.includes("mp4") ? "speech.mp4" : "speech.webm");
  let res: Response;
  try {
    res = await fetch(`${API}/transcribe`, { method: "POST", body: form });
  } catch {
    throw new Error("Cannot reach server — run: cd projects/voxforge && npm run dev");
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Transcription failed (${res.status})`);
  }
  const data = await res.json();
  return data.text;
}

export interface ChatResult {
  reply: string;
  gameUpdated?: boolean;
  activeGameId?: string;
}

export async function chat(
  message: string,
  activeGameId: string | null,
  history: ChatMessage[]
): Promise<ChatResult> {
  const res = await fetch(`${API}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, activeGameId, history }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Chat failed");
  }
  return res.json();
}
