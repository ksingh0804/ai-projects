#!/usr/bin/env node
/**
 * Smoke tests for Stutter Coach — used by the 4-hour improvement cycle.
 */
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { spawnSync } from "child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const BASE = "http://127.0.0.1:8787";
const failures = [];
const checks = [];

function pass(name) {
  checks.push({ name, ok: true });
}

function fail(name, detail) {
  failures.push({ name, detail });
  checks.push({ name, ok: false, detail });
}

async function fetchOk(url, label = url) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) {
      fail(label, `HTTP ${res.status}`);
      return null;
    }
    pass(label);
    return res;
  } catch (err) {
    fail(label, err.message);
    return null;
  }
}

function checkFiles() {
  const required = [
    "index.html",
    "app.bundle.js",
    "app.js",
    "conversation.js",
    "realtime-coach.js",
    "version.json",
    "serve.py",
  ];
  for (const f of required) {
    const p = join(ROOT, f);
    if (!existsSync(p)) fail(`file:${f}`, "missing");
    else pass(`file:${f}`);
  }
}

function checkBundleFreshness() {
  const bundle = join(ROOT, "app.bundle.js");
  const app = join(ROOT, "app.js");
  if (!existsSync(bundle) || !existsSync(app)) return;
  const bStat = readFileSync(bundle).length;
  if (bStat < 50000) fail("bundle:size", "bundle suspiciously small");
  else pass("bundle:size");
  const src = readFileSync(app, "utf8");
  const bundled = readFileSync(bundle, "utf8");
  if (src.includes("renderPulseStreak") && !bundled.includes("renderPulseStreak")) {
    fail("bundle:stale", "bundle out of date vs app.js");
  } else if (src.includes("loadAppMeta") && !bundled.includes("loadAppMeta")) {
    fail("bundle:stale", "bundle missing loadAppMeta");
  } else {
    pass("bundle:sync");
  }
}

function checkHtml() {
  const html = readFileSync(join(ROOT, "index.html"), "utf8");
  const ids = [
    "micBtn",
    "exerciseList",
    "liveCoachPanel",
    "startRoundBtn",
    "app.bundle.js",
    "realtimeCoach",
    "appVersionLabel",
  ];
  for (const id of ids) {
    if (!html.includes(id)) fail(`html:${id}`, "missing in index.html");
    else pass(`html:${id}`);
  }
}

async function checkServer() {
  const health = await fetchOk(`${BASE}/health`, "GET /health");
  if (health) {
    try {
      const data = await health.json();
      if (data.status !== "ok") fail("health:body", JSON.stringify(data));
      else pass("health:body");
    } catch (e) {
      fail("health:json", e.message);
    }
  }

  const index = await fetchOk(`${BASE}/`, "GET /");
  if (index) {
    const text = await index.text();
    if (!text.includes("Stutter Coach")) fail("index:content", "title missing");
    else pass("index:content");
  }

  const versionRes = await fetchOk(`${BASE}/version.json`, "GET /version.json");
  if (versionRes) {
    try {
      const v = await versionRes.json();
      if (!v.version) fail("version:json", "no version field");
      else pass("version:json");
    } catch (e) {
      fail("version:parse", e.message);
    }
  }

  const html = readFileSync(join(ROOT, "index.html"), "utf8");
  const m = html.match(/app\.bundle\.js\?v=(\d+)/);
  const v = m ? m[1] : "5";
  const bundle = await fetchOk(`${BASE}/app.bundle.js?v=${v}`, "GET /app.bundle.js");
  if (bundle) {
    const js = await bundle.text();
    const markers = ["__STUTTER_COACH_READY", "analyzeLiveUpdate", "startConversationRound"];
    for (const marker of markers) {
      if (!js.includes(marker)) fail(`bundle:${marker}`, "missing in bundle");
      else pass(`bundle:${marker}`);
    }
  }
}

export async function verify(options = {}) {
  failures.length = 0;
  checks.length = 0;

  checkFiles();
  checkHtml();
  checkBundleFreshness();

  if (options.ensureServer) {
    const ping = await fetch(`${BASE}/health`, { signal: AbortSignal.timeout(2000) }).catch(() => null);
    if (!ping?.ok) {
      spawnSync("python3", [join(ROOT, "serve.py")], {
        cwd: ROOT,
        detached: true,
        stdio: "ignore",
      });
      await new Promise((r) => setTimeout(r, 1500));
    }
  }

  await checkServer();

  return {
    ok: failures.length === 0,
    failures,
    checks,
    passed: checks.filter((c) => c.ok).length,
    total: checks.length,
  };
}

if (process.argv[1]?.endsWith("verify-app.mjs")) {
  const result = await verify({ ensureServer: process.argv.includes("--ensure-server") });
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.ok ? 0 : 1);
}
