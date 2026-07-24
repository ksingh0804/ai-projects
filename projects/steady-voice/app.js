/* Steady — app logic: navigation, state, and wiring for all tools. */
(function () {
  "use strict";
  var C = window.STEADY_CONTENT;
  var KEY = "steady_v1";
  var DEFAULT_STATE = {
    streak: { count: 0, lastDay: null },
    log: [],
    challengesDone: 0,
    ladder: [],
    largeText: false,
    customText: "",
    mission: { day: null, done: [], active: false, step: 0 },
    onboarded: false,
    practiceDays: {},
    lastTip: null,
    describe: { sceneId: null, fields: {}, modelOpen: false },
  };

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) {
        var s = JSON.parse(raw);
        if (s && typeof s === "object") {
          if (!s.streak || typeof s.streak !== "object") s.streak = { count: 0, lastDay: null };
          if (typeof s.streak.count !== "number") s.streak.count = 0;
          if (s.streak.lastDay !== null && typeof s.streak.lastDay !== "string") s.streak.lastDay = null;
          if (!Array.isArray(s.log)) s.log = [];
          if (!Array.isArray(s.ladder)) s.ladder = [];
          if (typeof s.challengesDone !== "number") s.challengesDone = 0;
          if (typeof s.customText !== "string") s.customText = "";
          if (!s.mission || typeof s.mission !== "object") s.mission = { day: null, done: [], active: false, step: 0 };
          if (!Array.isArray(s.mission.done)) s.mission.done = [];
          if (typeof s.onboarded !== "boolean") s.onboarded = false;
          if (!s.practiceDays || typeof s.practiceDays !== "object") s.practiceDays = {};
          if (s.lastTip != null && typeof s.lastTip !== "string") s.lastTip = null;
          if (!s.describe || typeof s.describe !== "object") s.describe = { sceneId: null, fields: {}, modelOpen: false };
          if (!s.describe.fields || typeof s.describe.fields !== "object") s.describe.fields = {};
          return s;
        }
      }
    } catch (e) {}
    return JSON.parse(JSON.stringify(DEFAULT_STATE));
  }

  /* ---------------- State ---------------- */
  var state = load();
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} }

  function todayKey() { return new Date().toISOString().slice(0, 10); }
  function yesterdayKey() { var d = new Date(); d.setDate(d.getDate() - 1); return d.toISOString().slice(0, 10); }

  function markPractice(label, meta) {
    var t = todayKey();
    if (state.streak.lastDay !== t) {
      state.streak.count = state.streak.lastDay === yesterdayKey() ? state.streak.count + 1 : 1;
      state.streak.lastDay = t;
    }
    if (!state.practiceDays) state.practiceDays = {};
    state.practiceDays[t] = true;
    addLog(label || "Practiced");
    save();
    renderHome();
    renderProgress();
    toast(label || "Practiced");
    if (meta && meta.missionStep) completeMissionStep(meta.missionStep);
    if (meta && meta.syncFile) syncProgressEntry(meta);
  }
  function showError(msg) {
    var el = document.getElementById("error-banner");
    if (!el) return;
    el.textContent = msg;
    el.hidden = false;
    clearTimeout(showError._t);
    showError._t = setTimeout(function () { el.hidden = true; }, 5000);
  }
  function syncOfflineBanner() {
    var el = document.getElementById("offline-banner");
    if (el) el.hidden = navigator.onLine !== false;
  }
  window.addEventListener("online", syncOfflineBanner);
  window.addEventListener("offline", syncOfflineBanner);
  syncOfflineBanner();
  function addLog(text) {
    state.log.unshift({ t: Date.now(), text: text });
    state.log = state.log.slice(0, 60);
  }

  /* ---------------- Personal progress file sync ---------------- */
  var progressEntries = [];
  var lastCorrections = [];
  var P = window.SteadyProgress;

  async function fetchProgress() {
    try {
      var res = await fetch("/api/progress");
      if (!res.ok) return;
      var data = await res.json();
      progressEntries = data.entries || [];
      if (data.summary && data.summary.last && data.summary.last.corrections) {
        lastCorrections = data.summary.last.corrections;
      }
      renderPersonalProgress();
    } catch (e) { /* offline / file:// */ }
  }

  async function syncProgressEntry(meta) {
    if (!P) return;
    var analysis = meta.analysis || {
      score: meta.score != null ? meta.score : 72,
      repetitions: [],
      fillers: [],
      missing: [],
      issues: meta.issues || [],
    };
    var corrections = meta.corrections || P.buildNextTimeCorrections(analysis, {
      tool: meta.tool,
      tension: meta.tension,
      hard: meta.hard,
      promptTip: meta.promptTip,
    });
    lastCorrections = corrections.map(function (c) { return typeof c === "string" ? c : c.text; });
    var entry = P.buildSessionEntry({
      tool: meta.tool || "practice",
      title: meta.title || meta.label || "Practice",
      target: meta.target || "",
      spoken: meta.spoken || "",
      analysis: analysis,
      tension: meta.tension,
      corrections: corrections,
    });
    var entries = [entry].concat(progressEntries).slice(0, 100);
    var summary = P.summarizeProgress(entries);
    var markdown = P.formatProgressMarkdown(entries, summary);
    try {
      var res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entry: entry, summary: summary, markdown: markdown }),
      });
      if (res.ok) {
        progressEntries = entries;
        renderPersonalProgress();
      }
    } catch (e) { /* keep local UI even if file write fails */ }
    return { entry: entry, corrections: corrections, summary: summary };
  }

  function renderPersonalProgress() {
    var trendEl = document.getElementById("progress-trend");
    var tipsEl = document.getElementById("progress-next-tips");
    var metaEl = document.getElementById("progress-file-meta");
    if (!trendEl || !P) return;
    var summary = P.summarizeProgress(progressEntries);
    trendEl.textContent = summary.trend.text + (summary.avg != null ? " · avg " + summary.avg : "");
    if (lastCorrections.length) {
      tipsEl.innerHTML = lastCorrections.map(function (t) { return "<li>" + escapeHtml(t) + "</li>"; }).join("");
    } else if (summary.last && summary.last.corrections && summary.last.corrections.length) {
      tipsEl.innerHTML = summary.last.corrections.map(function (t) { return "<li>" + escapeHtml(t) + "</li>"; }).join("");
    } else {
      tipsEl.innerHTML = '<li class="muted">Finish a reading-aloud round to unlock corrections.</li>';
    }
    if (metaEl) {
      metaEl.textContent = summary.sessions
        ? summary.sessions + " sessions in PERSONAL-PROGRESS.md · updates live after each check-in"
        : "Sessions save to PERSONAL-PROGRESS.md in real time.";
    }
  }

  /* ---------------- Navigation ---------------- */
  var navBtns = document.querySelectorAll(".nav-btn");
  var views = document.querySelectorAll(".view");
  var mobileNavBtns = document.querySelectorAll(".mobile-nav-btn");
  function go(view) {
    navBtns.forEach(function (b) { b.classList.toggle("is-active", b.dataset.view === view); });
    mobileNavBtns.forEach(function (b) { b.classList.toggle("is-active", b.dataset.view === view); });
    views.forEach(function (v) { v.classList.toggle("is-active", v.id === "view-" + view); });
    // Echo (DAF) and the metronome are practice aids meant to run WHILE you use other
    // tabs (e.g. Echo on while reading), so they keep playing until you explicitly stop
    // them from their own tab. Only stop the view-local animations/timers on navigation.
    if (view !== "breathing") stopBreath();
    if (view !== "reading") { stopReading(); stopLiveListen(); }
    if (view === "reading") renderLastTipBanner();
    if (("#" + view) !== location.hash) location.hash = view;
    document.getElementById("main").focus();
  }
  var validViews = {};
  navBtns.forEach(function (b) {
    validViews[b.dataset.view] = true;
    b.addEventListener("click", function () { go(b.dataset.view); });
  });
  mobileNavBtns.forEach(function (b) {
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

  /* ---------------- Toast + guided mission ---------------- */
  var toastEl = document.getElementById("toast");
  var toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.hidden = true; }, 2200);
  }

  var MISSION_STEPS = [
    { id: "breathing", label: "Breathe (2 min)", view: "breathing", tip: "Start a breathing pattern, then mark done." },
    { id: "techniques", label: "Open a technique", view: "techniques", tip: "Open one technique card and try a drill chip." },
    { id: "reading", label: "Read aloud once", view: "reading", tip: "Use Practice aloud or Start pace on today's topic." },
    { id: "interview", label: "One interview answer", view: "interview", tip: "Reveal or practice one Daily 10 answer." },
    { id: "checkin", label: "Log today's practice", view: "home", tip: "Tap I practiced today or finish your brave challenge." },
  ];

  function ensureMissionDay() {
    if (!state.mission) state.mission = { day: null, done: [], active: false, step: 0 };
    if (state.mission.day !== todayKey()) {
      state.mission = { day: todayKey(), done: [], active: false, step: 0 };
      save();
    }
  }

  function completeMissionStep(id) {
    ensureMissionDay();
    if (state.mission.done.indexOf(id) >= 0) { renderMission(); return; }
    state.mission.done.push(id);
    if (state.mission.active) {
      var idx = MISSION_STEPS.findIndex(function (s) { return s.id === id; });
      if (idx >= 0 && idx >= state.mission.step) state.mission.step = Math.min(idx + 1, MISSION_STEPS.length);
    }
    save();
    renderMission();
    toast("Mission step done: " + id);
    if (state.mission.done.length >= MISSION_STEPS.length) {
      toast("Today's guided session complete — nice work.");
      state.mission.active = false;
      save();
      renderMission();
      var card = document.getElementById("mission-card");
      if (card) {
        card.classList.remove("celebrate");
        void card.offsetWidth;
        card.classList.add("celebrate");
      }
    }
  }

  function renderMission() {
    ensureMissionDay();
    var stepsEl = document.getElementById("mission-steps");
    var bar = document.getElementById("mission-bar");
    var title = document.getElementById("mission-title");
    var sub = document.getElementById("mission-sub");
    var nextBtn = document.getElementById("mission-next");
    var coachBar = document.getElementById("coach-bar");
    var coachText = document.getElementById("coach-bar-text");
    if (!stepsEl) return;
    var done = state.mission.done;
    var pct = Math.round((done.length / MISSION_STEPS.length) * 100);
    if (bar) bar.style.width = pct + "%";
    if (title) {
      title.textContent = done.length >= MISSION_STEPS.length
        ? "Today's session complete"
        : (state.mission.active ? "Session in progress" : "Start today's practice");
    }
    if (sub) {
      var cur = MISSION_STEPS[Math.min(state.mission.step, MISSION_STEPS.length - 1)];
      sub.textContent = done.length >= MISSION_STEPS.length
        ? "You finished all five interactive steps. Come back tomorrow for a fresh Daily 50 + Interview 10."
        : (state.mission.active ? cur.tip : "A short interactive walkthrough — breathe, technique, reading, interview, then check in.");
    }
    stepsEl.innerHTML = MISSION_STEPS.map(function (s, i) {
      var isDone = done.indexOf(s.id) >= 0;
      var isCurrent = state.mission.active && i === state.mission.step && !isDone;
      return '<li class="' + (isDone ? "done" : "") + (isCurrent ? " current" : "") + '">' +
        '<button type="button" class="mission-check" data-id="' + s.id + '" aria-pressed="' + isDone + '">' +
        (isDone ? "✓" : (i + 1)) + "</button> " +
        '<button type="button" class="link-btn" data-goto="' + s.view + '">' + escapeHtml(s.label) + "</button>" +
        "</li>";
    }).join("");
    stepsEl.querySelectorAll(".mission-check").forEach(function (btn) {
      btn.addEventListener("click", function () { completeMissionStep(btn.dataset.id); });
    });
    stepsEl.querySelectorAll("[data-goto]").forEach(function (el) {
      el.addEventListener("click", function () { go(el.dataset.goto); });
    });
    if (nextBtn) nextBtn.hidden = !state.mission.active || done.length >= MISSION_STEPS.length;
    if (coachBar) {
      var coachOpen = state.mission.active && done.length < MISSION_STEPS.length;
      coachBar.hidden = !coachOpen;
      document.body.classList.toggle("coach-open", coachOpen);
      if (coachOpen) {
        var stepIdx = Math.min(state.mission.step, MISSION_STEPS.length - 1);
        var step = MISSION_STEPS[stepIdx];
        var stepEl = document.getElementById("coach-bar-step");
        var titleEl = document.getElementById("coach-bar-title");
        var fillEl = document.getElementById("coach-bar-fill");
        if (stepEl) stepEl.textContent = "Step " + (stepIdx + 1) + " of " + MISSION_STEPS.length;
        if (titleEl) titleEl.textContent = step.label;
        if (coachText) coachText.textContent = step.tip;
        if (fillEl) fillEl.style.width = pct + "%";
      }
    }
  }

  function markCurrentMissionDone() {
    ensureMissionDay();
    var next = MISSION_STEPS.find(function (s) { return state.mission.done.indexOf(s.id) < 0; });
    if (!next) { toast("All steps done"); return; }
    completeMissionStep(next.id);
    if (state.mission.active) advanceMission();
  }

  function startMission() {
    ensureMissionDay();
    state.mission.active = true;
    if (state.mission.done.length >= MISSION_STEPS.length) {
      state.mission.done = [];
      state.mission.step = 0;
    }
    save();
    renderMission();
    var next = MISSION_STEPS.find(function (s) { return state.mission.done.indexOf(s.id) < 0; }) || MISSION_STEPS[0];
    go(next.view);
    toast("Guided session started");
  }

  function advanceMission() {
    ensureMissionDay();
    var next = MISSION_STEPS.find(function (s) { return state.mission.done.indexOf(s.id) < 0; });
    if (!next) { toast("All steps done"); return; }
    state.mission.step = MISSION_STEPS.indexOf(next);
    state.mission.active = true;
    save();
    renderMission();
    go(next.view);
  }

  document.getElementById("mission-start") && document.getElementById("mission-start").addEventListener("click", startMission);
  document.getElementById("mission-next") && document.getElementById("mission-next").addEventListener("click", advanceMission);
  document.getElementById("mission-reset") && document.getElementById("mission-reset").addEventListener("click", function () {
    state.mission = { day: todayKey(), done: [], active: false, step: 0 };
    save(); renderMission(); toast("Today's mission reset");
  });
  document.getElementById("coach-bar-next") && document.getElementById("coach-bar-next").addEventListener("click", advanceMission);
  document.getElementById("coach-bar-done") && document.getElementById("coach-bar-done").addEventListener("click", markCurrentMissionDone);
  document.getElementById("coach-bar-home") && document.getElementById("coach-bar-home").addEventListener("click", function () {
    state.mission.active = false;
    save();
    renderMission();
    go("home");
    toast("Session paused — resume anytime from Home");
  });

  // Keyboard shortcuts
  var viewKeys = { "1": "home", "2": "daf", "3": "pacing", "4": "breathing", "5": "techniques", "6": "reading", "7": "interview", "8": "confidence", "9": "learn", "0": "progress" };
  document.addEventListener("keydown", function (e) {
    if (e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
    if (e.key === "g" || e.key === "G") { e.preventDefault(); startMission(); return; }
    if (viewKeys[e.key]) { e.preventDefault(); go(viewKeys[e.key]); }
  });

  /* ---------------- Home ---------------- */
  var challengeIdx = dayOfYear() % C.dailyChallenges.length;
  function dayOfYear() { var n = new Date(); var s = new Date(n.getFullYear(), 0, 0); return Math.floor((n - s) / 86400000); }

  function renderWeekCal() {
    var el = document.getElementById("week-cal");
    if (!el) return;
    var days = state.practiceDays || {};
    var labels = ["S", "M", "T", "W", "T", "F", "S"];
    var now = new Date();
    var dow = now.getDay();
    var html = "";
    for (var i = 0; i < 7; i++) {
      var d = new Date(now);
      d.setDate(now.getDate() - dow + i);
      var key = d.toISOString().slice(0, 10);
      var cls = "week-day" + (days[key] ? " practiced" : "") + (key === todayKey() ? " today" : "");
      html += '<span class="' + cls + '" title="' + key + '">' + labels[i] + "</span>";
    }
    el.innerHTML = html;
  }
  function renderHome() {
    document.getElementById("streak-count").textContent = state.streak.count;
    var sub = document.getElementById("streak-sub");
    if (state.streak.lastDay === todayKey()) sub.textContent = "Logged today — nice. Keep it going.";
    else if (state.streak.count > 0) sub.textContent = "Practice today to keep your streak alive.";
    else sub.textContent = "Do anything today to start your streak.";
    document.getElementById("daily-challenge").textContent = C.dailyChallenges[challengeIdx];
    renderWeekCal();
    renderMission();
  }
  document.getElementById("log-practice-btn").addEventListener("click", function () {
    markPractice("Logged a practice day", { missionStep: "checkin" });
  });
  document.getElementById("new-challenge-btn").addEventListener("click", function () {
    challengeIdx = (challengeIdx + 1) % C.dailyChallenges.length; renderHome();
  });
  document.getElementById("done-challenge-btn").addEventListener("click", function () {
    state.challengesDone = (state.challengesDone || 0) + 1;
    markPractice("Brave challenge: " + C.dailyChallenges[challengeIdx], { missionStep: "checkin" });
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
      showError("Echo needs microphone permission on http://127.0.0.1:8788");
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
      var left = secs;
      orbLabel.textContent = label + " · " + left;
      orb.style.setProperty("--breath-dur", secs + "s");
      orb.classList.remove("inhale", "exhale");
      if (/in/i.test(label)) orb.classList.add("inhale");
      else if (/out|speak/i.test(label)) orb.classList.add("exhale");
      i++;
      // Count the label down each second (4, 3, 2, 1), then move to the next phase.
      function tick() {
        left--;
        if (left > 0) {
          orbLabel.textContent = label + " · " + left;
          breathTimer = setTimeout(tick, 1000);
        } else {
          step();
        }
      }
      breathTimer = setTimeout(tick, 1000);
    }
    step();
  }
  breathBtn.addEventListener("click", function () {
    if (breathTimer) { stopBreath(); return; }
    breathBtn.textContent = "Stop";
    runBreath();
    markPractice("Did a breathing exercise", { missionStep: "breathing" });
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
      if (card.classList.contains("open")) markPractice("Studied technique: " + t.name, { missionStep: "techniques" });
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
    markPractice("Paced reading practice", { missionStep: "reading" });
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

  /* -------- Reading aloud: live STT coach + next-time corrections -------- */
  var liveCoach = document.getElementById("live-coach");
  var liveTip = document.getElementById("live-tip");
  var liveHeard = document.getElementById("live-heard");
  var liveStopBtn = document.getElementById("live-stop");
  var readAloudBtn = document.getElementById("read-aloud");
  var feedbackCard = document.getElementById("feedback-card");
  var feedbackScore = document.getElementById("feedback-score");
  var feedbackTips = document.getElementById("feedback-tips");
  var feedbackTension = document.getElementById("feedback-tension");
  var feedbackTensionVal = document.getElementById("feedback-tension-val");
  var feedbackHard = document.getElementById("feedback-hard");
  var feedbackSave = document.getElementById("feedback-save");
  var recognition = null;
  var liveTranscript = "";
  var pendingFeedback = null;
  var coachEncourageTimer = null;
  var ENCOURAGE = [
    "Nice pace — keep the airflow easy.",
    "You're doing the hard work. Soften the next onset.",
    "Slow is strong. One syllable at a time.",
    "If a block comes, pause and restart gently.",
  ];
  function renderLastTipBanner() {
    var el = document.getElementById("last-tip-banner");
    if (!el) return;
    if (state.lastTip) {
      el.hidden = false;
      el.textContent = "Last round tip: " + state.lastTip;
    } else {
      el.hidden = true;
    }
  }
  function clearEncourage() {
    if (coachEncourageTimer) clearInterval(coachEncourageTimer);
    coachEncourageTimer = null;
  }

  function SpeechRec() {
    return window.SpeechRecognition || window.webkitSpeechRecognition || null;
  }
  function stopLiveListen() {
    clearEncourage();
    if (recognition) {
      try { recognition.onresult = null; recognition.onend = null; recognition.onerror = null; recognition.stop(); } catch (e) {}
      recognition = null;
    }
    if (liveCoach) liveCoach.hidden = true;
    if (readAloudBtn) readAloudBtn.textContent = "🎙 Practice aloud";
  }
  function showFeedbackRound(analysis, target, spoken) {
    if (!P || !feedbackCard) return;
    var corrections = P.buildNextTimeCorrections(analysis, {});
    pendingFeedback = { analysis: analysis, target: target, spoken: spoken, corrections: corrections };
    feedbackScore.textContent = "Fluency score " + analysis.score + " · word match " + analysis.accuracy + "%";
    feedbackTips.innerHTML = corrections.map(function (c) {
      return "<li>" + escapeHtml((c.icon ? c.icon + " " : "") + c.text) + "</li>";
    }).join("");
    feedbackCard.hidden = false;
    if (corrections.length) {
      state.lastTip = (corrections[0].icon ? corrections[0].icon + " " : "") + corrections[0].text;
      save();
      renderLastTipBanner();
    }
  }
  function startLiveListen() {
    var Rec = SpeechRec();
    if (!Rec) {
      if (liveTip) liveTip.textContent = "Speech recognition needs Chrome or Edge.";
      if (liveCoach) liveCoach.hidden = false;
      return;
    }
    stopReading();
    stopLiveListen();
    liveTranscript = "";
    if (feedbackCard) feedbackCard.hidden = true;
    var passage = currentPassage();
    recognition = new Rec();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.onresult = function (ev) {
      var interim = "";
      var final = "";
      for (var i = 0; i < ev.results.length; i++) {
        var t = ev.results[i][0].transcript;
        if (ev.results[i].isFinal) final += t + " ";
        else interim += t;
      }
      if (final) liveTranscript += final;
      var heard = (liveTranscript + " " + interim).trim();
      if (liveHeard) liveHeard.textContent = heard ? 'Heard: "' + heard.slice(0, 140) + (heard.length > 140 ? "…" : "") + '"' : "";
      if (liveTip && P) {
        var tip = P.liveTipFromInterim(heard);
        liveTip.textContent = tip.icon + " " + tip.text;
      }
    };
    recognition.onerror = function () {
      if (liveTip) liveTip.textContent = "Mic issue — allow microphone, stay on http://127.0.0.1:8788.";
      showError("Microphone issue — allow access and stay on http://127.0.0.1:8788");
    };
    recognition.onend = function () {
      // Auto-restart while still in listening mode (Chrome ends between pauses).
      if (recognition) {
        try { recognition.start(); } catch (e) {}
      }
    };
    try {
      recognition.start();
      if (liveCoach) liveCoach.hidden = false;
      if (liveTip) liveTip.textContent = "🎙 Listening — speak the passage slowly.";
      if (readAloudBtn) readAloudBtn.textContent = "Listening…";
      clearEncourage();
      var ei = 0;
      coachEncourageTimer = setInterval(function () {
        if (!liveTip || !recognition) return;
        liveTip.textContent = "💬 " + ENCOURAGE[ei % ENCOURAGE.length];
        ei++;
      }, 18000);
    } catch (e) {
      if (liveTip) liveTip.textContent = "Could not start mic. Check Chrome microphone permission.";
      if (liveCoach) liveCoach.hidden = false;
      showError("Could not start mic — check Chrome microphone permission.");
    }
  }
  document.getElementById("combo-echo-pace") && document.getElementById("combo-echo-pace").addEventListener("click", async function () {
    go("reading");
    if (!window.SteadyAudio.isRunning()) {
      try { await toggleDaf(false); } catch (e) {}
    }
    if (!window.SteadyMetronome.isRunning()) metroBtn.click();
    toast("Echo + Pace on — speak one syllable per beat");
  });
  function finishLiveListen() {
    var spoken = liveTranscript.trim();
    var passage = currentPassage();
    stopLiveListen();
    if (!spoken) {
      if (liveCoach) { liveCoach.hidden = false; liveTip.textContent = "No speech captured — try again and speak closer to the mic."; }
      return;
    }
    var analysis = P ? P.analyzeSpeech(passage.text, spoken) : { score: 70, accuracy: 70, repetitions: [], fillers: [], missing: [] };
    showFeedbackRound(analysis, passage.text, spoken);
    markPractice("Reading aloud: " + passage.title, {
      syncFile: true,
      missionStep: "reading",
      tool: "reading",
      title: "Reading aloud · " + passage.title,
      target: passage.text,
      spoken: spoken,
      analysis: analysis,
      corrections: pendingFeedback && pendingFeedback.corrections,
    });
  }
  if (readAloudBtn) readAloudBtn.addEventListener("click", function () {
    if (recognition) finishLiveListen();
    else startLiveListen();
  });
  if (liveStopBtn) liveStopBtn.addEventListener("click", finishLiveListen);
  if (feedbackTension) feedbackTension.addEventListener("input", function () {
    feedbackTensionVal.textContent = feedbackTension.value;
  });
  if (feedbackSave) feedbackSave.addEventListener("click", async function () {
    if (!pendingFeedback || !P) return;
    var tension = +feedbackTension.value;
    var hard = feedbackHard.value;
    var analysis = Object.assign({}, pendingFeedback.analysis, {
      issues: (pendingFeedback.analysis.issues || []).concat(hard ? [hard] : []),
    });
    var corrections = P.buildNextTimeCorrections(analysis, { tension: tension, hard: hard || undefined });
    await syncProgressEntry({
      tool: "reading",
      title: "Check-in · " + currentPassage().title,
      target: pendingFeedback.target,
      spoken: pendingFeedback.spoken,
      analysis: analysis,
      tension: tension,
      hard: hard,
      corrections: corrections,
    });
    markPractice("Saved check-in (tension " + tension + ")");
    feedbackTips.innerHTML = corrections.map(function (c) {
      return "<li>" + escapeHtml((c.icon ? c.icon + " " : "") + c.text) + "</li>";
    }).join("");
    feedbackScore.textContent = "Saved to PERSONAL-PROGRESS.md — use these tips next round.";
    go("progress");
  });

  /* ---------------- Interview: daily data-engineering Q&A ---------------- */
  var interviewList = document.getElementById("interview-list");
  var interviewDate = document.getElementById("interview-date");

  function buildDailyInterviewSet(day) {
    var bank = C.interviewQuestions || [];
    var base = seededShuffle(bank, 246813579);
    var len = base.length, n = Math.min(10, len);
    var start = len ? ((day * n) % len + len) % len : 0;
    var set = [];
    for (var i = 0; i < n; i++) set.push(base[(start + i) % len]);
    return set;
  }

  function renderInterview() {
    if (!interviewList) return;
    var set = buildDailyInterviewSet(daySeed);
    var dateText = new Date().toLocaleDateString(undefined, {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
    if (interviewDate) interviewDate.textContent = "Daily 10 · " + dateText;
    interviewList.innerHTML = set.map(function (item, i) {
      return '<article class="interview-card" data-i="' + i + '">' +
        '<p class="interview-focus">' + escapeHtml(item.focus || "data engineering") + "</p>" +
        "<h3>" + (i + 1) + ". " + escapeHtml(item.question) + "</h3>" +
        '<button class="ghost-btn interview-reveal" data-action="reveal">Try first, then show answer</button>' +
        '<div class="interview-answer-wrap" hidden>' +
          '<p class="interview-answer">' + escapeHtml(item.answer) + "</p>" +
          '<div class="row">' +
            '<button class="ghost-btn" data-action="speak">🔊 Hear answer</button>' +
            '<button class="primary-btn" data-action="practice">Practice in Reading</button>' +
          "</div>" +
        "</div>" +
      "</article>";
    }).join("");
    interviewList.querySelectorAll("button").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var card = btn.closest(".interview-card");
        var item = set[+card.dataset.i];
        var wrap = card.querySelector(".interview-answer-wrap");
        var reveal = card.querySelector(".interview-reveal");
        if (btn.dataset.action === "reveal") {
          var open = wrap.hidden;
          wrap.hidden = !open;
          reveal.textContent = open ? "Hide answer" : "Try first, then show answer";
          if (open) markPractice("Revealed interview answer: " + item.question);
          completeMissionStep("interview");
          return;
        }
        var script = "Question: " + item.question + " Answer: " + item.answer;
        if (btn.dataset.action === "speak") {
          speak(script, 0.82);
          markPractice("Reviewed interview answer: " + item.question);
          completeMissionStep("interview");
          return;
        }
        if (customText) {
          customText.value = script;
          state.customText = script;
          save();
        }
        passageSelect.value = "custom";
        updateNewBtn();
        renderPassage();
        markPractice("Prepared interview answer for reading: " + item.question);
        completeMissionStep("interview");
        go("reading");
      });
    });
  }

  var interviewTimerId = null;
  document.getElementById("interview-timer") && document.getElementById("interview-timer").addEventListener("click", function () {
    var label = document.getElementById("interview-timer-label");
    if (interviewTimerId) {
      clearInterval(interviewTimerId);
      interviewTimerId = null;
      if (label) label.textContent = "Timer stopped";
      return;
    }
    var left = 60;
    if (label) label.textContent = left + "s — answer out loud";
    interviewTimerId = setInterval(function () {
      left--;
      if (left <= 0) {
        clearInterval(interviewTimerId);
        interviewTimerId = null;
        if (label) label.textContent = "Time's up — reveal and compare";
        toast("60s done — reveal the answer and refine");
        markPractice("Interview timed practice", { missionStep: "interview" });
        return;
      }
      if (label) label.textContent = left + "s left";
    }, 1000);
  });

  /* ---------------- Describe a picture ---------------- */
  var describeIdx = 0;
  var pictureFrame = document.getElementById("picture-frame");
  var describeForm = document.getElementById("describe-form");
  var describeTitle = document.getElementById("describe-title");
  var describeModel = document.getElementById("describe-model");
  var describeModelBody = document.getElementById("describe-model-body");
  var describePracticeModel = document.getElementById("describe-practice-model");

  function pictureSvg(scene) {
    // Minimal offline SVGs — enough visual for structured speaking practice.
    var common = 'class="picture-scene" viewBox="0 0 400 240" xmlns="http://www.w3.org/2000/svg" role="img"';
    if (scene === "park") {
      return "<svg " + common + ' aria-label="Person and dog on a park bench">' +
        '<rect class="ps-sky" width="400" height="140"/><rect class="ps-ground" y="140" width="400" height="100"/>' +
        '<circle cx="320" cy="48" r="28" fill="#f2d27a"/><rect class="ps-wood" x="90" y="145" width="140" height="14" rx="3"/>' +
        '<rect class="ps-wood" x="100" y="120" width="120" height="28" rx="4"/><circle class="ps-person" cx="145" cy="100" r="16"/>' +
        '<rect class="ps-person" x="132" y="115" width="26" height="32" rx="6"/><ellipse class="ps-accent" cx="200" cy="168" rx="22" ry="12"/>' +
        '<circle class="ps-accent" cx="218" cy="158" r="9"/><circle class="ps-leaf" cx="60" cy="120" r="34"/><rect class="ps-wood" x="52" y="140" width="14" height="50"/>' +
        "</svg>";
    }
    if (scene === "cafe") {
      return "<svg " + common + ' aria-label="Barista handing a cup to a customer">' +
        '<rect class="ps-wall" width="400" height="240"/><rect class="ps-wood" y="150" width="400" height="90"/>' +
        '<rect fill="#2b211c" x="40" y="110" width="200" height="50" rx="4"/><circle class="ps-person" cx="100" cy="90" r="14"/>' +
        '<rect class="ps-person" x="88" y="104" width="24" height="30" rx="5"/><circle class="ps-person-2" cx="210" cy="95" r="14"/>' +
        '<rect class="ps-person-2" x="198" y="108" width="24" height="32" rx="5"/><ellipse class="ps-cup" cx="160" cy="125" rx="14" ry="10"/>' +
        '<path d="M155 108 q5 -12 14 0" stroke="#bbb" fill="none" stroke-width="2"/>' +
        "</svg>";
    }
    if (scene === "bus") {
      return "<svg " + common + ' aria-label="Two people waiting at a rainy bus stop">' +
        '<rect class="ps-sky-rain" width="400" height="160"/><rect class="ps-road" y="160" width="400" height="80"/>' +
        '<rect fill="#6d7580" x="70" y="90" width="160" height="10"/><rect fill="#6d7580" x="80" y="100" width="10" height="70"/>' +
        '<rect fill="#6d7580" x="210" y="100" width="10" height="70"/><circle class="ps-person" cx="120" cy="130" r="12"/>' +
        '<rect class="ps-person" x="110" y="142" width="20" height="28" rx="4"/><circle class="ps-person-2" cx="175" cy="132" r="12"/>' +
        '<rect class="ps-person-2" x="165" y="144" width="20" height="28" rx="4"/><line x1="40" y1="40" x2="30" y2="70" stroke="#9fb0c0" stroke-width="2"/>' +
        '<line x1="90" y1="30" x2="80" y2="65" stroke="#9fb0c0" stroke-width="2"/><line x1="300" y1="35" x2="290" y2="75" stroke="#9fb0c0" stroke-width="2"/>' +
        "</svg>";
    }
    if (scene === "kitchen") {
      return "<svg " + common + ' aria-label="Person making breakfast in a kitchen">' +
        '<rect class="ps-wall" width="400" height="240"/><rect class="ps-floor" y="170" width="400" height="70"/>' +
        '<rect fill="#87b4d4" x="40" y="40" width="90" height="70" rx="4"/><rect class="ps-wood" x="180" y="130" width="160" height="50" rx="4"/>' +
        '<circle class="ps-person" cx="230" cy="105" r="14"/><rect class="ps-person" x="218" y="118" width="24" height="30" rx="5"/>' +
        '<rect class="ps-cup" x="270" y="118" width="28" height="18" rx="2"/><ellipse fill="#c47b3a" cx="310" cy="145" rx="16" ry="8"/>' +
        '<path d="M285 105 q8 -16 18 0" stroke="#bbb" fill="none" stroke-width="2"/>' +
        "</svg>";
    }
    if (scene === "library") {
      return "<svg " + common + ' aria-label="Student reading at a library desk">' +
        '<rect fill="#2a3340" width="400" height="240"/><rect class="ps-wood" x="20" y="30" width="40" height="160"/><rect class="ps-wood" x="70" y="30" width="40" height="160"/>' +
        '<rect class="ps-wood" x="330" y="30" width="40" height="160"/><rect class="ps-wood" x="140" y="150" width="160" height="20" rx="3"/>' +
        '<circle class="ps-person" cx="200" cy="115" r="14"/><rect class="ps-person" x="188" y="128" width="24" height="28" rx="5"/>' +
        '<rect class="ps-book" x="210" y="138" width="36" height="14" rx="2"/><rect class="ps-note" x="155" y="140" width="30" height="18" rx="2"/>' +
        "</svg>";
    }
    if (scene === "beach") {
      return "<svg " + common + ' aria-label="Two friends walking on a beach at sunset">' +
        '<rect class="ps-sky-dusk" width="400" height="130"/><rect class="ps-sand" y="130" width="400" height="60"/><rect class="ps-water" y="190" width="400" height="50"/>' +
        '<circle fill="#f0c27a" cx="320" cy="70" r="26"/><circle class="ps-person" cx="160" cy="145" r="12"/><rect class="ps-person" x="150" y="156" width="20" height="26" rx="4"/>' +
        '<circle class="ps-person-2" cx="200" cy="147" r="12"/><rect class="ps-person-2" x="190" y="158" width="20" height="26" rx="4"/>' +
        "</svg>";
    }
    if (scene === "market") {
      return "<svg " + common + ' aria-label="Shopper choosing fruit at a market stall">' +
        '<rect class="ps-sky" width="400" height="120"/><rect class="ps-ground" y="120" width="400" height="120"/>' +
        '<rect fill="#c0392b" x="80" y="70" width="180" height="18"/><rect class="ps-wood" x="90" y="88" width="160" height="70"/>' +
        '<circle fill="#e74c3c" cx="130" cy="120" r="12"/><circle fill="#f1c40f" cx="160" cy="122" r="12"/><circle fill="#27ae60" cx="190" cy="120" r="12"/>' +
        '<circle class="ps-person" cx="280" cy="115" r="13"/><rect class="ps-person" x="268" y="128" width="24" height="30" rx="5"/>' +
        '<circle class="ps-person-2" cx="120" cy="95" r="11"/><rect class="ps-person-2" x="110" y="105" width="20" height="24" rx="4"/>' +
        "</svg>";
    }
    // office default
    return "<svg " + common + ' aria-label="Coworkers discussing a plan around a laptop">' +
      '<rect fill="#dfe6ee" width="400" height="240"/><rect class="ps-wood" x="90" y="140" width="220" height="30" rx="4"/>' +
      '<rect fill="#222" x="160" y="110" width="70" height="40" rx="3"/><circle class="ps-person" cx="130" cy="105" r="12"/>' +
      '<rect class="ps-person" x="120" y="116" width="20" height="26" rx="4"/><circle class="ps-person-2" cx="200" cy="100" r="12"/>' +
      '<rect class="ps-person-2" x="190" y="112" width="20" height="26" rx="4"/><circle class="ps-accent" cx="260" cy="108" r="12"/>' +
      '<rect class="ps-accent" x="250" y="120" width="20" height="26" rx="4"/><rect class="ps-note" x="40" y="40" width="28" height="22" rx="2"/>' +
      '<rect class="ps-note" x="78" y="48" width="28" height="22" rx="2"/>' +
      "</svg>";
  }

  function currentDescribeScene() {
    var scenes = C.pictureScenes || [];
    if (!scenes.length) return null;
    if (!state.describe) state.describe = { sceneId: null, fields: {}, modelOpen: false };
    var found = scenes.find(function (s) { return s.id === state.describe.sceneId; });
    if (found) {
      describeIdx = scenes.indexOf(found);
      return found;
    }
    describeIdx = ((daySeed % scenes.length) + scenes.length) % scenes.length;
    state.describe.sceneId = scenes[describeIdx].id;
    state.describe.fields = {};
    state.describe.modelOpen = false;
    save();
    return scenes[describeIdx];
  }

  function describeScript(fields) {
    var prompts = C.picturePrompts || [];
    return prompts.map(function (p) {
      var v = (fields && fields[p.id] || "").trim();
      return v ? (p.label + ": " + v) : "";
    }).filter(Boolean).join(" ");
  }

  function renderDescribe() {
    var scene = currentDescribeScene();
    if (!scene || !pictureFrame || !describeForm) return;
    if (describeTitle) describeTitle.textContent = "Picture · " + scene.title;
    pictureFrame.innerHTML = pictureSvg(scene.scene);
    var fields = state.describe.fields || {};
    describeForm.innerHTML = (C.picturePrompts || []).map(function (p) {
      return '<div class="describe-field">' +
        "<label for=\"describe-" + p.id + "\">" + escapeHtml(p.label) +
        '<span class="hint">' + escapeHtml(p.hint) + "</span></label>" +
        '<textarea id="describe-' + p.id + '" data-field="' + p.id + '" placeholder="' + escapeAttr(p.hint) + '">' +
        escapeHtml(fields[p.id] || "") + "</textarea></div>";
    }).join("");
    describeForm.querySelectorAll("textarea").forEach(function (ta) {
      ta.addEventListener("input", function () {
        if (!state.describe.fields) state.describe.fields = {};
        state.describe.fields[ta.dataset.field] = ta.value;
        save();
      });
    });
    if (describeModel) describeModel.hidden = !state.describe.modelOpen;
    if (describePracticeModel) describePracticeModel.hidden = !state.describe.modelOpen;
    if (state.describe.modelOpen && describeModelBody) {
      describeModelBody.innerHTML = (C.picturePrompts || []).map(function (p) {
        return '<p class="describe-model-line"><strong>' + escapeHtml(p.label) + "</strong> " +
          escapeHtml(scene.model[p.id] || "") + "</p>";
      }).join("");
    }
  }

  function sendDescribeToReading(text, label) {
    if (!text || !text.trim()) { toast("Write a description first"); return; }
    if (customText) {
      customText.value = text.trim();
      state.customText = text.trim();
      save();
    }
    passageSelect.value = "custom";
    updateNewBtn();
    renderPassage();
    markPractice(label || "Prepared picture description for reading");
    go("reading");
  }

  document.getElementById("describe-new") && document.getElementById("describe-new").addEventListener("click", function () {
    var scenes = C.pictureScenes || [];
    if (!scenes.length) return;
    describeIdx = (describeIdx + 1) % scenes.length;
    state.describe = { sceneId: scenes[describeIdx].id, fields: {}, modelOpen: false };
    save();
    renderDescribe();
    toast("New picture: " + scenes[describeIdx].title);
  });
  document.getElementById("describe-save") && document.getElementById("describe-save").addEventListener("click", function () {
    var script = describeScript(state.describe.fields);
    if (!script) { toast("Fill at least one part"); return; }
    markPractice("Saved picture description: " + (currentDescribeScene() || {}).title);
    toast("Description saved — reveal the model or practice in Reading");
  });
  document.getElementById("describe-reveal") && document.getElementById("describe-reveal").addEventListener("click", function () {
    state.describe.modelOpen = true;
    save();
    renderDescribe();
    markPractice("Viewed model picture answer");
  });
  document.getElementById("describe-practice-mine") && document.getElementById("describe-practice-mine").addEventListener("click", function () {
    sendDescribeToReading(describeScript(state.describe.fields), "Practice my picture description");
  });
  document.getElementById("describe-practice-model") && document.getElementById("describe-practice-model").addEventListener("click", function () {
    var scene = currentDescribeScene();
    if (!scene) return;
    sendDescribeToReading(describeScript(scene.model), "Practice model picture answer");
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
    if (!state.log.length) { log.innerHTML = '<li class="muted">No activity yet.</li>'; }
    else {
      log.innerHTML = state.log.map(function (e) {
        return "<li><span>" + escapeHtml(e.text) + '</span><span class="when">' + relTime(e.t) + "</span></li>";
      }).join("");
    }
    renderPersonalProgress();
  }
  document.getElementById("reset-data").addEventListener("click", function () {
    if (!confirm("Erase all your Steady data on this device? (Does not delete PERSONAL-PROGRESS.md on disk.)")) return;
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
    renderHome(); renderPassage(); renderInterview(); renderDescribe(); renderLadder(); renderDisclosure(); renderCbt(); renderProgress();
  }
  async function loadVersionBadge() {
    var el = document.getElementById("version-badge");
    if (!el) return;
    try {
      var res = await fetch("/health");
      if (!res.ok) return;
      var h = await res.json();
      el.textContent = "v" + (h.version || "?") + " · day " + (h.day || 1);
    } catch (e) {
      try {
        var v = await fetch("version.json").then(function (r) { return r.json(); });
        el.textContent = "v" + v.version + " · day " + (v.day || 1);
      } catch (e2) {}
    }
  }
  renderAll();
  fetchProgress();
  loadVersionBadge();
  renderLastTipBanner();
  (function showOnboard() {
    var overlay = document.getElementById("onboard-overlay");
    if (!overlay) return;
    if (state.onboarded) { overlay.hidden = true; return; }
    overlay.hidden = false;
    document.getElementById("onboard-done").addEventListener("click", function () {
      state.onboarded = true;
      save();
      overlay.hidden = true;
      toast("Press G anytime for today's guided session");
    });
  })();
  // Honor a deep-link hash on load (e.g. .../#progress opens the Progress tab).
  (function () { var v = location.hash.slice(1); if (validViews[v]) go(v); })();
  window.addEventListener("beforeunload", function () {
    stopLiveListen();
    window.SteadyAudio.stop(); window.SteadyMetronome.stop(); window.speechSynthesis && window.speechSynthesis.cancel();
  });
})();
