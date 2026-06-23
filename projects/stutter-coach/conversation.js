export const CONVERSATION_SCENARIOS = {
  daily: {
    title: "Daily Chat",
    description: "Casual small talk — café, weather, weekend",
    rounds: [
      {
        turns: [
          {
            coach: "Hi Kosta! I'm your speech coach. Let's warm up with easy small talk. How are you doing today?",
            sample: "I'm doing well, thank you. How about you?",
            tip: "Short answer is fine. Ease into the first word — don't rush.",
            retryCoach:
              "No rush. Take a breath, then tell me how you're doing — even 'I'm okay' works.",
            acks: {
              good: "I love that energy. You sounded clear and calm.",
              okay: "Good — steady and natural. That's exactly what we want.",
              low: "You got the words out. Let's smooth the start — breathe, then try once more.",
            },
          },
          {
            coach: "Nice. What did you have for breakfast this morning?",
            sample: "I had coffee and toast this morning.",
            tip: "Pause after 'I had' — then name one thing.",
            retryCoach: "Just one food or drink is enough. Slow and easy.",
            acks: {
              good: "Fluent answer. You're staying relaxed.",
              okay: "Clear enough to keep going. Nice work.",
              low: "Remember: gentle onset on the first sound of each word.",
            },
          },
          {
            coach: "Sounds good. What's one thing you're looking forward to this week?",
            sample: "I'm looking forward to practicing my speech this week.",
            tip: "Break it up: 'I'm looking forward to' — pause — 'one thing'.",
            retryCoach: "Share anything — a plan, a person, or just 'relaxing'.",
            acks: {
              good: "That flowed really well. Great control.",
              okay: "You communicated clearly. Keep that pace.",
              low: "Long sentences are hard. Shrink it: 'I'm looking forward to the weekend.'",
            },
          },
          {
            coach: "I hear you. Do you prefer mornings or evenings?",
            sample: "I prefer evenings because I feel more relaxed.",
            tip: "Pick one: 'Mornings' or 'Evenings' — then add one short reason.",
            retryCoach: "One word plus one reason. Example: 'Evenings, because I'm tired in the morning.'",
            acks: {
              good: "Smooth preference answer. Well done.",
              okay: "Good conversational reply.",
              low: "Try just 'Mornings' or 'Evenings' first, then expand.",
            },
          },
          {
            coach: "Last one for this round — what hobby helps you unwind?",
            sample: "Reading helps me unwind after a long day.",
            tip: "Soft H in 'helps' — don't push the air.",
            retryCoach: "Any hobby counts: walking, music, games, cooking.",
            acks: {
              good: "Strong finish to the round!",
              okay: "Solid answer. Round complete.",
              low: "You finished the round — that's a win. We'll build from here.",
            },
          },
        ],
      },
      {
        turns: [
          {
            coach: "Round two — a little longer. Tell me about your favorite place to relax.",
            sample: "My favorite place to relax is a quiet park near my home.",
            tip: "Start with 'My favorite place' — stretch it slightly.",
            retryCoach: "Name any place: home, a café, a park, your room.",
            acks: {
              good: "Beautiful fluency on a longer answer.",
              okay: "Good detail. You're handling longer turns.",
              low: "Chunk it: place name first, then why you like it.",
            },
          },
          {
            coach: "What would you tell a friend who feels nervous about speaking?",
            sample: "I would tell them to breathe and take their time.",
            tip: "Gentle W in 'would' — lips barely touch.",
            retryCoach: "One sentence of advice is enough.",
            acks: {
              good: "Wise and fluent — excellent.",
              okay: "Clear advice. Nice empathy.",
              low: "Short version: 'Breathe and go slow.'",
            },
          },
          {
            coach: "If you could learn one new skill this year, what would it be?",
            sample: "I would like to learn public speaking this year.",
            tip: "Watch the P in 'public' — light lip contact.",
            retryCoach: "Name any skill — cooking, coding, a language.",
            acks: {
              good: "You handled a tough P sound well.",
              okay: "Good ambition. Clear delivery.",
              low: "Try: 'I'd learn guitar' — keep it short.",
            },
          },
          {
            coach: "What's something small that made you smile recently?",
            sample: "A message from a friend made me smile recently.",
            tip: "Soft S in 'smile' and 'recently'.",
            retryCoach: "Anything tiny counts — a joke, sunshine, good food.",
            acks: {
              good: "Warm answer, smoothly delivered.",
              okay: "Nice personal touch.",
              low: "One short phrase is fine: 'Good coffee yesterday.'",
            },
          },
          {
            coach: "Great round. Before we wrap — say one thing you're proud of about your speech progress.",
            sample: "I'm proud that I practice speaking every day.",
            tip: "Own it slowly: 'I'm proud that I…'",
            retryCoach: "Even 'I'm proud I tried today' counts.",
            acks: {
              good: "Powerful close. You should be proud.",
              okay: "Honest and clear. Round two complete.",
              low: "Showing up to practice is already progress.",
            },
          },
        ],
      },
    ],
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
            tip: "Name first — gentle K — then pause — then your role.",
            retryCoach: "Try: 'My name is Kosta.' Then add one more sentence.",
            acks: {
              good: "Professional and clear intro.",
              okay: "Good meeting opener.",
              low: "Just your name is a fine start.",
            },
          },
          {
            coach: "How would you describe your main strength in one sentence?",
            sample: "My main strength is staying calm under pressure.",
            tip: "Light M on 'main' and 'my'.",
            retryCoach: "One trait: patient, focused, creative, helpful.",
            acks: {
              good: "Confident delivery.",
              okay: "That works in a real meeting.",
              low: "Shrink to: 'I'm a good listener.'",
            },
          },
          {
            coach: "Someone asks what you're working on. Give a one-sentence update.",
            sample: "I'm working on improving my communication skills.",
            tip: "Easy start: 'I'm working on' — then one project.",
            retryCoach: "Any project or goal you have in mind.",
            acks: {
              good: "Crisp project update.",
              okay: "Clear and professional.",
              low: "Try: 'I'm working on a personal project.'",
            },
          },
        ],
      },
      {
        turns: [
          {
            coach: "Round two — introduce yourself to a new teammate in two sentences.",
            sample: "Hi, I'm Kosta. I joined the team last month and I'm excited to collaborate.",
            tip: "Sentence one: name. Pause. Sentence two: one detail.",
            retryCoach: "Try: 'Hi, I'm Kosta.' Then add one fact about your role.",
            acks: {
              good: "Polished intro — you'd sound great in a real meeting.",
              okay: "Clear and professional. Nice work.",
              low: "Short is fine: name plus one sentence.",
            },
          },
          {
            coach: "Someone asks how your week is going. Give a brief, positive update.",
            sample: "My week is going well. I'm making steady progress on my goals.",
            tip: "Lead with 'My week is going…' — keep it under ten words.",
            retryCoach: "Even 'Busy but good' works.",
            acks: {
              good: "Natural weekly check-in.",
              okay: "That fits a stand-up or hallway chat.",
              low: "One phrase is enough: 'Pretty good, thanks.'",
            },
          },
          {
            coach: "Close with one sentence on what you'd like help with this week.",
            sample: "I'd like help prioritizing my tasks this week.",
            tip: "Start with 'I'd like help with…' — direct and calm.",
            retryCoach: "Ask for one small thing: feedback, clarity, or time.",
            acks: {
              good: "Strong, assertive close.",
              okay: "Good meeting closer.",
              low: "Try: 'Could we sync for five minutes?'",
            },
          },
        ],
      },
    ],
  },
};

export function analyzeConversationTurn(spokenText, durationSec, turn) {
  const spoken = spokenText.trim();
  const words = spoken
    .toLowerCase()
    .replace(/[^\w\s']/g, "")
    .split(/\s+/)
    .filter(Boolean);

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

  const sampleWords = turn.sample
    .toLowerCase()
    .replace(/[^\w\s']/g, "")
    .split(/\s+/)
    .filter(Boolean);
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
      icon: "✅",
      text: "Smooth conversational flow. Natural pace and good length.",
    });
  } else if (tier === "okay") {
    feedback.push({
      tone: "warn",
      icon: "🟡",
      text: "Understandable reply. Slow the first word of your next sentence.",
    });
  } else {
    feedback.push({
      tone: "warn",
      icon: "🔴",
      text: "Tough moment — normal in practice. Breathe, shorten your answer, try again.",
    });
  }

  if (repetitions.length) {
    feedback.push({
      tone: "warn",
      icon: "🔁",
      text: `Repeated "${[...new Set(repetitions)].join(", ")}" — pause one beat, say it once.`,
    });
  }
  if (fillerCount > 1) {
    feedback.push({
      tone: "tip",
      icon: "💨",
      text: `${fillerCount} fillers detected. Silent pause beats "um".`,
    });
  }
  if (words.length < 3) {
    feedback.push({
      tone: "tip",
      icon: "📏",
      text: "Try a slightly longer answer — at least 3–5 words.",
    });
  }
  if (turn.tip) {
    feedback.push({ tone: "tip", icon: "💡", text: turn.tip });
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
    feedback,
  };
}

export function buildCoachReply(turn, spoken, analysis) {
  const ack = turn.acks[analysis.tier] || turn.acks.okay;
  return ack;
}

export function getRound(scenario, roundIndex) {
  if (!scenario?.rounds?.length) return { turns: [] };
  const idx = ((roundIndex % scenario.rounds.length) + scenario.rounds.length) % scenario.rounds.length;
  return scenario.rounds[idx];
}

export function getRoundCount(scenario) {
  return scenario?.rounds?.length || 0;
}

export function buildRoundSummary(scores) {
  if (!scores.length) return "Let's keep practicing together.";
  const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  const best = Math.max(...scores);
  if (avg >= 75) {
    return `Round complete! Average score ${avg}, peak ${best}. You're ready for a harder round — same calm pace.`;
  }
  if (avg >= 55) {
    return `Round complete. Average ${avg}. Solid progress — let's do another round to build consistency.`;
  }
  return `Round complete. Average ${avg}. Every round trains your brain — let's go again with shorter answers.`;
}
