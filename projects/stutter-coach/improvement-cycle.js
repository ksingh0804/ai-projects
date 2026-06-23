/**
 * 4-hour improvement pulse — 6 slots/day, unique task per day × slot.
 * Adapts difficulty from recent session scores.
 */

export const SLOT_HOURS = 4;
export const SLOTS_PER_DAY = 24 / SLOT_HOURS;

export const SLOT_LABELS = [
  { id: 0, label: "Night", range: "12am–4am", emoji: "🌙" },
  { id: 1, label: "Dawn", range: "4am–8am", emoji: "🌅" },
  { id: 2, label: "Morning", range: "8am–12pm", emoji: "☀️" },
  { id: 3, label: "Afternoon", range: "12pm–4pm", emoji: "🌤" },
  { id: 4, label: "Evening", range: "4pm–8pm", emoji: "🌆" },
  { id: 5, label: "Night prep", range: "8pm–12am", emoji: "✨" },
];

/** dayIndex 0=Mon … 6=Sun */
export const DAILY_MISSIONS = [
  { title: "Foundation Monday", mission: "Build calm starts — breath, gentle onsets, first chat.", color: "#2a9d8f" },
  { title: "Consonant Tuesday", mission: "Tame P, B, T, K — light contact, no pressure.", color: "#457b9d" },
  { title: "Pace Wednesday", mission: "Half-speed speech — own your rhythm, not the clock.", color: "#6a9bcc" },
  { title: "Recovery Thursday", mission: "Low pressure day — acceptance beats perfection.", color: "#9b8ec4" },
  { title: "Power Friday", mission: "Hardest sounds + real conversation — stay calm.", color: "#e76f51" },
  { title: "Integration Saturday", mission: "Mix everything — read, intro, talk like real life.", color: "#e9c46a" },
  { title: "Review Sunday", mission: "Celebrate the week — evaluate and set next focus.", color: "#2a9d8f" },
];

/**
 * Tasks[dayIndex][slotIndex]
 * exerciseId, promptIndex (optional), scenarioId (small-talk), affirmation (speak-only)
 */
export const PULSE_TASKS = [
  // Monday
  [
    { title: "Sleep affirmation", type: "affirmation", text: "I rest my voice. Tomorrow I practice with patience.", minutes: 3, focus: "acceptance" },
    { title: "Dawn breathing", type: "breath", text: "Three slow breaths: in 4, hold 2, out 6. Then say 'Good morning' softly.", minutes: 4, exerciseId: "gentle-onset", promptIndex: 1, focus: "breathing" },
    { title: "Name intro", type: "drill", exerciseId: "baseline", promptIndex: 0, minutes: 5, focus: "introduction" },
    { title: "Gentle P word", type: "drill", exerciseId: "gentle-onset", promptIndex: 0, minutes: 5, focus: "gentle-onset" },
    { title: "Chat check-in", type: "conversation", exerciseId: "small-talk", scenarioId: "daily", turns: 2, minutes: 8, focus: "small-talk" },
    { title: "Day reflect", type: "affirmation", text: "I showed up today. One calm sentence is enough.", minutes: 3, focus: "reflect" },
  ],
  // Tuesday
  [
    { title: "Night reset", type: "affirmation", text: "Blocks are temporary. My voice is mine.", minutes: 3, focus: "acceptance" },
    { title: "Box breath + Kosta", type: "drill", exerciseId: "plosives", promptIndex: 3, minutes: 5, focus: "plosives" },
    { title: "Practice word", type: "drill", exerciseId: "plosives", promptIndex: 0, minutes: 5, focus: "plosives" },
    { title: "Because — soft B", type: "drill", exerciseId: "plosives", promptIndex: 1, minutes: 5, focus: "plosives" },
    { title: "Meeting opener", type: "conversation", exerciseId: "small-talk", scenarioId: "meeting", turns: 2, minutes: 8, focus: "small-talk" },
    { title: "Challenge word", type: "drill", exerciseId: "challenge", promptIndex: 0, minutes: 5, focus: "challenge" },
  ],
  // Wednesday
  [
    { title: "Pace mantra", type: "affirmation", text: "I speak at my own pace. Silence is my friend.", minutes: 3, focus: "acceptance" },
    { title: "Slow phrase 1", type: "drill", exerciseId: "slow-reading", promptIndex: 0, minutes: 6, focus: "pace" },
    { title: "Slow phrase 2", type: "drill", exerciseId: "slow-reading", promptIndex: 1, minutes: 6, focus: "pace" },
    { title: "Onset warm-up", type: "drill", exerciseId: "gentle-onset", promptIndex: 2, minutes: 5, focus: "gentle-onset" },
    { title: "Longer chat", type: "conversation", exerciseId: "small-talk", scenarioId: "daily", turns: 3, minutes: 10, focus: "small-talk" },
    { title: "Progress note", type: "affirmation", text: "Slower speech is stronger speech.", minutes: 3, focus: "reflect" },
  ],
  // Thursday (light)
  [
    { title: "Gentle night", type: "affirmation", text: "I am more than my fluency.", minutes: 3, focus: "acceptance" },
    { title: "Easy breath", type: "breath", text: "Notice belly rise and fall. No scoring.", minutes: 4, focus: "breathing" },
    { title: "One slow line", type: "drill", exerciseId: "slow-reading", promptIndex: 2, minutes: 5, focus: "pace" },
    { title: "Optional chat", type: "conversation", exerciseId: "small-talk", scenarioId: "daily", turns: 1, minutes: 5, focus: "small-talk", optional: true },
    { title: "Self-kindness", type: "affirmation", text: "Showing up is the win.", minutes: 3, focus: "acceptance" },
    { title: "Rest", type: "rest", text: "Stretch jaw and neck. Hydrate. No mic needed.", minutes: 5, focus: "rest" },
  ],
  // Friday
  [
    { title: "Power intention", type: "affirmation", text: "Calm beats force. I choose ease.", minutes: 3, focus: "acceptance" },
    { title: "Presentation chunk", type: "drill", exerciseId: "plosives", promptIndex: 4, minutes: 6, focus: "plosives" },
    { title: "Talking — light T", type: "drill", exerciseId: "plosives", promptIndex: 2, minutes: 5, focus: "plosives" },
    { title: "Your hardest word", type: "drill", exerciseId: "challenge", promptIndex: 0, minutes: 5, focus: "challenge" },
    { title: "Full chat round", type: "conversation", exerciseId: "small-talk", scenarioId: "daily", turns: 4, minutes: 10, focus: "small-talk" },
    { title: "Friday wins", type: "affirmation", text: "I faced hard sounds today. That counts.", minutes: 3, focus: "reflect" },
  ],
  // Saturday
  [
    { title: "Integration breath", type: "breath", text: "Inhale confidence, exhale tension.", minutes: 4, focus: "breathing" },
    { title: "Read aloud", type: "drill", exerciseId: "slow-reading", promptIndex: 0, minutes: 6, focus: "pace" },
    { title: "Full intro", type: "drill", exerciseId: "baseline", promptIndex: 1, minutes: 5, focus: "introduction" },
    { title: "Meeting scenario", type: "conversation", exerciseId: "small-talk", scenarioId: "meeting", turns: 3, minutes: 8, focus: "small-talk" },
    { title: "All challenge words", type: "drill", exerciseId: "challenge", promptIndex: 0, minutes: 6, focus: "challenge" },
    { title: "Weekend calm", type: "affirmation", text: "Real life is my practice ground.", minutes: 3, focus: "reflect" },
  ],
  // Sunday
  [
    { title: "Week gratitude", type: "affirmation", text: "I completed another week of practice.", minutes: 3, focus: "acceptance" },
    { title: "Weakest sound drill", type: "adaptive", minutes: 6, focus: "review" },
    { title: "Best exercise repeat", type: "adaptive", minutes: 6, focus: "review" },
    { title: "Dual scenario chat", type: "conversation", exerciseId: "small-talk", scenarioId: "daily", turns: 2, minutes: 8, focus: "small-talk" },
    { title: "Sunday evaluation", type: "evaluate", text: "Open Weekly Performance and read your summary.", minutes: 5, focus: "review" },
    { title: "Next week intention", type: "affirmation", text: "Next week I practice with curiosity, not fear.", minutes: 3, focus: "reflect" },
  ],
];

export function getDayIndex(date = new Date()) {
  const d = date.getDay();
  return d === 0 ? 6 : d - 1;
}

export function getCurrentSlotIndex(date = new Date()) {
  return Math.floor(date.getHours() / SLOT_HOURS);
}

export function getTodayDateKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function msUntilNextSlot(date = new Date()) {
  const slot = getCurrentSlotIndex(date);
  const nextHour = (slot + 1) * SLOT_HOURS;
  const next = new Date(date);
  if (nextHour >= 24) {
    next.setDate(next.getDate() + 1);
    next.setHours(0, 0, 0, 0);
  } else {
    next.setHours(nextHour, 0, 0, 0);
  }
  return Math.max(0, next - date);
}

export function formatCountdown(ms) {
  const totalMin = Math.ceil(ms / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function recentAvgScore(history, n = 5) {
  const recent = history.slice(0, n);
  if (!recent.length) return null;
  return Math.round(recent.reduce((s, h) => s + h.score, 0) / recent.length);
}

function weakestExercise(history) {
  const byEx = {};
  for (const h of history) {
    const id = h.exerciseId || "unknown";
    if (!byEx[id]) byEx[id] = { sum: 0, n: 0 };
    byEx[id].sum += h.score;
    byEx[id].n += 1;
  }
  let worst = null;
  let worstAvg = 101;
  for (const [id, v] of Object.entries(byEx)) {
    const avg = v.sum / v.n;
    if (avg < worstAvg) {
      worstAvg = avg;
      worst = id;
    }
  }
  return worst;
}

function strongestExercise(history) {
  const byEx = {};
  for (const h of history) {
    const id = h.exerciseId || "unknown";
    if (!byEx[id]) byEx[id] = { sum: 0, n: 0 };
    byEx[id].sum += h.score;
    byEx[id].n += 1;
  }
  let best = null;
  let bestAvg = -1;
  for (const [id, v] of Object.entries(byEx)) {
    const avg = v.sum / v.n;
    if (avg > bestAvg) {
      bestAvg = avg;
      best = id;
    }
  }
  return best;
}

export function resolveAdaptiveTask(task, history) {
  if (task.type !== "adaptive") return task;
  const weak = weakestExercise(history) || "gentle-onset";
  const strong = strongestExercise(history) || "baseline";
  const exerciseId = task.focus === "review" && task.title.includes("Weakest") ? weak : strong;
  return {
    ...task,
    type: "drill",
    exerciseId,
    promptIndex: 0,
    resolvedFrom: exerciseId,
  };
}

export function adaptTaskForPerformance(baseTask, history) {
  let task = resolveAdaptiveTask(baseTask, history);
  const avg = recentAvgScore(history);
  const adaptation = { level: "standard", note: "Standard pulse task." };

  if (avg == null) {
    return { task, adaptation };
  }

  if (avg < 50) {
    adaptation.level = "easier";
    adaptation.note = `Recent avg ${avg} — shortened focus, gentler pace. Retry without pressure.`;
    if (task.type === "conversation" && task.turns > 1) {
      task = { ...task, turns: Math.max(1, task.turns - 1) };
    }
    if (task.type === "drill" && task.exerciseId === "plosives") {
      task = { ...task, exerciseId: "gentle-onset", promptIndex: 0 };
    }
  } else if (avg >= 75) {
    adaptation.level = "harder";
    adaptation.note = `Recent avg ${avg} — leveling up! Add calm confidence.`;
    if (task.type === "drill" && task.exerciseId === "gentle-onset") {
      task = { ...task, promptIndex: Math.min(4, (task.promptIndex || 0) + 1) };
    }
    if (task.type === "conversation") {
      task = { ...task, turns: (task.turns || 2) + 1 };
    }
  } else {
    adaptation.note = `Recent avg ${avg} — steady progress. Keep the same calm pace.`;
  }

  return { task, adaptation };
}

export function getPulseTask(date, history) {
  const dayIdx = getDayIndex(date);
  const slotIdx = getCurrentSlotIndex(date);
  const base = PULSE_TASKS[dayIdx][slotIdx];
  const { task, adaptation } = adaptTaskForPerformance(base, history);
  const mission = DAILY_MISSIONS[dayIdx];
  const slot = SLOT_LABELS[slotIdx];
  return {
    dayIdx,
    slotIdx,
    mission,
    slot,
    task,
    adaptation,
    slotKey: `${getTodayDateKey(date)}-${slotIdx}`,
  };
}

export function getNextPulsePreview(date, history) {
  const next = new Date(date.getTime() + msUntilNextSlot(date));
  return getPulseTask(next, history);
}

export function runImprovementCheck(pulseState, date, history) {
  const today = getTodayDateKey(date);
  const slotIdx = getCurrentSlotIndex(date);
  const pulse = getPulseTask(date, history);

  if (pulseState.date !== today) {
    return {
      isNewDay: true,
      isNewSlot: true,
      pulse,
      message: `New day — ${pulse.mission.title}. Fresh tasks all day.`,
    };
  }

  const isNewSlot = pulseState.lastSlotIndex !== slotIdx;
  let message = null;
  if (isNewSlot) {
    message = `New 4-hour pulse: ${pulse.slot.label} — ${pulse.task.title}. ${pulse.adaptation.note}`;
  }

  return { isNewDay: false, isNewSlot, pulse, message };
}

export function buildImprovementEntry(pulse, score, adaptation) {
  return {
    at: new Date().toISOString(),
    day: pulse.mission.title,
    slot: pulse.slot.label,
    task: pulse.task.title,
    adaptation: adaptation.note,
    score,
    focus: pulse.task.focus,
  };
}

export function summarizeImprovementLog(log, limit = 8) {
  if (!log.length) return "Complete your first 4-hour pulse to start the improvement log.";
  const recent = log.slice(0, limit);
  const completed = recent.length;
  const avg = Math.round(recent.reduce((s, e) => s + (e.score || 0), 0) / completed);
  const adaptations = recent.filter((e) => e.adaptation?.includes("easier") || e.adaptation?.includes("harder")).length;
  return `${completed} recent pulses logged · avg ${avg}. ${adaptations} adaptive adjustments applied. Keep the 4-hour rhythm.`;
}
