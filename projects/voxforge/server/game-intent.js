const VALID_TYPES = new Set([
  "platformer",
  "shooter",
  "snake",
  "dodge",
  "collector",
  "pong",
  "racer",
  "flappy",
  "archery",
  "arcade",
]);

const TYPE_PATTERNS = {
  snake: {
    positive: [/\bsnake\b/, /\bworm\b/, /\bslither\b/],
    weight: 3,
  },
  pong: {
    positive: [/\bpong\b/, /\bpaddle\b/, /\bbreakout\b/, /\bbrick\b/],
    weight: 3,
  },
  flappy: {
    positive: [
      /\bflappy\b/,
      /\bbird\b/,
      /\bfly(?:ing)?\b/,
      /\bwing\b/,
      /\baero\b/,
      /\bairplane\b/,
      /\bplane\b/,
      /\bsky\b/,
      /\bsoar\b/,
      /\bfloat\b/,
    ],
    negative: [/\bshoot\b/, /\blaser\b/, /\bspace invader\b/],
    weight: 3,
  },
  archery: {
    positive: [
      /\barrows?\b/,
      /\bbow\b/,
      /\barchery\b/,
      /\btargets?\b/,
      /\baim\b/,
      /\bquiver\b/,
      /\bbullseye\b/,
      /\bshoot(?:ing)?\s+arrows?\b/,
    ],
    negative: [/\bspace\b/, /\blaser\b/, /\benemies\b/],
    weight: 3,
  },
  shooter: {
    positive: [
      /\bshoot(?:er|ing)?\b/,
      /\bbullet\b/,
      /\blaser\b/,
      /\bspace invader\b/,
      /\benemies\b/,
      /\bzombie\b/,
      /\bgun\b/,
      /\bblast\b/,
      /\bwar\b/,
      /\bfighter\b/,
    ],
    negative: [/\barrows?\b/, /\bbow\b/, /\barchery\b/, /\btargets?\b/],
    weight: 2,
  },
  platformer: {
    positive: [
      /\bjump(?:ing)?\b/,
      /\bplatform(?:er)?\b/,
      /\bmario\b/,
      /\bhop(?:ping)?\b/,
      /\brun(?:ner|ning)?\b/,
      /\blevel\b/,
      /\bsuper\b/,
      /\bclimb\b/,
    ],
    weight: 2,
  },
  dodge: {
    positive: [/\bdodge\b/, /\bavoid\b/, /\bfall(?:ing)?\b/, /\basteroid\b/, /\bobstacle\b/],
    weight: 2,
  },
  collector: {
    positive: [
      /\bcollect(?:or|ing)?\b/,
      /\bcoin\b/,
      /\bgem\b/,
      /\bgather\b/,
      /\bpickup\b/,
      /\btreasure\b/,
      /\bfruit\b/,
    ],
    weight: 2,
  },
  racer: {
    positive: [/\brace(?:r|racing)?\b/, /\bcar\b/, /\bdrive\b/, /\broad\b/, /\btraffic\b/],
    weight: 2,
  },
  kid_platformer: {
    positive: [
      /\b(kid|child|children|baby|toddler)\b/,
      /\blittle (?:kid|boy|girl|one)\b/,
      /\bfor (?:a )?(?:kid|child|children)\b/,
    ],
    weight: 4,
    mapsTo: "platformer",
  },
};

export function scoreGameTypes(message) {
  const m = message.toLowerCase();
  const scores = {};

  for (const [type, { positive, negative = [], weight, mapsTo }] of Object.entries(TYPE_PATTERNS)) {
    let score = 0;
    for (const re of positive) {
      if (re.test(m)) score += weight;
    }
    for (const re of negative) {
      if (re.test(m)) score -= weight;
    }
    if (score > 0) scores[mapsTo || type] = (scores[mapsTo || type] || 0) + score;
  }

  const ranked = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const top = ranked[0];
  return {
    type: top?.[0] ?? "arcade",
    topScore: top?.[1] ?? 0,
    scores,
  };
}

export function detectGameType(message) {
  return scoreGameTypes(message).type;
}

function normalizeType(raw) {
  const t = String(raw || "")
    .toLowerCase()
    .trim();
  return VALID_TYPES.has(t) ? t : null;
}

export function isBuildIntent(message, hasActiveGame) {
  const text = message.trim();
  if (text.length < 3) return false;

  const greeting = /^(hi|hello|hey|thanks|thank you)\b/i.test(text);
  if (greeting) return false;

  const { topScore } = scoreGameTypes(text);
  const explicitBuild = /\b(make|build|create|add|want|need|update|change|turn|into|switch|redo|different|generate)\b/i.test(
    text
  );

  const questionOrFix =
    /\b(what kind|why|how do|not working|doesn't work|does not work|broken|bug|fix|wrong|general game|what is this)\b/i.test(
      text
    );

  if (questionOrFix && !explicitBuild && topScore < 2) return false;

  if (hasActiveGame) return explicitBuild || topScore >= 1;
  return explicitBuild || topScore >= 1;
}

const CLASSIFY_PROMPT = `You classify voice commands for a browser game builder.
Reply with ONLY valid JSON, no markdown:
{"type":"<one type>","summary":"<short plain English of what to build>"}

Allowed types: platformer, shooter, snake, dodge, collector, pong, racer, flappy, archery, arcade

Examples:
- "a boy flying through the sky" -> flappy
- "shoot arrows at targets" -> archery
- "jump on platforms like mario" -> platformer
- "collect coins in a maze" -> collector`;

export async function classifyWithOllama(message, url, model) {
  const res = await fetch(`${url}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: CLASSIFY_PROMPT },
        { role: "user", content: message.trim() },
      ],
      stream: false,
      format: "json",
    }),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error("Ollama classify failed");
  const data = await res.json();
  const parsed = JSON.parse(data.message?.content || "{}");
  const type = normalizeType(parsed.type) || scoreGameTypes(message).type;
  return { type, summary: parsed.summary || message.trim() };
}

export async function classifyWithOpenAI(message, openai) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: CLASSIFY_PROMPT },
      { role: "user", content: message.trim() },
    ],
    max_tokens: 120,
    response_format: { type: "json_object" },
  });
  const parsed = JSON.parse(completion.choices[0]?.message?.content || "{}");
  const type = normalizeType(parsed.type) || scoreGameTypes(message).type;
  return { type, summary: parsed.summary || message.trim() };
}

function inferDefaultType(message) {
  const m = message.toLowerCase();
  if (/\b(kid|child|children|baby|toddler|little)\b/.test(m)) return "platformer";
  if (/\b(cute|simple|easy|fun|play)\b/.test(m)) return "collector";
  if (/\b(scary|hard|fast|action|fight)\b/.test(m)) return "shooter";
  return "platformer";
}

export async function resolveGameIntent(message, options = {}) {
  const { openai, ollamaUrl, ollamaModel, ollamaAvailable } = options;
  const scored = scoreGameTypes(message);

  if (openai) {
    try {
      return await classifyWithOpenAI(message, openai);
    } catch {
      /* fall through */
    }
  }

  if (ollamaAvailable && ollamaUrl && ollamaModel) {
    try {
      return await classifyWithOllama(message, ollamaUrl, ollamaModel);
    } catch {
      /* fall through */
    }
  }

  return {
    type: scored.topScore > 0 ? scored.type : inferDefaultType(message),
    summary: message.trim(),
    fromKeywords: true,
  };
}
