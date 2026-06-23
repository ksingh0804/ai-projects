/**
 * Real-time speech coaching — analyzes interim transcripts while the user speaks.
 * No external AI API; runs locally on Web Speech interim results.
 */

function normalize(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s']/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(text) {
  return normalize(text).split(" ").filter(Boolean);
}

function levenshtein(a, b) {
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[m][n];
}

function wordsMatch(a, b) {
  return a === b || levenshtein(a, b) <= 1;
}

const FILLERS = ["um", "uh", "er", "ah", "like", "you know", "so", "well"];

export function createLiveSession({ targetText = "", mode = "drill" } = {}) {
  return {
    targetText,
    mode,
    startedAt: performance.now(),
    lastSpeechAt: performance.now(),
    lastTipKey: "",
    lastTipAt: 0,
    lastSpokenLen: 0,
    peakScore: 0,
  };
}

export function buildWordProgress(targetText, spokenText) {
  const targetWords = tokenize(targetText);
  const spokenWords = tokenize(spokenText);
  if (!targetWords.length) return [];

  let spokenIdx = 0;
  return targetWords.map((word, i) => {
    while (spokenIdx < spokenWords.length && !wordsMatch(spokenWords[spokenIdx], word)) {
      spokenIdx++;
    }
    if (spokenIdx < spokenWords.length && wordsMatch(spokenWords[spokenIdx], word)) {
      spokenIdx++;
      return { word, status: "done", index: i };
    }
    const prevDone = i === 0 || targetWords.slice(0, i).every((_, j) => {
      const item = buildWordProgress(targetText, spokenText);
      return item[j]?.status === "done";
    });
    if (prevDone && i === spokenIdx) {
      return { word, status: "current", index: i };
    }
    return { word, status: i === 0 && !spokenWords.length ? "current" : "pending", index: i };
  });
}

/** Simpler sequential word progress tracker */
export function trackWordProgress(targetText, spokenText) {
  const targetWords = tokenize(targetText);
  const spokenWords = tokenize(spokenText);
  if (!targetWords.length) return [];

  let matched = 0;
  let sIdx = 0;
  for (let tIdx = 0; tIdx < targetWords.length; tIdx++) {
    while (sIdx < spokenWords.length && !wordsMatch(spokenWords[sIdx], targetWords[tIdx])) {
      sIdx++;
    }
    if (sIdx < spokenWords.length && wordsMatch(spokenWords[sIdx], targetWords[tIdx])) {
      matched++;
      sIdx++;
    } else {
      break;
    }
  }

  return targetWords.map((word, i) => {
    if (i < matched) return { word, status: "done", index: i };
    if (i === matched) return { word, status: "current", index: i };
    return { word, status: "pending", index: i };
  });
}

function detectRepetitions(words) {
  const hits = [];
  for (let i = 1; i < words.length; i++) {
    if (words[i] === words[i - 1]) hits.push(words[i]);
  }
  return [...new Set(hits)];
}

function detectPatterns(raw) {
  const patterns = [];
  const repetitionRegex = /\b(\w{1,4})\s+\1\b/gi;
  let match;
  while ((match = repetitionRegex.exec(raw)) !== null) {
    patterns.push({ type: "repetition", value: match[1] });
  }
  const prolongationRegex = /\b([bcdfghjklmnpqrstvwxyz])\1{2,}/gi;
  while ((match = prolongationRegex.exec(raw)) !== null) {
    patterns.push({ type: "prolongation", value: match[0] });
  }
  const lower = raw.toLowerCase();
  for (const filler of FILLERS) {
    const regex = new RegExp(`\\b${filler.replace(" ", "\\s+")}\\b`, "g");
    const count = (lower.match(regex) || []).length;
    if (count > 0) patterns.push({ type: "filler", value: filler, count });
  }
  return patterns;
}

function paceLabel(wpm, targetWpm = 110) {
  if (wpm <= 0) return { label: "Waiting…", tone: "neutral" };
  if (wpm < targetWpm * 0.55) return { label: "Very slow — that's okay", tone: "good" };
  if (wpm < targetWpm * 0.85) return { label: "Calm pace ✓", tone: "good" };
  if (wpm <= targetWpm * 1.25) return { label: "Good pace", tone: "good" };
  if (wpm <= targetWpm * 1.6) return { label: "A bit fast — breathe", tone: "warn" };
  return { label: "Too fast — slow down", tone: "warn" };
}

function pickTip(session, issues, progress, pace, mode) {
  const now = performance.now();
  const tips = [];

  if (issues.silenceSec >= 2.5) {
    tips.push({
      key: "silence",
      tone: "neutral",
      icon: "⏸",
      text: "Pause detected — breathe in slowly. No rush.",
    });
  }

  for (const rep of issues.repetitions.slice(0, 1)) {
    tips.push({
      key: `rep-${rep}`,
      tone: "warn",
      icon: "🔁",
      text: `Repeated "${rep}" — soft contact, try once more.`,
    });
  }

  for (const p of issues.patterns.filter((x) => x.type === "prolongation").slice(0, 1)) {
    tips.push({
      key: `pro-${p.value}`,
      tone: "warn",
      icon: "〰",
      text: "Stretch detected — ease into the sound, don't hold tension.",
    });
  }

  const fillers = issues.patterns.filter((x) => x.type === "filler");
  if (fillers.length) {
    tips.push({
      key: `fill-${fillers[0].value}`,
      tone: "warn",
      icon: "💬",
      text: `Filler "${fillers[0].value}" — pause silently instead.`,
    });
  }

  if (pace.tone === "warn") {
    tips.push({
      key: "pace-fast",
      tone: "warn",
      icon: "🐢",
      text: "Slow down — stretch the first sound of each word.",
    });
  }

  const current = progress.find((w) => w.status === "current");
  if (current && mode === "drill") {
    tips.push({
      key: `next-${current.word}`,
      tone: "neutral",
      icon: "🎯",
      text: `Next: "${current.word}" — gentle onset.`,
    });
  }

  if (issues.score >= 75 && !tips.some((t) => t.tone === "warn")) {
    tips.push({
      key: "flow-good",
      tone: "good",
      icon: "✨",
      text: "Smooth flow — keep this calm rhythm.",
    });
  }

  if (mode === "conversation" && issues.wordCount >= 3 && !tips.some((t) => t.tone === "warn")) {
    tips.push({
      key: "convo-good",
      tone: "good",
      icon: "👍",
      text: "Natural reply — stay relaxed.",
    });
  }

  return tips.slice(0, 3);
}

export function analyzeLiveUpdate(session, { spokenText, elapsedSec }) {
  const spokenWords = tokenize(spokenText);
  const wordCount = spokenWords.length;
  const now = performance.now();

  if (spokenText.length > session.lastSpokenLen) {
    session.lastSpeechAt = now;
    session.lastSpokenLen = spokenText.length;
  }

  const silenceSec = (now - session.lastSpeechAt) / 1000;
  const wpm = elapsedSec > 0.5 && wordCount > 0 ? Math.round((wordCount / elapsedSec) * 60) : 0;
  const pace = paceLabel(wpm);

  const repetitions = detectRepetitions(spokenWords);
  const patterns = detectPatterns(spokenText);

  let progress = [];
  let score = 50;
  let progressPct = 0;

  if (session.mode === "drill" && session.targetText) {
    progress = trackWordProgress(session.targetText, spokenText);
    const targetWords = tokenize(session.targetText);
    const done = progress.filter((w) => w.status === "done").length;
    progressPct = targetWords.length ? Math.round((done / targetWords.length) * 100) : 0;
    score = progressPct;
    if (spokenText.trim()) score += 5;
    if (pace.tone === "good") score += 10;
    score -= repetitions.length * 8;
    score -= patterns.filter((p) => p.type === "prolongation").length * 10;
    score -= patterns.filter((p) => p.type === "filler").length * 4;
  } else {
    progressPct = Math.min(100, wordCount * 12);
    score = 55;
    if (wordCount >= 2) score += 10;
    if (wordCount >= 5) score += 10;
    if (pace.tone === "good") score += 15;
    score -= repetitions.length * 10;
    score -= patterns.filter((p) => p.type === "filler").length * 5;
    score -= patterns.filter((p) => p.type === "prolongation").length * 8;
  }

  score = Math.max(0, Math.min(100, Math.round(score)));
  session.peakScore = Math.max(session.peakScore, score);

  const issues = { repetitions, patterns, silenceSec, wordCount, wpm, score };
  const tips = pickTip(session, issues, progress, pace, session.mode);

  let status = "listening";
  if (silenceSec >= 2.5 && wordCount === 0) status = "waiting";
  else if (silenceSec >= 2.5) status = "paused";
  else if (score >= 75) status = "flowing";
  else if (repetitions.length || patterns.some((p) => p.type !== "filler")) status = "coaching";

  return {
    score,
    peakScore: session.peakScore,
    progress,
    progressPct,
    wpm,
    pace,
    tips,
    status,
    wordCount,
    silenceSec,
  };
}

export function shouldSpeakTip(session, tip) {
  const now = performance.now();
  if (tip.key === session.lastTipKey && now - session.lastTipAt < 8000) return false;
  if (tip.tone === "good" && now - session.lastTipAt < 12000) return false;
  session.lastTipKey = tip.key;
  session.lastTipAt = now;
  return true;
}
