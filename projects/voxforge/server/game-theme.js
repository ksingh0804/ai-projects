const PALETTES = {
  sky: { bg: "#1a2a4a", accent: "#87ceeb", player: "#ffc857" },
  space: { bg: "#050510", accent: "#7c5cff", player: "#00e5c0" },
  ocean: { bg: "#0d2137", accent: "#00b4d8", player: "#ffc857" },
  forest: { bg: "#1a2e1a", accent: "#6bcb4a", player: "#ffc857" },
  city: { bg: "#1a1a2e", accent: "#7c5cff", player: "#00e5c0" },
  default: { bg: "#0a0a12", accent: "#7c5cff", player: "#00e5c0" },
};

const TYPE_SETTING = {
  flappy: "sky",
  shooter: "space",
  racer: "city",
  archery: "forest",
  pong: "default",
};

export function extractHero(message) {
  const m = message.toLowerCase();
  if (/\b(kid|child|children|boy|girl|baby|toddler|little)\b/.test(m)) return "kid";
  if (/\b(bird|flappy|chicken|duck)\b/.test(m)) return "bird";
  if (/\b(cat|kitten)\b/.test(m)) return "cat";
  if (/\b(dog|puppy)\b/.test(m)) return "dog";
  if (/\b(robot|bot)\b/.test(m)) return "robot";
  if (/\b(fish|shark|whale)\b/.test(m)) return "fish";
  if (/\b(car|truck|vehicle)\b/.test(m)) return "car";
  return "default";
}

export function extractSetting(message, type) {
  const m = message.toLowerCase();
  if (/\b(sky|cloud|fly|flying|aero)\b/.test(m)) return "sky";
  if (/\b(space|star|galaxy|planet|alien)\b/.test(m)) return "space";
  if (/\b(ocean|sea|water|underwater|beach|fish)\b/.test(m)) return "ocean";
  if (/\b(forest|tree|jungle|grass|garden|park)\b/.test(m)) return "forest";
  if (/\b(city|street|road|traffic)\b/.test(m)) return "city";
  return TYPE_SETTING[type] || "default";
}

export function extractCollectLabel(message) {
  const m = message.toLowerCase();
  if (/\b(star|stars)\b/.test(m)) return "stars";
  if (/\b(coin|coins|gold|money)\b/.test(m)) return "coins";
  if (/\b(gem|gems|diamond|crystal)\b/.test(m)) return "gems";
  if (/\b(fruit|apple|berry|banana)\b/.test(m)) return "fruit";
  if (/\b(candy|sweet|treat)\b/.test(m)) return "candy";
  if (/\b(kid|child|children|baby)\b/.test(m)) return "stars";
  return "coins";
}

export function isKidFriendly(message) {
  return /\b(kid|child|children|baby|toddler|little|simple|easy|cute|young)\b/.test(
    message.toLowerCase()
  );
}

export function buildTheme(message, type, typeLabel) {
  const m = message.toLowerCase();
  const kidFriendly = isKidFriendly(m);
  let setting = extractSetting(m, type);
  let hero = extractHero(m);

  if (type === "flappy") hero = "bird";
  if (type === "racer") hero = "car";
  if (type === "snake") hero = "default";

  const palette = PALETTES[setting] || PALETTES.default;

  return {
    summary: message.trim().slice(0, 140),
    typeLabel,
    hero,
    setting,
    kidFriendly,
    playerColor: kidFriendly ? "#ff9ff3" : palette.player,
    accentColor: palette.accent,
    bgColor: palette.bg,
    collectLabel: extractCollectLabel(m),
    speed: kidFriendly ? 0.72 : 1,
  };
}

export function sharedGameScript(theme) {
  return `
const T = ${JSON.stringify(theme)};
function drawBackground(x) {
  x.fillStyle = T.bgColor;
  x.fillRect(0, 0, 640, 400);
  if (T.setting === 'sky') {
    const g = x.createLinearGradient(0, 0, 0, 400);
    g.addColorStop(0, '#4facfe'); g.addColorStop(1, '#a8edea');
    x.fillStyle = g; x.fillRect(0, 0, 640, 400);
    x.fillStyle = '#ffffff88';
    [[60,50,50,14],[220,90,60,16],[420,60,45,12],[540,110,55,14]].forEach(c => x.fillRect(c[0], c[1], c[2], c[3]));
  } else if (T.setting === 'space') {
    x.fillStyle = '#050510'; x.fillRect(0, 0, 640, 400);
    x.fillStyle = '#ffffffcc';
    for (let i = 0; i < 45; i++) x.fillRect((i * 137) % 640, (i * 89) % 400, 2, 2);
  } else if (T.setting === 'forest') {
    x.fillStyle = '#87ceeb'; x.fillRect(0, 0, 640, 180);
    x.fillStyle = '#2d5a27'; x.fillRect(0, 180, 640, 220);
    x.fillStyle = '#6bcb4a'; x.fillRect(0, 360, 640, 40);
  } else if (T.setting === 'ocean') {
    const g = x.createLinearGradient(0, 0, 0, 400);
    g.addColorStop(0, '#0077b6'); g.addColorStop(1, '#023e8a');
    x.fillStyle = g; x.fillRect(0, 0, 640, 400);
  } else if (T.setting === 'city') {
    x.fillStyle = '#2b2d42'; x.fillRect(0, 0, 640, 400);
    x.fillStyle = '#1a1a2e';
    for (let i = 0; i < 9; i++) x.fillRect(i * 72, 100 + (i % 3) * 25, 56, 300);
  }
  if (T.kidFriendly) {
    x.fillStyle = '#ffd700';
    x.font = '14px serif';
    for (let i = 0; i < 6; i++) x.fillText('★', 30 + i * 100, 28);
  }
}
function drawPlayer(x, px, py, w, h) {
  x.fillStyle = T.playerColor;
  if (T.hero === 'kid') {
    x.beginPath(); x.arc(px + w / 2, py + h / 2, Math.min(w, h) / 2 + 3, 0, Math.PI * 2); x.fill();
    x.fillStyle = '#333';
    x.fillRect(px + w / 2 - 7, py + h / 2 - 3, 4, 4);
    x.fillRect(px + w / 2 + 3, py + h / 2 - 3, 4, 4);
    x.strokeStyle = '#333'; x.beginPath(); x.arc(px + w / 2, py + h / 2 + 5, 7, 0, Math.PI); x.stroke();
  } else if (T.hero === 'bird') {
    x.beginPath(); x.arc(px + w / 2, py + h / 2, 14, 0, Math.PI * 2); x.fill();
    x.fillStyle = '#ff6b35'; x.fillRect(px + w / 2 + 8, py + h / 2 - 4, 10, 8);
  } else if (T.hero === 'car') {
    x.fillRect(px, py + h - 14, w, 14);
    x.fillStyle = '#222';
    x.fillRect(px + 5, py + h - 5, 12, 8);
    x.fillRect(px + w - 17, py + h - 5, 12, 8);
  } else if (T.hero === 'robot') {
    x.fillRect(px, py, w, h);
    x.fillStyle = '#fff';
    x.fillRect(px + 5, py + 6, 7, 7); x.fillRect(px + w - 12, py + 6, 7, 7);
  } else {
    x.fillRect(px, py, w, h);
  }
}
function drawCollectible(x, cx, cy, r) {
  if (T.collectLabel === 'stars') {
    x.fillStyle = '#ffd700'; x.font = '18px serif'; x.fillText('★', cx - 6, cy + 6);
  } else if (T.collectLabel === 'candy') {
    x.fillStyle = '#ff9ff3'; x.fillRect(cx - r, cy - r, r * 2, r * 2);
  } else if (T.collectLabel === 'fruit') {
    x.fillStyle = '#ff6b6b'; x.beginPath(); x.arc(cx, cy, r, 0, Math.PI * 2); x.fill();
  } else {
    x.fillStyle = T.accentColor;
    x.beginPath(); x.arc(cx, cy, r, 0, Math.PI * 2); x.fill();
  }
}
`;
}
