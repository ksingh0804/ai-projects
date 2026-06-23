(() => {
  // conversation.js
  var CONVERSATION_SCENARIOS = {
    daily: {
      title: "Daily Chat",
      description: "Casual small talk \u2014 caf\xE9, weather, weekend",
      rounds: [
        {
          turns: [
            {
              coach: "Hi Kosta! I'm your speech coach. Let's warm up with easy small talk. How are you doing today?",
              sample: "I'm doing well, thank you. How about you?",
              tip: "Short answer is fine. Ease into the first word \u2014 don't rush.",
              retryCoach: "No rush. Take a breath, then tell me how you're doing \u2014 even 'I'm okay' works.",
              acks: {
                good: "I love that energy. You sounded clear and calm.",
                okay: "Good \u2014 steady and natural. That's exactly what we want.",
                low: "You got the words out. Let's smooth the start \u2014 breathe, then try once more."
              }
            },
            {
              coach: "Nice. What did you have for breakfast this morning?",
              sample: "I had coffee and toast this morning.",
              tip: "Pause after 'I had' \u2014 then name one thing.",
              retryCoach: "Just one food or drink is enough. Slow and easy.",
              acks: {
                good: "Fluent answer. You're staying relaxed.",
                okay: "Clear enough to keep going. Nice work.",
                low: "Remember: gentle onset on the first sound of each word."
              }
            },
            {
              coach: "Sounds good. What's one thing you're looking forward to this week?",
              sample: "I'm looking forward to practicing my speech this week.",
              tip: "Break it up: 'I'm looking forward to' \u2014 pause \u2014 'one thing'.",
              retryCoach: "Share anything \u2014 a plan, a person, or just 'relaxing'.",
              acks: {
                good: "That flowed really well. Great control.",
                okay: "You communicated clearly. Keep that pace.",
                low: "Long sentences are hard. Shrink it: 'I'm looking forward to the weekend.'"
              }
            },
            {
              coach: "I hear you. Do you prefer mornings or evenings?",
              sample: "I prefer evenings because I feel more relaxed.",
              tip: "Pick one: 'Mornings' or 'Evenings' \u2014 then add one short reason.",
              retryCoach: "One word plus one reason. Example: 'Evenings, because I'm tired in the morning.'",
              acks: {
                good: "Smooth preference answer. Well done.",
                okay: "Good conversational reply.",
                low: "Try just 'Mornings' or 'Evenings' first, then expand."
              }
            },
            {
              coach: "Last one for this round \u2014 what hobby helps you unwind?",
              sample: "Reading helps me unwind after a long day.",
              tip: "Soft H in 'helps' \u2014 don't push the air.",
              retryCoach: "Any hobby counts: walking, music, games, cooking.",
              acks: {
                good: "Strong finish to the round!",
                okay: "Solid answer. Round complete.",
                low: "You finished the round \u2014 that's a win. We'll build from here."
              }
            }
          ]
        },
        {
          turns: [
            {
              coach: "Round two \u2014 a little longer. Tell me about your favorite place to relax.",
              sample: "My favorite place to relax is a quiet park near my home.",
              tip: "Start with 'My favorite place' \u2014 stretch it slightly.",
              retryCoach: "Name any place: home, a caf\xE9, a park, your room.",
              acks: {
                good: "Beautiful fluency on a longer answer.",
                okay: "Good detail. You're handling longer turns.",
                low: "Chunk it: place name first, then why you like it."
              }
            },
            {
              coach: "What would you tell a friend who feels nervous about speaking?",
              sample: "I would tell them to breathe and take their time.",
              tip: "Gentle W in 'would' \u2014 lips barely touch.",
              retryCoach: "One sentence of advice is enough.",
              acks: {
                good: "Wise and fluent \u2014 excellent.",
                okay: "Clear advice. Nice empathy.",
                low: "Short version: 'Breathe and go slow.'"
              }
            },
            {
              coach: "If you could learn one new skill this year, what would it be?",
              sample: "I would like to learn public speaking this year.",
              tip: "Watch the P in 'public' \u2014 light lip contact.",
              retryCoach: "Name any skill \u2014 cooking, coding, a language.",
              acks: {
                good: "You handled a tough P sound well.",
                okay: "Good ambition. Clear delivery.",
                low: "Try: 'I'd learn guitar' \u2014 keep it short."
              }
            },
            {
              coach: "What's something small that made you smile recently?",
              sample: "A message from a friend made me smile recently.",
              tip: "Soft S in 'smile' and 'recently'.",
              retryCoach: "Anything tiny counts \u2014 a joke, sunshine, good food.",
              acks: {
                good: "Warm answer, smoothly delivered.",
                okay: "Nice personal touch.",
                low: "One short phrase is fine: 'Good coffee yesterday.'"
              }
            },
            {
              coach: "Great round. Before we wrap \u2014 say one thing you're proud of about your speech progress.",
              sample: "I'm proud that I practice speaking every day.",
              tip: "Own it slowly: 'I'm proud that I\u2026'",
              retryCoach: "Even 'I'm proud I tried today' counts.",
              acks: {
                good: "Powerful close. You should be proud.",
                okay: "Honest and clear. Round two complete.",
                low: "Showing up to practice is already progress."
              }
            }
          ]
        }
      ]
    },
    meeting: {
      title: "Meeting Intro",
      description: "Name, role, and quick intro",
      rounds: [
        {
          turns: [
            {
              coach: "Let's practice a meeting intro. Start with: say your name and what you do.",
              sample: "My name is Kosta and I work in technology.",
              tip: "Name first \u2014 gentle K \u2014 then pause \u2014 then your role.",
              retryCoach: "Try: 'My name is Kosta.' Then add one more sentence.",
              acks: {
                good: "Professional and clear intro.",
                okay: "Good meeting opener.",
                low: "Just your name is a fine start."
              }
            },
            {
              coach: "How would you describe your main strength in one sentence?",
              sample: "My main strength is staying calm under pressure.",
              tip: "Light M on 'main' and 'my'.",
              retryCoach: "One trait: patient, focused, creative, helpful.",
              acks: {
                good: "Confident delivery.",
                okay: "That works in a real meeting.",
                low: "Shrink to: 'I'm a good listener.'"
              }
            },
            {
              coach: "Someone asks what you're working on. Give a one-sentence update.",
              sample: "I'm working on improving my communication skills.",
              tip: "Easy start: 'I'm working on' \u2014 then one project.",
              retryCoach: "Any project or goal you have in mind.",
              acks: {
                good: "Crisp project update.",
                okay: "Clear and professional.",
                low: "Try: 'I'm working on a personal project.'"
              }
            }
          ]
        },
        {
          turns: [
            {
              coach: "Round two \u2014 introduce yourself to a new teammate in two sentences.",
              sample: "Hi, I'm Kosta. I joined the team last month and I'm excited to collaborate.",
              tip: "Sentence one: name. Pause. Sentence two: one detail.",
              retryCoach: "Try: 'Hi, I'm Kosta.' Then add one fact about your role.",
              acks: {
                good: "Polished intro \u2014 you'd sound great in a real meeting.",
                okay: "Clear and professional. Nice work.",
                low: "Short is fine: name plus one sentence."
              }
            },
            {
              coach: "Someone asks how your week is going. Give a brief, positive update.",
              sample: "My week is going well. I'm making steady progress on my goals.",
              tip: "Lead with 'My week is going\u2026' \u2014 keep it under ten words.",
              retryCoach: "Even 'Busy but good' works.",
              acks: {
                good: "Natural weekly check-in.",
                okay: "That fits a stand-up or hallway chat.",
                low: "One phrase is enough: 'Pretty good, thanks.'"
              }
            },
            {
              coach: "Close with one sentence on what you'd like help with this week.",
              sample: "I'd like help prioritizing my tasks this week.",
              tip: "Start with 'I'd like help with\u2026' \u2014 direct and calm.",
              retryCoach: "Ask for one small thing: feedback, clarity, or time.",
              acks: {
                good: "Strong, assertive close.",
                okay: "Good meeting closer.",
                low: "Try: 'Could we sync for five minutes?'"
              }
            }
          ]
        }
      ]
    }
  };
  function analyzeConversationTurn(spokenText, durationSec, turn) {
    const spoken = spokenText.trim();
    const words = spoken.toLowerCase().replace(/[^\w\s']/g, "").split(/\s+/).filter(Boolean);
    const repetitions = [];
    for (let i = 1; i < words.length; i++) {
      if (words[i] === words[i - 1]) repetitions.push(words[i]);
    }
    const patterns = [];
    const repetitionRegex = /\b(\w{1,4})\s+\1\b/gi;
    let match;
    while ((match = repetitionRegex.exec(spoken)) !== null) {
      patterns.push({ type: "repetition", value: match[1] });
    }
    const prolongationRegex = /\b([bcdfghjklmnpqrstvwxyz])\1{2,}/gi;
    while ((match = prolongationRegex.exec(spoken)) !== null) {
      patterns.push({ type: "prolongation", value: match[0] });
    }
    const fillers = ["um", "uh", "er", "ah", "like", "you know"];
    let fillerCount = 0;
    for (const filler of fillers) {
      const regex = new RegExp(`\\b${filler}\\b`, "gi");
      fillerCount += (spoken.match(regex) || []).length;
    }
    const sampleWords = turn.sample.toLowerCase().replace(/[^\w\s']/g, "").split(/\s+/).filter(Boolean);
    let overlap = 0;
    for (const w of words) {
      if (sampleWords.some((s) => s === w || Math.abs(s.length - w.length) <= 1)) overlap++;
    }
    const relevance = words.length ? Math.min(1, overlap / Math.max(3, sampleWords.length * 0.35)) : 0;
    let score = 40;
    if (words.length >= 3) score += 15;
    if (words.length >= 6) score += 10;
    if (durationSec > 0 && durationSec < words.length * 3) score += 10;
    if (!repetitions.length && !patterns.length) score += 10;
    if (fillerCount === 0) score += 5;
    if (fillerCount <= 1) score += 3;
    if (relevance >= 0.4) score += 10;
    score -= repetitions.length * 10;
    score -= patterns.filter((p) => p.type === "prolongation").length * 12;
    score -= Math.max(0, fillerCount - 2) * 5;
    if (words.length < 2) score -= 25;
    if (durationSec > words.length * 5) score -= 8;
    score = Math.max(0, Math.min(100, Math.round(score)));
    const feedback = [];
    const tier = score >= 75 ? "good" : score >= 50 ? "okay" : "low";
    if (tier === "good") {
      feedback.push({
        tone: "good",
        icon: "\u2705",
        text: "Smooth conversational flow. Natural pace and good length."
      });
    } else if (tier === "okay") {
      feedback.push({
        tone: "warn",
        icon: "\u{1F7E1}",
        text: "Understandable reply. Slow the first word of your next sentence."
      });
    } else {
      feedback.push({
        tone: "warn",
        icon: "\u{1F534}",
        text: "Tough moment \u2014 normal in practice. Breathe, shorten your answer, try again."
      });
    }
    if (repetitions.length) {
      feedback.push({
        tone: "warn",
        icon: "\u{1F501}",
        text: `Repeated "${[...new Set(repetitions)].join(", ")}" \u2014 pause one beat, say it once.`
      });
    }
    if (fillerCount > 1) {
      feedback.push({
        tone: "tip",
        icon: "\u{1F4A8}",
        text: `${fillerCount} fillers detected. Silent pause beats "um".`
      });
    }
    if (words.length < 3) {
      feedback.push({
        tone: "tip",
        icon: "\u{1F4CF}",
        text: "Try a slightly longer answer \u2014 at least 3\u20135 words."
      });
    }
    if (turn.tip) {
      feedback.push({ tone: "tip", icon: "\u{1F4A1}", text: turn.tip });
    }
    return {
      score,
      tier,
      wordCount: words.length,
      repetitions: [...new Set(repetitions)],
      patterns,
      fillerCount,
      relevance,
      durationSec,
      feedback
    };
  }
  function buildCoachReply(turn, spoken, analysis) {
    const ack = turn.acks[analysis.tier] || turn.acks.okay;
    return ack;
  }
  function getRound(scenario, roundIndex) {
    if (!scenario?.rounds?.length) return { turns: [] };
    const idx = (roundIndex % scenario.rounds.length + scenario.rounds.length) % scenario.rounds.length;
    return scenario.rounds[idx];
  }
  function getRoundCount(scenario) {
    return scenario?.rounds?.length || 0;
  }
  function buildRoundSummary(scores) {
    if (!scores.length) return "Let's keep practicing together.";
    const avg2 = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const best = Math.max(...scores);
    if (avg2 >= 75) {
      return `Round complete! Average score ${avg2}, peak ${best}. You're ready for a harder round \u2014 same calm pace.`;
    }
    if (avg2 >= 55) {
      return `Round complete. Average ${avg2}. Solid progress \u2014 let's do another round to build consistency.`;
    }
    return `Round complete. Average ${avg2}. Every round trains your brain \u2014 let's go again with shorter answers.`;
  }

  // weekly-plan.js
  var WEEKLY_PLAN = {
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
          { start: 0, end: 3, activity: "Breathing", detail: "4-count inhale \u2192 2-count hold \u2192 6-count exhale. Repeat 3 cycles. Shoulders down." },
          { start: 3, end: 5, activity: "Acceptance", detail: 'Say aloud: "I allow my voice to be imperfect. Blocks are information, not failure."' },
          { start: 5, end: 10, activity: "Introduction", detail: "Both prompts in the app. Record tension after each. Establish your baseline score." },
          { start: 10, end: 22, activity: "Gentle Onset", detail: "All 5 prompts. Retry any score under 60. Whisper-grow into each first sound." },
          { start: 22, end: 28, activity: "Small Talk", detail: "Daily Chat \u2014 Round 1. Short answers only. Let the coach lead." },
          { start: 28, end: 30, activity: "Reflect", detail: "Note one word that felt easy and one that was hard. Rate overall tension." }
        ]
      },
      {
        day: 2,
        title: "Consonant Tuesday",
        focus: "Hard consonants + meeting-style conversation",
        type: "full",
        exercises: ["gentle-onset", "plosives", "small-talk", "challenge"],
        blocks: [
          { start: 0, end: 3, activity: "Breathing", detail: "Box breathing: in 4, hold 4, out 4, hold 4. Two rounds." },
          { start: 3, end: 8, activity: "Gentle Onset warm-up", detail: "First 3 prompts only \u2014 light contact, no pressure." },
          { start: 8, end: 18, activity: "Hard Consonants", detail: 'All 5 prompts including "Kosta" and "presentation". Break long words into chunks.' },
          { start: 18, end: 26, activity: "Small Talk", detail: "Meeting Intro scenario. Practice name + role + one-sentence update." },
          { start: 26, end: 30, activity: "Your Words", detail: 'Drill "Kosta" and one challenge word you added. Gentle K every time.' }
        ]
      },
      {
        day: 3,
        title: "Pace Wednesday",
        focus: "Slow reading + longer conversation round",
        type: "full",
        exercises: ["slow-reading", "small-talk"],
        blocks: [
          { start: 0, end: 5, activity: "Breathing + acceptance", detail: '3 deep breaths, then: "I speak at my own pace. Silence is my friend."' },
          { start: 5, end: 15, activity: "Slow Reading", detail: "All 3 prompts at half speed. Pause at every comma and period." },
          { start: 15, end: 25, activity: "Small Talk", detail: "Daily Chat \u2014 Round 2 (longer answers). Stay under 10 words per sentence if blocks appear." },
          { start: 25, end: 30, activity: "Reflect", detail: "Compare today's avg score to Day 1. Did slower reading help tension?" }
        ]
      },
      {
        day: 4,
        title: "Recovery Thursday",
        focus: "Light day \u2014 low pressure, acceptance, rest",
        type: "rest",
        exercises: ["slow-reading", "small-talk"],
        blocks: [
          { start: 0, end: 5, activity: "Gentle breathing", detail: "No targets. Just notice belly rise and fall. No scoring." },
          { start: 5, end: 15, activity: "Slow Reading (light)", detail: "Only 1\u20132 prompts. If you block, pause, breathe, continue \u2014 no retry pressure." },
          { start: 15, end: 22, activity: "Small Talk (optional)", detail: "2 turns max in Daily Chat. Skip if tired \u2014 mark day complete anyway." },
          { start: 22, end: 26, activity: "Acceptance affirmations", detail: 'Speak slowly: "I am more than my fluency." "Showing up is the win."' },
          { start: 26, end: 30, activity: "Rest", detail: "Close the app. Stretch jaw and neck. Hydrate." }
        ]
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
          { start: 24, end: 30, activity: "Small Talk", detail: "Full Daily Chat round. Aim for calm, not perfect scores." }
        ]
      },
      {
        day: 6,
        title: "Integration Saturday",
        focus: "Combine reading, intro, and real-world phrases",
        type: "full",
        exercises: ["slow-reading", "baseline", "small-talk", "challenge"],
        blocks: [
          { start: 0, end: 3, activity: "Breathing", detail: '3 cycles. Set intention: "Today I integrate what I practiced."' },
          { start: 3, end: 12, activity: "Slow Reading", detail: "All prompts. Imagine reading to a friend, not performing." },
          { start: 12, end: 22, activity: "Introduction + Meeting Intro", detail: "Baseline prompts, then Meeting Intro scenario end-to-end." },
          { start: 22, end: 30, activity: "Challenge words", detail: "Every word in your list. Add one new word if you hit 80+ on all." }
        ]
      },
      {
        day: 7,
        title: "Review Sunday",
        focus: "Week review, celebration, evaluation",
        type: "review",
        exercises: ["gentle-onset", "slow-reading", "small-talk"],
        blocks: [
          { start: 0, end: 5, activity: "Breathing + acceptance", detail: '"I completed a week of practice. That matters more than any score."' },
          { start: 5, end: 15, activity: "Weakest exercise", detail: "Open the Performance tab \u2014 drill whichever exercise scored lowest this week." },
          { start: 15, end: 25, activity: "Small Talk finale", detail: "One round Daily Chat + one round Meeting Intro. Celebrate finishing." },
          { start: 25, end: 30, activity: "Weekly evaluation", detail: "Open Performance \u2192 read your auto-generated week summary. Check all 7 days." }
        ]
      }
    ]
  };
  function getWeekStart(date = /* @__PURE__ */ new Date()) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }
  function getWeekStartISO(date = /* @__PURE__ */ new Date()) {
    return getWeekStart(date).toISOString().slice(0, 10);
  }
  function getTodayPlanDay(date = /* @__PURE__ */ new Date()) {
    const weekStart = getWeekStart(date);
    const diff = Math.floor((date - weekStart) / 864e5);
    const idx = Math.min(Math.max(diff, 0), 6);
    return WEEKLY_PLAN.days[idx];
  }
  function dayKeyForDate(date = /* @__PURE__ */ new Date()) {
    const weekStart = getWeekStart(date);
    const diff = Math.floor((date - weekStart) / 864e5);
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
  function evaluateWeek(history, weekStartISO = getWeekStartISO(), completedDays = {}) {
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
        checked: Boolean(completedDays[String(i + 1)])
      });
    }
    const weekSessions = sessionsInWeek(history, weekStartISO);
    const allScores = weekSessions.map((s) => s.score);
    const allTensions = weekSessions.map((s) => s.tension).filter((t) => t != null);
    const weekAvg = avg(allScores);
    const weekTension = avg(allTensions);
    const practicedDays = dayStats.filter((d) => d.sessions > 0);
    const best = practicedDays.length ? practicedDays.reduce((a, b) => (a.avgScore ?? 0) >= (b.avgScore ?? 0) ? a : b) : null;
    const worst = practicedDays.length ? practicedDays.reduce((a, b) => (a.avgScore ?? 101) <= (b.avgScore ?? 101) ? a : b) : null;
    const firstHalf = dayStats.slice(0, 3).flatMap((d) => sessionsOnDate(history, d.date).map((s) => s.tension));
    const secondHalf = dayStats.slice(4).flatMap((d) => sessionsOnDate(history, d.date).map((s) => s.tension));
    const tensionTrend = firstHalf.length && secondHalf.length ? avg(secondHalf) - avg(firstHalf) : null;
    const checkedCount = dayStats.filter((d) => d.checked).length;
    const summary = buildWeekSummary({
      weekAvg,
      weekTension,
      totalSessions: weekSessions.length,
      checkedCount,
      best,
      worst,
      tensionTrend,
      dayStats
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
        tension: d.avgTension ?? 0
      }))
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
      const trend = tensionTrend == null ? "" : tensionTrend < -0.5 ? " Tension eased through the week \u2014 acceptance and rest days are working." : tensionTrend > 0.5 ? " Tension rose slightly \u2014 consider more breathing before hard blocks." : " Tension held steady.";
      lines.push(`Average self-rated tension: ${weekTension}/10.${trend}`);
    }
    if (best) {
      lines.push(`Strongest day: Day ${best.day} (${best.label}) \u2014 avg ${best.avgScore}.`);
    }
    if (worst && worst.day !== best?.day) {
      lines.push(`Toughest day: Day ${worst.day} (${worst.label}) \u2014 avg ${worst.avgScore}. Retry that day's exercises next week.`);
    }
    if (checkedCount === 7) {
      lines.push("All 7 plan days checked off \u2014 outstanding consistency, Kosta.");
    } else if (checkedCount >= 5) {
      lines.push(`${checkedCount}/7 plan days marked complete. You're building a real habit.`);
    } else {
      lines.push(`${checkedCount}/7 plan days checked. Aim for 5+ next week \u2014 short sessions still count.`);
    }
    return lines.join(" ");
  }

  // improvement-cycle.js
  var SLOT_HOURS = 4;
  var SLOTS_PER_DAY = 24 / SLOT_HOURS;
  var SLOT_LABELS = [
    { id: 0, label: "Night", range: "12am\u20134am", emoji: "\u{1F319}" },
    { id: 1, label: "Dawn", range: "4am\u20138am", emoji: "\u{1F305}" },
    { id: 2, label: "Morning", range: "8am\u201312pm", emoji: "\u2600\uFE0F" },
    { id: 3, label: "Afternoon", range: "12pm\u20134pm", emoji: "\u{1F324}" },
    { id: 4, label: "Evening", range: "4pm\u20138pm", emoji: "\u{1F306}" },
    { id: 5, label: "Night prep", range: "8pm\u201312am", emoji: "\u2728" }
  ];
  var DAILY_MISSIONS = [
    { title: "Foundation Monday", mission: "Build calm starts \u2014 breath, gentle onsets, first chat.", color: "#2a9d8f" },
    { title: "Consonant Tuesday", mission: "Tame P, B, T, K \u2014 light contact, no pressure.", color: "#457b9d" },
    { title: "Pace Wednesday", mission: "Half-speed speech \u2014 own your rhythm, not the clock.", color: "#6a9bcc" },
    { title: "Recovery Thursday", mission: "Low pressure day \u2014 acceptance beats perfection.", color: "#9b8ec4" },
    { title: "Power Friday", mission: "Hardest sounds + real conversation \u2014 stay calm.", color: "#e76f51" },
    { title: "Integration Saturday", mission: "Mix everything \u2014 read, intro, talk like real life.", color: "#e9c46a" },
    { title: "Review Sunday", mission: "Celebrate the week \u2014 evaluate and set next focus.", color: "#2a9d8f" }
  ];
  var PULSE_TASKS = [
    // Monday
    [
      { title: "Sleep affirmation", type: "affirmation", text: "I rest my voice. Tomorrow I practice with patience.", minutes: 3, focus: "acceptance" },
      { title: "Dawn breathing", type: "breath", text: "Three slow breaths: in 4, hold 2, out 6. Then say 'Good morning' softly.", minutes: 4, exerciseId: "gentle-onset", promptIndex: 1, focus: "breathing" },
      { title: "Name intro", type: "drill", exerciseId: "baseline", promptIndex: 0, minutes: 5, focus: "introduction" },
      { title: "Gentle P word", type: "drill", exerciseId: "gentle-onset", promptIndex: 0, minutes: 5, focus: "gentle-onset" },
      { title: "Chat check-in", type: "conversation", exerciseId: "small-talk", scenarioId: "daily", turns: 2, minutes: 8, focus: "small-talk" },
      { title: "Day reflect", type: "affirmation", text: "I showed up today. One calm sentence is enough.", minutes: 3, focus: "reflect" }
    ],
    // Tuesday
    [
      { title: "Night reset", type: "affirmation", text: "Blocks are temporary. My voice is mine.", minutes: 3, focus: "acceptance" },
      { title: "Box breath + Kosta", type: "drill", exerciseId: "plosives", promptIndex: 3, minutes: 5, focus: "plosives" },
      { title: "Practice word", type: "drill", exerciseId: "plosives", promptIndex: 0, minutes: 5, focus: "plosives" },
      { title: "Because \u2014 soft B", type: "drill", exerciseId: "plosives", promptIndex: 1, minutes: 5, focus: "plosives" },
      { title: "Meeting opener", type: "conversation", exerciseId: "small-talk", scenarioId: "meeting", turns: 2, minutes: 8, focus: "small-talk" },
      { title: "Challenge word", type: "drill", exerciseId: "challenge", promptIndex: 0, minutes: 5, focus: "challenge" }
    ],
    // Wednesday
    [
      { title: "Pace mantra", type: "affirmation", text: "I speak at my own pace. Silence is my friend.", minutes: 3, focus: "acceptance" },
      { title: "Slow phrase 1", type: "drill", exerciseId: "slow-reading", promptIndex: 0, minutes: 6, focus: "pace" },
      { title: "Slow phrase 2", type: "drill", exerciseId: "slow-reading", promptIndex: 1, minutes: 6, focus: "pace" },
      { title: "Onset warm-up", type: "drill", exerciseId: "gentle-onset", promptIndex: 2, minutes: 5, focus: "gentle-onset" },
      { title: "Longer chat", type: "conversation", exerciseId: "small-talk", scenarioId: "daily", turns: 3, minutes: 10, focus: "small-talk" },
      { title: "Progress note", type: "affirmation", text: "Slower speech is stronger speech.", minutes: 3, focus: "reflect" }
    ],
    // Thursday (light)
    [
      { title: "Gentle night", type: "affirmation", text: "I am more than my fluency.", minutes: 3, focus: "acceptance" },
      { title: "Easy breath", type: "breath", text: "Notice belly rise and fall. No scoring.", minutes: 4, focus: "breathing" },
      { title: "One slow line", type: "drill", exerciseId: "slow-reading", promptIndex: 2, minutes: 5, focus: "pace" },
      { title: "Optional chat", type: "conversation", exerciseId: "small-talk", scenarioId: "daily", turns: 1, minutes: 5, focus: "small-talk", optional: true },
      { title: "Self-kindness", type: "affirmation", text: "Showing up is the win.", minutes: 3, focus: "acceptance" },
      { title: "Rest", type: "rest", text: "Stretch jaw and neck. Hydrate. No mic needed.", minutes: 5, focus: "rest" }
    ],
    // Friday
    [
      { title: "Power intention", type: "affirmation", text: "Calm beats force. I choose ease.", minutes: 3, focus: "acceptance" },
      { title: "Presentation chunk", type: "drill", exerciseId: "plosives", promptIndex: 4, minutes: 6, focus: "plosives" },
      { title: "Talking \u2014 light T", type: "drill", exerciseId: "plosives", promptIndex: 2, minutes: 5, focus: "plosives" },
      { title: "Your hardest word", type: "drill", exerciseId: "challenge", promptIndex: 0, minutes: 5, focus: "challenge" },
      { title: "Full chat round", type: "conversation", exerciseId: "small-talk", scenarioId: "daily", turns: 4, minutes: 10, focus: "small-talk" },
      { title: "Friday wins", type: "affirmation", text: "I faced hard sounds today. That counts.", minutes: 3, focus: "reflect" }
    ],
    // Saturday
    [
      { title: "Integration breath", type: "breath", text: "Inhale confidence, exhale tension.", minutes: 4, focus: "breathing" },
      { title: "Read aloud", type: "drill", exerciseId: "slow-reading", promptIndex: 0, minutes: 6, focus: "pace" },
      { title: "Full intro", type: "drill", exerciseId: "baseline", promptIndex: 1, minutes: 5, focus: "introduction" },
      { title: "Meeting scenario", type: "conversation", exerciseId: "small-talk", scenarioId: "meeting", turns: 3, minutes: 8, focus: "small-talk" },
      { title: "All challenge words", type: "drill", exerciseId: "challenge", promptIndex: 0, minutes: 6, focus: "challenge" },
      { title: "Weekend calm", type: "affirmation", text: "Real life is my practice ground.", minutes: 3, focus: "reflect" }
    ],
    // Sunday
    [
      { title: "Week gratitude", type: "affirmation", text: "I completed another week of practice.", minutes: 3, focus: "acceptance" },
      { title: "Weakest sound drill", type: "adaptive", minutes: 6, focus: "review" },
      { title: "Best exercise repeat", type: "adaptive", minutes: 6, focus: "review" },
      { title: "Dual scenario chat", type: "conversation", exerciseId: "small-talk", scenarioId: "daily", turns: 2, minutes: 8, focus: "small-talk" },
      { title: "Sunday evaluation", type: "evaluate", text: "Open Weekly Performance and read your summary.", minutes: 5, focus: "review" },
      { title: "Next week intention", type: "affirmation", text: "Next week I practice with curiosity, not fear.", minutes: 3, focus: "reflect" }
    ]
  ];
  function getDayIndex(date = /* @__PURE__ */ new Date()) {
    const d = date.getDay();
    return d === 0 ? 6 : d - 1;
  }
  function getCurrentSlotIndex(date = /* @__PURE__ */ new Date()) {
    return Math.floor(date.getHours() / SLOT_HOURS);
  }
  function getTodayDateKey(date = /* @__PURE__ */ new Date()) {
    return date.toISOString().slice(0, 10);
  }
  function msUntilNextSlot(date = /* @__PURE__ */ new Date()) {
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
  function formatCountdown(ms) {
    const totalMin = Math.ceil(ms / 6e4);
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
      const avg2 = v.sum / v.n;
      if (avg2 < worstAvg) {
        worstAvg = avg2;
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
      const avg2 = v.sum / v.n;
      if (avg2 > bestAvg) {
        bestAvg = avg2;
        best = id;
      }
    }
    return best;
  }
  function resolveAdaptiveTask(task, history) {
    if (task.type !== "adaptive") return task;
    const weak = weakestExercise(history) || "gentle-onset";
    const strong = strongestExercise(history) || "baseline";
    const exerciseId = task.focus === "review" && task.title.includes("Weakest") ? weak : strong;
    return {
      ...task,
      type: "drill",
      exerciseId,
      promptIndex: 0,
      resolvedFrom: exerciseId
    };
  }
  function adaptTaskForPerformance(baseTask, history) {
    let task = resolveAdaptiveTask(baseTask, history);
    const avg2 = recentAvgScore(history);
    const adaptation = { level: "standard", note: "Standard pulse task." };
    if (avg2 == null) {
      return { task, adaptation };
    }
    if (avg2 < 50) {
      adaptation.level = "easier";
      adaptation.note = `Recent avg ${avg2} \u2014 shortened focus, gentler pace. Retry without pressure.`;
      if (task.type === "conversation" && task.turns > 1) {
        task = { ...task, turns: Math.max(1, task.turns - 1) };
      }
      if (task.type === "drill" && task.exerciseId === "plosives") {
        task = { ...task, exerciseId: "gentle-onset", promptIndex: 0 };
      }
    } else if (avg2 >= 75) {
      adaptation.level = "harder";
      adaptation.note = `Recent avg ${avg2} \u2014 leveling up! Add calm confidence.`;
      if (task.type === "drill" && task.exerciseId === "gentle-onset") {
        task = { ...task, promptIndex: Math.min(4, (task.promptIndex || 0) + 1) };
      }
      if (task.type === "conversation") {
        task = { ...task, turns: (task.turns || 2) + 1 };
      }
    } else {
      adaptation.note = `Recent avg ${avg2} \u2014 steady progress. Keep the same calm pace.`;
    }
    return { task, adaptation };
  }
  function getPulseTask(date, history) {
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
      slotKey: `${getTodayDateKey(date)}-${slotIdx}`
    };
  }
  function runImprovementCheck(pulseState, date, history) {
    const today = getTodayDateKey(date);
    const slotIdx = getCurrentSlotIndex(date);
    const pulse = getPulseTask(date, history);
    if (pulseState.date !== today) {
      return {
        isNewDay: true,
        isNewSlot: true,
        pulse,
        message: `New day \u2014 ${pulse.mission.title}. Fresh tasks all day.`
      };
    }
    const isNewSlot = pulseState.lastSlotIndex !== slotIdx;
    let message = null;
    if (isNewSlot) {
      message = `New 4-hour pulse: ${pulse.slot.label} \u2014 ${pulse.task.title}. ${pulse.adaptation.note}`;
    }
    return { isNewDay: false, isNewSlot, pulse, message };
  }
  function buildImprovementEntry(pulse, score, adaptation) {
    return {
      at: (/* @__PURE__ */ new Date()).toISOString(),
      day: pulse.mission.title,
      slot: pulse.slot.label,
      task: pulse.task.title,
      adaptation: adaptation.note,
      score,
      focus: pulse.task.focus
    };
  }
  function summarizeImprovementLog(log, limit = 8) {
    if (!log.length) return "Complete your first 4-hour pulse to start the improvement log.";
    const recent = log.slice(0, limit);
    const completed = recent.length;
    const avg2 = Math.round(recent.reduce((s, e) => s + (e.score || 0), 0) / completed);
    const adaptations = recent.filter((e) => e.adaptation?.includes("easier") || e.adaptation?.includes("harder")).length;
    return `${completed} recent pulses logged \xB7 avg ${avg2}. ${adaptations} adaptive adjustments applied. Keep the 4-hour rhythm.`;
  }

  // realtime-coach.js
  function normalize(text) {
    return text.toLowerCase().replace(/[^\w\s']/g, "").replace(/\s+/g, " ").trim();
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
  var FILLERS = ["um", "uh", "er", "ah", "like", "you know", "so", "well"];
  function createLiveSession({ targetText = "", mode = "drill" } = {}) {
    return {
      targetText,
      mode,
      startedAt: performance.now(),
      lastSpeechAt: performance.now(),
      lastTipKey: "",
      lastTipAt: 0,
      lastSpokenLen: 0,
      peakScore: 0
    };
  }
  function trackWordProgress(targetText, spokenText) {
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
    if (wpm <= 0) return { label: "Waiting\u2026", tone: "neutral" };
    if (wpm < targetWpm * 0.55) return { label: "Very slow \u2014 that's okay", tone: "good" };
    if (wpm < targetWpm * 0.85) return { label: "Calm pace \u2713", tone: "good" };
    if (wpm <= targetWpm * 1.25) return { label: "Good pace", tone: "good" };
    if (wpm <= targetWpm * 1.6) return { label: "A bit fast \u2014 breathe", tone: "warn" };
    return { label: "Too fast \u2014 slow down", tone: "warn" };
  }
  function pickTip(session, issues, progress, pace, mode) {
    const now = performance.now();
    const tips = [];
    if (issues.silenceSec >= 2.5) {
      tips.push({
        key: "silence",
        tone: "neutral",
        icon: "\u23F8",
        text: "Pause detected \u2014 breathe in slowly. No rush."
      });
    }
    for (const rep of issues.repetitions.slice(0, 1)) {
      tips.push({
        key: `rep-${rep}`,
        tone: "warn",
        icon: "\u{1F501}",
        text: `Repeated "${rep}" \u2014 soft contact, try once more.`
      });
    }
    for (const p of issues.patterns.filter((x) => x.type === "prolongation").slice(0, 1)) {
      tips.push({
        key: `pro-${p.value}`,
        tone: "warn",
        icon: "\u3030",
        text: "Stretch detected \u2014 ease into the sound, don't hold tension."
      });
    }
    const fillers = issues.patterns.filter((x) => x.type === "filler");
    if (fillers.length) {
      tips.push({
        key: `fill-${fillers[0].value}`,
        tone: "warn",
        icon: "\u{1F4AC}",
        text: `Filler "${fillers[0].value}" \u2014 pause silently instead.`
      });
    }
    if (pace.tone === "warn") {
      tips.push({
        key: "pace-fast",
        tone: "warn",
        icon: "\u{1F422}",
        text: "Slow down \u2014 stretch the first sound of each word."
      });
    }
    const current = progress.find((w) => w.status === "current");
    if (current && mode === "drill") {
      tips.push({
        key: `next-${current.word}`,
        tone: "neutral",
        icon: "\u{1F3AF}",
        text: `Next: "${current.word}" \u2014 gentle onset.`
      });
    }
    if (issues.score >= 75 && !tips.some((t) => t.tone === "warn")) {
      tips.push({
        key: "flow-good",
        tone: "good",
        icon: "\u2728",
        text: "Smooth flow \u2014 keep this calm rhythm."
      });
    }
    if (mode === "conversation" && issues.wordCount >= 3 && !tips.some((t) => t.tone === "warn")) {
      tips.push({
        key: "convo-good",
        tone: "good",
        icon: "\u{1F44D}",
        text: "Natural reply \u2014 stay relaxed."
      });
    }
    return tips.slice(0, 3);
  }
  function analyzeLiveUpdate(session, { spokenText, elapsedSec }) {
    const spokenWords = tokenize(spokenText);
    const wordCount = spokenWords.length;
    const now = performance.now();
    if (spokenText.length > session.lastSpokenLen) {
      session.lastSpeechAt = now;
      session.lastSpokenLen = spokenText.length;
    }
    const silenceSec = (now - session.lastSpeechAt) / 1e3;
    const wpm = elapsedSec > 0.5 && wordCount > 0 ? Math.round(wordCount / elapsedSec * 60) : 0;
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
      progressPct = targetWords.length ? Math.round(done / targetWords.length * 100) : 0;
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
      silenceSec
    };
  }
  function shouldSpeakTip(session, tip) {
    const now = performance.now();
    if (tip.key === session.lastTipKey && now - session.lastTipAt < 8e3) return false;
    if (tip.tone === "good" && now - session.lastTipAt < 12e3) return false;
    session.lastTipKey = tip.key;
    session.lastTipAt = now;
    return true;
  }

  // app.js
  var STORAGE_KEY = "stutter-coach-v1";
  var EXERCISES = [
    {
      id: "live-coach",
      title: "Live Coach",
      description: "Real-time voice analysis",
      mode: "live",
      instruction: "Tap the mic and start speaking. The coach analyzes your voice live \u2014 pace, repetitions, fillers, and word progress \u2014 and gives instant tips while you talk.",
      prompts: [
        {
          text: "My name is Kosta. I am practicing calm, clear speech one word at a time.",
          tip: "Watch the live score and word chips \u2014 green means you're on track."
        },
        {
          text: "Today I will speak slowly, breathe between phrases, and stay relaxed.",
          tip: "If pace turns yellow, pause and take one slow breath."
        },
        {
          text: "I can communicate clearly even when I feel tension in my voice.",
          tip: "Live tips appear instantly \u2014 adjust without stopping."
        }
      ]
    },
    {
      id: "small-talk",
      title: "Small Talk",
      description: "Two-way chat + feedback loop",
      mode: "conversation",
      scenarioId: "daily",
      instruction: "Have a real back-and-forth conversation. The coach speaks first, you respond, get feedback, then the coach asks the next question. Repeat each round to build fluency."
    },
    {
      id: "baseline",
      title: "Introduction",
      description: "Name + calm opener",
      instruction: "Speak at your natural pace first. We'll use this as your baseline to compare against later rounds.",
      prompts: [
        {
          text: "My name is Kosta. I am practicing speaking clearly and calmly today.",
          tip: "Let your name flow gently \u2014 ease into the K, don't punch it."
        },
        {
          text: "Hello, my name is Kosta. It's nice to meet you.",
          tip: "Watch the first sound of each sentence \u2014 soft starts help."
        }
      ]
    },
    {
      id: "gentle-onset",
      title: "Gentle Onset",
      description: "Ease into first sounds",
      instruction: "Say each word slowly. Ease into the first sound like a whisper growing into speech \u2014 never punch consonants.",
      prompts: [
        { text: "people", tip: "Soft lips on P \u2014 barely touch before voicing." },
        { text: "morning", tip: "Hum the M first, then open into the word." },
        { text: "speaking", tip: "Gentle S hiss, light P contact." },
        { text: "clearly", tip: "Soft K \u2014 let the word roll out." },
        { text: "calmly", tip: "Easy K onset, relaxed jaw." }
      ]
    },
    {
      id: "slow-reading",
      title: "Slow Reading",
      description: "Half speed, full control",
      instruction: "Read at half your normal speed. Pause briefly at every comma and period. Gentle onsets on every word.",
      prompts: [
        {
          text: "Today, I am learning to speak with calm and control.",
          tip: "Pause at the comma. One phrase at a time."
        },
        {
          text: "I do not need to rush. Each word can come when I am ready.",
          tip: "Stretch the first word of each sentence slightly."
        },
        {
          text: "I am making progress, one sentence at a time.",
          tip: "End confidently \u2014 the last word matters too."
        }
      ]
    },
    {
      id: "plosives",
      title: "Hard Consonants",
      description: "P, B, T, K drills",
      instruction: "These sounds trigger blocks for many people. Use light articulatory contact \u2014 tongue and lips barely touch.",
      prompts: [
        { text: "practice", tip: "Light P \u2014 think 'almost saying it'." },
        { text: "because", tip: "Soft B \u2014 let vibration start before lips part." },
        { text: "talking", tip: "Light T \u2014 tongue tip barely taps." },
        { text: "Kosta", tip: "Easy K \u2014 don't build pressure behind it." },
        { text: "presentation", tip: "Break it: pre \u2014 sen \u2014 ta \u2014 tion." }
      ]
    },
    {
      id: "challenge",
      title: "Your Words",
      description: "Custom challenge list",
      instruction: "Practice the words you added in the sidebar. Add at least one word to use this exercise.",
      prompts: [],
      dynamic: true
    }
  ];
  var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  var CANONICAL_HOST = "127.0.0.1";
  var CANONICAL_PORT = "8787";
  var CANONICAL_URL = `http://${CANONICAL_HOST}:${CANONICAL_PORT}/`;
  var state = {
    exerciseId: "baseline",
    promptIndex: 0,
    challengeWords: ["Kosta"],
    history: [],
    weeklyProgress: {
      weekStart: getWeekStartISO(),
      completedDays: {}
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
      streakBest: 0
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
      roundFinished: false
    },
    settings: {
      speakPrompts: true,
      showInterim: true,
      autoContinue: true,
      realtimeCoach: true,
      speakLiveTips: false
    },
    liveSession: null,
    liveCoachTimer: null
  };
  var $ = (id) => document.getElementById(id);
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
          improvementLog: state.pulseProgress.improvementLog.slice(0, 40)
        }
      })
    );
  }
  function normalize2(text) {
    return text.toLowerCase().replace(/[^\w\s']/g, "").replace(/\s+/g, " ").trim();
  }
  function tokenize2(text) {
    return normalize2(text).split(" ").filter(Boolean);
  }
  function levenshtein2(a, b) {
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
      const idx = spoken.findIndex((w) => w === word || levenshtein2(w, word) <= 1);
      if (idx !== -1) {
        matches++;
        spoken.splice(idx, 1);
      }
    }
    return matches / targetWords.length;
  }
  function detectRepetitions2(words) {
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
    const targetWords = tokenize2(targetText);
    const spokenWords = tokenize2(spokenText);
    const accuracy = wordAccuracy(targetWords, spokenWords);
    const repetitions = detectRepetitions2(spokenWords);
    const patterns = detectStutterPatterns(spokenText);
    const missing = targetWords.filter(
      (w) => !spokenWords.some((s) => s === w || levenshtein2(s, w) <= 1)
    );
    const extra = spokenWords.filter(
      (w) => !targetWords.some((t) => t === w || levenshtein2(t, w) <= 1)
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
        icon: "\u2705",
        text: "Strong round \u2014 your words matched the target well. Keep this pace."
      });
    } else if (score >= 60) {
      feedback.push({
        tone: "warn",
        icon: "\u{1F7E1}",
        text: "Good effort. Slow down slightly and ease into the first sound of each word."
      });
    } else {
      feedback.push({
        tone: "warn",
        icon: "\u{1F534}",
        text: "Tough round \u2014 that's normal. Try again at half speed with gentle onsets."
      });
    }
    if (repetitions.length) {
      feedback.push({
        tone: "warn",
        icon: "\u{1F501}",
        text: `Repeated word detected: "${repetitions.join('", "')}". Pause one beat, then say it once with a soft start.`
      });
    }
    for (const p of patterns.filter((x) => x.type === "prolongation")) {
      feedback.push({
        tone: "warn",
        icon: "\u3030\uFE0F",
        text: `Prolonged sound "${p.value}" \u2014 release tension in your jaw and lips.`
      });
    }
    const fillerHits = patterns.filter((p) => p.type === "filler");
    if (fillerHits.length) {
      feedback.push({
        tone: "tip",
        icon: "\u{1F4A8}",
        text: "Fillers detected. Take a breath before starting \u2014 silence is fine."
      });
    }
    if (missing.length) {
      feedback.push({
        tone: "tip",
        icon: "\u{1F4DD}",
        text: `Missing or unclear: "${missing.slice(0, 4).join('", "')}". Break the phrase into smaller chunks.`
      });
    }
    if (extra.length > 2) {
      feedback.push({
        tone: "tip",
        icon: "\u2795",
        text: "Extra words detected \u2014 focus on matching the prompt exactly."
      });
    }
    if (durationSec > targetWords.length * 4) {
      feedback.push({
        tone: "tip",
        icon: "\u23F1\uFE0F",
        text: "You took a while \u2014 that's okay. Blocks cost time. Gentle onsets will speed you up over practice."
      });
    }
    if (!feedback.some((f) => f.tone === "warn") && score >= 70) {
      feedback.push({
        tone: "good",
        icon: "\u{1F4AA}",
        text: "No major disfluency patterns detected. Move to the next prompt or try a harder exercise."
      });
    }
    feedback.push({
      tone: "tip",
      icon: "\u{1FA9E}",
      text: "Hrithik Roshan's daily habit: mirror practice + recording. Try reading the prompt to yourself once before tapping the mic."
    });
    return {
      score,
      accuracy,
      repetitions,
      patterns,
      missing,
      extra,
      durationSec,
      feedback
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
    const prompt = state.pulseProgress.activeTask?.text && state.pulseProgress.activePulseKey ? { text: state.pulseProgress.activeTask.text } : currentPrompt();
    return prompt?.text || "";
  }
  function getLiveSpokenText() {
    return `${state.finalTranscript || ""} ${state.interimTranscript || ""}`.trim();
  }
  function getSpeechElapsedSec() {
    if (!state.speechStart) return 0;
    return (performance.now() - state.speechStart) / 1e3;
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
    const pacePct = Math.min(100, Math.max(8, update.wpm / 140 * 100));
    $("livePaceBar").style.width = `${pacePct}%`;
    $("livePaceLabel").textContent = update.pace.label;
    const statusLabels = {
      listening: "Analyzing your speech in real time\u2026",
      waiting: "Listening\u2026 start whenever you're ready.",
      paused: "Pause detected \u2014 breathe, then continue.",
      flowing: "Smooth flow \u2014 keep this calm pace.",
      coaching: "Coach spotted something \u2014 check the tips below."
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
      elapsedSec: getSpeechElapsedSec()
    });
    renderLiveCoach(update);
    maybeSpeakLiveTip(update);
    if (update.status === "flowing") {
      $("micStatus").textContent = "Great flow \u2014 tap mic when finished.";
    } else if (update.status === "coaching") {
      $("micStatus").textContent = "Live coaching active \u2014 adjust and keep going.";
    }
  }
  function startLiveCoachLoop() {
    stopLiveCoachLoop();
    if (!isLiveCoachEnabled()) return;
    const mode = isConversationMode() && state.conversation.active ? "conversation" : "drill";
    state.liveSession = createLiveSession({
      targetText: mode === "drill" ? getLiveTargetText() : "",
      mode
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
    if (select.options.length === Object.keys(CONVERSATION_SCENARIOS).length && select.value === current) {
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
      const ready = state.conversation.active && !state.conversation.processing && !state.listening;
      $("micBtn").disabled = !ready;
      $("micStatus").textContent = !state.conversation.active ? "Tap Start round \u2014 the coach speaks first." : state.conversation.processing ? "Coach is speaking\u2026" : "Your turn \u2014 tap the mic and respond.";
      return;
    }
    $("micBtn").disabled = false;
    $("micStatus").textContent = "Ready \u2014 tap the mic and speak the prompt.";
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
    $("quickStartText").textContent = isLiveCoachMode() ? "Tap the mic \u2192 speak \u2192 watch live score, word progress, and instant tips." : convo ? "Tap Start round \u2192 coach speaks \u2192 tap mic \u2192 respond \u2192 get feedback." : isLiveCoachEnabled() ? "Tap the mic \u2192 speak \u2192 live coach analyzes you in real time." : "Pick an exercise \u2192 tap the green mic \u2192 speak \u2192 tap again for feedback.";
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
    setConversationStatus("Coach is speaking\u2026");
    updateMicState();
    await speakTextAsync(text);
    setConversationStatus("Your turn \u2014 tap the mic and respond.");
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
      `\u2014 Round ${roundNum} started: ${scenario.description} (${getMaxTurnsForRound(round)} turns) \u2014`
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
    const avg2 = state.conversation.roundScores.length ? Math.round(
      state.conversation.roundScores.reduce((a, b) => a + b, 0) / state.conversation.roundScores.length
    ) : 0;
    state.conversation.processing = true;
    renderPrompt();
    appendChat("feedback", `Round summary: ${summary}`);
    await speakTextAsync(summary);
    recordSession(
      `Small talk round ${state.conversation.round + 1}`,
      `${state.conversation.roundScores.length} turns`,
      avg2,
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
    setConversationStatus(`Round done. Next up: "${preview.slice(0, 72)}${preview.length > 72 ? "\u2026" : ""}"`);
    renderPrompt();
  }
  async function handleConversationResponse(spoken, durationSec) {
    const turn = currentConversationTurn();
    if (!turn) return;
    const analysis = analyzeConversationTurn(spoken, durationSec, turn);
    appendChat("user", spoken);
    appendChat(
      "feedback",
      analysis.feedback.slice(0, 3).map((f) => `${f.icon} ${f.text}`).join(" "),
      `Score <span class="chat-bubble__score">${analysis.score}</span>`
    );
    showFeedback(analysis, turn.sample, spoken);
    $("feedbackTitle").textContent = analysis.score >= 75 ? "Great reply!" : analysis.score >= 50 ? "Keep going" : "Try once more";
    state.pendingAnalysis = { analysis, prompt: { text: turn.sample }, spoken, conversation: true };
    updateMicState();
    const shouldRetry = analysis.score < 50 && state.conversation.retries < 1;
    if (shouldRetry) {
      state.conversation.retries += 1;
      setConversationStatus("Let's smooth that out \u2014 retry this turn.");
      state.conversation.processing = true;
      renderPrompt();
      await speakTextAsync(turn.retryCoach);
      state.conversation.processing = false;
      $("micBtn").classList.add("is-waiting");
      renderPrompt();
      return;
    }
    if (state.settings.autoContinue) {
      setConversationStatus("Continuing in a moment\u2026");
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
        tip: `Ease into the first sound of "${word}". Say it once, slowly.`
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
      li.innerHTML = `${word} <button type="button" aria-label="Remove ${word}">\xD7</button>`;
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
      const previewRound = state.conversation.roundFinished ? getRound(getScenario(), nextRoundIndex()) : round;
      const previewTurn = state.conversation.active ? currentConversationTurn() : previewRound.turns[0];
      $("promptCounter").textContent = state.conversation.active ? `Turn ${Math.min(current, total)} of ${total} \xB7 Round ${state.conversation.round + 1}` : state.conversation.roundFinished ? `Round ${nextRoundIndex() + 1} ready` : `Round ${state.conversation.round + 1} ready`;
      $("targetText").textContent = previewTurn?.coach || "Tap Start round \u2014 coach speaks first.";
      $("targetTip").textContent = state.conversation.active ? "Respond naturally. Short answers are fine." : "Two-way practice: coach asks \u2192 you answer \u2192 feedback \u2192 next question.";
      updateMicState();
      return;
    }
    const prompts = getPrompts(exercise);
    if (exercise.dynamic && !prompts.length) {
      $("exerciseTitle").textContent = exercise.title;
      $("exerciseLabel").textContent = "Exercise";
      $("exerciseInstruction").textContent = "Add at least one challenge word in the sidebar to start.";
      $("targetText").textContent = "\u2014";
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
    const offset = circumference - score / 100 * circumference;
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
      const liveNote = analysis.livePeakScore != null ? ` \xB7 Live peak ${analysis.livePeakScore}` : "";
      $("feedbackSummary").textContent = `Word match: ${pct}% \xB7 Duration: ${analysis.durationSec.toFixed(1)}s${liveNote}`;
    } else {
      const liveNote = analysis.livePeakScore != null ? ` \xB7 Live peak ${analysis.livePeakScore}` : "";
      $("feedbackSummary").textContent = `${analysis.wordCount} words \xB7 ${analysis.durationSec.toFixed(1)}s \xB7 ${analysis.fillerCount} fillers${liveNote}`;
    }
    if (isConversationMode()) {
      $("feedbackTitle").textContent = analysis.score >= 75 ? "Great reply!" : analysis.score >= 50 ? "Keep going" : "Try once more";
    } else {
      $("feedbackTitle").textContent = analysis.score >= 80 ? "Great work!" : analysis.score >= 55 ? "Keep going" : "Try again";
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
    $("weekRangeLabel").textContent = `${weekStart.toLocaleDateString(void 0, { month: "short", day: "numeric" })} \u2013 ${end.toLocaleDateString(void 0, { month: "short", day: "numeric" })}`;
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
          <span class="week-day__meta">${day.type === "rest" ? "Light \xB7 " : ""}${day.focus}</span>
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
    $("todayPlanTitle").textContent = `Day ${plan.day} \u2014 ${plan.title}`;
    $("todayPlanFocus").textContent = plan.focus;
    $("todayPlanBadge").textContent = plan.type === "rest" ? "Light \xB7 30 min" : "30 min";
    const schedule = $("todayScheduleList");
    schedule.innerHTML = "";
    for (const block of plan.blocks) {
      const li = document.createElement("li");
      li.className = "schedule-item";
      li.innerHTML = `
      <span class="schedule-item__time">${block.start}\u2013${block.end} min</span>
      <div class="schedule-item__body">
        <strong>${block.activity}</strong>
        <p>${block.detail}</p>
      </div>
    `;
      schedule.appendChild(li);
    }
    const exNames = plan.exercises.map(exerciseTitle).join(" \u2192 ");
    $("todayPlanExercises").textContent = `App path: ${exNames}`;
  }
  var pulseCountdownTimer = null;
  function renderPulseUI() {
    const now = /* @__PURE__ */ new Date();
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
    $("dailyMissionSlot").textContent = `${pulse.slot.emoji} ${pulse.slot.label} \xB7 ${pulse.task.title} (~${pulse.task.minutes} min)`;
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
    $("startPulseBtn").textContent = done ? "Redo this pulse" : `Do this pulse (~${pulse.task.minutes} min)`;
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
    const cursor = /* @__PURE__ */ new Date();
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
    el.textContent = `\u{1F525} Streak: ${streakCurrent} day${streakCurrent === 1 ? "" : "s"} \xB7 best ${streakBest}`;
  }
  async function loadAppMeta() {
    try {
      const res = await fetch("/version.json");
      if (!res.ok) return;
      const data = await res.json();
      $("appVersionLabel").textContent = `v${data.version} \xB7 cycle ${data.iteration || 0}`;
      if (data.lastCycleAt) {
        const when = new Date(data.lastCycleAt).toLocaleString();
        $("cycleStatusLabel").textContent = `Last auto-check: ${when} (${data.lastCycleStatus || "\u2014"})`;
      } else {
        $("cycleStatusLabel").textContent = "Auto-check every 4 hours";
      }
    } catch {
      $("appVersionLabel").textContent = "v1.6.0";
    }
  }
  function updatePulseCountdown() {
    const ms = msUntilNextSlot();
    $("pulseCountdown").textContent = `Next pulse in ${formatCountdown(ms)} \xB7 Iteration ${state.pulseProgress.iteration}`;
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
    }, 6e4);
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
      const time = new Date(entry.at).toLocaleString(void 0, {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit"
      });
      li.innerHTML = `<strong>${entry.slot}</strong> \xB7 ${entry.task} \u2014 score ${entry.score ?? "\u2014"} <span class="chat-bubble__meta">${time}</span>`;
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
      $("exerciseInstruction").textContent = `${pulse.mission.title} \xB7 ${pulse.slot.label} \u2014 ${task.title}`;
      $("targetText").textContent = task.text;
      $("targetTip").textContent = task.type === "evaluate" ? "Scroll to Weekly Performance after speaking." : "Speak slowly. No scoring pressure.";
      $("promptCounter").textContent = `${pulse.slot.label} \xB7 ~${task.minutes} min`;
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
      $("exerciseInstruction").textContent = `${pulse.mission.title} \xB7 ${pulse.slot.label} \u2014 ${task.turns} turns`;
      $("targetTip").textContent = pulse.adaptation.note;
      $("promptCounter").textContent = `${pulse.slot.label} \xB7 ~${task.minutes} min`;
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
      $("exerciseInstruction").textContent = `${pulse.mission.title} \xB7 ${pulse.slot.label} \u2014 ${task.title}`;
      $("targetTip").textContent = pulse.adaptation.note;
      $("promptCounter").textContent = `${pulse.slot.label} \xB7 ~${task.minutes} min`;
      updateMicState();
    }
  }
  function completeActivePulse(score) {
    if (!state.pulseProgress.activePulseKey) return;
    const now = /* @__PURE__ */ new Date();
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
      const height = d.sessions ? Math.max(8, d.score / maxScore * 100) : 4;
      const tier = d.score >= 80 ? "good" : d.score >= 55 ? "mid" : d.sessions ? "low" : "empty";
      col.innerHTML = `
      <div class="chart-col__bar-wrap">
        <div class="chart-col__bar chart-col__bar--${tier}" style="height:${height}%"></div>
      </div>
      <span class="chart-col__score">${d.sessions ? d.score : "\u2014"}</span>
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
      const y = padding.top + plotH - (d.tension || 0) / 10 * plotH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    chartData.forEach((d, i) => {
      if (!d.tension) return;
      const x = padding.left + i * step;
      const y = padding.top + plotH - d.tension / 10 * plotH;
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
    $("perfWeekLabel").textContent = `${start.toLocaleDateString(void 0, { month: "short", day: "numeric" })} \u2013 ${end.toLocaleDateString(void 0, { month: "short", day: "numeric" })}`;
    $("perfSessions").textContent = String(eval_.totalSessions);
    $("perfAvgScore").textContent = eval_.avgScore != null ? String(eval_.avgScore) : "\u2014";
    $("perfAvgTension").textContent = eval_.avgTension != null ? `${eval_.avgTension}/10` : "\u2014";
    $("perfDaysChecked").textContent = `${eval_.checkedCount}/7`;
    const highlights = $("perfHighlights");
    highlights.innerHTML = "";
    if (eval_.tensionTrend != null) {
      const trendEl = document.createElement("p");
      trendEl.className = "perf-trend";
      const arrow = eval_.tensionTrend < -0.3 ? "\u2193 easing" : eval_.tensionTrend > 0.3 ? "\u2191 rising" : "\u2192 steady";
      trendEl.textContent = `Tension trend: ${arrow} (${eval_.tensionTrend > 0 ? "+" : ""}${eval_.tensionTrend} vs early week)`;
      highlights.appendChild(trendEl);
    }
    if (eval_.bestDay) {
      const best = document.createElement("p");
      best.className = "perf-highlight perf-highlight--good";
      best.textContent = `Best day: Day ${eval_.bestDay.day} (${eval_.bestDay.label}) \u2014 avg ${eval_.bestDay.avgScore}`;
      highlights.appendChild(best);
    }
    if (eval_.worstDay && eval_.worstDay.day !== eval_.bestDay?.day) {
      const worst = document.createElement("p");
      worst.className = "perf-highlight perf-highlight--warn";
      worst.textContent = `Toughest day: Day ${eval_.worstDay.day} (${eval_.worstDay.label}) \u2014 avg ${eval_.worstDay.avgScore}`;
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
      at: (/* @__PURE__ */ new Date()).toISOString()
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
      const time = new Date(item.at).toLocaleString(void 0, {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit"
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
      $("avgScore").textContent = "\u2014";
      return;
    }
    const avg2 = Math.round(
      state.history.reduce((sum, h) => sum + h.score, 0) / state.history.length
    );
    $("avgScore").textContent = String(avg2);
  }
  function startTimer() {
    state.speechStart = performance.now();
    $("speechTimer").textContent = "0.0s";
    clearInterval(state.timerInterval);
    state.timerInterval = setInterval(() => {
      const elapsed = (performance.now() - state.speechStart) / 1e3;
      $("speechTimer").textContent = `${elapsed.toFixed(1)}s`;
    }, 100);
  }
  function stopTimer() {
    clearInterval(state.timerInterval);
    if (!state.speechStart) return 0;
    return (performance.now() - state.speechStart) / 1e3;
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
          reason: "Microphone permission denied. In Chrome: click the lock icon in the address bar \u2192 Site settings \u2192 Allow microphone."
        };
      }
      if (name === "NotFoundError") {
        return { ok: false, reason: "No microphone found. Plug in or enable your mic in System Settings \u2192 Sound \u2192 Input." };
      }
      return { ok: false, reason: `Microphone error: ${name}` };
    }
  }
  async function runPreflight() {
    $("canonicalUrl").textContent = CANONICAL_URL;
    if (location.protocol === "file:") {
      setSetupBanner(
        "error",
        "Opened as a file \u2014 voice will not work",
        `Do not open index.html directly. Run ./start.sh then use ${CANONICAL_URL}`,
        { showUrl: true }
      );
      $("micBtn").disabled = true;
      $("micStatus").textContent = "Voice disabled on file:// \u2014 use the local server URL.";
      return false;
    }
    if (!window.isSecureContext) {
      setSetupBanner(
        "error",
        "Insecure page \u2014 voice blocked",
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
        "Chrome sends audio to Google's speech service \u2014 an internet connection is required for transcription.",
        { showUrl: false }
      );
    }
    const mic = await ensureMicrophoneAccess();
    if (!mic.ok) {
      setSetupBanner("error", "Microphone not allowed", mic.reason, { showMic: true, showUrl: false });
      $("micBtn").disabled = true;
      $("micStatus").textContent = "Tap \u201CAllow microphone\u201D above, then try again.";
      return false;
    }
    state.micReady = true;
    if (location.hostname === CANONICAL_HOST && location.port === CANONICAL_PORT) {
      setSetupBanner(
        "ok",
        "Ready \u2014 tap the mic to practice",
        isConversationMode() ? "Tap Start round first. The coach speaks, then you respond." : "Tap the green mic, speak the prompt, tap again for feedback.",
        { showUrl: false }
      );
      setTimeout(hideSetupBanner, 6e3);
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
      $("micStatus").textContent = "Speech recognition not supported. Use Chrome or Edge at http://127.0.0.1:8787";
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
      $("micBtn").querySelector(".mic-btn__label").textContent = isConversationMode() ? "Listening\u2026 tap when done" : "Listening\u2026";
      $("micStatus").textContent = isLiveCoachEnabled() ? "Live coach active \u2014 speak naturally." : isConversationMode() ? "Respond naturally. Tap again when finished." : "Speak now. Tap again when finished.";
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
      $("finalText").textContent = final.trim() || "\u2026";
      updateLiveCoach();
    };
    recognition.onerror = (event) => {
      if (event.error === "no-speech") {
        $("micStatus").textContent = "No speech heard \u2014 tap the mic and try again.";
      } else if (event.error === "not-allowed") {
        $("micStatus").textContent = "Microphone blocked. In Chrome: lock icon \u2192 Site settings \u2192 Microphone \u2192 Allow.";
        setSetupBanner(
          "error",
          "Microphone blocked",
          "Chrome denied access. Reset permission for this site and tap \u201CAllow microphone\u201D again.",
          { showMic: true }
        );
      } else if (event.error === "network") {
        $("micStatus").textContent = "Network error \u2014 Chrome speech needs internet. Check your connection and retry.";
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
      $("micStatus").textContent = "Mic already active \u2014 tap again to finish.";
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
    const prompt = state.pulseProgress.activeTask?.text && state.pulseProgress.activePulseKey ? { text: state.pulseProgress.activeTask.text, tip: state.pulseProgress.activeTask.tip || "" } : currentPrompt();
    const analysis = analyzeSpeech(prompt.text, spoken, duration);
    if (state.liveSession?.peakScore) {
      analysis.livePeakScore = state.liveSession.peakScore;
    }
    showFeedback(analysis, prompt.text, spoken);
    $("micStatus").textContent = "Feedback ready \u2014 try again or move to next prompt.";
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
        setConversationStatus("Retry this turn \u2014 tap the mic when ready.");
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
          isConversationMode() ? "Select Small Talk, tap Start round, then respond when the coach finishes." : "Tap the green mic, speak the prompt, then tap again for feedback.",
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
      const pulse = getPulseTask(/* @__PURE__ */ new Date(), state.history);
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
})();
