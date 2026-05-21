export function isVoiceSupported(): boolean {
  return Boolean(navigator.mediaDevices?.getUserMedia && window.MediaRecorder && "speechSynthesis" in window);
}

function getMimeType(): string {
  if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) return "audio/webm;codecs=opus";
  if (MediaRecorder.isTypeSupported("audio/webm")) return "audio/webm";
  if (MediaRecorder.isTypeSupported("audio/mp4")) return "audio/mp4";
  return "";
}

export class MicRecorder {
  private stream: MediaStream | null = null;
  private recorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];

  async start(): Promise<void> {
    this.chunks = [];
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mimeType = getMimeType();
    this.recorder = mimeType
      ? new MediaRecorder(this.stream, { mimeType })
      : new MediaRecorder(this.stream);

    this.recorder.ondataavailable = (e) => {
      if (e.data.size > 0) this.chunks.push(e.data);
    };

    this.recorder.start(250);
  }

  stop(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.recorder || !this.stream) {
        reject(new Error("Not recording"));
        return;
      }

      const recorder = this.recorder;
      const stream = this.stream;

      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(this.chunks, { type: recorder.mimeType || "audio/webm" });
        this.recorder = null;
        this.stream = null;
        resolve(blob);
      };

      recorder.onerror = () => reject(new Error("Recording failed"));
      recorder.requestData();
      recorder.stop();
    });
  }

  cancel() {
    if (this.recorder?.state === "recording") this.recorder.stop();
    this.stream?.getTracks().forEach((t) => t.stop());
    this.recorder = null;
    this.stream = null;
    this.chunks = [];
  }
}

export function waitForVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const voices = speechSynthesis.getVoices();
    if (voices.length) {
      resolve(voices);
      return;
    }
    speechSynthesis.onvoiceschanged = () => resolve(speechSynthesis.getVoices());
    setTimeout(() => resolve(speechSynthesis.getVoices()), 500);
  });
}

/** Speak aloud; always resolves quickly so the UI never gets stuck. */
export async function speakText(text: string): Promise<void> {
  if (!("speechSynthesis" in window)) return;

  speechSynthesis.cancel();
  const short = text.length > 120 ? `${text.slice(0, 117)}…` : text;
  const voices = await waitForVoices();
  const preferred =
    voices.find((v) => v.lang.startsWith("en") && v.localService) ??
    voices.find((v) => v.lang.startsWith("en")) ??
    voices[0];

  return new Promise((resolve) => {
    const utterance = new SpeechSynthesisUtterance(short);
    utterance.rate = 1.05;
    if (preferred) utterance.voice = preferred;

    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      clearInterval(resumeTimer);
      clearTimeout(maxTimer);
      resolve();
    };

    // Chrome sometimes pauses TTS mid-utterance
    const resumeTimer = setInterval(() => {
      if (speechSynthesis.speaking) speechSynthesis.resume();
    }, 200);

    // Never block the user longer than 8 seconds
    const maxTimer = setTimeout(() => {
      speechSynthesis.cancel();
      finish();
    }, 8000);

    utterance.onend = finish;
    utterance.onerror = finish;
    speechSynthesis.speak(utterance);
  });
}

export function stopSpeaking() {
  speechSynthesis.cancel();
}
