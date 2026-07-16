#!/usr/bin/env node
/**
 * Steady daily improvement cycle marker — verify, bump version, log.
 * The Cursor Automation / agent implements the actual code from improvements-queue.json.
 *
 * Usage: node scripts/improvement-cycle.mjs [--dry-run] [--mark-id=<id>]
 */
import { readFileSync, writeFileSync, appendFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { spawnSync, spawn } from "child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const VERSION_FILE = join(ROOT, "version.json");
const LOG_FILE = join(ROOT, "IMPROVEMENT-LOG.md");
const QUEUE_FILE = join(ROOT, "scripts", "improvements-queue.json");
const DRY = process.argv.includes("--dry-run");
const markArg = process.argv.find((a) => a.startsWith("--mark-id="));
const FORCE_ID = markArg ? markArg.slice("--mark-id=".length) : null;

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}
function writeJson(path, data) {
  writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`);
}
function bump(version, major = false) {
  const p = version.split(".").map(Number);
  if (major) return `${(p[0] || 0) + 1}.0.0`;
  p[1] = (p[1] || 0) + 1;
  p[2] = 0;
  return p.join(".");
}

function ensureServer() {
  if (DRY) return;
  const r = spawnSync("curl", ["-sf", "http://127.0.0.1:8788/health"], { encoding: "utf8" });
  if (r.status === 0) return;
  spawn("python3", [join(ROOT, "serve.py")], { cwd: ROOT, detached: true, stdio: "ignore" }).unref();
  spawnSync("sleep", ["2"]);
}

function syncCacheBust(iteration) {
  const htmlPath = join(ROOT, "index.html");
  let html = readFileSync(htmlPath, "utf8");
  const bust = String(iteration || 1);
  html = html
    .replace(/(styles\.css)(\?v=\d+)?/g, `$1?v=${bust}`)
    .replace(/(reticle-dev\.js)(\?v=\d+)?/g, `$1?v=${bust}`)
    .replace(/(content\.js)(\?v=\d+)?/g, `$1?v=${bust}`)
    .replace(/(audio\.js)(\?v=\d+)?/g, `$1?v=${bust}`)
    .replace(/(progress-tracker\.js)(\?v=\d+)?/g, `$1?v=${bust}`)
    .replace(/(app\.js)(\?v=\d+)?/g, `$1?v=${bust}`);
  if (!DRY) writeFileSync(htmlPath, html);
}

function nextImprovement(completed, queue) {
  if (FORCE_ID) return queue.find((i) => i.id === FORCE_ID) || null;
  return queue.find((item) => !completed.includes(item.id)) || null;
}

async function runVerify() {
  const r = spawnSync("node", [join(ROOT, "scripts", "verify-app.mjs")], {
    cwd: ROOT,
    encoding: "utf8",
  });
  const out = (r.stdout || "") + (r.stderr || "");
  const ok = r.status === 0 && out.includes("ALL CHECKS PASSED");
  const passed = (out.match(/✓/g) || []).length;
  const failed = (out.match(/✗/g) || []).length;
  return { ok, passed, failed, total: passed + failed, out };
}

async function main() {
  const versionData = readJson(VERSION_FILE);
  const queue = readJson(QUEUE_FILE);
  versionData.iteration = (versionData.iteration || 0) + 1;
  versionData.completedImprovements = versionData.completedImprovements || [];

  ensureServer();
  const result = await runVerify();
  const pending = nextImprovement(versionData.completedImprovements, queue);
  const isDay5 = pending && pending.day === 5;
  const newVersion = result.ok && pending
    ? (isDay5 ? "2.0.0" : bump(versionData.version))
    : versionData.version;

  if (result.ok && pending && !DRY) {
    if (!versionData.completedImprovements.includes(pending.id)) {
      versionData.completedImprovements.push(pending.id);
    }
    versionData.day = pending.day;
  }

  versionData.version = newVersion;
  versionData.updated = new Date().toISOString().slice(0, 10);
  if (!DRY) {
    writeJson(VERSION_FILE, versionData);
    syncCacheBust(versionData.iteration);
    appendFileSync(
      LOG_FILE,
      `\n## Cycle ${versionData.iteration} — ${versionData.updated}\n\n` +
        `- **Version:** ${versionData.version}\n` +
        `- **Status:** ${result.ok ? "ok" : "verify-failed"}\n` +
        `- **Checks:** ${result.passed}/${result.total} passed\n` +
        `- **Completed this cycle:** ${pending ? pending.id + " — " + pending.title : "none"}\n` +
        `- **Notes:** ${pending ? pending.description : "queue empty"}\n`
    );
  }

  console.log(JSON.stringify({
    ok: result.ok,
    version: versionData.version,
    day: versionData.day,
    completed: pending?.id || null,
    next: nextImprovement(versionData.completedImprovements, queue)?.id || null,
  }, null, 2));
  process.exit(result.ok ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
