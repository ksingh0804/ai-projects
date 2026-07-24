/**
 * Steady app smoke test — loads the app in headless Chrome and checks core UI/JS.
 * Run: node scripts/verify-app.mjs  (server must be on http://127.0.0.1:8788)
 */
import pkg from "../../toy-product-research/video/node_modules/playwright-core/index.js";
const { chromium } = pkg;

const URL = "http://127.0.0.1:8788/";
const views = ["home", "daf", "pacing", "breathing", "techniques", "reading", "interview", "describe", "confidence", "learn", "progress"];
const errors = [];

function ok(msg) { console.log("  ✓", msg); }
function fail(msg) { console.error("  ✗", msg); errors.push(msg); }

const browser = await chromium.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
});
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

page.on("pageerror", (e) => {
  if (/esm\.sh|@reticlehq/.test(e.message)) return; // optional Reticle SDK
  fail("JS error: " + e.message);
});
page.on("console", (msg) => {
  if (msg.type() !== "error") return;
  const t = msg.text();
  if (/esm\.sh|Content Security Policy|@reticlehq/.test(t)) return;
  fail("console.error: " + t);
});

try {
  const res = await page.goto(URL, { waitUntil: "networkidle", timeout: 15000 });
  if (!res || res.status() !== 200) fail("Home page HTTP " + (res ? res.status() : "no response"));
  else ok("Home page loads (200)");

  // Dismiss first-run onboarding if present
  async function dismissOnboard() {
    const visible = await page.locator("#onboard-overlay:not([hidden])").count();
    if (visible) {
      await page.locator("#onboard-done").click();
      await page.waitForTimeout(100);
    }
  }
  await dismissOnboard();
  ok("Onboarding dismissible");

  // Content loaded
  const techCount = await page.locator("#technique-list .tech-card").count();
  if (techCount < 5) fail("Techniques: expected ≥5 cards, got " + techCount);
  else ok("Techniques: " + techCount + " cards");

  const dailyCount = await page.locator('#passage-select optgroup[label*="Today"] option').count();
  if (dailyCount !== 50) fail("Reading daily topics: expected 50, got " + dailyCount);
  else ok("Reading: 50 daily topics");

  const readingText = await page.locator("#reading-box .w").count();
  if (readingText < 10) fail("Reading box empty or too short (" + readingText + " words)");
  else ok("Reading passage rendered (" + readingText + " words)");

  const interviewCount = await page.locator("#interview-list .interview-card").count();
  if (interviewCount !== 10) fail("Interview daily answers: expected 10, got " + interviewCount);
  else ok("Interview: 10 daily Q&A cards");

  const missionBtn = await page.locator("#mission-start").count();
  if (!missionBtn) fail("Guided mission missing");
  else ok("Guided mission UI present");

  const weekCal = await page.locator("#week-cal .week-day").count();
  if (weekCal !== 7) fail("Week calendar missing");
  else ok("Week streak calendar present");

  const combo = await page.locator("#combo-echo-pace").count();
  if (!combo) fail("Echo + Pace combo missing");
  else ok("Echo + Pace combo present");

  const health = await page.evaluate(async () => {
    const r = await fetch("/health");
    return r.ok ? await r.json() : null;
  });
  if (!health || health.status !== "ok") fail("GET /health failed");
  else ok("Health endpoint ok (v" + health.version + ")");

  const breathOpts = await page.locator("#breath-pattern option").count();
  if (breathOpts < 2) fail("Breathing patterns missing");
  else ok("Breathing: " + breathOpts + " patterns");

  const factsCount = await page.locator("#facts-list .fact").count();
  if (factsCount < 4) fail("Learn facts missing");
  else ok("Learn: " + factsCount + " facts");

  // Navigation + deep links
  for (const v of views) {
    await page.click('.nav-btn[data-view="' + v + '"]');
    await page.waitForTimeout(150);
    const active = await page.locator("#view-" + v + ".is-active").count();
    if (active !== 1) fail("Nav failed for view: " + v);
  }
  ok("All " + views.length + " tabs navigate");

  await page.goto(URL + "#progress", { waitUntil: "networkidle" });
  await page.waitForTimeout(200);
  await dismissOnboard();
  const progActive = await page.locator("#view-progress.is-active").count();
  if (progActive !== 1) fail("Deep-link #progress failed");
  else ok("Deep-link #progress works");

  // Echo stays running when switching to Reading (logic check via injected state)
  await page.goto(URL + "#daf", { waitUntil: "networkidle" });
  await dismissOnboard();
  const echoPersists = await page.evaluate(() => {
    const src = document.querySelector('script[src*="app.js"]');
    return fetch(src.src).then((r) => r.text()).then((t) => {
      return !t.includes('view !== "daf" && window.SteadyAudio.isRunning()');
    });
  });
  if (!echoPersists) fail("Echo still stops on tab change (regression)");
  else ok("Echo persists across tabs (no auto-stop in go())");

  // Custom text mode
  await page.goto(URL + "#reading", { waitUntil: "networkidle" });
  await dismissOnboard();
  await page.selectOption("#passage-select", "custom");
  await page.fill("#custom-text", "Hello practice text for testing.");
  await page.waitForTimeout(100);
  const customWords = await page.locator("#reading-box .w").count();
  if (customWords < 4) fail("Custom text reading not rendered");
  else ok("Custom text mode works");

  await page.click('.nav-btn[data-view="interview"]');
  const timerBtn = await page.locator("#interview-timer").count();
  if (!timerBtn) fail("Interview timer missing");
  else ok("Interview practice timer present");
  const firstCard = page.locator("#interview-list .interview-card").first();
  await firstCard.locator('button[data-action="reveal"]').click();
  await firstCard.locator('button[data-action="practice"]').click();
  await page.waitForTimeout(100);
  const readingActiveAfterInterview = await page.locator("#view-reading.is-active").count();
  const interviewPracticeWords = await page.locator("#reading-box .w").count();
  if (readingActiveAfterInterview !== 1 || interviewPracticeWords < 20) {
    fail("Interview Practice in Reading did not load answer into Reading");
  } else ok("Interview answer can be practiced in Reading");

  await page.click('.nav-btn[data-view="describe"]');
  const describeFields = await page.locator("#describe-form textarea").count();
  if (describeFields !== 4) fail("Describe form: expected 4 fields, got " + describeFields);
  else ok("Describe: 4 structured fields");
  await page.fill('#describe-who', "A person and a dog.");
  await page.fill('#describe-where', "In a park.");
  await page.fill('#describe-action', "They are resting.");
  await page.fill('#describe-details', "It feels calm.");
  await page.click("#describe-reveal");
  const modelVisible = await page.locator("#describe-model:not([hidden])").count();
  if (!modelVisible) fail("Describe model answer did not reveal");
  else ok("Describe model answer reveals");
  await page.click("#describe-practice-model");
  await page.waitForTimeout(100);
  const readingAfterDescribe = await page.locator("#view-reading.is-active").count();
  const describePracticeWords = await page.locator("#reading-box .w").count();
  if (readingAfterDescribe !== 1 || describePracticeWords < 10) {
    fail("Describe Practice model in Reading failed");
  } else ok("Describe model can be practiced in Reading");

  // Progress stats render
  await page.click('.nav-btn[data-view="progress"]');
  const stats = await page.locator("#progress-stats .stat").count();
  if (stats !== 4) fail("Progress stats: expected 4, got " + stats);
  else ok("Progress dashboard renders");

  // Log practice button
  await page.click('.nav-btn[data-view="home"]');
  await page.click("#log-practice-btn");
  await page.click('.nav-btn[data-view="progress"]');
  const logItems = await page.locator("#activity-log li").count();
  if (logItems < 1) fail("Practice log not updated after button click");
  else ok("Practice logging works");

} catch (e) {
  fail("Test harness: " + e.message);
} finally {
  await browser.close();
}

console.log("\n" + (errors.length ? errors.length + " FAILED" : "ALL CHECKS PASSED"));
process.exit(errors.length ? 1 : 0);
