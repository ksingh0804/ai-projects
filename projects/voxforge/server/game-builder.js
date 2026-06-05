import fs from "fs/promises";
import path from "path";
import { detectGameType, isBuildIntent, resolveGameIntent } from "./game-intent.js";
import { buildTheme, sharedGameScript } from "./game-theme.js";

export { detectGameType };

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function wrapGame(title, bodyScript, instructions, theme) {
  const safeTitle = escapeHtml(title);
  const safeSummary = escapeHtml(theme.summary);
  const safeType = escapeHtml(theme.typeLabel);
  const safeControls = escapeHtml(instructions);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${safeTitle}</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; background: #0a0a12; color: #e8e8ff; font-family: system-ui, sans-serif;
      display: flex; flex-direction: column; align-items: center; min-height: 100vh; padding: 1rem; }
    header { text-align: center; max-width: 640px; width: 100%; margin-bottom: 0.5rem; }
    h1 { margin: 0 0 0.35rem; font-size: 1.25rem; }
    .type-badge { display: inline-block; font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.08em;
      padding: 0.2rem 0.55rem; border-radius: 999px; background: #7c5cff33; border: 1px solid #7c5cff66; color: #c4b5ff; }
    .brief { margin: 0.35rem 0 0.25rem; opacity: 0.75; font-size: 0.8rem; line-height: 1.35; font-style: italic; }
    .controls { margin: 0 0 0.75rem; opacity: 0.55; font-size: 0.75rem; }
    .wrap { position: relative; }
    canvas { border: 2px solid #7c5cff44; border-radius: 8px; background: #111; max-width: 100%; display: block; cursor: pointer; }
    #start { position: absolute; inset: 0; display: grid; place-items: center; background: rgba(0,0,0,0.75);
      border-radius: 8px; cursor: pointer; z-index: 2; font-size: 1.1rem; font-weight: 600; color: #e8e8ff; }
    #start span { padding: 0.75rem 1.25rem; border: 2px solid #7c5cff; border-radius: 8px; background: #7c5cff33; }
  </style>
</head>
<body>
  <header>
    <h1>${safeTitle}</h1>
    <span class="type-badge">${safeType}</span>
    <p class="brief">"${safeSummary}"</p>
    <p class="controls">${safeControls}</p>
  </header>
  <div class="wrap">
    <div id="start"><span>Click to play</span></div>
    <canvas id="c" width="640" height="400" tabindex="0"></canvas>
  </div>
  <script>
function activateGame() {
  const start = document.getElementById('start');
  const canvas = document.getElementById('c');
  if (start) start.style.display = 'none';
  canvas.focus();
  window.focus();
}
document.getElementById('start').onclick = activateGame;
document.getElementById('c').onclick = activateGame;
${sharedGameScript(theme)}
${bodyScript}
  </script>
</body>
</html>`;
}

const TEMPLATES = {
  platformer: (title, theme) =>
    wrapGame(
      title,
      `
const c = document.getElementById('c'), x = c.getContext('2d');
const spd = 4 * T.speed;
let px = 80, py = 300, vy = 0, grounded = false, score = 0, stars = [];
const keys = {};
addEventListener('keydown', e => keys[e.code] = true);
addEventListener('keyup', e => keys[e.code] = false);
const platforms = [[0,360,640,40],[120,280,120,16],[320,220,140,16],[500,160,100,16]];
function loop() {
  if (keys['ArrowLeft'] || keys['KeyA']) px -= spd;
  if (keys['ArrowRight'] || keys['KeyD']) px += spd;
  if ((keys['Space'] || keys['ArrowUp'] || keys['KeyW']) && grounded) { vy = -11 * T.speed; grounded = false; }
  vy += 0.45 * T.speed; py += vy; grounded = false;
  for (const [ox,oy,w,h] of platforms) {
    if (px+20>ox && px<ox+w && py+24>oy && py+24<oy+h+8 && vy>=0) { py = oy-24; vy = 0; grounded = true; }
  }
  px = Math.max(0, Math.min(620, px));
  if (py > 400) { px = 80; py = 300; vy = 0; }
  if (grounded && Math.random() < 0.015) stars.push({x: px + Math.random()*200, y: py - 40 - Math.random()*80});
  stars.forEach(s => s.y -= 1.5); stars = stars.filter(s => s.y > 0);
  drawBackground(x);
  x.fillStyle = T.accentColor; platforms.forEach(p=>x.fillRect(p[0],p[1],p[2],p[3]));
  stars.forEach(s => drawCollectible(x, s.x, s.y, 8));
  drawPlayer(x, px, py, 20, 24);
  x.fillStyle='#fff'; x.fillText('Score: '+score, 12, 24);
  if (stars.length && Math.abs(stars[0].x - px) < 24 && Math.abs(stars[0].y - py) < 24) { score++; stars.shift(); }
  requestAnimationFrame(loop);
}
loop();`,
      theme.kidFriendly ? "Easy jump game — arrows to move, Space to jump, collect stars!" : "Arrow keys to move, Space to jump.",
      theme
    ),

  shooter: (title, theme) =>
    wrapGame(
      title,
      `
const c = document.getElementById('c'), x = c.getContext('2d');
let px = 300, bullets = [], enemies = [], score = 0, tick = 0;
const keys = {};
addEventListener('keydown', e => { keys[e.code]=true; if(e.code==='Space'){e.preventDefault(); bullets.push({x:px+16,y:360,vx:0,vy:-8});} });
addEventListener('keyup', e => keys[e.code]=false);
function loop() {
  tick++;
  if (keys['ArrowLeft']||keys['KeyA']) px -= 5;
  if (keys['ArrowRight']||keys['KeyD']) px += 5;
  px = Math.max(0, Math.min(608, px));
  if (tick % 45 === 0) enemies.push({x: Math.random()*600, y: -20, vy: 2+Math.random()*2});
  bullets.forEach(b => b.y += b.vy);
  enemies.forEach(e => e.y += e.vy);
  bullets = bullets.filter(b => b.y > -10);
  enemies = enemies.filter(e => e.y < 420);
  for (const b of bullets) for (const e of enemies) {
    if (Math.hypot(b.x-e.x, b.y-e.y) < 22) { e.dead=true; b.dead=true; score+=10; }
  }
  bullets = bullets.filter(b=>!b.dead); enemies = enemies.filter(e=>!e.dead);
  drawBackground(x);
  drawPlayer(x, px, 360, 32, 24);
  x.fillStyle='#ff4d6d'; bullets.forEach(b=>x.fillRect(b.x,b.y,4,12));
  x.fillStyle='#ffc857'; enemies.forEach(e=>x.fillRect(e.x,e.y,28,28));
  x.fillStyle='#fff'; x.fillText('Score: '+score, 12, 24);
  requestAnimationFrame(loop);
}
loop();`,
      "Move with arrows, Space to shoot.",
      theme
    ),

  snake: (title, theme) =>
    wrapGame(
      title,
      `
const c = document.getElementById('c'), x = c.getContext('2d');
const size = 20;
let snake = [{x:10,y:10}], dir = {x:1,y:0}, food = {x:15,y:10}, score = 0, tick = 0;
addEventListener('keydown', e => {
  if (e.code==='ArrowUp' && dir.y!==1) dir={x:0,y:-1};
  if (e.code==='ArrowDown' && dir.y!==-1) dir={x:0,y:1};
  if (e.code==='ArrowLeft' && dir.x!==1) dir={x:-1,y:0};
  if (e.code==='ArrowRight' && dir.x!==-1) dir={x:1,y:0};
});
function loop() {
  if (++tick % 8 !== 0) { requestAnimationFrame(loop); return; }
  const head = {x: snake[0].x+dir.x, y: snake[0].y+dir.y};
  if (head.x<0||head.y<0||head.x>=32||head.y>=20|| snake.some(s=>s.x===head.x&&s.y===head.y)) {
    snake=[{x:10,y:10}]; dir={x:1,y:0}; score=0;
  } else {
    snake.unshift(head);
    if (head.x===food.x && head.y===food.y) { score++; food={x:Math.floor(Math.random()*32),y:Math.floor(Math.random()*20)}; }
    else snake.pop();
  }
  drawBackground(x);
  x.fillStyle=T.playerColor; snake.forEach(s=>x.fillRect(s.x*size,s.y*size,size-2,size-2));
  drawCollectible(x, food.x*size+10, food.y*size+10, 8);
  x.fillStyle='#fff'; x.fillText('Score: '+score, 12, 24);
  requestAnimationFrame(loop);
}
loop();`,
      "Arrow keys to steer the snake.",
      theme
    ),

  dodge: (title, theme) =>
    wrapGame(
      title,
      `
const c = document.getElementById('c'), x = c.getContext('2d');
let px = 300, hazards = [], score = 0, tick = 0;
const keys = {};
addEventListener('keydown', e => keys[e.code]=true);
addEventListener('keyup', e => keys[e.code]=false);
function loop() {
  tick++;
  if (keys['ArrowLeft']||keys['KeyA']) px -= 6;
  if (keys['ArrowRight']||keys['KeyD']) px += 6;
  px = Math.max(0, Math.min(608, px));
  if (tick % 20 === 0) hazards.push({x: Math.random()*600, y: -20, vy: 4+Math.random()*3});
  hazards.forEach(h => h.y += h.vy);
  hazards = hazards.filter(h => h.y < 420);
  for (const h of hazards) if (Math.abs(h.x-px)<28 && h.y>340 && h.y<380) { score=0; hazards=[]; px=300; }
  score++;
  drawBackground(x);
  drawPlayer(x, px, 360, 32, 24);
  x.fillStyle='#ff4d6d'; hazards.forEach(h=>x.fillRect(h.x,h.y,24,24));
  x.fillStyle='#fff'; x.fillText('Score: '+score, 12, 24);
  requestAnimationFrame(loop);
}
loop();`,
      "Dodge falling blocks — move with arrow keys.",
      theme
    ),

  collector: (title, theme) =>
    wrapGame(
      title,
      `
const c = document.getElementById('c'), x = c.getContext('2d');
let px = 300, py = 200, coins = [], score = 0, tick = 0;
const keys = {};
addEventListener('keydown', e => keys[e.code]=true);
addEventListener('keyup', e => keys[e.code]=false);
function loop() {
  tick++;
  if (keys['ArrowLeft']||keys['KeyA']) px -= 4;
  if (keys['ArrowRight']||keys['KeyD']) px += 4;
  if (keys['ArrowUp']||keys['KeyW']) py -= 4;
  if (keys['ArrowDown']||keys['KeyS']) py += 4;
  if (tick % 40 === 0) coins.push({x:40+Math.random()*560,y:40+Math.random()*320});
  for (const coin of coins) {
    if (Math.hypot(coin.x-px, coin.y-py) < 24) { coin.dead=true; score+=5; }
  }
  coins = coins.filter(c=>!c.dead);
  drawBackground(x);
  coins.forEach(c => drawCollectible(x, c.x, c.y, 10));
  drawPlayer(x, px - 12, py - 12, 24, 24);
  x.fillStyle='#fff'; x.fillText('Score: '+score, 12, 24);
  requestAnimationFrame(loop);
}
loop();`,
      theme.kidFriendly ? "Move with arrows and collect the stars!" : "Move with arrows and collect the items.",
      theme
    ),

  pong: (title, theme) =>
    wrapGame(
      title,
      `
const c = document.getElementById('c'), x = c.getContext('2d');
let paddle = 280, ball = {x:320,y:200,vx:4,vy:3}, score = 0;
addEventListener('mousemove', e => {
  const r = c.getBoundingClientRect();
  paddle = e.clientX - r.left - 50;
});
function loop() {
  ball.x += ball.vx; ball.y += ball.vy;
  if (ball.x < 8 || ball.x > 632) ball.vx *= -1;
  if (ball.y < 8) ball.vy *= -1;
  if (ball.y > 360 && ball.x > paddle && ball.x < paddle+100) { ball.vy = -Math.abs(ball.vy); score++; }
  if (ball.y > 400) { ball = {x:320,y:200,vx:4,vy:3}; score = 0; }
  drawBackground(x);
  x.fillStyle=T.accentColor; x.fillRect(paddle,370,100,12);
  x.fillStyle=T.playerColor; x.beginPath(); x.arc(ball.x,ball.y,8,0,7); x.fill();
  x.fillStyle='#fff'; x.fillText('Score: '+score, 12, 24);
  requestAnimationFrame(loop);
}
loop();`,
      "Move mouse to control the paddle.",
      theme
    ),

  flappy: (title, theme) =>
    wrapGame(
      title,
      `
const c = document.getElementById('c'), x = c.getContext('2d');
let bird = { y: 200, vy: 0 }, pipes = [], score = 0, tick = 0, alive = true;
addEventListener('keydown', e => {
  if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
    e.preventDefault();
    if (!alive) { bird = { y: 200, vy: 0 }; pipes = []; score = 0; tick = 0; alive = true; }
    bird.vy = -6.5;
  }
});
addEventListener('click', () => { if (!alive) bird.vy = -6.5; else bird.vy = -6.5; });
function loop() {
  tick++;
  if (alive) {
    bird.vy += 0.35; bird.y += bird.vy;
    if (tick % 70 === 0) {
      const gap = 120 + Math.random() * 40;
      const top = 60 + Math.random() * 160;
      pipes.push({ x: 640, top, gap });
    }
    pipes.forEach(p => p.x -= 3);
    pipes = pipes.filter(p => p.x > -60);
    for (const p of pipes) {
      if (p.x < 80 && p.x + 52 > 48) {
        if (bird.y < p.top || bird.y + 20 > p.top + p.gap) alive = false;
      }
      if (p.x === 47) score++;
    }
    if (bird.y > 380 || bird.y < 0) alive = false;
  }
  drawBackground(x);
  x.fillStyle='#6bcb4a'; x.fillRect(0,360,640,40);
  x.fillStyle='#2ecc71'; pipes.forEach(p => { x.fillRect(p.x,0,52,p.top); x.fillRect(p.x,p.top+p.gap,52,400); });
  drawPlayer(x, 42, bird.y, 28, 28);
  x.fillStyle='#fff'; x.fillText('Score: '+score, 12, 24);
  if (!alive) { x.fillStyle='#fff'; x.fillText('Space to retry', 250, 200); }
  requestAnimationFrame(loop);
}
loop();`,
      "Space or click to flap — dodge the pipes.",
      theme
    ),

  archery: (title, theme) =>
    wrapGame(
      title,
      `
const c = document.getElementById('c'), x = c.getContext('2d');
let aim = 0.5, power = 0, charging = false, arrows = [], targets = [], score = 0, tick = 0;
const keys = {};
addEventListener('keydown', e => {
  keys[e.code] = true;
  if (e.code === 'Space') { e.preventDefault(); charging = true; }
});
addEventListener('keyup', e => {
  keys[e.code] = false;
  if (e.code === 'Space' && charging) {
    charging = false;
    const speed = 6 + power * 10;
    arrows.push({ x: 80, y: 340, vx: Math.cos(aim) * speed, vy: Math.sin(aim) * speed, life: 120 });
    power = 0;
  }
});
function loop() {
  tick++;
  if (keys['ArrowUp'] || keys['KeyW']) aim -= 0.03;
  if (keys['ArrowDown'] || keys['KeyS']) aim += 0.03;
  aim = Math.max(-1.2, Math.min(-0.2, aim));
  if (charging) power = Math.min(1, power + 0.02);
  if (tick % 90 === 0) targets.push({ x: 400 + Math.random() * 180, y: 80 + Math.random() * 200, r: 22 + Math.random() * 16 });
  targets = targets.filter(t => !t.dead);
  arrows.forEach(a => { a.x += a.vx; a.y += a.vy; a.vy += 0.15; a.life--; });
  for (const a of arrows) for (const t of targets) {
    if (Math.hypot(a.x - t.x, a.y - t.y) < t.r && !t.dead) { t.dead = true; a.dead = true; score += Math.round(50 - t.r); }
  }
  arrows = arrows.filter(a => !a.dead && a.life > 0 && a.x < 640 && a.y < 400);
  drawBackground(x);
  x.fillStyle='#8B4513'; x.fillRect(0,350,640,50);
  targets.forEach(t => {
    x.strokeStyle='#fff'; x.lineWidth=2;
    x.beginPath(); x.arc(t.x,t.y,t.r,0,7); x.stroke();
    x.fillStyle='#ff4d6d'; x.beginPath(); x.arc(t.x,t.y,t.r*0.35,0,7); x.fill();
  });
  x.strokeStyle='#ccc'; x.lineWidth=3;
  x.beginPath(); x.moveTo(80,340); x.lineTo(80+Math.cos(aim)*60,340+Math.sin(aim)*60); x.stroke();
  if (charging) { x.fillStyle='#ffc857'; x.fillRect(80,320,power*80,8); }
  x.fillStyle='#aaa'; arrows.forEach(a => { x.beginPath(); x.moveTo(a.x,a.y); x.lineTo(a.x-a.vx*3,a.y-a.vy*3); x.stroke(); });
  x.fillStyle='#fff'; x.fillText('Score: '+score, 12, 24);
  requestAnimationFrame(loop);
}
loop();`,
      "Up/down to aim, hold Space for power, release to shoot.",
      theme
    ),

  racer: (title, theme) =>
    wrapGame(
      title,
      `
const c = document.getElementById('c'), x = c.getContext('2d');
let px = 300, obstacles = [], score = 0, tick = 0, speed = 4;
const keys = {};
addEventListener('keydown', e => keys[e.code]=true);
addEventListener('keyup', e => keys[e.code]=false);
function loop() {
  tick++;
  if (keys['ArrowLeft']||keys['KeyA']) px -= 7;
  if (keys['ArrowRight']||keys['KeyD']) px += 7;
  px = Math.max(40, Math.min(600, px));
  if (tick % 25 === 0) obstacles.push({x: 80+Math.random()*480, y: -40});
  obstacles.forEach(o => o.y += speed);
  obstacles = obstacles.filter(o => o.y < 420);
  for (const o of obstacles) if (Math.abs(o.x-px)<30 && o.y>320 && o.y<380) { score=0; obstacles=[]; }
  if (tick % 120 === 0) speed += 0.2;
  score++;
  drawBackground(x);
  x.fillStyle='#333'; x.fillRect(280,0,80,400);
  drawPlayer(x, px - 15, 340, 30, 40);
  x.fillStyle='#ff4d6d'; obstacles.forEach(o=>x.fillRect(o.x-20,o.y,40,40));
  x.fillStyle='#fff'; x.fillText('Score: '+score, 12, 24);
  requestAnimationFrame(loop);
}
loop();`,
      "Arrow keys to dodge traffic.",
      theme
    ),

  arcade: (title, theme) =>
    wrapGame(
      title,
      `
const c = document.getElementById('c'), x = c.getContext('2d');
let px = 300, py = 200, targets = [], score = 0, tick = 0;
const keys = {};
addEventListener('keydown', e => { keys[e.code]=true; if(e.code==='Space'){e.preventDefault(); targets.push({x:px,y:py,vx:(Math.random()-0.5)*6,vy:-6,life:60});} });
addEventListener('keyup', e => keys[e.code]=false);
function loop() {
  tick++;
  if (keys['ArrowLeft']||keys['KeyA']) px -= 5;
  if (keys['ArrowRight']||keys['KeyD']) px += 5;
  if (keys['ArrowUp']||keys['KeyW']) py -= 5;
  if (keys['ArrowDown']||keys['KeyS']) py += 5;
  if (tick % 50 === 0) targets.push({x:Math.random()*600+20,y:-10,vx:0,vy:2+Math.random()*2,life:999,enemy:true});
  targets.forEach(t => { t.x+=t.vx; t.y+=t.vy; if(t.life) t.life--; });
  targets = targets.filter(t => t.y<420 && t.life!==0);
  for (const t of targets.filter(t=>t.enemy))
    for (const s of targets.filter(t=>!t.enemy))
      if (Math.hypot(t.x-s.x,t.y-s.y)<20) { t.dead=true; s.dead=true; score+=15; }
  targets = targets.filter(t=>!t.dead);
  drawBackground(x);
  drawPlayer(x, px - 12, py - 12, 24, 24);
  targets.forEach(t => { x.fillStyle = t.enemy ? '#ff4d6d' : T.accentColor; x.fillRect(t.x-6,t.y-6,12,12); });
  x.fillStyle='#fff'; x.fillText('Score: '+score, 12, 24);
  requestAnimationFrame(loop);
}
loop();`,
      "Arrows to move, Space to shoot.",
      theme
    ),
};

const TYPE_LABELS = {
  platformer: "jump platformer",
  shooter: "space shooter",
  snake: "snake game",
  dodge: "dodge game",
  collector: "coin collector",
  pong: "paddle game",
  racer: "racing game",
  flappy: "flying game",
  archery: "archery game",
  arcade: "arcade game",
};

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48) || `game-${Date.now()}`;
}

function extractGameName(message) {
  const m = message.match(/(?:called|named|name it|game)\s+["']?([^"'.]+)["']?/i);
  return m?.[1]?.trim();
}

export async function tryBuildFromCommand(message, activeGame, gamesDir, intentOptions = {}) {
  const text = message.trim();
  if (text.length < 3) return null;
  if (!isBuildIntent(text, Boolean(activeGame))) return null;

  let game = activeGame;
  let created = false;

  if (!game) {
    const name = extractGameName(text) || "My Game";
    const id = slugify(name);
    const gamePath = path.join(gamesDir, id);
    try {
      await fs.access(gamePath);
      game = { id, name, description: "" };
    } catch {
      await fs.mkdir(gamePath, { recursive: true });
      game = {
        id,
        name,
        description: text,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await fs.writeFile(path.join(gamePath, "meta.json"), JSON.stringify(game, null, 2));
      created = true;
    }
  }

  const gamePath = path.join(gamesDir, game.id);
  await fs.mkdir(gamePath, { recursive: true });

  let meta = null;
  const metaPath = path.join(gamePath, "meta.json");
  try {
    meta = JSON.parse(await fs.readFile(metaPath, "utf8"));
  } catch {
    /* no meta yet */
  }

  const intent = await resolveGameIntent(text, intentOptions);
  const type = intent.type;
  const label = TYPE_LABELS[type] || TYPE_LABELS.arcade;
  const theme = buildTheme(intent.summary || text, type, label);
  const sameType = meta?.lastBuild === type;

  if (activeGame && sameType && meta?.lastPrompt === text) {
    return {
      reply: `Already built a ${label} from that command. Try something different — like "flappy bird", "archery targets", "snake", or "racing game".`,
      gameUpdated: false,
      activeGameId: game.id,
    };
  }

  const html = TEMPLATES[type](game.name, theme);
  await fs.writeFile(path.join(gamePath, "index.html"), html);

  try {
    const nextMeta = meta || {
      id: game.id,
      name: game.name,
      createdAt: new Date().toISOString(),
    };
    nextMeta.description = intent.summary || text;
    nextMeta.updatedAt = new Date().toISOString();
    nextMeta.lastBuild = type;
    nextMeta.lastBuildLabel = label;
    nextMeta.lastPrompt = text;
    nextMeta.buildSummary = intent.summary || text;
    nextMeta.theme = { hero: theme.hero, setting: theme.setting, kidFriendly: theme.kidFriendly };
    await fs.writeFile(metaPath, JSON.stringify(nextMeta, null, 2));
  } catch {
    /* meta optional */
  }

  const heard = text.length > 60 ? `${text.slice(0, 57)}…` : text;
  const article = /^[aeiou]/i.test(label) ? "an" : "a";
  const reply = created
    ? `Heard: "${heard}". Built ${article} ${label}. Click the preview to play.`
    : sameType
      ? `Refreshed your ${label}. Try "flappy bird", "archery", "snake", or "jump game" for a different style.`
      : `Heard: "${heard}". Switched to ${article} ${label}. Click the preview to play.`;

  return { reply, gameUpdated: true, activeGameId: game.id, gameType: type };
}

export async function tryBuildGame(message, activeGame, gamesDir, intentOptions = {}) {
  return tryBuildFromCommand(message, activeGame, gamesDir, intentOptions);
}
