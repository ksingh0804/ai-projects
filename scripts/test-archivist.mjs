import assert from "node:assert/strict";
import {
  atlas,
  chapterCount,
  complete,
  createState,
  plainText,
  run,
} from "../docs/guide/engine.js";

function say(input, state = createState()) {
  const response = run(input, state);
  return { text: plainText(response.lines), response, state: { ...state, ...pick(response) } };
}

function pick(response) {
  const next = {};
  if (response.cwd) next.cwd = response.cwd;
  if (response.chapter != null) next.chapter = response.chapter;
  if (response.focus != null) next.focus = response.focus;
  return next;
}

const briefing = say("");
assert.match(briefing.text, /Briefing\s+1 \/ 4/);
assert.match(briefing.text, /Kaustubh Singh/);
assert.equal(briefing.response.chapter, 1);

let state = createState();
for (let step = 1; step <= 4; step += 1) {
  const turn = say(step === 1 ? "tour" : "", state);
  state = turn.state;
  assert.match(turn.text, new RegExp(`Briefing\\s+${step} \\/ 4`));
}
assert.match(say("", state).text, /Briefing complete/);
const second = say("next", say("tour").state);
assert.match(second.text, /Open these three/);
assert.match(second.text, /ksingh0804.github.io\/ai-projects/);
assert.deepEqual(second.response.highlights, ["steady", "loan", "rag"]);
assert.doesNotMatch(plainText(run("tour all").lines), /FreshCart|grocery-logistics/);

const steady = say("open steady");
assert.match(steady.text, /Web Audio/);
assert.match(steady.text, /github.io\/ai-projects/);
assert.equal(steady.response.focus, "steady");

const loan = say("open loan");
assert.match(loan.text, /307,511|307,000|8\.1%|92%/);
assert.match(loan.text, /EXT_SOURCE/);
assert.match(loan.text, /github.com\/ksingh0804\/Loan-Defaulter/);

assert.match(say("open rag").text, /Ollama/);
assert.match(say("open coach").text, /8787/);
assert.match(say("open greenleaf").text, /FastAPI/);
assert.match(say("open no-such").text, /don't have a project/);
assert.match(say("open scratch").text, /simpleGame/);
assert.match(say("open ipl").text, /IPL/);

const repos = say("repos");
for (const name of [
  "ai-projects",
  "Loan-Defaulter",
  "greenleaf-market",
  "IPL",
  "Stock-Sentiment",
  "Cardiovascular-Analysis",
  "Covid19-Analysis",
  "Breast-Cancer-Prediction",
  "Book-Recommendation",
  "Forest-Fires-Prediction",
  "ksingh0804",
  "vs_code_python_github",
  "simpleGame",
]) {
  assert.match(repos.text, new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
}
assert.equal(chapterCount(), 4);
assert.equal(atlas().flatMap((group) => group.items).length, 8);

let walked = createState();
walked = say("cd projects", walked).state;
assert.equal(walked.cwd, "/projects");
assert.match(say("ls", walked).text, /steady\.md/);
assert.match(say("cat steady.md", walked).text, /Steady/);
assert.match(say("cat ../../etc/passwd", walked).text, /No such file/);
assert.equal(say("cd ..", walked).state.cwd, "/");

const tab = complete("op", createState());
assert.ok(tab.matches.includes("open"));
assert.match(complete("open ste", createState()).replacement, /^open steady/);

assert.match(say("contact").text, /singhkaustubh85@gmail.com/);
assert.match(say("skills").text, /scikit-learn/);
assert.doesNotMatch(say("skills").text, /Airflow|Snowflake|dbt/);
assert.match(say("sudo hire me").text, /singhkaustubh85@gmail.com/);

console.log("archivist engine: ok");
