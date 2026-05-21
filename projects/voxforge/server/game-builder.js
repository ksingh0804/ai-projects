import fs from "fs/promises";
import path from "path";

export function detectGameType(message) {
  const m = message.toLowerCase();
  if (/\bsnake\b/.test(m)) return "snake";
  if (/\b(pong|paddle|breakout)\b/.test(m)) return "pong";
  if (/\b(shoot|shooter|bullet|laser|space invader|enemies)\b/.test(m)) return "shooter";
  if (/\b(jump|platform|mario|hop)\b/.test(m)) return "platformer";
  if (/\b(dodge|avoid|falling|asteroid)\b/.test(m)) return "dodge";
  if (/\b(collect|coin|gem|gather|pickup)\b/.test(m)) return "collector";
  if (/\b(race|racing|car|drive)\b/.test(m)) return "racer";
  return "arcade";
}

function wrapGame(title, bodyScript, instructions) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; background: #0a0a12; color: #e8e8ff; font-family: system-ui, sans-serif;
      display: flex; flex-direction: column; align-items: center; min-height: 100vh; padding: 1rem; }
    h1 { margin: 0 0 0.25rem; font-size: 1.25rem; }
    p { margin: 0 0 0.75rem; opacity: 0.65; font-size: 0.85rem; }
    canvas { border: 2px solid #7c5cff44; border-radius: 8px; background: #111; max-width: 100%; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <p>${instructions}</p>
  <canvas id="c" width="640" height="400"></canvas>
  <script>
${bodyScript}
  </script>
</body>
</html>`;
}

const TEMPLATES = {
  platformer: (title) =>
    wrapGame(
      title,
      `
const c = document.getElementById('c'), x = c.getContext('2d');
let px = 80, py = 300, vy = 0, grounded = false, score = 0;
const keys = {};
addEventListener('keydown', e => keys[e.code] = true);
addEventListener('keyup', e => keys[e.code] = false);
const platforms = [[0,360,640,40],[120,280,120,16],[320,220,140,16],[500,160,100,16]];
function loop() {
  if (keys['ArrowLeft'] || keys['KeyA']) px -= 4;
  if (keys['ArrowRight'] || keys['KeyD']) px += 4;
  if ((keys['Space'] || keys['ArrowUp'] || keys['KeyW']) && grounded) { vy = -11; grounded = false; }
  vy += 0.45; py += vy; grounded = false;
  for (const [ox,oy,w,h] of platforms) {
    if (px+20>ox && px<ox+w && py+24>oy && py+24<oy+h+8 && vy>=0) { py = oy-24; vy = 0; grounded = true; }
  }
  px = Math.max(0, Math.min(620, px));
  if (py > 400) { px = 80; py = 300; vy = 0; }
  if (grounded && Math.random() < 0.02) score++;
  x.fillStyle='#111'; x.fillRect(0,0,640,400);
  x.fillStyle='#7c5cff'; platforms.forEach(p=>x.fillRect(p[0],p[1],p[2],p[3]));
  x.fillStyle='#00e5c0'; x.fillRect(px,py,20,24);
  x.fillStyle='#fff'; x.fillText('Score: '+score, 12, 24);
  requestAnimationFrame(loop);
}
loop();`,
      "Arrow keys to move, Space to jump."
    ),

  shooter: (title) =>
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
  x.fillStyle='#0a0a12'; x.fillRect(0,0,640,400);
  x.fillStyle='#00e5c0'; x.fillRect(px,360,32,24);
  x.fillStyle='#ff4d6d'; bullets.forEach(b=>x.fillRect(b.x,b.y,4,12));
  x.fillStyle='#ffc857'; enemies.forEach(e=>x.fillRect(e.x,e.y,28,28));
  x.fillStyle='#fff'; x.fillText('Score: '+score, 12, 24);
  requestAnimationFrame(loop);
}
loop();`,
      "Move with arrows, Space to shoot."
    ),

  snake: (title) =>
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
  x.fillStyle='#111'; x.fillRect(0,0,640,400);
  x.fillStyle='#00e5c0'; snake.forEach(s=>x.fillRect(s.x*size,s.y*size,size-2,size-2));
  x.fillStyle='#ff4d6d'; x.fillRect(food.x*size,food.y*size,size-2,size-2);
  x.fillStyle='#fff'; x.fillText('Score: '+score, 12, 24);
  requestAnimationFrame(loop);
}
loop();`,
      "Arrow keys to steer the snake."
    ),

  dodge: (title) =>
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
  x.fillStyle='#0a0a12'; x.fillRect(0,0,640,400);
  x.fillStyle='#00e5c0'; x.fillRect(px,360,32,24);
  x.fillStyle='#ff4d6d'; hazards.forEach(h=>x.fillRect(h.x,h.y,24,24));
  x.fillStyle='#fff'; x.fillText('Score: '+score, 12, 24);
  requestAnimationFrame(loop);
}
loop();`,
      "Dodge falling blocks — move with arrow keys."
    ),

  collector: (title) =>
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
  x.fillStyle='#111'; x.fillRect(0,0,640,400);
  x.fillStyle='#ffc857'; coins.forEach(c=>{ x.beginPath(); x.arc(c.x,c.y,10,0,7); x.fill(); });
  x.fillStyle='#00e5c0'; x.fillRect(px-12,py-12,24,24);
  x.fillStyle='#fff'; x.fillText('Score: '+score, 12, 24);
  requestAnimationFrame(loop);
}
loop();`,
      "Move with arrows and collect the coins."
    ),

  pong: (title) =>
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
  x.fillStyle='#111'; x.fillRect(0,0,640,400);
  x.fillStyle='#7c5cff'; x.fillRect(paddle,370,100,12);
  x.fillStyle='#00e5c0'; x.beginPath(); x.arc(ball.x,ball.y,8,0,7); x.fill();
  x.fillStyle='#fff'; x.fillText('Score: '+score, 12, 24);
  requestAnimationFrame(loop);
}
loop();`,
      "Move mouse to control the paddle."
    ),

  racer: (title) =>
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
  x.fillStyle='#1a1a2e'; x.fillRect(0,0,640,400);
  x.fillStyle='#333'; x.fillRect(280,0,80,400);
  x.fillStyle='#00e5c0'; x.fillRect(px-15,340,30,40);
  x.fillStyle='#ff4d6d'; obstacles.forEach(o=>x.fillRect(o.x-20,o.y,40,40));
  x.fillStyle='#fff'; x.fillText('Score: '+score, 12, 24);
  requestAnimationFrame(loop);
}
loop();`,
      "Arrow keys to dodge traffic."
    ),

  arcade: (title) =>
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
  x.fillStyle='#0a0a12'; x.fillRect(0,0,640,400);
  x.fillStyle='#00e5c0'; x.fillRect(px-12,py-12,24,24);
  targets.forEach(t => { x.fillStyle = t.enemy ? '#ff4d6d' : '#ffc857'; x.fillRect(t.x-6,t.y-6,12,12); });
  x.fillStyle='#fff'; x.fillText('Score: '+score, 12, 24);
  requestAnimationFrame(loop);
}
loop();`,
      "Arrows to move, Space to shoot."
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
  arcade: "arcade shooter",
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

export async function tryBuildFromCommand(message, activeGame, gamesDir) {
  const text = message.trim();
  if (text.length < 3) return null;

  const buildWords = /\b(make|build|create|add|want|need|game|jump|shoot|move|snake|dodge|collect|race|pong|platform|play|update|change|turn|into)\b/i;
  const isGreeting = /^(hi|hello|hey|thanks|thank you)\b/i.test(text);
  if (isGreeting) return null;
  if (!activeGame && !buildWords.test(text)) return null;

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

  const type = detectGameType(text);
  const label = TYPE_LABELS[type];
  const sameType = meta?.lastBuild === type;

  // Already built this type — guide user instead of looping the same message
  if (activeGame && sameType && meta?.lastPrompt === text) {
    return {
      reply: `Your ${label} is ready. Click the preview, then use arrow keys and space. Say "jump game", "shooter", or "snake" to switch types.`,
      gameUpdated: false,
      activeGameId: game.id,
    };
  }

  const html = TEMPLATES[type](game.name);
  await fs.writeFile(path.join(gamePath, "index.html"), html);

  try {
    const nextMeta = meta || {
      id: game.id,
      name: game.name,
      createdAt: new Date().toISOString(),
    };
    nextMeta.description = text;
    nextMeta.updatedAt = new Date().toISOString();
    nextMeta.lastBuild = type;
    nextMeta.lastPrompt = text;
    await fs.writeFile(metaPath, JSON.stringify(nextMeta, null, 2));
  } catch {
    /* meta optional */
  }

  const reply = created
    ? `Done! Built a ${label}. Click the preview to play, then Ask me to change it.`
    : sameType
      ? `Refreshed your ${label}. Click the preview to play — Ask me anytime for a different game type.`
      : `Switched to a ${label}. Click the preview to play. Say another command whenever you're ready.`;

  return { reply, gameUpdated: true, activeGameId: game.id, gameType: type };
}

export async function tryBuildGame(message, activeGame, gamesDir) {
  return tryBuildFromCommand(message, activeGame, gamesDir);
}
