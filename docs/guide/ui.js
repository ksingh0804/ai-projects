import {
  atlas,
  bootLines,
  chapterCount,
  complete,
  createState,
  plainText,
  run,
} from "./engine.js";

const output = document.querySelector("#output");
const form = document.querySelector("#form");
const command = document.querySelector("#command");
const prompt = document.querySelector("#prompt");
const chips = document.querySelector("#chips");
const robot = document.querySelector("#robot");
const status = document.querySelector("#status");
const termTitle = document.querySelector("#term-title");
const voiceButton = document.querySelector("#voice");
const skipButton = document.querySelector("#skip");
const steps = document.querySelector("#steps");
const atlasRoot = document.querySelector("#atlas");
const sr = document.querySelector("#sr-status");
const start = document.querySelector("#start");
const mapToggle = document.querySelector("#map-toggle");

const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let state = createState();
let voiceOn = localStorage.getItem("archivist-voice") === "on";
let history = [];
let historyAt = 0;
let generation = 0;
let skipTyping = false;
let moodTimer = 0;

renderAtlas();
syncVoiceButton();
setChips(["tour", "projects", "map", "live", "contact"]);

start.addEventListener("click", () => execute("tour"));
mapToggle.addEventListener("click", () => {
  const open = atlasRoot.classList.toggle("open");
  mapToggle.setAttribute("aria-expanded", open ? "true" : "false");
  mapToggle.textContent = open ? "Hide the repository map" : "Show the repository map";
});
form.addEventListener("submit", (event) => {
  event.preventDefault();
  const value = command.value;
  command.value = "";
  if (value.trim()) {
    history = history.filter((item) => item !== value);
    history.push(value);
    if (history.length > 80) history.shift();
  }
  historyAt = history.length;
  execute(value);
});

command.addEventListener("keydown", (event) => {
  if (event.key === "Tab") {
    event.preventDefault();
    const { matches, replacement } = complete(command.value, state);
    if (replacement) command.value = replacement;
    if (matches.length > 1) {
      const line = document.createElement("div");
      line.className = "line dim";
      line.textContent = matches.join("   ");
      output.appendChild(line);
      output.scrollTop = output.scrollHeight;
    }
    return;
  }
  if (event.key === "Escape") {
    skipTyping = true;
    return;
  }
  if (event.key === "ArrowUp") {
    event.preventDefault();
    if (!history.length) return;
    historyAt = Math.max(0, historyAt - 1);
    command.value = history[historyAt] ?? "";
    return;
  }
  if (event.key === "ArrowDown") {
    event.preventDefault();
    if (!history.length) return;
    historyAt = Math.min(history.length, historyAt + 1);
    command.value = history[historyAt] ?? "";
  }
});

voiceButton.addEventListener("click", () => {
  voiceOn = !voiceOn;
  localStorage.setItem("archivist-voice", voiceOn ? "on" : "off");
  if (!voiceOn && window.speechSynthesis) window.speechSynthesis.cancel();
  syncVoiceButton();
});

skipButton.addEventListener("click", () => {
  skipTyping = true;
});

window.addEventListener("keydown", (event) => {
  const tag = document.activeElement && document.activeElement.tagName;
  if (event.key === "/" && tag !== "INPUT" && tag !== "TEXTAREA") {
    event.preventDefault();
    command.focus();
  }
});

const params = new URLSearchParams(location.search);
const initial = (params.get("cmd") || "").slice(0, 80);
boot(initial);

function boot(initialCommand) {
  printBlock({ lines: bootLines(), speech: "", mood: "talk", suggestions: ["tour", "projects", "map", "help"] }, false).then(() => {
    if (initialCommand) execute(initialCommand, false);
    else if (window.matchMedia("(min-width: 900px)").matches) command.focus();
  });
}

function execute(raw, echo = true) {
  generation += 1;
  skipTyping = false;
  if (window.speechSynthesis) window.speechSynthesis.cancel();
  const response = run(raw, state);
  if (response.cwd) state.cwd = response.cwd;
  if (response.chapter != null) state.chapter = response.chapter;
  if (response.focus != null) state.focus = response.focus;
  if (response.voice) {
    voiceOn = response.voice === "on";
    localStorage.setItem("archivist-voice", voiceOn ? "on" : "off");
    syncVoiceButton();
  }
  if (response.clear) output.replaceChildren();
  updateChrome();
  const gen = generation;
  printBlock(response, echo && raw.trim() ? raw.trim() : "", gen);
}

function updateChrome() {
  const where = state.cwd === "/" ? "~" : `~${state.cwd}`;
  prompt.textContent = `visitor@ksingh0804:${where}$`;
  const total = chapterCount();
  termTitle.textContent = state.chapter ? `briefing ${state.chapter}/${total}` : "visitor@ksingh0804";
  for (const step of steps.querySelectorAll("li")) {
    const n = Number(step.dataset.step);
    step.classList.toggle("done", state.chapter > n);
    step.classList.toggle("now", state.chapter === n);
    if (state.chapter === n) step.setAttribute("aria-current", "step");
    else step.removeAttribute("aria-current");
  }
  start.textContent = state.chapter ? "Replay the briefing" : "Start the briefing";
  for (const button of atlasRoot.querySelectorAll("button")) {
    button.classList.toggle("active", button.dataset.id === state.focus);
  }
}

function renderAtlas() {
  for (const group of atlas()) {
    const block = document.createElement("section");
    block.className = "atlas-group";
    const title = document.createElement("p");
    title.className = "kicker";
    title.textContent = group.label;
    const list = document.createElement("div");
    list.className = "atlas-list";
    for (const item of group.items) {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.id = item.id;
      button.innerHTML = `<strong></strong><small></small>`;
      button.querySelector("strong").textContent = item.name;
      button.querySelector("small").textContent = item.note;
      button.addEventListener("click", () => execute(`open ${item.id}`));
      list.appendChild(button);
    }
    block.append(title, list);
    atlasRoot.appendChild(block);
  }
}

function setChips(labels) {
  chips.replaceChildren();
  for (const label of labels) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "chip";
    button.textContent = label;
    button.addEventListener("click", () => execute(label));
    chips.appendChild(button);
  }
}

function syncVoiceButton() {
  voiceButton.setAttribute("aria-pressed", voiceOn ? "true" : "false");
  voiceButton.textContent = voiceOn ? "Voice on" : "Voice off";
}

function setMood(mood) {
  robot.dataset.mood = mood || "idle";
  status.textContent = mood === "talk" ? "Speaking" : mood === "alert" ? "Try another command" : "Ready";
  window.clearTimeout(moodTimer);
  if (mood && mood !== "idle") {
    moodTimer = window.setTimeout(() => {
      robot.dataset.mood = "idle";
      status.textContent = "Ready";
    }, 1400);
  }
}

async function printBlock(response, echo, gen = generation) {
  skipButton.hidden = reduced;
  setMood(response.mood || "talk");
  if (echo) {
    const row = document.createElement("div");
    row.className = "line echo";
    const ps1 = document.createElement("span");
    ps1.className = "ps1";
    ps1.textContent = `${prompt.textContent} `;
    row.append(ps1, document.createTextNode(echo));
    output.appendChild(row);
  }
  for (const line of response.lines) {
    if (gen !== generation) return;
    await reveal(line, gen);
    output.scrollTop = output.scrollHeight;
  }
  if (gen !== generation) return;
  skipButton.hidden = true;
  setChips(response.suggestions || []);
  const spoken = response.speech || "";
  sr.textContent = spoken || plainText(response.lines).replace(/\s+/g, " ").trim().slice(0, 280);
  if (voiceOn && spoken) speak(spoken);
  setMood("idle");
  updateChrome();
}

function reveal(line, gen) {
  if (line.type === "gap") {
    const gap = document.createElement("div");
    gap.className = "line gap";
    output.appendChild(gap);
    return Promise.resolve();
  }
  if (line.type === "actions") {
    const row = document.createElement("div");
    row.className = "actions";
    for (const item of line.items || []) {
      if (item.href) {
        const link = document.createElement("a");
        link.href = item.href;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = item.label;
        row.appendChild(link);
      } else if (item.command) {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = item.label;
        button.addEventListener("click", () => execute(item.command));
        row.appendChild(button);
      }
    }
    output.appendChild(row);
    return Promise.resolve();
  }
  const el = document.createElement("div");
  el.className = `line ${line.kind || "text"}`;
  output.appendChild(el);
  const full = line.text || "";
  if (line.type === "link") {
    const link = document.createElement("a");
    link.href = line.href;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    el.appendChild(link);
    return typeInto(link, full, gen);
  }
  return typeInto(el, full, gen);
}

function typeInto(node, full, gen) {
  if (reduced || skipTyping || full.length < 2) {
    node.textContent = full;
    return Promise.resolve();
  }
  const step = full.length > 80 ? 4 : 1;
  const delay = full.length > 80 ? 5 : 8;
  return new Promise((resolve) => {
    let index = 0;
    const tick = () => {
      if (gen !== generation) return resolve();
      if (skipTyping) {
        node.textContent = full;
        return resolve();
      }
      index = Math.min(full.length, index + step);
      node.textContent = full.slice(0, index);
      output.scrollTop = output.scrollHeight;
      if (index >= full.length) resolve();
      else window.setTimeout(tick, delay);
    };
    tick();
  });
}

function speak(value) {
  if (!window.speechSynthesis) return;
  const utterance = new SpeechSynthesisUtterance(value);
  utterance.rate = 1.02;
  utterance.pitch = 0.96;
  const voice = window.speechSynthesis.getVoices().find((item) => /en[-_]/i.test(item.lang));
  if (voice) utterance.voice = voice;
  window.speechSynthesis.speak(utterance);
}
