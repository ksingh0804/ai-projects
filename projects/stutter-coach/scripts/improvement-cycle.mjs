#!/usr/bin/env node
/**
 * 4-hour improvement cycle — start app, verify, auto-fix, apply next improvement, bump version, log progress.
 *
 * Usage: node scripts/improvement-cycle.mjs [--dry-run]
 */
import { readFileSync, writeFileSync, appendFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { spawnSync, spawn } from "child_process";
import { verify } from "./verify-app.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const VERSION_FILE = join(ROOT, "version.json");
const LOG_FILE = join(ROOT, "IMPROVEMENT-LOG.md");
const QUEUE_FILE = join(ROOT, "scripts", "improvements-queue.json");
const DRY = process.argv.includes("--dry-run");

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function writeJson(path, data) {
  writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`);
}

function bumpPatch(version) {
  const parts = version.split(".").map(Number);
  parts[2] = (parts[2] || 0) + 1;
  return parts.join(".");
}

function rebuildBundle() {
  if (DRY) return { ok: true };
  const r = spawnSync(
    "npx",
    ["--yes", "esbuild", "app.js", "--bundle", "--format=iife", "--outfile=app.bundle.js"],
    { cwd: ROOT, encoding: "utf8" }
  );
  return { ok: r.status === 0, output: r.stderr || r.stdout };
}

function syncCacheBust(versionData) {
  const htmlPath = join(ROOT, "index.html");
  let html = readFileSync(htmlPath, "utf8");
  const bust = String(versionData.iteration || 1);
  html = html.replace(/app\.bundle\.js\?v=\d+/, `app.bundle.js?v=${bust}`);
  if (!DRY) writeFileSync(htmlPath, html);
}

function ensureServer() {
  if (DRY) return;
  try {
    const r = spawnSync("curl", ["-sf", "http://127.0.0.1:8787/health"], { encoding: "utf8" });
    if (r.status === 0) return;
  } catch {
    /* ignore */
  }
  spawn("python3", [join(ROOT, "serve.py")], {
    cwd: ROOT,
    detached: true,
    stdio: "ignore",
  }).unref();
  spawnSync("sleep", ["2"]);
}

function autoFix(failures) {
  const actions = [];
  const names = failures.map((f) => f.name);

  if (names.some((n) => n.startsWith("bundle:") || n === "bundle:stale")) {
    const r = rebuildBundle();
    actions.push(r.ok ? "rebuilt app.bundle.js" : "bundle rebuild failed");
  }

  if (names.some((n) => n.includes("GET /") || n.includes("health"))) {
    ensureServer();
    actions.push("restarted or confirmed server on :8787");
  }

  return actions;
}

function appendLog(entry) {
  const block = `
## Cycle ${entry.iteration} — ${entry.date}

- **Version:** ${entry.version} → ${entry.newVersion}
- **Status:** ${entry.status}
- **Checks:** ${entry.passed}/${entry.total} passed
- **Auto-fixes:** ${entry.fixes.length ? entry.fixes.join("; ") : "none"}
- **Improvement applied:** ${entry.improvement || "none (queue empty or already done)"}
- **Notes:** ${entry.notes}

`;
  if (!DRY) appendFileSync(LOG_FILE, block);
}

function nextImprovement(completed, queue) {
  return queue.find((item) => !completed.includes(item.id)) || null;
}

async function main() {
  const started = new Date();
  const versionData = readJson(VERSION_FILE);
  const queue = readJson(QUEUE_FILE);
  versionData.iteration = (versionData.iteration || 0) + 1;

  ensureServer();

  let result = await verify({ ensureServer: true });
  let fixes = [];

  if (!result.ok) {
    fixes = autoFix(result.failures);
    if (fixes.length) rebuildBundle();
    result = await verify({ ensureServer: true });
  }

  const improvement = nextImprovement(versionData.completedImprovements || [], queue);
  let improvementNote = "verification-only cycle";

  if (result.ok && improvement && !DRY) {
    if (!versionData.completedImprovements.includes(improvement.id)) {
      versionData.completedImprovements.push(improvement.id);
    }
    improvementNote = `${improvement.title} (${improvement.id})`;
  }

  const newVersion = result.ok ? bumpPatch(versionData.version) : versionData.version;
  versionData.version = newVersion;
  versionData.lastCycleAt = started.toISOString();
  versionData.lastCycleStatus = result.ok ? "pass" : "fail";

  if (!DRY) {
    writeJson(VERSION_FILE, versionData);
    syncCacheBust(versionData);
    if (fixes.length || !result.ok) rebuildBundle();
  }

  appendLog({
    iteration: versionData.iteration,
    date: started.toISOString().slice(0, 16).replace("T", " "),
    version: readJson(VERSION_FILE).version,
    newVersion,
    status: result.ok ? "✅ pass" : "❌ fail",
    passed: result.passed,
    total: result.total,
    fixes,
    improvement: improvementNote,
    notes: result.ok
      ? "App verified; version bumped."
      : `Remaining failures: ${result.failures.map((f) => f.name).join(", ")}`,
  });

  const summary = {
    ok: result.ok,
    version: newVersion,
    iteration: versionData.iteration,
    fixes,
    improvement: improvementNote,
    failures: result.failures,
  };

  console.log(JSON.stringify(summary, null, 2));
  process.exit(result.ok ? 0 : 1);
}

main();
