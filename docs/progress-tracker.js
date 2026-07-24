/**
 * Steady personal improvement tracker + next-time corrections.
 * Pure logic (no DOM). Server persists to PERSONAL-PROGRESS.md via /api/progress.
 */
(function (root) {
  "use strict";

  var FILLERS = { um: 1, uh: 1, er: 1, ah: 1, like: 1, youknow: 1 };

  function normalizeWords(text) {
    return String(text || "")
      .toLowerCase()
      .replace(/[^a-z0-9'\s]/g, " ")
      .split(/\s+/)
      .filter(Boolean);
  }

  /** Lightweight speech analysis for reading aloud (no ML). */
  function analyzeSpeech(targetText, spokenText) {
    var target = normalizeWords(targetText);
    var spoken = normalizeWords(spokenText);
    var targetSet = {};
    target.forEach(function (w) { targetSet[w] = (targetSet[w] || 0) + 1; });

    var repetitions = [];
    var fillers = [];
    var missing = [];
    var i;
    for (i = 1; i < spoken.length; i++) {
      if (spoken[i] === spoken[i - 1] && repetitions.indexOf(spoken[i]) < 0) {
        repetitions.push(spoken[i]);
      }
    }
    spoken.forEach(function (w) {
      if (FILLERS[w.replace("'", "")] && fillers.indexOf(w) < 0) fillers.push(w);
    });
    target.forEach(function (w) {
      if (!spoken.includes(w) && missing.indexOf(w) < 0) missing.push(w);
    });

    var matched = 0;
    target.forEach(function (w) {
      if (spoken.includes(w)) matched++;
    });
    var accuracy = target.length ? Math.round((matched / target.length) * 100) : 0;
    var score = accuracy;
    if (repetitions.length) score -= Math.min(25, repetitions.length * 8);
    if (fillers.length) score -= Math.min(15, fillers.length * 5);
    score = Math.max(0, Math.min(100, score));

    return {
      score: score,
      accuracy: accuracy,
      repetitions: repetitions.slice(0, 5),
      fillers: fillers.slice(0, 5),
      missing: missing.slice(0, 8),
      wordCount: spoken.length,
      targetCount: target.length,
    };
  }

  /** Live tip while speaking (one at a time). */
  function liveTipFromInterim(spokenSoFar) {
    var spoken = normalizeWords(spokenSoFar);
    if (!spoken.length) return { icon: "🎙", text: "Speak the passage slowly — soft first sounds." };
    if (spoken.length >= 2 && spoken[spoken.length - 1] === spoken[spoken.length - 2]) {
      return { icon: "⏸", text: "You repeated a word — pause one beat, then continue once." };
    }
    var last = spoken[spoken.length - 1];
    if (FILLERS[last.replace("'", "")]) {
      return { icon: "🌬", text: "Heard a filler — swap it for a silent breath next phrase." };
    }
    if (spoken.length > 12) {
      return { icon: "🐌", text: "Good volume of speech — keep stretching the first sound of each word." };
    }
    return { icon: "✨", text: "Keep going — gentle onset on the next word." };
  }

  /** Build 1–3 actionable next-time corrections. */
  function buildNextTimeCorrections(analysis, opts) {
    opts = opts || {};
    var tips = [];
    function push(priority, icon, text, focus) {
      if (tips.length >= 3) return;
      if (tips.some(function (t) { return t.focus === focus; })) return;
      tips.push({ priority: priority, icon: icon, text: text, focus: focus });
    }

    var reps = analysis.repetitions || [];
    var fillers = analysis.fillers || [];
    var missing = analysis.missing || [];
    var score = analysis.score ?? 70;
    var issues = analysis.issues || [];

    if (reps.length) {
      push(1, "🔁", 'Next time: pause one beat before "' + reps[0] + '", then say it once with a soft start.', "repetition");
    }
    if (fillers.length) {
      push(2, "💬", 'Next time: swap "' + fillers[0] + '" for a silent breath. Silence is fine.', "filler");
    }
    if (missing.length) {
      push(2, "🎯", 'Next time: land "' + missing.slice(0, 2).join('" and "') + '" — chunk the phrase and restart there.', "missing");
    }
    if (issues.indexOf("first-sound") >= 0 || opts.hard === "first-sound") {
      push(1, "🎙", "Next time: ease into the first sound (soft h → vowel) before pressing consonants.", "first-sound");
    }
    if (issues.indexOf("pace") >= 0 || opts.hard === "pace" || score < 55) {
      push(1, "🐌", "Next time: half-speed. Stretch the first sound of every word, then finish the phrase.", "pace");
    }
    if (issues.indexOf("tension") >= 0 || opts.hard === "tension" || (opts.tension && opts.tension >= 7)) {
      push(1, "🌬", "Next time: drop shoulders, jaw soft, speak on the exhale — never on an empty tank.", "tension");
    }
    if (issues.indexOf("blocks") >= 0 || opts.hard === "blocks") {
      push(1, "🔓", "Next time: if you block, soften mid-word (pull-out) — don't push harder.", "blocks");
    }
    if (opts.tool === "echo") {
      push(3, "🎧", "Next time with Echo: try 50–100 ms delay and read one calm library passage aloud.", "echo");
    }
    if (opts.tool === "pacing") {
      push(3, "♩", "Next time: start metronome at 50–60 BPM — one syllable per click.", "pacing");
    }
    if (opts.promptTip) {
      push(3, "📌", opts.promptTip, "prompt-tip");
    }
    if (!tips.length) {
      push(3, "✨", "Strong round. Next time: keep this pace and try the next topic without rushing the first sound.", "maintain");
    }
    tips.sort(function (a, b) { return a.priority - b.priority; });
    return tips.slice(0, 3);
  }

  function extractIssues(analysis) {
    var issues = [];
    if ((analysis.repetitions || []).length) issues.push("repetition");
    if ((analysis.fillers || []).length) issues.push("filler");
    if ((analysis.missing || []).length) issues.push("missing-words");
    if ((analysis.score ?? 100) < 55) issues.push("low-score");
    (analysis.issues || []).forEach(function (i) {
      if (issues.indexOf(i) < 0) issues.push(i);
    });
    return issues;
  }

  function trendLabel(history) {
    if (!history || history.length < 3) {
      return { direction: "new", text: "Building your personal baseline…", delta: 0 };
    }
    var recent = history.slice(0, 5);
    var older = history.slice(5, 10);
    if (!older.length) {
      var avg = Math.round(recent.reduce(function (s, h) { return s + (h.score || 0); }, 0) / recent.length);
      return { direction: "flat", text: "Early avg " + avg + " — keep daily reps.", delta: 0 };
    }
    var rAvg = recent.reduce(function (s, h) { return s + (h.score || 0); }, 0) / recent.length;
    var oAvg = older.reduce(function (s, h) { return s + (h.score || 0); }, 0) / older.length;
    var delta = Math.round(rAvg - oAvg);
    if (delta >= 5) return { direction: "up", text: "Improving — recent avg up " + delta + " pts.", delta: delta };
    if (delta <= -5) {
      return { direction: "down", text: "Recent avg down " + Math.abs(delta) + " pts — slow down and soft starts.", delta: delta };
    }
    return { direction: "flat", text: "Steady — recent avg close to baseline.", delta: delta };
  }

  function topIssues(history, limit) {
    limit = limit || 3;
    var counts = {};
    history.slice(0, 30).forEach(function (h) {
      (h.issues || []).forEach(function (issue) {
        counts[issue] = (counts[issue] || 0) + 1;
      });
    });
    return Object.keys(counts)
      .map(function (issue) { return { issue: issue, n: counts[issue] }; })
      .sort(function (a, b) { return b.n - a.n; })
      .slice(0, limit);
  }

  function buildSessionEntry(input) {
    var analysis = input.analysis || { score: input.score || 70, repetitions: [], fillers: [], missing: [], issues: input.issues || [] };
    return {
      at: new Date().toISOString(),
      tool: input.tool || "practice",
      title: input.title || input.tool || "Practice",
      target: input.target || "",
      spoken: input.spoken || "",
      score: analysis.score != null ? analysis.score : (input.score != null ? input.score : 70),
      tension: input.tension != null ? input.tension : null,
      accuracy: analysis.accuracy != null ? analysis.accuracy : null,
      repetitions: analysis.repetitions || [],
      fillers: analysis.fillers || [],
      missing: (analysis.missing || []).slice(0, 6),
      issues: extractIssues(analysis),
      corrections: (input.corrections || []).map(function (c) { return typeof c === "string" ? c : c.text; }),
    };
  }

  function summarizeProgress(entries) {
    var history = entries || [];
    var trend = trendLabel(history);
    var issues = topIssues(history);
    var last = history[0] || null;
    var scored = history.filter(function (h) { return typeof h.score === "number"; });
    var avg = scored.length
      ? Math.round(scored.slice(0, 20).reduce(function (s, h) { return s + h.score; }, 0) / Math.min(scored.length, 20))
      : null;
    return { trend: trend, issues: issues, last: last, avg: avg, sessions: history.length };
  }

  function formatProgressMarkdown(entries, summary) {
    var lines = [];
    var now = new Date().toISOString();
    lines.push("# Personal Progress — Steady");
    lines.push("");
    lines.push("_Updated live: " + now + "_");
    lines.push("");
    lines.push("## Snapshot");
    lines.push("");
    lines.push("- **Sessions logged:** " + summary.sessions);
    lines.push("- **Recent avg (up to 20):** " + (summary.avg != null ? summary.avg : "—"));
    lines.push("- **Trend:** " + summary.trend.text);
    if (summary.issues.length) {
      lines.push("- **Top issues:** " + summary.issues.map(function (i) { return i.issue + " (" + i.n + "×)"; }).join(", "));
    }
    lines.push("");
    lines.push("## Next-time focus");
    lines.push("");
    if (summary.last && summary.last.corrections && summary.last.corrections.length) {
      summary.last.corrections.forEach(function (tip) { lines.push("- " + tip); });
    } else {
      lines.push("- Complete a reading-aloud or check-in round to unlock next-time corrections.");
    }
    lines.push("");
    lines.push("## Session log (newest first)");
    lines.push("");
    (entries || []).slice(0, 40).forEach(function (e) {
      var time = (e.at || "").replace("T", " ").slice(0, 16) || "?";
      var issues = (e.issues || []).join(", ") || "clean";
      lines.push(
        "### " + time + " · " + (e.title || e.tool) + " · score " + (e.score != null ? e.score : "—") +
          " · tension " + (e.tension != null ? e.tension : "—")
      );
      if (e.target) lines.push("- Target: " + e.target.slice(0, 120));
      if (e.spoken) lines.push("- Heard: " + e.spoken.slice(0, 120));
      lines.push("- Issues: " + issues);
      if (e.corrections && e.corrections.length) lines.push("- Next time: " + e.corrections[0]);
      lines.push("");
    });
    return lines.join("\n").replace(/\n+$/, "") + "\n";
  }

  function progressSelfCheck() {
    var analysis = analyzeSpeech(
      "My name is Sam and I like coffee",
      "My name is Sam Sam uh and I like coffee"
    );
    if (analysis.repetitions.indexOf("sam") < 0) throw new Error("expected sam repetition");
    if (analysis.fillers.indexOf("uh") < 0) throw new Error("expected filler");
    var tips = buildNextTimeCorrections(analysis, { tension: 8, hard: "first-sound" });
    if (tips.length < 2) throw new Error("expected multiple tips");
    var entry = buildSessionEntry({
      tool: "reading",
      title: "Reading aloud",
      target: "My name is Sam",
      spoken: "My name is Sam Sam uh",
      analysis: analysis,
      tension: 6,
      corrections: tips,
    });
    var summary = summarizeProgress([entry]);
    var md = formatProgressMarkdown([entry], summary);
    if (md.indexOf("Personal Progress — Steady") < 0) throw new Error("bad markdown header");
    if (md.indexOf("Next-time focus") < 0) throw new Error("missing next-time");
    var tip = liveTipFromInterim("hello hello");
    if (!tip.text) throw new Error("live tip empty");
    return true;
  }

  root.SteadyProgress = {
    analyzeSpeech: analyzeSpeech,
    liveTipFromInterim: liveTipFromInterim,
    buildNextTimeCorrections: buildNextTimeCorrections,
    buildSessionEntry: buildSessionEntry,
    summarizeProgress: summarizeProgress,
    formatProgressMarkdown: formatProgressMarkdown,
    progressSelfCheck: progressSelfCheck,
  };

  if (typeof process !== "undefined" && process.argv && process.argv[1] && process.argv[1].indexOf("progress-tracker") >= 0) {
    progressSelfCheck();
    console.log("Steady progress-tracker self-check OK");
  }
})(typeof window !== "undefined" ? window : globalThis);
