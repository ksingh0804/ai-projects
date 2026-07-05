/* Steady — app logic: navigation, state, and wiring for all tools. */
(function () {
  "use strict";
  var C = window.STEADY_CONTENT;
  var KEY = "steady_v1";

  /* ---------------- State ---------------- */
  var state = load();

  function load() {
    try {
      var s = JSON.parse(localStorage.getItem(KEY));
      if (s && typeof s === "object") return s;
    } catch (e) {}
    return { streak: { count: 0, lastDay: null }, log: [], challengesDone: 0, ladder: [], largeText: false };
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} }

  function todayKey() { return new Date().toISOString().slice(0, 10); }
  function yesterdayKey() { var d = new Date(); d.setDate(d.getDate() - 1); return d.toISOString().slice(0, 10); }

  function markPractice(label) {
    var t = todayKey();
    if (state.streak.lastDay !== t) {
      state.streak.count = state.streak.lastDay === yesterdayKey() ? state.streak.count + 1 : 1;
      state.streak.lastDay = t;
    }
    addLog(label || "Practiced");
    save();
    renderHome();
    renderProgress();
  }
  function addLog(text) {
    state.log.unshift({ t: Date.now(), text: text });
    state.log = state.log.slice(0, 60);
  }

  /* ---------------- Navigation ---------------- */
  var navBtns = document.querySelectorAll(".nav-btn");
  var views = document.querySelectorAll(".view");
  function go(view) {
    navBtns.forEach(function (b) { b.classList.toggle("is-active", b.dataset.view === view); });
    views.forEach(function (v) { v.classList.toggle("is-active", v.id === "view-" + view); });
    // Echo (DAF) and the metronome are practice aids meant to run WHILE you use other
    // tabs (e.g. Echo on while reading), so they keep playing until you explicitly stop
    // them from their own tab. Only stop the view-local animations/timers on navigation.
    if (view !== "breathing") stopBreath();
    if (view !== "reading") stopReading();
    if (("#" + view) !== location.hash) location.hash = view;
    document.getElementById("main").focus();
  }
  var validViews = {};
  navBtns.forEach(function (b) {
    validViews[b.dataset.view] = true;
    b.addEventListener("click", function () { go(b.dataset.view); });
  });
  document.querySelectorAll("[data-goto]").forEach(function (el) {
    el.addEventListener("click", function () { go(el.dataset.goto); });
  });
  // Deep-linking: open directly to a tab via URL hash (e.g. .../#progress).
  window.addEventListener("hashchange", function () {
    var v = location.hash.slice(1);
    if (validViews[v]) go(v);
  });

  /* ---------------- Text size ---------------- */
  var tsBtn = document.getElementById("textsize-btn");
  function applyTextSize() { document.body.classList.toggle("large-text", !!state.largeText); }
  tsBtn.addEventListener("click", function () { state.largeText = !state.largeText; applyTextSize(); save(); });
  applyTextSize();

  /* ---------------- TTS helper ---------------- */
  function speak(text, rate) {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(text);
    u.rate = rate || 0.8;
    u.pitch = 1;
    window.speechSynthesis.speak(u);
  }

  /* ---------------- Home ---------------- */
  var challengeIdx = dayOfYear() % C.dailyChallenges.length;
  function dayOfYear() { var n = new Date(); var s = new Date(n.getFullYear(), 0, 0); return Math.floor((n - s) / 86400000); }

  function renderHome() {
    document.getElementById("streak-count").textContent = state.streak.count;
    var sub = document.getElementById("streak-sub");
    if (state.streak.lastDay === todayKey()) sub.textContent = "Logged today — nice. Keep it going.";
    else if (state.streak.count > 0) sub.textContent = "Practice today to keep your streak alive.";
    else sub.textContent = "Do anything today to start your streak.";
    document.getElementById("daily-challenge").textContent = C.dailyChallenges[challengeIdx];
  }
  document.getElementById("log-practice-btn").addEventListener("click", function () { markPractice("Logged a practice day"); });
  document.getElementById("new-challenge-btn").addEventListener("click", function () {
    challengeIdx = (challengeIdx + 1) % C.dailyChallenges.length; renderHome();
  });
  document.getElementById("done-challenge-btn").addEventListener("click", function () {
    state.challengesDone = (state.challengesDone || 0) + 1;
    markPractice("Brave challenge: " + C.dailyChallenges[challengeIdx]);
  });

  /* ---------------- DAF (Echo) ---------------- */
  var dafBtn = document.getElementById("daf-toggle");
  var dafControls = document.getElementById("daf-controls");
  var dafDot = document.getElementById("daf-dot");
  var dafStateEl = document.getElementById("daf-state");

  function dafOpts() {
    return {
      delayMs: +document.getElementById("daf-delay").value,
      pitch: (+document.getElementById("daf-pitch").value) / 6, // -1..1
      volume: (+document.getElementById("daf-vol").value) / 100,
      masking: (+document.getElementById("daf-mask").value) / 100,
    };
  }
  async function toggleDaf(forceStop) {
    if (window.SteadyAudio.isRunning() || forceStop) {
      window.SteadyAudio.stop();
      dafBtn.textContent = "Start Echo";
      dafDot.classList.remove("live");
      dafStateEl.textContent = "Stopped";
      dafControls.setAttribute("aria-hidden", "true");
      return;
    }
    try {
      await window.SteadyAudio.start(dafOpts());
      dafBtn.textContent = "Stop Echo";
      dafDot.classList.add("live");
      dafStateEl.textContent = "Live — speak into your mic";
      dafControls.setAttribute("aria-hidden", "false");
      markPractice("Used Echo (altered auditory feedback)");
    } catch (e) {
      dafStateEl.textContent = "Mic blocked — allow microphone access and use http (not file://).";
    }
  }
  dafBtn.addEventListener("click", function () { toggleDaf(false); });
  [["daf-delay", "daf-delay-val"], ["daf-pitch", "daf-pitch-val"], ["daf-vol", "daf-vol-val"], ["daf-mask", "daf-mask-val"]].forEach(function (p) {
    var input = document.getElementById(p[0]);
    var out = document.getElementById(p[1]);
    input.addEventListener("input", function () {
      out.textContent = input.value;
      if (window.SteadyAudio.isRunning()) window.SteadyAudio.apply(dafOpts());
    });
  });

  /* ---------------- Pacing (metronome) ---------------- */
  var metroBtn = document.getElementById("metro-toggle");
  var pulse = document.getElementById("pulse");
  var bpmInput = document.getElementById("bpm");
  var bpmVal = document.getElementById("bpm-val");
  bpmInput.addEventListener("input", function () {
    bpmVal.textContent = bpmInput.value;
    if (window.SteadyMetronome.isRunning()) window.SteadyMetronome.setBpm(+bpmInput.value);
  });
  function stopMetro() {
    window.SteadyMetronome.stop();
    metroBtn.textContent = "Start metronome";
    pulse.classList.remove("beat", "accent");
  }
  metroBtn.addEventListener("click", function () {
    if (window.SteadyMetronome.isRunning()) { stopMetro(); return; }
    var accent = document.getElementById("metro-accent").checked;
    window.SteadyMetronome.start(+bpmInput.value, function (b) {
      var isAccent = accent && b % 4 === 0;
      pulse.classList.add("beat");
      pulse.classList.toggle("accent", isAccent);
      setTimeout(function () { pulse.classList.remove("beat", "accent"); }, 90);
    }, accent);
    metroBtn.textContent = "Stop metronome";
    markPractice("Practiced rhythmic pacing");
  });

  /* ---------------- Breathing ---------------- */
  var breathSelect = document.getElementById("breath-pattern");
  var breathBtn = document.getElementById("breath-toggle");
  var orb = document.getElementById("breath-orb");
  var orbLabel = document.getElementById("breath-label");
  var breathTimer = null;
  Object.keys(C.breathing).forEach(function (k) {
    var o = document.createElement("option");
    o.value = k; o.textContent = C.breathing[k].name; breathSelect.appendChild(o);
  });
  function stopBreath() {
    if (breathTimer) clearTimeout(breathTimer);
    breathTimer = null;
    breathBtn.textContent = "Start";
    orb.className = "breath-orb";
    orbLabel.textContent = "Ready";
  }
  function runBreath() {
    var phases = C.breathing[breathSelect.value].phases;
    var i = 0;
    function step() {
      var ph = phases[i % phases.length];
      var label = ph[0], secs = ph[1];
      orbLabel.textContent = label + " · " + secs;
      orb.style.setProperty("--breath-dur", secs + "s");
      orb.classList.remove("inhale", "exhale");
      if (/in/i.test(label)) orb.classList.add("inhale");
      else if (/out|speak/i.test(label)) orb.classList.add("exhale");
      i++;
      breathTimer = setTimeout(step, secs * 1000);
    }
    step();
  }
  breathBtn.addEventListener("click", function () {
    if (breathTimer) { stopBreath(); return; }
    breathBtn.textContent = "Stop";
    runBreath();
    markPractice("Did a breathing exercise");
  });

  /* ---------------- Techniques ---------------- */
  var techList = document.getElementById("technique-list");
  C.techniques.forEach(function (t) {
    var card = document.createElement("div");
    card.className = "tech-card";
    var drillChips = t.drill.map(function (d) { return '<button class="chip" data-say="' + escapeAttr(d) + '">' + escapeHtml(d) + " 🔊</button>"; }).join("");
    card.innerHTML =
      '<div class="tech-fam">' + t.family + "</div>" +
      "<h3>" + escapeHtml(t.name) + "</h3>" +
      '<p class="short">' + escapeHtml(t.short) + "</p>" +
      '<div class="tech-detail">' +
        "<p>" + escapeHtml(t.why) + "</p>" +
        "<ol>" + t.steps.map(function (s) { return "<li>" + escapeHtml(s) + "</li>"; }).join("") + "</ol>" +
        '<p class="muted small">Practice (tap to hear, slow):</p><div class="drill">' + drillChips + "</div>" +
      "</div>";
    card.addEventListener("click", function (e) {
      if (e.target.classList.contains("chip")) { speak(e.target.dataset.say, 0.55); return; }
      card.classList.toggle("open");
      if (card.classList.contains("open")) markPractice("Studied technique: " + t.name);
    });
    techList.appendChild(card);
  });

  /* ---------------- Reading ---------------- */
  var passageSelect = document.getElementById("passage-select");
  var readBox = document.getElementById("reading-box");
  var wpmInput = document.getElementById("wpm");
  var wpmVal = document.getElementById("wpm-val");
  var readBtn = document.getElementById("read-toggle");
  var readNewBtn = document.getElementById("read-new");
  var readTimer = null;

  // Seeded PRNG (mulberry32) so a date seed gives a stable, reproducible passage.
  function mulberry32(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function dayNumber() {
    // whole days since epoch (UTC-stable per calendar day locally)
    return Math.floor((Date.now() - new Date().getTimezoneOffset() * 60000) / 86400000);
  }
  function pick(arr, rnd) { return arr[Math.floor(rnd() * arr.length)]; }
  function pickN(arr, n, rnd) {
    var copy = arr.slice(), out = [];
    for (var i = 0; i < n && copy.length; i++) out.push(copy.splice(Math.floor(rnd() * copy.length), 1)[0]);
    return out;
  }
  function seededShuffle(arr, seed) {
    var rnd = mulberry32(seed), a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rnd() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function titleCase(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  // Build one topic passage (intro + 2–3 middles + closer), seeded for reproducibility.
  function makeTopicPassage(topic, seed) {
    var d = C.readingTopics;
    var rnd = mulberry32(seed);
    var fill = function (s) { return s.replace("{t}", topic); };
    var nMid = 2 + Math.floor(rnd() * 2); // 2–3 middles
    var sentences = [fill(pick(d.intros, rnd))].concat(pickN(d.middles, nMid, rnd), [fill(pick(d.closers, rnd))]);
    return { level: "Daily 50", title: titleCase(topic), text: sentences.join(" ") };
  }

  // Today's 50 topics — a date-seeded shuffle of the subject bank, so the set, order,
  // and wording are new every day and differ from yesterday.
  var daySeed = dayNumber();
  // Stable global order of all subjects; each day takes the next 50-topic window,
  // so consecutive days are disjoint (no overlap with yesterday). Wording is
  // re-seeded per day so even eventual repeats read differently.
  function buildDailySet(day) {
    var base = seededShuffle(C.readingTopics.subjects, 987654321);
    var len = base.length, n = Math.min(50, len);
    var start = ((day * n) % len + len) % len;
    var set = [];
    for (var i = 0; i < n; i++) set.push(makeTopicPassage(base[(start + i) % len], day * 131 + i + 1));
    return set;
  }
  var dailySet = buildDailySet(daySeed);

  var customText = document.getElementById("custom-text");
  if (customText && state.customText) customText.value = state.customText;
  function currentPassage() {
    var v = passageSelect.value;
    if (v.charAt(0) === "d") return dailySet[+v.slice(1)];
    if (v === "custom") {
      var t = (customText.value || "").trim();
      return { level: "Custom", title: "Your text", text: t || "Type or paste your own text above, then press Start." };
    }
    return C.passages[+v];
  }

  // Build the dropdown: Today's 50 topics, then your-own-text, then the calm library.
  var todayStr = new Date().toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
  var gDaily = document.createElement("optgroup");
  gDaily.label = "★ Today's 50 topics · " + todayStr + " (new daily)";
  dailySet.forEach(function (p, i) {
    var o = document.createElement("option"); o.value = "d" + i;
    o.textContent = (i + 1) + ". " + p.title;
    gDaily.appendChild(o);
  });
  passageSelect.appendChild(gDaily);

  var gCustom = document.createElement("optgroup");
  gCustom.label = "Your text";
  var customOpt = document.createElement("option");
  customOpt.value = "custom"; customOpt.textContent = "✎ Your own text";
  gCustom.appendChild(customOpt);
  passageSelect.appendChild(gCustom);

  var gLib = document.createElement("optgroup");
  gLib.label = "Calm library";
  C.passages.forEach(function (p, i) {
    var o = document.createElement("option"); o.value = "" + i;
    o.textContent = (p.level ? p.level + " · " : "") + p.title;
    gLib.appendChild(o);
  });
  passageSelect.appendChild(gLib);
  passageSelect.value = "d0";

  function renderPassage() {
    var p = currentPassage();
    readBox.innerHTML = p.text.split(/\s+/).map(function (w, i) { return '<span class="w" data-i="' + i + '">' + escapeHtml(w) + "</span>"; }).join(" ");
  }
  function stopReading() {
    if (readTimer) clearInterval(readTimer);
    readTimer = null;
    readBtn.textContent = "Start";
    readBox.querySelectorAll(".w").forEach(function (w) { w.classList.remove("active", "done"); });
  }
  function updateNewBtn() {
    if (readNewBtn) readNewBtn.style.display = passageSelect.value.charAt(0) === "d" ? "" : "none";
    if (customText) customText.style.display = passageSelect.value === "custom" ? "" : "none";
  }
  passageSelect.addEventListener("change", function () { stopReading(); updateNewBtn(); renderPassage(); });
  updateNewBtn();
  if (customText) customText.addEventListener("input", function () {
    state.customText = customText.value; save();
    if (passageSelect.value === "custom") { stopReading(); renderPassage(); }
  });
  wpmInput.addEventListener("input", function () { wpmVal.textContent = wpmInput.value; });
  readBtn.addEventListener("click", function () {
    if (readTimer) { stopReading(); return; }
    var words = readBox.querySelectorAll(".w");
    if (!words.length) renderPassage();
    words = readBox.querySelectorAll(".w");
    var i = 0;
    var interval = 60000 / (+wpmInput.value);
    readBtn.textContent = "Stop";
    markPractice("Paced reading practice");
    readTimer = setInterval(function () {
      words.forEach(function (w, j) { w.classList.toggle("active", j === i); w.classList.toggle("done", j < i); });
      i++;
      if (i > words.length) stopReading();
    }, interval);
  });
  if (readNewBtn) readNewBtn.addEventListener("click", function () {
    // Jump to a random topic from today's 50 for extra practice.
    var idx = Math.floor(Math.random() * dailySet.length);
    passageSelect.value = "d" + idx;
    stopReading(); updateNewBtn(); renderPassage();
  });
  document.getElementById("read-speak").addEventListener("click", function () {
    speak(currentPassage().text, 0.7);
  });

  /* ---------------- Confidence: ladder ---------------- */
  var ladderList = document.getElementById("ladder-list");
  function renderLadder() {
    ladderList.innerHTML = "";
    if (!state.ladder.length) { ladderList.innerHTML = '<li class="muted">No items yet. Add a situation you tend to avoid.</li>'; return; }
    state.ladder.sort(function (a, b) { return a.suds - b.suds; });
    state.ladder.forEach(function (item) {
      var li = document.createElement("li");
      li.className = item.done ? "done" : "";
      li.innerHTML =
        '<input type="checkbox" ' + (item.done ? "checked" : "") + ' aria-label="Done" />' +
        '<span class="ladder-name">' + escapeHtml(item.name) + "</span>" +
        '<span class="ladder-suds">fear ' + item.suds + "</span>" +
        '<button class="ladder-del" title="Remove">×</button>';
      li.querySelector("input").addEventListener("change", function (e) {
        item.done = e.target.checked; save(); renderLadder();
        if (item.done) markPractice("Faced a fear: " + item.name);
      });
      li.querySelector(".ladder-del").addEventListener("click", function () {
        state.ladder = state.ladder.filter(function (x) { return x.id !== item.id; }); save(); renderLadder();
      });
      ladderList.appendChild(li);
    });
  }
  document.getElementById("ladder-add").addEventListener("click", addLadder);
  document.getElementById("ladder-input").addEventListener("keydown", function (e) { if (e.key === "Enter") addLadder(); });
  function addLadder() {
    var input = document.getElementById("ladder-input");
    var suds = document.getElementById("ladder-suds");
    var name = input.value.trim();
    if (!name) return;
    state.ladder.push({ id: Date.now() + "" + Math.random(), name: name, suds: Math.max(0, Math.min(100, +suds.value || 0)), done: false });
    input.value = ""; save(); renderLadder();
  }
  document.getElementById("ladder-suggest").addEventListener("click", function () {
    var used = state.ladder.map(function (x) { return x.name; });
    var pick = C.exposureSuggestions.filter(function (s) { return used.indexOf(s) < 0; });
    if (!pick.length) return;
    var s = pick[Math.floor(Math.random() * pick.length)];
    state.ladder.push({ id: Date.now() + "" + Math.random(), name: s, suds: 40, done: false });
    save(); renderLadder();
  });

  /* ---------------- Confidence: disclosure ---------------- */
  var discSelect = document.getElementById("disclosure-select");
  var discPreview = document.getElementById("disclosure-preview");
  C.disclosureTemplates.forEach(function (t, i) { var o = document.createElement("option"); o.value = i; o.textContent = t; discSelect.appendChild(o); });
  function renderDisclosure() { discPreview.textContent = "“" + C.disclosureTemplates[+discSelect.value] + "”"; }
  discSelect.addEventListener("change", renderDisclosure);
  document.getElementById("disclosure-speak").addEventListener("click", function () { speak(C.disclosureTemplates[+discSelect.value], 0.85); });

  /* ---------------- Confidence: CBT ---------------- */
  var cbtSelect = document.getElementById("cbt-select");
  C.cbtThoughts.forEach(function (t, i) { var o = document.createElement("option"); o.value = i; o.textContent = t.unhelpful; cbtSelect.appendChild(o); });
  function renderCbt() {
    var t = C.cbtThoughts[+cbtSelect.value];
    document.getElementById("cbt-bad").textContent = t.unhelpful;
    document.getElementById("cbt-good").textContent = t.balanced;
  }
  cbtSelect.addEventListener("change", renderCbt);

  /* ---------------- Learn ---------------- */
  var factsList = document.getElementById("facts-list");
  C.facts.forEach(function (f) {
    var d = document.createElement("div"); d.className = "fact";
    d.innerHTML = '<p class="m"><span class="tag">Myth</span> ' + escapeHtml(f.myth) + '</p><p class="f"><span class="tag">Fact</span> ' + escapeHtml(f.fact) + "</p>";
    factsList.appendChild(d);
  });
  var resLinks = document.getElementById("resource-links");
  C.facLinks.forEach(function (l) {
    var li = document.createElement("li");
    li.innerHTML = '<a href="' + l.url + '" target="_blank" rel="noopener">' + escapeHtml(l.label) + " ↗</a>";
    resLinks.appendChild(li);
  });

  /* ---------------- Progress ---------------- */
  function renderProgress() {
    var stats = document.getElementById("progress-stats");
    var faced = state.ladder.filter(function (x) { return x.done; }).length;
    var data = [
      ["Day streak", state.streak.count],
      ["Sessions logged", state.log.length],
      ["Brave challenges", state.challengesDone || 0],
      ["Fears faced", faced],
    ];
    stats.innerHTML = data.map(function (d) { return '<div class="stat"><div class="n">' + d[1] + '</div><div class="l">' + d[0] + "</div></div>"; }).join("");
    var log = document.getElementById("activity-log");
    if (!state.log.length) { log.innerHTML = '<li class="muted">No activity yet.</li>'; return; }
    log.innerHTML = state.log.map(function (e) {
      return "<li><span>" + escapeHtml(e.text) + '</span><span class="when">' + relTime(e.t) + "</span></li>";
    }).join("");
  }
  document.getElementById("reset-data").addEventListener("click", function () {
    if (!confirm("Erase all your Steady data on this device?")) return;
    localStorage.removeItem(KEY);
    state = load();
    renderAll();
  });

  /* ---------------- Utils ---------------- */
  function escapeHtml(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function escapeAttr(s) { return escapeHtml(s).replace(/'/g, "&#39;"); }
  function relTime(t) {
    var s = (Date.now() - t) / 1000;
    if (s < 60) return "just now";
    if (s < 3600) return Math.floor(s / 60) + "m ago";
    if (s < 86400) return Math.floor(s / 3600) + "h ago";
    return Math.floor(s / 86400) + "d ago";
  }

  /* ---------------- Init ---------------- */
  function renderAll() {
    renderHome(); renderPassage(); renderLadder(); renderDisclosure(); renderCbt(); renderProgress();
  }
  renderAll();
  // Honor a deep-link hash on load (e.g. .../#progress opens the Progress tab).
  (function () { var v = location.hash.slice(1); if (validViews[v]) go(v); })();
  window.addEventListener("beforeunload", function () {
    window.SteadyAudio.stop(); window.SteadyMetronome.stop(); window.speechSynthesis && window.speechSynthesis.cancel();
  });
})();
