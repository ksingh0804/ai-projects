import { pipeline } from "@xenova/transformers";
import { spawn } from "child_process";
import ffmpegPath from "ffmpeg-static";
import fs from "fs/promises";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";
import wavefile from "wavefile";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CACHE_DIR = path.join(__dirname, "..", ".cache");

/** @type {import("@xenova/transformers").AutomaticSpeechRecognitionPipeline | null} */
let transcriber = null;
/** @type {Promise<unknown> | null} */
let loading = null;

async function getTranscriber() {
  if (transcriber) return transcriber;
  if (loading) return loading;

  loading = pipeline("automatic-speech-recognition", "Xenova/whisper-tiny.en", {
    cache_dir: CACHE_DIR,
  }).then((pipe) => {
    transcriber = pipe;
    return transcriber;
  });

  return loading;
}

function convertToWav(inputPath, outputPath) {
  if (!ffmpegPath) throw new Error("ffmpeg not available");

  return new Promise((resolve, reject) => {
    const proc = spawn(ffmpegPath, [
      "-i",
      inputPath,
      "-ar",
      "16000",
      "-ac",
      "1",
      "-f",
      "wav",
      "-y",
      outputPath,
    ]);

    let stderr = "";
    proc.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    proc.on("close", (code) => {
      if (code === 0) resolve(undefined);
      else reject(new Error(stderr.trim() || `ffmpeg failed (code ${code})`));
    });
    proc.on("error", reject);
  });
}

function wavBufferToSamples(buffer) {
  const wav = new wavefile.WaveFile(buffer);
  wav.toBitDepth("32f");
  wav.toSampleRate(16000);
  let samples = wav.getSamples();
  if (Array.isArray(samples)) samples = samples[0];
  return samples;
}

export async function transcribeAudioBuffer(buffer, mimeType = "audio/webm") {
  if (!buffer?.length) throw new Error("Empty recording — speak longer and try again.");

  const ext = mimeType.includes("wav")
    ? "wav"
    : mimeType.includes("mp4")
      ? "mp4"
      : "webm";
  const inputPath = path.join(os.tmpdir(), `voxforge-${Date.now()}.${ext}`);
  let wavPath = null;

  try {
    await fs.writeFile(inputPath, buffer);

    if (ext === "wav") {
      wavPath = inputPath;
    } else {
      wavPath = `${inputPath}.wav`;
      await convertToWav(inputPath, wavPath);
    }

    const wavBuffer = await fs.readFile(wavPath);
    const audioData = wavBufferToSamples(wavBuffer);
    const pipe = await getTranscriber();
    const result = await pipe(audioData);
    return (typeof result === "string" ? result : result?.text ?? "").trim();
  } finally {
    await fs.unlink(inputPath).catch(() => {});
    if (wavPath && wavPath !== inputPath) await fs.unlink(wavPath).catch(() => {});
  }
}

export async function warmWhisper() {
  console.log("Loading Whisper model (first run downloads ~40MB)…");
  await getTranscriber();
  console.log("Whisper ready.");
}
