/** Kosta's 7-day stuttering practice plan — 30 min/day */

export const WEEKLY_PLAN = {
  name: "Kosta",
  minutesPerDay: 30,
  days: [
    {
      day: 1,
      title: "Foundation Monday",
      focus: "Breathing, acceptance, gentle onsets, first small talk",
      type: "full",
      exercises: ["baseline", "gentle-onset", "small-talk"],
      blocks: [
        { start: 0, end: 3, activity: "Breathing", detail: "4-count inhale → 2-count hold → 6-count exhale. Repeat 3 cycles. Shoulders down." },
        { start: 3, end: 5, activity: "Acceptance", detail: "Say aloud: \"I allow my voice to be imperfect. Blocks are information, not failure.\"" },
        { start: 5, end: 10, activity: "Introduction", detail: "Both prompts in the app. Record tension after each. Establish your baseline score." },
        { start: 10, end: 22, activity: "Gentle Onset", detail: "All 5 prompts. Retry any score under 60. Whisper-grow into each first sound." },
        { start: 22, end: 28, activity: "Small Talk", detail: "Daily Chat — Round 1. Short answers only. Let the coach lead." },
        { start: 28, end: 30, activity: "Reflect", detail: "Note one word that felt easy and one that was hard. Rate overall tension." },
      ],
    },
    {
      day: 2,
      title: "Consonant Tuesday",
      focus: "Hard consonants + meeting-style conversation",
      type: "full",
      exercises: ["gentle-onset", "plosives", "small-talk", "challenge"],
      blocks: [
        { start: 0, end: 3, activity: "Breathing", detail: "Box breathing: in 4, hold 4, out 4, hold 4. Two rounds." },
        { start: 3, end: 8, activity: "Gentle Onset warm-up", detail: "First 3 prompts only — light contact, no pressure." },
        { start: 8, end: 18, activity: "Hard Consonants", detail: "All 5 prompts including \"Kosta\" and \"presentation\". Break long words into chunks." },
        { start: 18, end: 26, activity: "Small Talk", detail: "Meeting Intro scenario. Practice name + role + one-sentence update." },
        { start: 26, end: 30, activity: "Your Words", detail: "Drill \"Kosta\" and one challenge word you added. Gentle K every time." },
      ],
    },
    {
      day: 3,
      title: "Pace Wednesday",
      focus: "Slow reading + longer conversation round",
      type: "full",
      exercises: ["slow-reading", "small-talk"],
      blocks: [
        { start: 0, end: 5, activity: "Breathing + acceptance", detail: "3 deep breaths, then: \"I speak at my own pace. Silence is my friend.\"" },
        { start: 5, end: 15, activity: "Slow Reading", detail: "All 3 prompts at half speed. Pause at every comma and period." },
        { start: 15, end: 25, activity: "Small Talk", detail: "Daily Chat — Round 2 (longer answers). Stay under 10 words per sentence if blocks appear." },
        { start: 25, end: 30, activity: "Reflect", detail: "Compare today's avg score to Day 1. Did slower reading help tension?" },
      ],
    },
    {
      day: 4,
      title: "Recovery Thursday",
      focus: "Light day — low pressure, acceptance, rest",
      type: "rest",
      exercises: ["slow-reading", "small-talk"],
      blocks: [
        { start: 0, end: 5, activity: "Gentle breathing", detail: "No targets. Just notice belly rise and fall. No scoring." },
        { start: 5, end: 15, activity: "Slow Reading (light)", detail: "Only 1–2 prompts. If you block, pause, breathe, continue — no retry pressure." },
        { start: 15, end: 22, activity: "Small Talk (optional)", detail: "2 turns max in Daily Chat. Skip if tired — mark day complete anyway." },
        { start: 22, end: 26, activity: "Acceptance affirmations", detail: "Speak slowly: \"I am more than my fluency.\" \"Showing up is the win.\"" },
        { start: 26, end: 30, activity: "Rest", detail: "Close the app. Stretch jaw and neck. Hydrate." },
      ],
    },
    {
      day: 5,
      title: "Power Friday",
      focus: "Hardest sounds + mixed drills",
      type: "full",
      exercises: ["plosives", "challenge", "gentle-onset", "small-talk"],
      blocks: [
        { start: 0, end: 4, activity: "Breathing", detail: "Power breath: sharp inhale through nose, long slow exhale through lips." },
        { start: 4, end: 14, activity: "Hard Consonants + Your Words", detail: "Alternate plosive prompts with challenge words. 2 passes on weakest word." },
        { start: 14, end: 24, activity: "Gentle Onset", detail: "Full set. Focus on words that scored lowest earlier this week." },
        { start: 24, end: 30, activity: "Small Talk", detail: "Full Daily Chat round. Aim for calm, not perfect scores." },
      ],
    },
    {
      day: 6,
      title: "Integration Saturday",
      focus: "Combine reading, intro, and real-world phrases",
      type: "full",
      exercises: ["slow-reading", "baseline", "small-talk", "challenge"],
      blocks: [
        { start: 0, end: 3, activity: "Breathing", detail: "3 cycles. Set intention: \"Today I integrate what I practiced.\"" },
        { start: 3, end: 12, activity: "Slow Reading", detail: "All prompts. Imagine reading to a friend, not performing." },
        { start: 12, end: 22, activity: "Introduction + Meeting Intro", detail: "Baseline prompts, then Meeting Intro scenario end-to-end." },
        { start: 22, end: 30, activity: "Challenge words", detail: "Every word in your list. Add one new word if you hit 80+ on all." },
      ],
    },
    {
      day: 7,
      title: "Review Sunday",
      focus: "Week review, celebration, evaluation",
      type: "review",
      exercises: ["gentle-onset", "slow-reading", "small-talk"],
      blocks: [
        { start: 0, end: 5, activity: "Breathing + acceptance", detail: "\"I completed a week of practice. That matters more than any score.\"" },
        { start: 5, end: 15, activity: "Weakest exercise", detail: "Open the Performance tab — drill whichever exercise scored lowest this week." },
        { start: 15, end: 25, activity: "Small Talk finale", detail: "One round Daily Chat + one round Meeting Intro. Celebrate finishing." },
        { start: 25, end: 30, activity: "Weekly evaluation", detail: "Open Performance → read your auto-generated week summary. Check all 7 days." },
      ],
    },
  ],
};

export function getWeekStart(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getWeekStartISO(date = new Date()) {
  return getWeekStart(date).toISOString().slice(0, 10);
}

export function getTodayPlanDay(date = new Date()) {
  const weekStart = getWeekStart(date);
  const diff = Math.floor((date - weekStart) / 86400000);
  const idx = Math.min(Math.max(diff, 0), 6);
  return WEEKLY_PLAN.days[idx];
}

export function dayKeyForDate(date = new Date()) {
  const weekStart = getWeekStart(date);
  const diff = Math.floor((date - weekStart) / 86400000);
  return String(Math.min(Math.max(diff + 1, 1), 7));
}

function dateOnly(iso) {
  return iso.slice(0, 10);
}

function sessionsInWeek(history, weekStartISO) {
  const start = new Date(weekStartISO);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  return history.filter((h) => {
    const t = new Date(h.at);
    return t >= start && t < end;
  });
}

function sessionsOnDate(history, ymd) {
  return history.filter((h) => dateOnly(h.at) === ymd);
}

function avg(nums) {
  return nums.length ? Math.round(nums.reduce((a, b) => a + b, 0) / nums.length) : null;
}

export function evaluateWeek(history, weekStartISO = getWeekStartISO(), completedDays = {}) {
  const start = new Date(weekStartISO);
  const dayStats = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const ymd = d.toISOString().slice(0, 10);
    const sessions = sessionsOnDate(history, ymd);
    const scores = sessions.map((s) => s.score);
    const tensions = sessions.map((s) => s.tension).filter((t) => t != null);
    dayStats.push({
      day: i + 1,
      date: ymd,
      label: WEEKLY_PLAN.days[i].title,
      type: WEEKLY_PLAN.days[i].type,
      sessions: sessions.length,
      avgScore: avg(scores),
      avgTension: avg(tensions),
      checked: Boolean(completedDays[String(i + 1)]),
    });
  }

  const weekSessions = sessionsInWeek(history, weekStartISO);
  const allScores = weekSessions.map((s) => s.score);
  const allTensions = weekSessions.map((s) => s.tension).filter((t) => t != null);
  const weekAvg = avg(allScores);
  const weekTension = avg(allTensions);

  const practicedDays = dayStats.filter((d) => d.sessions > 0);
  const best = practicedDays.length
    ? practicedDays.reduce((a, b) => ((a.avgScore ?? 0) >= (b.avgScore ?? 0) ? a : b))
    : null;
  const worst = practicedDays.length
    ? practicedDays.reduce((a, b) => ((a.avgScore ?? 101) <= (b.avgScore ?? 101) ? a : b))
    : null;

  const firstHalf = dayStats.slice(0, 3).flatMap((d) => sessionsOnDate(history, d.date).map((s) => s.tension));
  const secondHalf = dayStats.slice(4).flatMap((d) => sessionsOnDate(history, d.date).map((s) => s.tension));
  const tensionTrend =
    firstHalf.length && secondHalf.length
      ? avg(secondHalf) - avg(firstHalf)
      : null;

  const checkedCount = dayStats.filter((d) => d.checked).length;
  const summary = buildWeekSummary({
    weekAvg,
    weekTension,
    totalSessions: weekSessions.length,
    checkedCount,
    best,
    worst,
    tensionTrend,
    dayStats,
  });

  return {
    weekStart: weekStartISO,
    totalSessions: weekSessions.length,
    avgScore: weekAvg,
    avgTension: weekTension,
    tensionTrend,
    bestDay: best,
    worstDay: worst,
    dayStats,
    checkedCount,
    summary,
    chartData: dayStats.map((d) => ({
      day: d.day,
      score: d.avgScore ?? 0,
      sessions: d.sessions,
      tension: d.avgTension ?? 0,
    })),
  };
}

function buildWeekSummary({ weekAvg, weekTension, totalSessions, checkedCount, best, worst, tensionTrend, dayStats }) {
  const lines = [];

  if (totalSessions === 0 && checkedCount === 0) {
    return "No practice logged this week yet. Open today's plan in the sidebar and complete your first 30-minute session.";
  }

  lines.push(`You logged ${totalSessions} session${totalSessions === 1 ? "" : "s"} across ${dayStats.filter((d) => d.sessions > 0).length} day(s).`);

  if (weekAvg != null) {
    lines.push(`Average fluency score: ${weekAvg}/100.`);
  }

  if (weekTension != null) {
    const trend =
      tensionTrend == null
        ? ""
        : tensionTrend < -0.5
          ? " Tension eased through the week — acceptance and rest days are working."
          : tensionTrend > 0.5
            ? " Tension rose slightly — consider more breathing before hard blocks."
            : " Tension held steady.";
    lines.push(`Average self-rated tension: ${weekTension}/10.${trend}`);
  }

  if (best) {
    lines.push(`Strongest day: Day ${best.day} (${best.label}) — avg ${best.avgScore}.`);
  }
  if (worst && worst.day !== best?.day) {
    lines.push(`Toughest day: Day ${worst.day} (${worst.label}) — avg ${worst.avgScore}. Retry that day's exercises next week.`);
  }

  if (checkedCount === 7) {
    lines.push("All 7 plan days checked off — outstanding consistency, Kosta.");
  } else if (checkedCount >= 5) {
    lines.push(`${checkedCount}/7 plan days marked complete. You're building a real habit.`);
  } else {
    lines.push(`${checkedCount}/7 plan days checked. Aim for 5+ next week — short sessions still count.`);
  }

  return lines.join(" ");
}
