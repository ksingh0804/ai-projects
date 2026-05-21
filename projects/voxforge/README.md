# VoxForge

**Voice Game Studio** — forge browser games with your voice.

## Voice (free)

Uses the **browser Web Speech API** — no API key, no cost.

- **Speech → text:** Chrome `SpeechRecognition`
- **Text → speech:** Chrome `speechSynthesis`

Use **Chrome** for best results.

## Chat (free options)

| Mode | Setup |
|------|-------|
| **Ollama** (recommended) | `ollama pull llama3.2` then run Ollama |
| Built-in fallback | Works out of the box (simple replies) |
| OpenAI (optional) | Set `OPENAI_API_KEY` in `.env` |

## Run

```bash
cd projects/voxforge
npm install && npm run dev
```

Open **http://127.0.0.1:5173**

## Usage

1. Click **+** to create a game
2. Select a game for context
3. Click **Ask me**, speak, wait for voice reply

Games saved under `games/<slug>/`.
