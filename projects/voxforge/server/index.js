import "dotenv/config";
import cors from "cors";
import express from "express";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import OpenAI from "openai";
import multer from "multer";
import { transcribeAudioBuffer, warmWhisper } from "./whisper.js";
import { tryBuildGame } from "./game-builder.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const GAMES_DIR = path.join(ROOT, "games");
const PORT = process.env.PORT || 8787;

const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.2";

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const app = express();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });

app.use(cors());
app.use(express.json());

async function ensureGamesDir() {
  await fs.mkdir(GAMES_DIR, { recursive: true });
}

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48) || `game-${Date.now()}`;
}

async function readGameMeta(gamePath) {
  try {
    const raw = await fs.readFile(path.join(gamePath, "meta.json"), "utf8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function listGames() {
  await ensureGamesDir();
  const entries = await fs.readdir(GAMES_DIR, { withFileTypes: true });
  const games = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const gamePath = path.join(GAMES_DIR, entry.name);
    const meta = await readGameMeta(gamePath);
    games.push({
      id: entry.name,
      name: meta?.name || entry.name,
      description: meta?.description || "",
      updatedAt: meta?.updatedAt || null,
    });
  }

  return games.sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
}

function systemPrompt(activeGame) {
  const gameLine = activeGame
    ? `Active game: "${activeGame.name}" (id: ${activeGame.id}). All requests apply to this game unless the user switches context.`
    : "No active game selected. Help the user start a new game idea or pick one from the sidebar.";

  return `You are VoxForge, a voice-first game design assistant. You help users brainstorm and build browser games through conversation.

${gameLine}

Keep responses concise (2-4 sentences) since they will be spoken aloud. Be enthusiastic and creative. When the user describes a game, acknowledge the idea and outline the next step (mechanics, art style, or first playable prototype). Game files will be created in the games folder — for now focus on clarifying the vision and confirming what to build next.`;
}

async function ollamaAvailable() {
  try {
    const res = await fetch(`${OLLAMA_URL}/api/tags`, { signal: AbortSignal.timeout(1500) });
    return res.ok;
  } catch {
    return false;
  }
}

async function chatWithOllama(messages) {
  const res = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: OLLAMA_MODEL, messages, stream: false }),
  });
  if (!res.ok) throw new Error("Ollama request failed");
  const data = await res.json();
  return data.message?.content || "I didn't catch that. Try again?";
}

async function generateReply(message, activeGame, history) {
  const built = await tryBuildGame(message, activeGame, GAMES_DIR);
  if (built) return built;

  if (!activeGame) {
    return {
      reply:
        "Select a game from the sidebar or say something like: create a jump game called Sky Hop.",
      gameUpdated: false,
    };
  }

  const messages = [
    { role: "system", content: systemPrompt(activeGame) },
    ...history.slice(-8).map((h) => ({ role: h.role, content: h.content })),
    { role: "user", content: message.trim() },
  ];

  if (openai) {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      max_tokens: 300,
    });
    return {
      reply: completion.choices[0]?.message?.content || "I didn't catch that. Try again?",
      gameUpdated: false,
    };
  }

  if (await ollamaAvailable()) {
    return { reply: await chatWithOllama(messages), gameUpdated: false };
  }

  return {
    reply: `I'm not sure how to build that yet. Try: "make it a jump game", "build a shooter", or "create snake game".`,
    gameUpdated: false,
  };
}

// --- Routes ---

app.get("/api/health", async (_req, res) => {
  const hasOllama = await ollamaAvailable();
  const chat = openai ? "openai" : hasOllama ? "ollama" : "local";
  const chatNote =
    chat === "openai"
      ? "Chat via OpenAI"
      : chat === "ollama"
        ? `Chat via Ollama (${OLLAMA_MODEL})`
        : "Chat via built-in replies (install Ollama for smarter chat)";

  res.json({
    ok: true,
    voice: "local-whisper",
    chat,
    message: `Voice: local Whisper on server (free). ${chatNote}.`,
  });
});

app.get("/api/games", async (_req, res) => {
  try {
    res.json(await listGames());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/games", async (req, res) => {
  try {
    const { name, description = "" } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: "Name required" });

    const id = slugify(name);
    const gamePath = path.join(GAMES_DIR, id);

    try {
      await fs.access(gamePath);
      return res.status(409).json({ error: "Game already exists", id });
    } catch {
      /* new game */
    }

    await fs.mkdir(gamePath, { recursive: true });
    const meta = {
      id,
      name: name.trim(),
      description: description.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await fs.writeFile(path.join(gamePath, "meta.json"), JSON.stringify(meta, null, 2));
    await fs.writeFile(
      path.join(gamePath, "index.html"),
      `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${meta.name}</title>
  <style>
    body { margin: 0; min-height: 100vh; display: grid; place-items: center;
      background: #0a0a12; color: #e8e8ff; font-family: system-ui, sans-serif; }
    h1 { font-size: 2rem; opacity: 0.9; }
    p { opacity: 0.6; }
  </style>
</head>
<body>
  <div>
    <h1>${meta.name}</h1>
    <p>Your game will appear here. Tell VoxForge what to build.</p>
  </div>
</body>
</html>`
    );

    res.status(201).json(meta);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/transcribe", upload.single("audio"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No audio file" });

  try {
    const text = await transcribeAudioBuffer(req.file.buffer, req.file.mimetype);
    res.json({ text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/chat", async (req, res) => {
  const { message, activeGameId, history = [] } = req.body;
  if (!message?.trim()) return res.status(400).json({ error: "Message required" });

  try {
    const games = await listGames();
    const activeGame = games.find((g) => g.id === activeGameId) || null;
    const result = await generateReply(message, activeGame, history);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve generated games for preview
app.use("/games", express.static(GAMES_DIR));

// Serve built client in production
const clientDist = path.join(ROOT, "client", "dist");
app.use(express.static(clientDist));
app.get("*", (_req, res, next) => {
  if (_req.path.startsWith("/api")) return next();
  res.sendFile(path.join(clientDist, "index.html"), (err) => {
    if (err) next();
  });
});

await ensureGamesDir();
app.listen(PORT, async () => {
  console.log(`VoxForge server → http://localhost:${PORT}`);
  console.log("Voice: local Whisper on server (free)");
  warmWhisper().catch((err) => console.warn("Whisper preload skipped:", err.message));
  const hasOllama = await ollamaAvailable();
  if (openai) console.log("Chat: OpenAI");
  else if (hasOllama) console.log(`Chat: Ollama (${OLLAMA_MODEL})`);
  else console.log("Chat: built-in fallback (run Ollama for free smart chat)");
});
