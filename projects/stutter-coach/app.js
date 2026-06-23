import {
  CONVERSATION_SCENARIOS,
  analyzeConversationTurn,
  buildCoachReply,
  getRound,
  buildRoundSummary,
  getRoundCount,
} from "./conversation.js";
import {
  WEEKLY_PLAN,
  getWeekStartISO,
  getTodayPlanDay,
  dayKeyForDate,
  evaluateWeek,
} from "./weekly-plan.js";
import {
  SLOT_LABELS,
  getPulseTask,
  getTodayDateKey,
  getCurrentSlotIndex,
  msUntilNextSlot,
  formatCountdown,
  runImprovementCheck,
  buildImprovementEntry,
  summarizeImprovementLog,
} from "./improvement-cycle.js";
import {
  createLiveSession,
  analyzeLiveUpdate,
  shouldSpeakTip,
} from "./realtime-coach.js";

const STORAGE_KEY = "stutter-coach-v1";

const EXERCISES = [
  {
    id: "live-coach",
    title: "Live Coach",
    description: "Real-time voice analysis",
    mode: "live",
    instruction:
      "Tap the mic and start speaking. The coach analyzes your voice live — pace, repetitions, fillers, and word progress — and gives instant tips while you talk.",
    prompts: [
      {
        text: "My name is Kosta. I am practicing calm, clear speech one word at a time.",
        tip: "Watch the live score and word chips — green means you're on track.",
      },
      {
        text: "Today I will speak slowly, breathe between phrases, and stay relaxed.",
        tip: "If pace turns yellow, pause and take one slow breath.",
      },
      {
        text: "I can communicate clearly even when I feel tension in my voice.",
        tip: "Live tips appear instantly — adjust without stopping.",
      },
    ],
  },
  {
    id: "small-talk",
    title: "Small Talk",
    description: "Two-way chat + feedback loop",
    mode: "conversation",
    scenarioId: "daily",
    instruction:
      "Have a real back-and-forth conversation. The coach speaks first, you respond, get feedback, then the coach asks the next question. Repeat each round to build fluency.",
  },
  {
    id: "baseline",
    title: "Introduction",
    description: "Name + calm opener",
    instruction:
      "Speak at your natural pace first. We'll use this as your baseline to compare against later rounds.",
    prompts: [
      {
        text: "My name is Kosta. I am practicing speaking clearly and calmly today.",
        tip: "Let your name flow gently — ease into the K, don't punch it.",
      },
      {
        text: "Hello, my name is Kosta. It's nice to meet you.",
        tip: "Watch the first sound of each sentence — soft starts help.",
      },
    ],
  },
  {
    id: "gentle-onset",
    title: "Gentle Onset",
    description: "Ease into first sounds",
    instruction:
      "Say each word slowly. Ease into the first sound like a whisper growing into speech — never punch consonants.",
    prompts: [
      { text: "people", tip: "Soft lips on P — barely touch before voicing." },
      { text: "morning", tip: "Hum the M first, then open into the word." },
      { text: "speaking", tip: "Gentle S hiss, light P contact." },
      { text: "clearly", tip: "Soft K — let the word roll out." },
      { text: "calmly", tip: "Easy K onset, relaxed jaw." },
    ],
  },
  {
    id: "slow-reading",
    title: "Slow Reading",
    description: "Half speed, full control",
    instruction:
      "Read at half your normal speed. Pause briefly at every comma and period. Gentle onsets on every word.",
    prompts: [
      {
        text: "Today, I am learning to speak with calm and control.",
        tip: "Pause at the comma. One phrase at a time.",
      },
      {
        text: "I do not need to rush. Each word can come when I am ready.",
        tip: "Stretch the first word of each sentence slightly.",
      },
      {
        text: "I am making progress, one sentence at a time.",
        tip: "End confidently — the last word matters too.",
      },
    ],
  },
  {
    id: "plosives",
    title: "Hard Consonants",
    description: "P, B, T, K drills",
    instruction:
      "These sounds trigger blocks for many people. Use light articulatory contact — tongue and lips barely touch.",
    prompts: [
      { text: "practice", tip: "Light P — think 'almost saying it'." },
      { text: "because", tip: "Soft B — let vibration start before lips part." },
      { text: "talking", tip: "Light T — tongue tip barely taps." },
      { text: "Kosta", tip: "Easy K — don't build pressure behind it." },
      { text: "presentation", tip: "Break it: pre — sen — ta — tion." },
    ],
  },
  {
    id: "challenge",
    title: "Your Words",
    description: "Custom challenge list",
    instruction:
      "Practice the words you added in the sidebar. Add at least one word to use this exercise.",
    prompts: [],
    dynamic: true,
  },
];

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

const CANONICAL_HOST = "127.0.0.1";
const CANONICAL_PORT = "8787";
const CANONICAL_URL = `http://${CANONICAL_HOST}:${CANONICAL_PORT}/`;

const state = {
  exerciseId: "baseline",
  promptIndex: 0,
  challengeWords: ["Kosta"],
  history: [],
  weeklyProgress: {
    weekStart: getWeekStartISO(),
    completedDays: {},
  },
  pulseProgress: {
    date: getTodayDateKey(),
    completedSlots: [],
    lastSlotIndex: getCurrentSlotIndex(),
    iteration: 0,
    improvementLog: [],
    activePulseKey: null,
    activeTask: null,
    streakDays: {},
    streakCurrent: 0,
    streakBest: 0,
  },
  recognition: null,
  listening: false,
  micReady: false,
  speechStart: null,
  timerInterval: null,
  finalTranscript: "",
  interimTranscript: "",
  conversation: {
    active: false,
    scenarioId: "daily",
    round: 0,
    turnIndex: 0,
    retries: 0,
    roundScores: [],
    processing: false,
    continueTimer: null,
    roundFinished: false,
  },
  settings: {
    speakPrompts: true,
    showInterim: true,
    autoContinue: true,
    realtimeCoach: true,
    speakLiveTips: false,
  },
  liveSession: null,
  liveCoachTimer: null,
};

const $ = (id) => document.getElementById(id);

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);
    if (saved.challengeWords?.length) state.challengeWords = saved.challengeWords;
    if (saved.history) state.history = saved.history;
    if (saved.settings) state.settings = { ...state.settings, ...saved.settings };
    if (saved.weeklyProgress) {
      const currentWeek = getWeekStartISO();
      if (saved.weeklyProgress.weekStart === currentWeek) {
        state.weeklyProgress = saved.weeklyProgress;
      } else {
        state.weeklyProgress = { weekStart: currentWeek, completedDays: {} };
      }
    }
    if (saved.pulseProgress) {
      state.pulseProgress = { ...state.pulseProgress, ...saved.pulseProgress };
      state.pulseProgress.activePulseKey = null;
      state.pulseProgress.activeTask = null;
      if (state.pulseProgress.date !== getTodayDateKey()) {
        state.pulseProgress.date = getTodayDateKey();
        state.pulseProgress.completedSlots = [];
      }
    }
  } catch {
    /* ignore corrupt storage */
  }
}

function saveState() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      challengeWords: state.challengeWords,
      history: state.history.slice(0, 50),
      settings: state.settings,
      weeklyProgress: state.weeklyProgress,
      pulseProgress: {
        ...state.pulseProgress,
        improvementLog: state.pulseProgress.improvementLog.slice(0, 40),
      },
    })
  );
}

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
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[m][n];
}

function wordAccuracy(targetWords, spokenWords) {
  if (!targetWords.length) return 0;
  let matches = 0;
  const spoken = [...spokenWords];
  for (const word of targetWords) {
    const idx = spoken.findIndex((w) => w === word || levenshtein(w, word) <= 1);
    if (idx !== -1) {
      matches++;
      spoken.splice(idx, 1);
    }
  }
  return matches / targetWords.length;
}

function detectRepetitions(words) {
  const hits = [];
  for (let i = 1; i < words.length; i++) {
    if (words[i] === words[i - 1]) {
      hits.push(words[i]);
    }
  }
  return [...new Set(hits)];
}

function detectStutterPatterns(raw) {
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
  const fillers = ["um", "uh", "er", "ah", "like", "you know"];
  const lower = raw.toLowerCase();
  for (const filler of fillers) {
    const regex = new RegExp(`\\b${filler}\\b`, "g");
    const count = (lower.match(regex) || []).length;
    if (count > 0) patterns.push({ type: "filler", value: filler, count });
  }
  return patterns;
}

function analyzeSpeech(targetText, spokenText, durationSec) {
  const targetWords = tokenize(targetText);
  const spokenWords = tokenize(spokenText);
  const accuracy = wordAccuracy(targetWords, spokenWords);
  const repetitions = detectRepetitions(spokenWords);
  const patterns = detectStutterPatterns(spokenText);
  const missing = targetWords.filter(
    (w) => !spokenWords.some((s) => s === w || levenshtein(s, w) <= 1)
  );
  const extra = spokenWords.filter(
    (w) => !targetWords.some((t) => t === w || levenshtein(t, w) <= 1)
  );

  let score = Math.round(accuracy * 70);
  if (spokenText.trim()) score += 10;
  if (durationSec > 0 && durationSec < targetWords.length * 2.5) score += 10;
  if (!repetitions.length) score += 5;
  if (!patterns.filter((p) => p.type !== "filler").length) score += 5;
  score -= repetitions.length * 8;
  score -= patterns.filter((p) => p.type === "prolongation").length * 10;
  score -= Math.max(0, missing.length - 1) * 6;
  score = Math.max(0, Math.min(100, score));

  const feedback = [];

  if (score >= 85) {
    feedback.push({
      tone: "good",
      icon: "✅",
      text: "Strong round — your words matched the target well. Keep this pace.",
    });
  } else if (score >= 60) {
    feedback.push({
      tone: "warn",
      icon: "🟡",
      text: "Good effort. Slow down slightly and ease into the first sound of each word.",
    });
  } else {
    feedback.push({
      tone: "warn",
      icon: "🔴",
      text: "Tough round — that's normal. Try again at half speed with gentle onsets.",
    });
  }

  if (repetitions.length) {
    feedback.push({
      tone: "warn",
      icon: "🔁",
      text: `Repeated word detected: "${repetitions.join('", "')}". Pause one beat, then say it once with a soft start.`,
    });
  }

  for (const p of patterns.filter((x) => x.type === "prolongation")) {
    feedback.push({
      tone: "warn",
      icon: "〰️",
      text: `Prolonged sound "${p.value}" — release tension in your jaw and lips.`,
    });
  }

  const fillerHits = patterns.filter((p) => p.type === "filler");
  if (fillerHits.length) {
    feedback.push({
      tone: "tip",
      icon: "💨",
      text: "Fillers detected. Take a breath before starting — silence is fine.",
    });
  }

  if (missing.length) {
    feedback.push({
      tone: "tip",
      icon: "📝",
      text: `Missing or unclear: "${missing.slice(0, 4).join('", "')}". Break the phrase into smaller chunks.`,
    });
  }

  if (extra.length > 2) {
    feedback.push({
      tone: "tip",
      icon: "➕",
      text: "Extra words detected — focus on matching the prompt exactly.",
    });
  }

  if (durationSec > targetWords.length * 4) {
    feedback.push({
      tone: "tip",
      icon: "⏱️",
      text: "You took a while — that's okay. Blocks cost time. Gentle onsets will speed you up over practice.",
    });
  }

  if (!feedback.some((f) => f.tone === "warn") && score >= 70) {
    feedback.push({
      tone: "good",
      icon: "💪",
      text: "No major disfluency patterns detected. Move to the next prompt or try a harder exercise.",
    });
  }

  feedback.push({
    tone: "tip",
    icon: "🪞",
    text: "Hrithik Roshan's daily habit: mirror practice + recording. Try reading the prompt to yourself once before tapping the mic.",
  });

  return {
    score,
    accuracy,
    repetitions,
    patterns,
    missing,
    extra,
    durationSec,
    feedback,
  };
}

function isConversationMode() {
  return getExercise(state.exerciseId).mode === "conversation";
}

function isLiveCoachMode() {
  return getExercise(state.exerciseId)?.mode === "live";
}

function isLiveCoachEnabled() {
  return state.settings.realtimeCoach || isLiveCoachMode();
}

function getLiveTargetText() {
  if (isConversationMode() && state.conversation.active) return "";
  const prompt =
    state.pulseProgress.activeTask?.text && state.pulseProgress.activePulseKey
      ? { text: state.pulseProgress.activeTask.text }
      : currentPrompt();
  return prompt?.text || "";
}

function getLiveSpokenText() {
  return `${state.finalTranscript || ""} ${state.interimTranscript || ""}`.trim();
}

function getSpeechElapsedSec() {
  if (!state.speechStart) return 0;
  return (performance.now() - state.speechStart) / 1000;
}

function hideLiveCoachPanel() {
  $("liveCoachPanel").hidden = true;
  $("liveCoachPanel").className = "live-coach";
}

function renderLiveCoach(update) {
  const panel = $("liveCoachPanel");
  panel.hidden = false;
  panel.className = `live-coach is-${update.status}`;

  $("liveCoachScore").textContent = String(update.score);
  $("liveProgressPct").textContent = `${update.progressPct}%`;
  $("liveProgressBar").style.width = `${update.progressPct}%`;

  const pacePct = Math.min(100, Math.max(8, (update.wpm / 140) * 100));
  $("livePaceBar").style.width = `${pacePct}%`;
  $("livePaceLabel").textContent = update.pace.label;

  const statusLabels = {
    listening: "Analyzing your speech in real time…",
    waiting: "Listening… start whenever you're ready.",
    paused: "Pause detected — breathe, then continue.",
    flowing: "Smooth flow — keep this calm pace.",
    coaching: "Coach spotted something — check the tips below.",
  };
  $("liveCoachStatus").textContent = statusLabels[update.status] || statusLabels.listening;

  const wordsEl = $("liveWordProgress");
  wordsEl.innerHTML = "";
  if (update.progress.length) {
    for (const item of update.progress) {
      const span = document.createElement("span");
      span.className = `live-word${item.status === "done" ? " is-done" : item.status === "current" ? " is-current" : ""}`;
      span.textContent = item.word;
      wordsEl.appendChild(span);
    }
  } else if (update.wordCount > 0) {
    wordsEl.innerHTML = `<span class="live-word is-current">${update.wordCount} words spoken</span>`;
  }

  const tipsEl = $("liveCoachTips");
  tipsEl.innerHTML = "";
  for (const tip of update.tips) {
    const li = document.createElement("li");
    li.className = `live-tip live-tip--${tip.tone}`;
    li.innerHTML = `<span class="live-tip__icon">${tip.icon}</span><span>${tip.text}</span>`;
    tipsEl.appendChild(li);
  }
}

function maybeSpeakLiveTip(update) {
  if (!state.settings.speakLiveTips || !window.speechSynthesis) return;
  const warnTip = update.tips.find((t) => t.tone === "warn");
  const tip = warnTip || update.tips.find((t) => t.tone === "good");
  if (!tip || !state.liveSession || !shouldSpeakTip(state.liveSession, tip)) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(tip.text.replace(/^[^\s]+\s/, ""));
  utter.rate = 0.95;
  utter.volume = 0.85;
  window.speechSynthesis.speak(utter);
}

function updateLiveCoach() {
  if (!state.liveSession || !state.listening || !isLiveCoachEnabled()) return;
  const spoken = getLiveSpokenText();
  const update = analyzeLiveUpdate(state.liveSession, {
    spokenText: spoken,
    elapsedSec: getSpeechElapsedSec(),
  });
  renderLiveCoach(update);
  maybeSpeakLiveTip(update);

  if (update.status === "flowing") {
    $("micStatus").textContent = "Great flow — tap mic when finished.";
  } else if (update.status === "coaching") {
    $("micStatus").textContent = "Live coaching active — adjust and keep going.";
  }
}

function startLiveCoachLoop() {
  stopLiveCoachLoop();
  if (!isLiveCoachEnabled()) return;

  const mode = isConversationMode() && state.conversation.active ? "conversation" : "drill";
  state.liveSession = createLiveSession({
    targetText: mode === "drill" ? getLiveTargetText() : "",
    mode,
  });
  updateLiveCoach();
  state.liveCoachTimer = setInterval(updateLiveCoach, 400);
}

function stopLiveCoachLoop() {
  clearInterval(state.liveCoachTimer);
  state.liveCoachTimer = null;
  state.liveSession = null;
  hideLiveCoachPanel();
}

function getScenario() {
  return CONVERSATION_SCENARIOS[state.conversation.scenarioId] || CONVERSATION_SCENARIOS.daily;
}

function getConversationRound() {
  const scenario = getScenario();
  return getRound(scenario, state.conversation.round);
}

function getMaxTurnsForRound(round = getConversationRound()) {
  const pulseTurns = state.pulseProgress.activeTask?.turns;
  if (typeof pulseTurns === "number" && pulseTurns > 0) {
    return Math.min(pulseTurns, round.turns.length);
  }
  return round.turns.length;
}

function currentConversationTurn() {
  const round = getConversationRound();
  return round.turns[state.conversation.turnIndex];
}

function nextRoundIndex() {
  const scenario = getScenario();
  const count = getRoundCount(scenario);
  if (!count) return 0;
  return (state.conversation.round + 1) % count;
}

function appendChat(role, text, meta = "") {
  const thread = $("chatThread");
  const li = document.createElement("li");
  li.className = `chat-bubble chat-bubble--${role}`;
  li.innerHTML = `${text}${meta ? `<span class="chat-bubble__meta">${meta}</span>` : ""}`;
  thread.appendChild(li);
  thread.scrollTop = thread.scrollHeight;
}

function clearChat() {
  $("chatThread").innerHTML = "";
}

function setConversationStatus(text) {
  $("conversationStatus").textContent = text;
}

function renderScenarioSelect() {
  const select = $("scenarioSelect");
  if (!select) return;
  const current = state.conversation.scenarioId;
  if (
    select.options.length === Object.keys(CONVERSATION_SCENARIOS).length &&
    select.value === current
  ) {
    return;
  }
  select.innerHTML = "";
  for (const [id, scenario] of Object.entries(CONVERSATION_SCENARIOS)) {
    const opt = document.createElement("option");
    opt.value = id;
    opt.textContent = scenario.title;
    if (id === current) opt.selected = true;
    select.appendChild(opt);
  }
}

function updateMicState() {
  if (!state.micReady || !SpeechRecognition) {
    $("micBtn").disabled = true;
    return;
  }
  if (isConversationMode()) {
    const ready =
      state.conversation.active &&
      !state.conversation.processing &&
      !state.listening;
    $("micBtn").disabled = !ready;
    $("micStatus").textContent = !state.conversation.active
      ? "Tap Start round — the coach speaks first."
      : state.conversation.processing
        ? "Coach is speaking…"
        : "Your turn — tap the mic and respond.";
    return;
  }
  $("micBtn").disabled = false;
  $("micStatus").textContent = "Ready — tap the mic and speak the prompt.";
}

function clearContinueTimer() {
  if (state.conversation.continueTimer) {
    clearTimeout(state.conversation.continueTimer);
    state.conversation.continueTimer = null;
  }
}

function togglePracticeUI() {
  const convo = isConversationMode();
  $("conversationPanel").hidden = !convo;
  $("drillPanel").hidden = convo;
  $("drillPanel").classList.toggle("is-hidden", convo);
  $("hearPromptBtn").hidden = convo;
  $("continueConvoBtn").hidden = true;
  $("nextBtn").hidden = convo;
  $("retryBtn").textContent = convo ? "Retry this turn" : "Try again";
  $("quickStartText").textContent = isLiveCoachMode()
    ? "Tap the mic → speak → watch live score, word progress, and instant tips."
    : convo
      ? "Tap Start round → coach speaks → tap mic → respond → get feedback."
      : isLiveCoachEnabled()
        ? "Tap the mic → speak → live coach analyzes you in real time."
        : "Pick an exercise → tap the green mic → speak → tap again for feedback.";
  if (convo) {
    renderScenarioSelect();
  }
}

function speakTextAsync(text, { rate = 0.92 } = {}) {
  return new Promise((resolve) => {
    if (!window.speechSynthesis || !state.settings.speakPrompts || !text) {
      resolve();
      return;
    }
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = rate;
    utter.onend = () => resolve();
    utter.onerror = () => resolve();
    window.speechSynthesis.speak(utter);
  });
}

async function coachSay(text) {
  appendChat("coach", text);
  setConversationStatus("Coach is speaking…");
  updateMicState();
  await speakTextAsync(text);
  setConversationStatus("Your turn — tap the mic and respond.");
  $("micBtn").classList.add("is-waiting");
  updateMicState();
}

async function startConversationRound() {
  if (!state.micReady || state.conversation.processing) return;

  clearContinueTimer();
  state.pendingAnalysis = null;

  if (!state.conversation.active && state.conversation.roundFinished) {
    state.conversation.round = nextRoundIndex();
    state.conversation.roundFinished = false;
  }

  state.conversation.active = true;
  state.conversation.turnIndex = 0;
  state.conversation.retries = 0;
  state.conversation.roundScores = [];
  state.conversation.processing = true;

  clearChat();
  hideFeedback();
  $("startRoundBtn").disabled = true;
  $("scenarioSelect").disabled = true;
  $("continueConvoBtn").hidden = true;

  const scenario = getScenario();
  const roundNum = state.conversation.round + 1;
  const round = getConversationRound();
  appendChat(
    "feedback",
    `— Round ${roundNum} started: ${scenario.description} (${getMaxTurnsForRound(round)} turns) —`
  );

  renderPrompt();
  try {
    await coachSay(currentConversationTurn().coach);
  } finally {
    state.conversation.processing = false;
    $("startRoundBtn").disabled = false;
    $("startRoundBtn").textContent = "Restart round";
    renderPrompt();
  }
}

async function advanceConversationTurn(analysis, spoken) {
  state.conversation.roundScores.push(analysis.score);
  state.conversation.turnIndex += 1;
  state.conversation.retries = 0;

  const round = getConversationRound();
  const maxTurns = getMaxTurnsForRound(round);
  const turn = round.turns[state.conversation.turnIndex - 1];
  const ack = buildCoachReply(turn, spoken, analysis);

  state.conversation.processing = true;
  renderPrompt();
  await coachSay(ack);

  if (state.conversation.turnIndex >= maxTurns) {
    await finishConversationRound();
    return;
  }

  await coachSay(currentConversationTurn().coach);
  state.conversation.processing = false;
  hideFeedback();
  renderPrompt();
}

async function finishConversationRound() {
  const summary = buildRoundSummary(state.conversation.roundScores);
  const avg = state.conversation.roundScores.length
    ? Math.round(
        state.conversation.roundScores.reduce((a, b) => a + b, 0) /
          state.conversation.roundScores.length
      )
    : 0;

  state.conversation.processing = true;
  renderPrompt();
  appendChat("feedback", `Round summary: ${summary}`);
  await speakTextAsync(summary);

  recordSession(
    `Small talk round ${state.conversation.round + 1}`,
    `${state.conversation.roundScores.length} turns`,
    avg,
    Number($("tensionSlider").value)
  );

  state.conversation.roundFinished = true;
  state.conversation.turnIndex = 0;
  state.conversation.active = false;
  state.conversation.processing = false;
  $("scenarioSelect").disabled = false;
  $("startRoundBtn").textContent = "Another round";
  $("startRoundBtn").disabled = false;
  $("micBtn").classList.remove("is-waiting");

  const nextRound = getRound(getScenario(), nextRoundIndex());
  const preview = nextRound.turns[0]?.coach || "Tap Another round to keep practicing.";
  setConversationStatus(`Round done. Next up: "${preview.slice(0, 72)}${preview.length > 72 ? "…" : ""}"`);
  renderPrompt();
}

async function handleConversationResponse(spoken, durationSec) {
  const turn = currentConversationTurn();
  if (!turn) return;

  const analysis = analyzeConversationTurn(spoken, durationSec, turn);
  appendChat("user", spoken);
  appendChat(
    "feedback",
    analysis.feedback
      .slice(0, 3)
      .map((f) => `${f.icon} ${f.text}`)
      .join(" "),
    `Score <span class="chat-bubble__score">${analysis.score}</span>`
  );

  showFeedback(analysis, turn.sample, spoken);
  $("feedbackTitle").textContent =
    analysis.score >= 75 ? "Great reply!" : analysis.score >= 50 ? "Keep going" : "Try once more";

  state.pendingAnalysis = { analysis, prompt: { text: turn.sample }, spoken, conversation: true };
  updateMicState();

  const shouldRetry = analysis.score < 50 && state.conversation.retries < 1;

  if (shouldRetry) {
    state.conversation.retries += 1;
    setConversationStatus("Let's smooth that out — retry this turn.");
    state.conversation.processing = true;
    renderPrompt();
    await speakTextAsync(turn.retryCoach);
    state.conversation.processing = false;
    $("micBtn").classList.add("is-waiting");
    renderPrompt();
    return;
  }

  if (state.settings.autoContinue) {
    setConversationStatus("Continuing in a moment…");
    clearContinueTimer();
    state.conversation.continueTimer = setTimeout(() => continueConversation(), 1800);
  } else {
    setConversationStatus("Review feedback, then tap Continue conversation.");
    $("continueConvoBtn").hidden = false;
  }
}

async function continueConversation() {
  clearContinueTimer();
  if (!state.pendingAnalysis?.conversation) return;
  if (state.conversation.processing) {
    state.conversation.continueTimer = setTimeout(() => continueConversation(), 400);
    return;
  }
  const { analysis, spoken } = state.pendingAnalysis;
  state.pendingAnalysis = null;
  $("continueConvoBtn").hidden = true;
  await advanceConversationTurn(analysis, spoken);
}

function getExercise(id) {
  return EXERCISES.find((e) => e.id === id) || EXERCISES[0];
}

function getPrompts(exercise) {
  if (exercise.dynamic) {
    return state.challengeWords.map((word) => ({
      text: word,
      tip: `Ease into the first sound of "${word}". Say it once, slowly.`,
    }));
  }
  return exercise.prompts;
}

function currentPrompt() {
  const exercise = getExercise(state.exerciseId);
  const prompts = getPrompts(exercise);
  return prompts[state.promptIndex] || prompts[0];
}

function renderExercises() {
  const list = $("exerciseList");
  list.innerHTML = "";
  for (const ex of EXERCISES) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "exercise-btn";
    btn.setAttribute("role", "tab");
    btn.setAttribute("aria-selected", ex.id === state.exerciseId ? "true" : "false");
    btn.dataset.id = ex.id;
    btn.innerHTML = `<span class="exercise-btn__title">${ex.title}</span><span class="exercise-btn__desc">${ex.description}</span>`;
    btn.addEventListener("click", () => selectExercise(ex.id));
    list.appendChild(btn);
  }
}

function renderChallengeTags() {
  const list = $("challengeTags");
  list.innerHTML = "";
  for (const word of state.challengeWords) {
    const li = document.createElement("li");
    li.className = "challenge-tag";
    li.innerHTML = `${word} <button type="button" aria-label="Remove ${word}">×</button>`;
    li.querySelector("button").addEventListener("click", () => {
      state.challengeWords = state.challengeWords.filter((w) => w !== word);
      saveState();
      renderChallengeTags();
      if (state.exerciseId === "challenge") renderPrompt();
    });
    list.appendChild(li);
  }
}

function renderPrompt() {
  const exercise = getExercise(state.exerciseId);
  togglePracticeUI();

  if (isConversationMode()) {
    $("exerciseTitle").textContent = exercise.title;
    $("exerciseLabel").textContent = "Conversation";
    $("exerciseInstruction").textContent = exercise.instruction;
    const round = getConversationRound();
    const total = getMaxTurnsForRound(round);
    const current = state.conversation.active ? state.conversation.turnIndex + 1 : 0;
    const previewRound = state.conversation.roundFinished
      ? getRound(getScenario(), nextRoundIndex())
      : round;
    const previewTurn = state.conversation.active
      ? currentConversationTurn()
      : previewRound.turns[0];
    $("promptCounter").textContent = state.conversation.active
      ? `Turn ${Math.min(current, total)} of ${total} · Round ${state.conversation.round + 1}`
      : state.conversation.roundFinished
        ? `Round ${nextRoundIndex() + 1} ready`
        : `Round ${state.conversation.round + 1} ready`;
    $("targetText").textContent =
      previewTurn?.coach || "Tap Start round — coach speaks first.";
    $("targetTip").textContent = state.conversation.active
      ? "Respond naturally. Short answers are fine."
      : "Two-way practice: coach asks → you answer → feedback → next question.";
    updateMicState();
    return;
  }

  const prompts = getPrompts(exercise);

  if (exercise.dynamic && !prompts.length) {
    $("exerciseTitle").textContent = exercise.title;
    $("exerciseLabel").textContent = "Exercise";
    $("exerciseInstruction").textContent =
      "Add at least one challenge word in the sidebar to start.";
    $("targetText").textContent = "—";
    $("targetTip").textContent = "";
    $("promptCounter").textContent = "0 prompts";
    $("micBtn").disabled = true;
    return;
  }

  if (state.promptIndex >= prompts.length) state.promptIndex = 0;
  const prompt = prompts[state.promptIndex];

  $("exerciseTitle").textContent = exercise.title;
  $("exerciseLabel").textContent = "Exercise";
  $("exerciseInstruction").textContent = exercise.instruction;
  $("targetText").textContent = prompt.text;
  $("targetTip").textContent = prompt.tip ? `Tip: ${prompt.tip}` : "";
  $("promptCounter").textContent = `Prompt ${state.promptIndex + 1} of ${prompts.length}`;
  hideFeedback();
  updateMicState();

  if (state.settings.speakPrompts) {
    speakText(prompt.text);
  }
}

function hideFeedback() {
  $("feedbackCard").hidden = true;
  $("transcriptCard").hidden = true;
  $("interimText").textContent = "";
  $("finalText").textContent = "";
  state.finalTranscript = "";
  state.interimTranscript = "";
}

function selectExercise(id) {
  clearContinueTimer();
  state.pendingAnalysis = null;
  state.pulseProgress.activePulseKey = null;
  state.pulseProgress.activeTask = null;
  $("dailyMission").hidden = true;
  state.exerciseId = id;
  state.promptIndex = 0;
  state.conversation.active = false;
  state.conversation.turnIndex = 0;
  state.conversation.retries = 0;
  state.conversation.processing = false;
  state.conversation.roundFinished = false;
  $("startRoundBtn").textContent = "Start round";
  $("scenarioSelect").disabled = false;
  if (getExercise(id).scenarioId) {
    state.conversation.scenarioId = getExercise(id).scenarioId;
  }
  renderExercises();
  renderPrompt();
}

function speakText(text) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.rate = 0.9;
  utter.pitch = 1;
  window.speechSynthesis.speak(utter);
}

function setScoreUI(score) {
  const ring = $("scoreRing");
  const fg = $("scoreRingFg");
  const circumference = 327;
  const offset = circumference - (score / 100) * circumference;
  fg.style.strokeDashoffset = String(offset);
  $("scoreValue").textContent = String(score);
  ring.dataset.score = String(score);
  ring.dataset.scoreTier = score >= 80 ? "good" : score >= 55 ? "mid" : "low";
}

function showFeedback(analysis, targetText, spokenText) {
  $("transcriptCard").hidden = false;
  $("feedbackCard").hidden = false;
  $("finalText").textContent = spokenText || "(no speech detected)";
  setScoreUI(analysis.score);

  if (analysis.accuracy != null) {
    const pct = Math.round(analysis.accuracy * 100);
    const liveNote = analysis.livePeakScore != null ? ` · Live peak ${analysis.livePeakScore}` : "";
    $("feedbackSummary").textContent = `Word match: ${pct}% · Duration: ${analysis.durationSec.toFixed(1)}s${liveNote}`;
  } else {
    const liveNote = analysis.livePeakScore != null ? ` · Live peak ${analysis.livePeakScore}` : "";
    $("feedbackSummary").textContent = `${analysis.wordCount} words · ${analysis.durationSec.toFixed(1)}s · ${analysis.fillerCount} fillers${liveNote}`;
  }

  if (isConversationMode()) {
    $("feedbackTitle").textContent =
      analysis.score >= 75 ? "Great reply!" : analysis.score >= 50 ? "Keep going" : "Try once more";
  } else {
    $("feedbackTitle").textContent =
      analysis.score >= 80 ? "Great work!" : analysis.score >= 55 ? "Keep going" : "Try again";
  }

  const list = $("feedbackList");
  list.innerHTML = "";
  for (const item of analysis.feedback) {
    const li = document.createElement("li");
    li.className = `feedback-item feedback-item--${item.tone}`;
    li.innerHTML = `<span class="feedback-item__icon">${item.icon}</span><span>${item.text}</span>`;
    list.appendChild(li);
  }
}

function exerciseTitle(id) {
  const ex = EXERCISES.find((e) => e.id === id);
  return ex ? ex.title : id;
}

function renderWeekChecklist() {
  const list = $("weekChecklist");
  list.innerHTML = "";
  const todayKey = dayKeyForDate();
  const weekStart = new Date(state.weeklyProgress.weekStart);
  const end = new Date(weekStart);
  end.setDate(end.getDate() + 6);
  $("weekRangeLabel").textContent = `${weekStart.toLocaleDateString(undefined, { month: "short", day: "numeric" })} – ${end.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;

  for (const day of WEEKLY_PLAN.days) {
    const key = String(day.day);
    const li = document.createElement("li");
    li.className = "week-day";
    if (key === todayKey) li.classList.add("is-today");
    if (day.type === "rest") li.classList.add("is-rest");
    if (state.weeklyProgress.completedDays[key]) li.classList.add("is-done");

    const id = `week-day-${key}`;
    li.innerHTML = `
      <label class="week-day__label" for="${id}">
        <input type="checkbox" id="${id}" data-day="${key}" ${state.weeklyProgress.completedDays[key] ? "checked" : ""} />
        <span class="week-day__info">
          <span class="week-day__title">Day ${day.day}: ${day.title}</span>
          <span class="week-day__meta">${day.type === "rest" ? "Light · " : ""}${day.focus}</span>
        </span>
      </label>
    `;
    li.querySelector("input").addEventListener("change", (e) => {
      const d = e.target.dataset.day;
      if (e.target.checked) {
        state.weeklyProgress.completedDays[d] = true;
      } else {
        delete state.weeklyProgress.completedDays[d];
      }
      saveState();
      renderWeekChecklist();
      renderPerformance();
    });
    list.appendChild(li);
  }
}

function renderTodayPlan() {
  const plan = getTodayPlanDay();
  $("todayPlanTitle").textContent = `Day ${plan.day} — ${plan.title}`;
  $("todayPlanFocus").textContent = plan.focus;
  $("todayPlanBadge").textContent = plan.type === "rest" ? "Light · 30 min" : "30 min";

  const schedule = $("todayScheduleList");
  schedule.innerHTML = "";
  for (const block of plan.blocks) {
    const li = document.createElement("li");
    li.className = "schedule-item";
    li.innerHTML = `
      <span class="schedule-item__time">${block.start}–${block.end} min</span>
      <div class="schedule-item__body">
        <strong>${block.activity}</strong>
        <p>${block.detail}</p>
      </div>
    `;
    schedule.appendChild(li);
  }

  const exNames = plan.exercises.map(exerciseTitle).join(" → ");
  $("todayPlanExercises").textContent = `App path: ${exNames}`;
}

let pulseCountdownTimer = null;

function renderPulseUI() {
  const now = new Date();
  const pulse = getPulseTask(now, state.history);
  const check = runImprovementCheck(state.pulseProgress, now, state.history);

  if (check.isNewSlot || check.isNewDay) {
    state.pulseProgress.lastSlotIndex = pulse.slotIdx;
    if (check.isNewDay) {
      state.pulseProgress.date = getTodayDateKey(now);
      state.pulseProgress.completedSlots = [];
    }
    saveState();
  }

  $("dailyMission").hidden = !state.pulseProgress.activePulseKey;
  $("dailyMissionTitle").textContent = pulse.mission.title;
  $("dailyMissionText").textContent = pulse.mission.mission;
  $("dailyMissionSlot").textContent = `${pulse.slot.emoji} ${pulse.slot.label} · ${pulse.task.title} (~${pulse.task.minutes} min)`;
  $("dailyMission").classList.toggle("is-new-pulse", Boolean(check.message));

  const slotsEl = $("pulseSlots");
  slotsEl.innerHTML = "";
  for (const s of SLOT_LABELS) {
    const li = document.createElement("li");
    li.className = "pulse-slot";
    if (s.id === pulse.slotIdx) li.classList.add("is-current");
    if (state.pulseProgress.completedSlots.includes(s.id)) li.classList.add("is-done");
    li.textContent = `${s.emoji} ${s.label}`;
    li.title = s.range;
    slotsEl.appendChild(li);
  }

  const done = state.pulseProgress.completedSlots.includes(pulse.slotIdx);
  $("startPulseBtn").textContent = done
    ? "Redo this pulse"
    : `Do this pulse (~${pulse.task.minutes} min)`;
  $("pulseAdaptation").textContent = pulse.adaptation.note;

  renderPulseStreak();
  updatePulseCountdown();
}

function recalcPulseStreak() {
  if (!state.pulseProgress.streakDays) state.pulseProgress.streakDays = {};
  const today = getTodayDateKey();
  if (state.pulseProgress.completedSlots.length >= 3) {
    state.pulseProgress.streakDays[today] = state.pulseProgress.completedSlots.length;
  }

  let current = 0;
  const cursor = new Date();
  for (let i = 0; i < 400; i++) {
    const key = cursor.toISOString().slice(0, 10);
    if ((state.pulseProgress.streakDays[key] || 0) >= 3) {
      current++;
      cursor.setDate(cursor.getDate() - 1);
    } else if (i === 0) {
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }

  state.pulseProgress.streakCurrent = current;
  state.pulseProgress.streakBest = Math.max(state.pulseProgress.streakBest || 0, current);
}

function renderPulseStreak() {
  const el = $("pulseStreak");
  if (!el) return;
  recalcPulseStreak();
  const { streakCurrent, streakBest } = state.pulseProgress;
  el.textContent = `🔥 Streak: ${streakCurrent} day${streakCurrent === 1 ? "" : "s"} · best ${streakBest}`;
}

async function loadAppMeta() {
  try {
    const res = await fetch("/version.json");
    if (!res.ok) return;
    const data = await res.json();
    $("appVersionLabel").textContent = `v${data.version} · cycle ${data.iteration || 0}`;
    if (data.lastCycleAt) {
      const when = new Date(data.lastCycleAt).toLocaleString();
      $("cycleStatusLabel").textContent = `Last auto-check: ${when} (${data.lastCycleStatus || "—"})`;
    } else {
      $("cycleStatusLabel").textContent = "Auto-check every 4 hours";
    }
  } catch {
    $("appVersionLabel").textContent = "v1.6.0";
  }
}

function updatePulseCountdown() {
  const ms = msUntilNextSlot();
  $("pulseCountdown").textContent = `Next pulse in ${formatCountdown(ms)} · Iteration ${state.pulseProgress.iteration}`;
}

function startPulseCountdown() {
  clearInterval(pulseCountdownTimer);
  pulseCountdownTimer = setInterval(() => {
    const prevSlot = getCurrentSlotIndex();
    updatePulseCountdown();
    const nowSlot = getCurrentSlotIndex();
    if (nowSlot !== state.pulseProgress.lastSlotIndex) {
      renderPulseUI();
      renderImprovementLog();
    }
  }, 60000);
}

function renderImprovementLog() {
  const log = state.pulseProgress.improvementLog;
  $("improvementLogSummary").textContent = summarizeImprovementLog(log);
  const list = $("improvementLogList");
  list.innerHTML = "";
  if (!log.length) {
    const li = document.createElement("li");
    li.className = "improvement-log__item";
    li.textContent = "Complete a 4-hour pulse to log your first improvement.";
    list.appendChild(li);
    return;
  }
  for (const entry of log.slice(0, 8)) {
    const li = document.createElement("li");
    li.className = "improvement-log__item";
    const time = new Date(entry.at).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
    li.innerHTML = `<strong>${entry.slot}</strong> · ${entry.task} — score ${entry.score ?? "—"} <span class="chat-bubble__meta">${time}</span>`;
    list.appendChild(li);
  }
}

function applyPulseTask(pulse) {
  const { task } = pulse;
  state.pulseProgress.activePulseKey = pulse.slotKey;
  state.pulseProgress.activeTask = task;
  $("dailyMission").hidden = false;
  state.conversation.active = false;
  state.conversation.processing = false;
  $("startRoundBtn").disabled = false;
  $("startRoundBtn").textContent = "Start round";
  $("scenarioSelect").disabled = false;

  if (task.type === "affirmation" || task.type === "breath" || task.type === "rest" || task.type === "evaluate") {
    state.exerciseId = "baseline";
    state.promptIndex = 0;
    renderExercises();
    renderPrompt();
    $("exerciseLabel").textContent = "4-hour pulse";
    $("exerciseTitle").textContent = task.title;
    $("exerciseInstruction").textContent = `${pulse.mission.title} · ${pulse.slot.label} — ${task.title}`;
    $("targetText").textContent = task.text;
    $("targetTip").textContent =
      task.type === "evaluate"
        ? "Scroll to Weekly Performance after speaking."
        : "Speak slowly. No scoring pressure.";
    $("promptCounter").textContent = `${pulse.slot.label} · ~${task.minutes} min`;
    if (state.settings.speakPrompts && task.text) speakText(task.text);
    updateMicState();
    return;
  }

  if (task.type === "conversation") {
    state.exerciseId = "small-talk";
    state.conversation.scenarioId = task.scenarioId || "daily";
    state.conversation.round = 0;
    state.conversation.roundFinished = false;
    state.conversation.active = false;
    state.conversation.turnIndex = 0;
    $("scenarioSelect").value = state.conversation.scenarioId;
    renderExercises();
    renderPrompt();
    $("exerciseLabel").textContent = "4-hour pulse";
    $("exerciseTitle").textContent = task.title;
    $("exerciseInstruction").textContent = `${pulse.mission.title} · ${pulse.slot.label} — ${task.turns} turns`;
    $("targetTip").textContent = pulse.adaptation.note;
    $("promptCounter").textContent = `${pulse.slot.label} · ~${task.minutes} min`;
    setConversationStatus(`Tap Start round for ${task.turns} turns, then respond when the coach finishes.`);
    updateMicState();
    return;
  }

  if (task.type === "drill" && task.exerciseId) {
    state.exerciseId = task.exerciseId;
    state.promptIndex = task.promptIndex ?? 0;
    renderExercises();
    renderPrompt();
    $("exerciseLabel").textContent = "4-hour pulse";
    $("exerciseTitle").textContent = task.title;
    $("exerciseInstruction").textContent = `${pulse.mission.title} · ${pulse.slot.label} — ${task.title}`;
    $("targetTip").textContent = pulse.adaptation.note;
    $("promptCounter").textContent = `${pulse.slot.label} · ~${task.minutes} min`;
    updateMicState();
  }
}

function completeActivePulse(score) {
  if (!state.pulseProgress.activePulseKey) return;
  const now = new Date();
  const pulse = getPulseTask(now, state.history);
  const slotIdx = pulse.slotIdx;

  if (!state.pulseProgress.completedSlots.includes(slotIdx)) {
    state.pulseProgress.completedSlots.push(slotIdx);
  }
  state.pulseProgress.iteration += 1;
  state.pulseProgress.lastSlotIndex = slotIdx;

  const entry = buildImprovementEntry(pulse, score, pulse.adaptation);
  state.pulseProgress.improvementLog.unshift(entry);
  state.pulseProgress.activePulseKey = null;
  state.pulseProgress.activeTask = null;
  recalcPulseStreak();
  saveState();
  renderPulseUI();
  renderImprovementLog();
}

function renderProgressChart(chartData) {
  const chart = $("progressChart");
  chart.innerHTML = "";
  const maxScore = 100;
  for (const d of chartData) {
    const col = document.createElement("div");
    col.className = "chart-col";
    const height = d.sessions ? Math.max(8, (d.score / maxScore) * 100) : 4;
    const tier = d.score >= 80 ? "good" : d.score >= 55 ? "mid" : d.sessions ? "low" : "empty";
    col.innerHTML = `
      <div class="chart-col__bar-wrap">
        <div class="chart-col__bar chart-col__bar--${tier}" style="height:${height}%"></div>
      </div>
      <span class="chart-col__score">${d.sessions ? d.score : "—"}</span>
      <span class="chart-col__day">D${d.day}</span>
    `;
    chart.appendChild(col);
  }
}

function renderTensionChart(chartData) {
  const canvas = $("tensionCanvas");
  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  const padding = { top: 12, right: 16, bottom: 24, left: 32 };
  const plotW = w - padding.left - padding.right;
  const plotH = h - padding.top - padding.bottom;

  ctx.strokeStyle = "#d8e2ef";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padding.left, padding.top);
  ctx.lineTo(padding.left, h - padding.bottom);
  ctx.lineTo(w - padding.right, h - padding.bottom);
  ctx.stroke();

  ctx.fillStyle = "#5c6b7f";
  ctx.font = "11px system-ui, sans-serif";
  ctx.fillText("10", 4, padding.top + 4);
  ctx.fillText("1", 8, h - padding.bottom);

  const points = chartData.filter((d) => d.tension > 0);
  if (!points.length) {
    ctx.fillStyle = "#5c6b7f";
    ctx.fillText("No tension data yet", padding.left + 20, h / 2);
    return;
  }

  const step = plotW / (chartData.length - 1 || 1);
  ctx.strokeStyle = "#457b9d";
  ctx.lineWidth = 2;
  ctx.beginPath();
  chartData.forEach((d, i) => {
    const x = padding.left + i * step;
    const y = padding.top + plotH - ((d.tension || 0) / 10) * plotH;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  chartData.forEach((d, i) => {
    if (!d.tension) return;
    const x = padding.left + i * step;
    const y = padding.top + plotH - (d.tension / 10) * plotH;
    ctx.fillStyle = "#2a9d8f";
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.fillStyle = "#5c6b7f";
  ctx.font = "10px system-ui, sans-serif";
  chartData.forEach((d, i) => {
    const x = padding.left + i * step;
    ctx.fillText(`D${d.day}`, x - 8, h - 6);
  });
}

function renderPerformance() {
  const eval_ = evaluateWeek(
    state.history,
    state.weeklyProgress.weekStart,
    state.weeklyProgress.completedDays
  );

  const start = new Date(eval_.weekStart);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  $("perfWeekLabel").textContent = `${start.toLocaleDateString(undefined, { month: "short", day: "numeric" })} – ${end.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;

  $("perfSessions").textContent = String(eval_.totalSessions);
  $("perfAvgScore").textContent = eval_.avgScore != null ? String(eval_.avgScore) : "—";
  $("perfAvgTension").textContent = eval_.avgTension != null ? `${eval_.avgTension}/10` : "—";
  $("perfDaysChecked").textContent = `${eval_.checkedCount}/7`;

  const highlights = $("perfHighlights");
  highlights.innerHTML = "";

  if (eval_.tensionTrend != null) {
    const trendEl = document.createElement("p");
    trendEl.className = "perf-trend";
    const arrow = eval_.tensionTrend < -0.3 ? "↓ easing" : eval_.tensionTrend > 0.3 ? "↑ rising" : "→ steady";
    trendEl.textContent = `Tension trend: ${arrow} (${eval_.tensionTrend > 0 ? "+" : ""}${eval_.tensionTrend} vs early week)`;
    highlights.appendChild(trendEl);
  }

  if (eval_.bestDay) {
    const best = document.createElement("p");
    best.className = "perf-highlight perf-highlight--good";
    best.textContent = `Best day: Day ${eval_.bestDay.day} (${eval_.bestDay.label}) — avg ${eval_.bestDay.avgScore}`;
    highlights.appendChild(best);
  }
  if (eval_.worstDay && eval_.worstDay.day !== eval_.bestDay?.day) {
    const worst = document.createElement("p");
    worst.className = "perf-highlight perf-highlight--warn";
    worst.textContent = `Toughest day: Day ${eval_.worstDay.day} (${eval_.worstDay.label}) — avg ${eval_.worstDay.avgScore}`;
    highlights.appendChild(worst);
  }

  renderProgressChart(eval_.chartData);
  renderTensionChart(eval_.chartData);
  $("weekSummaryText").textContent = eval_.summary;
}

function recordSession(targetText, spokenText, score, tension) {
  state.history.unshift({
    exerciseId: state.exerciseId,
    target: targetText,
    spoken: spokenText,
    score,
    tension,
    at: new Date().toISOString(),
  });
  saveState();
  renderHistory();
  renderHeaderStats();
  renderPerformance();
  completeActivePulse(score);
}

function renderHistory() {
  const list = $("historyList");
  const empty = $("historyEmpty");
  list.innerHTML = "";

  if (!state.history.length) {
    empty.hidden = false;
    return;
  }
  empty.hidden = true;

  for (const item of state.history.slice(0, 8)) {
    const li = document.createElement("li");
    li.className = "history-item";
    const time = new Date(item.at).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
    li.innerHTML = `
      <span class="history-item__prompt">${item.target}</span>
      <span class="history-item__score">${item.score}</span>
      <span class="history-item__time">${time}</span>
    `;
    list.appendChild(li);
  }
}

function renderHeaderStats() {
  $("totalSessions").textContent = String(state.history.length);
  if (!state.history.length) {
    $("avgScore").textContent = "—";
    return;
  }
  const avg = Math.round(
    state.history.reduce((sum, h) => sum + h.score, 0) / state.history.length
  );
  $("avgScore").textContent = String(avg);
}

function startTimer() {
  state.speechStart = performance.now();
  $("speechTimer").textContent = "0.0s";
  clearInterval(state.timerInterval);
  state.timerInterval = setInterval(() => {
    const elapsed = (performance.now() - state.speechStart) / 1000;
    $("speechTimer").textContent = `${elapsed.toFixed(1)}s`;
  }, 100);
}

function stopTimer() {
  clearInterval(state.timerInterval);
  if (!state.speechStart) return 0;
  return (performance.now() - state.speechStart) / 1000;
}

function setSetupBanner(kind, title, body, { showMic = false, showUrl = false } = {}) {
  const banner = $("setupBanner");
  banner.hidden = false;
  banner.className = `setup-banner is-${kind}`;
  $("setupBannerTitle").textContent = title;
  $("setupBannerBody").textContent = body;
  $("enableMicBtn").hidden = !showMic;
  $("openChromeUrlBtn").hidden = !showUrl;
}

function hideSetupBanner() {
  $("setupBanner").hidden = true;
}

function isChromeFamily() {
  return /Chrome|Chromium|Edg\//.test(navigator.userAgent) && !/Firefox/.test(navigator.userAgent);
}

function isLocalDev() {
  const host = location.hostname;
  return host === "localhost" || host === "127.0.0.1" || host === "[::1]";
}

async function ensureMicrophoneAccess() {
  if (!navigator.mediaDevices?.getUserMedia) {
    return { ok: false, reason: "Your browser does not expose microphone APIs." };
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((track) => track.stop());
    return { ok: true };
  } catch (err) {
    const name = err?.name || "Error";
    if (name === "NotAllowedError" || name === "PermissionDeniedError") {
      return {
        ok: false,
        reason:
          "Microphone permission denied. In Chrome: click the lock icon in the address bar → Site settings → Allow microphone.",
      };
    }
    if (name === "NotFoundError") {
      return { ok: false, reason: "No microphone found. Plug in or enable your mic in System Settings → Sound → Input." };
    }
    return { ok: false, reason: `Microphone error: ${name}` };
  }
}

async function runPreflight() {
  $("canonicalUrl").textContent = CANONICAL_URL;

  if (location.protocol === "file:") {
    setSetupBanner(
      "error",
      "Opened as a file — voice will not work",
      `Do not open index.html directly. Run ./start.sh then use ${CANONICAL_URL}`,
      { showUrl: true }
    );
    $("micBtn").disabled = true;
    $("micStatus").textContent = "Voice disabled on file:// — use the local server URL.";
    return false;
  }

  if (!window.isSecureContext) {
    setSetupBanner(
      "error",
      "Insecure page — voice blocked",
      `Chrome only allows the microphone on HTTPS or ${CANONICAL_URL}. Start the local server and use that exact address.`,
      { showUrl: true }
    );
    $("micBtn").disabled = true;
    return false;
  }

  if (!isLocalDev()) {
    setSetupBanner(
      "warn",
      "Not running on local dev URL",
      `For reliable Chrome microphone access, use ${CANONICAL_URL} (127.0.0.1 and localhost are different sites to Chrome).`,
      { showUrl: true }
    );
  }

  if (!SpeechRecognition) {
    setSetupBanner(
      "error",
      "Speech recognition not available",
      "Use Google Chrome or Microsoft Edge. Firefox and Safari do not support the free Web Speech API for dictation.",
      { showUrl: false }
    );
    $("micBtn").disabled = true;
    $("micStatus").textContent = "Speech recognition unsupported in this browser.";
    return false;
  }

  if (!isChromeFamily()) {
    setSetupBanner(
      "warn",
      "Browser may not support voice dictation",
      "Chrome or Edge recommended. You can still try the mic, but recognition may fail.",
      { showUrl: false }
    );
  }

  if (!navigator.onLine) {
    setSetupBanner(
      "warn",
      "You appear offline",
      "Chrome sends audio to Google's speech service — an internet connection is required for transcription.",
      { showUrl: false }
    );
  }

  const mic = await ensureMicrophoneAccess();
  if (!mic.ok) {
    setSetupBanner("error", "Microphone not allowed", mic.reason, { showMic: true, showUrl: false });
    $("micBtn").disabled = true;
    $("micStatus").textContent = "Tap “Allow microphone” above, then try again.";
    return false;
  }

  state.micReady = true;
  if (location.hostname === CANONICAL_HOST && location.port === CANONICAL_PORT) {
    setSetupBanner(
      "ok",
      "Ready — tap the mic to practice",
      isConversationMode()
        ? "Tap Start round first. The coach speaks, then you respond."
        : "Tap the green mic, speak the prompt, tap again for feedback.",
      { showUrl: false }
    );
    setTimeout(hideSetupBanner, 6000);
  } else if (isLocalDev()) {
    setSetupBanner(
      "warn",
      "Microphone works, but use the canonical URL",
      `You are on ${location.origin}. For fewer Chrome permission issues, bookmark ${CANONICAL_URL}`,
      { showUrl: true }
    );
  } else {
    hideSetupBanner();
  }

  return true;
}

function setupRecognition() {
  if (!SpeechRecognition) {
    $("micStatus").textContent =
      "Speech recognition not supported. Use Chrome or Edge at http://127.0.0.1:8787";
    $("micBtn").disabled = true;
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = "en-US";
  recognition.maxAlternatives = 1;

  recognition.onstart = () => {
    state.listening = true;
    $("micBtn").classList.add("is-listening");
    $("micBtn").classList.remove("is-waiting");
    $("micBtn").querySelector(".mic-btn__label").textContent = isConversationMode()
      ? "Listening… tap when done"
      : "Listening…";
    $("micStatus").textContent = isLiveCoachEnabled()
      ? "Live coach active — speak naturally."
      : isConversationMode()
        ? "Respond naturally. Tap again when finished."
        : "Speak now. Tap again when finished.";
    $("transcriptCard").hidden = false;
    startTimer();
    startLiveCoachLoop();
  };

  recognition.onresult = (event) => {
    let interim = "";
    let final = state.finalTranscript;
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        final += transcript + " ";
      } else {
        interim += transcript;
      }
    }
    state.finalTranscript = final;
    state.interimTranscript = interim;
    if (state.settings.showInterim) {
      $("interimText").textContent = interim ? `Live: ${interim}` : "";
    }
    $("finalText").textContent = final.trim() || "…";
    updateLiveCoach();
  };

  recognition.onerror = (event) => {
    if (event.error === "no-speech") {
      $("micStatus").textContent = "No speech heard — tap the mic and try again.";
    } else if (event.error === "not-allowed") {
      $("micStatus").textContent =
        "Microphone blocked. In Chrome: lock icon → Site settings → Microphone → Allow.";
      setSetupBanner(
        "error",
        "Microphone blocked",
        "Chrome denied access. Reset permission for this site and tap “Allow microphone” again.",
        { showMic: true }
      );
    } else if (event.error === "network") {
      $("micStatus").textContent =
        "Network error — Chrome speech needs internet. Check your connection and retry.";
      setSetupBanner(
        "warn",
        "Speech service unreachable",
        "Chrome sends audio to Google for transcription. Connect to the internet and try again.",
        { showUrl: false }
      );
    } else if (event.error === "aborted") {
      $("micStatus").textContent = "Recording stopped.";
    } else {
      $("micStatus").textContent = `Speech error: ${event.error}`;
    }
    stopListening();
  };

  recognition.onend = () => {
    if (state.listening) {
      try {
        recognition.start();
      } catch {
        finishListening();
      }
    }
  };

  state.recognition = recognition;
  updateMicState();
}

async function startListening() {
  if (!state.recognition || !state.micReady) {
    const mic = await ensureMicrophoneAccess();
    if (!mic.ok) {
      setSetupBanner("error", "Microphone not allowed", mic.reason, { showMic: true });
      return;
    }
    state.micReady = true;
    $("micBtn").disabled = false;
  }

  hideFeedback();
  state.finalTranscript = "";
  state.interimTranscript = "";
  $("interimText").textContent = "";
  $("finalText").textContent = "";
  try {
    state.recognition.start();
  } catch {
    $("micStatus").textContent = "Mic already active — tap again to finish.";
  }
}

function stopListening() {
  state.listening = false;
  stopLiveCoachLoop();
  $("micBtn").classList.remove("is-listening");
  $("micBtn").querySelector(".mic-btn__label").textContent = "Tap to speak";
}

function finishListening() {
  stopListening();
  $("micBtn").classList.remove("is-waiting");
  const duration = stopTimer();
  const spoken = (state.finalTranscript || state.interimTranscript).trim();

  if (!spoken) {
    $("micStatus").textContent = "No speech captured. Try again.";
    return;
  }

  if (isConversationMode() && state.conversation.active) {
    $("micStatus").textContent = "Feedback ready.";
    handleConversationResponse(spoken, duration);
    return;
  }

  const prompt =
    state.pulseProgress.activeTask?.text && state.pulseProgress.activePulseKey
      ? { text: state.pulseProgress.activeTask.text, tip: state.pulseProgress.activeTask.tip || "" }
      : currentPrompt();
  const analysis = analyzeSpeech(prompt.text, spoken, duration);
  if (state.liveSession?.peakScore) {
    analysis.livePeakScore = state.liveSession.peakScore;
  }
  showFeedback(analysis, prompt.text, spoken);
  $("micStatus").textContent = "Feedback ready — try again or move to next prompt.";
  state.pendingAnalysis = { analysis, prompt, spoken };
}

function toggleMic() {
  if (!state.recognition) return;

  if (state.listening) {
    state.listening = false;
    state.recognition.stop();
    finishListening();
    return;
  }

  startListening();
}

function bindEvents() {
  $("micBtn").addEventListener("click", toggleMic);

  $("hearPromptBtn").addEventListener("click", () => {
    const prompt = currentPrompt();
    if (prompt?.text) speakText(prompt.text);
  });

  $("retryBtn").addEventListener("click", () => {
    clearContinueTimer();
    state.pendingAnalysis = null;
    hideFeedback();
    if (isConversationMode() && state.conversation.active) {
      setConversationStatus("Retry this turn — tap the mic when ready.");
      $("micBtn").classList.add("is-waiting");
      updateMicState();
    }
  });

  $("continueConvoBtn").addEventListener("click", () => continueConversation());

  $("startRoundBtn").addEventListener("click", () => startConversationRound());

  $("scenarioSelect").addEventListener("change", (e) => {
    state.conversation.scenarioId = e.target.value;
    state.conversation.round = 0;
    state.conversation.roundFinished = false;
    state.conversation.active = false;
    state.conversation.turnIndex = 0;
    renderPrompt();
  });

  $("nextBtn").addEventListener("click", () => {
    if (state.pendingAnalysis) {
      const tension = Number($("tensionSlider").value);
      recordSession(
        state.pendingAnalysis.prompt.text,
        state.pendingAnalysis.spoken,
        state.pendingAnalysis.analysis.score,
        tension
      );
      state.pendingAnalysis = null;
    }

    const prompts = getPrompts(getExercise(state.exerciseId));
    state.promptIndex = (state.promptIndex + 1) % prompts.length;
    renderPrompt();
  });

  $("tensionSlider").addEventListener("input", (e) => {
    $("tensionValue").textContent = e.target.value;
  });

  $("addChallengeWord").addEventListener("click", () => {
    const input = $("challengeWordInput");
    const word = input.value.trim();
    if (!word) return;
    if (!state.challengeWords.includes(word)) {
      state.challengeWords.push(word);
      saveState();
      renderChallengeTags();
      if (state.exerciseId === "challenge") renderPrompt();
    }
    input.value = "";
  });

  $("challengeWordInput").addEventListener("keydown", (e) => {
    if (e.key === "Enter") $("addChallengeWord").click();
  });

  $("speakPrompts").addEventListener("change", (e) => {
    state.settings.speakPrompts = e.target.checked;
    saveState();
  });

  $("showInterim").addEventListener("change", (e) => {
    state.settings.showInterim = e.target.checked;
    saveState();
  });

  $("autoContinue").addEventListener("change", (e) => {
    state.settings.autoContinue = e.target.checked;
    saveState();
  });

  $("realtimeCoach").addEventListener("change", (e) => {
    state.settings.realtimeCoach = e.target.checked;
    saveState();
  });

  $("speakLiveTips").addEventListener("change", (e) => {
    state.settings.speakLiveTips = e.target.checked;
    saveState();
  });

  $("enableMicBtn").addEventListener("click", async () => {
    const mic = await ensureMicrophoneAccess();
    if (mic.ok) {
      state.micReady = true;
      updateMicState();
      setSetupBanner(
        "ok",
        "Microphone enabled",
        isConversationMode()
          ? "Select Small Talk, tap Start round, then respond when the coach finishes."
          : "Tap the green mic, speak the prompt, then tap again for feedback.",
        { showUrl: false }
      );
    } else {
      setSetupBanner("error", "Still blocked", mic.reason, { showMic: true });
    }
  });

  $("openChromeUrlBtn").addEventListener("click", () => {
    window.location.href = CANONICAL_URL;
  });

  $("jumpTodayPlanBtn").addEventListener("click", () => {
    const details = $("weekTodayDetails");
    details.open = true;
    $("weekTodayPanel").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  $("startPulseBtn").addEventListener("click", () => {
    const pulse = getPulseTask(new Date(), state.history);
    applyPulseTask(pulse);
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (pulse.task.type === "conversation") {
      $("conversationPanel").scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  });
}

async function init() {
  try {
    loadState();
    bindEvents();
    renderExercises();
    renderChallengeTags();
    renderHistory();
    renderHeaderStats();
    renderWeekChecklist();
    renderTodayPlan();
    renderPulseUI();
    renderImprovementLog();
    renderPerformance();
    renderPrompt();
    setupRecognition();
    startPulseCountdown();

    $("speakPrompts").checked = state.settings.speakPrompts;
    $("showInterim").checked = state.settings.showInterim;
    $("autoContinue").checked = state.settings.autoContinue;
    $("realtimeCoach").checked = state.settings.realtimeCoach;
    $("speakLiveTips").checked = state.settings.speakLiveTips;

    window.__STUTTER_COACH_READY = true;

    await runPreflight();
    updateMicState();
    loadAppMeta();
  } catch (err) {
    console.error(err);
    setSetupBanner(
      "error",
      "App failed to start",
      `${err.message}. Hard-refresh the page (Cmd+Shift+R) at http://127.0.0.1:8787`,
      { showUrl: true }
    );
  }
}

init();
