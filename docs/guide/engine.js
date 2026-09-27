/**
 * ARCHIVIST command engine.
 * Pure data + text. The page in ui.js renders this; nothing here touches the DOM.
 */

export const EMAIL = "singhkaustubh85@gmail.com";
export const PROFILE = "https://github.com/ksingh0804";
export const GUIDE = "https://ksingh0804.github.io/ai-projects/guide/";

const WORKSHOP = "https://github.com/ksingh0804/ai-projects";

export function text(value, kind = "text") {
  return { type: "text", text: value, kind };
}
export function linkLine(label, href) {
  return { type: "link", text: label, href, kind: "link" };
}
export function gap() {
  return { type: "gap" };
}
export function actions(items) {
  return { type: "actions", items };
}
export function card(data) {
  return { type: "card", ...data };
}

const NOTEBOOKS = [
  {
    id: "ipl",
    name: "IPL",
    url: "https://github.com/ksingh0804/IPL",
    line: "Exploratory analysis of IPL matches and deliveries. pandas, Jupyter.",
  },
  {
    id: "stocks",
    name: "Stock-Sentiment",
    url: "https://github.com/ksingh0804/Stock-Sentiment",
    line: "Sentiment on stock-related headlines. NLP, scikit-learn, Jupyter.",
  },
  {
    id: "heart",
    name: "Cardiovascular-Analysis",
    url: "https://github.com/ksingh0804/Cardiovascular-Analysis",
    line: "EDA and risk modeling on a cardiovascular dataset.",
  },
  {
    id: "covid",
    name: "Covid19-Analysis",
    url: "https://github.com/ksingh0804/Covid19-Analysis",
    line: "Exploratory analysis and charts of COVID-19 case data.",
  },
  {
    id: "cancer",
    name: "Breast-Cancer-Prediction",
    url: "https://github.com/ksingh0804/Breast-Cancer-Prediction",
    line: "Binary classification of breast-cancer tumors with scikit-learn.",
  },
  {
    id: "books",
    name: "Book-Recommendation",
    url: "https://github.com/ksingh0804/Book-Recommendation",
    line: "Collaborative-filtering book recommender.",
  },
  {
    id: "fires",
    name: "Forest-Fires-Prediction",
    url: "https://github.com/ksingh0804/Forest-Fires-Prediction",
    line: "Regression of burned area from meteorological features.",
  },
];

const REPOS = [
  {
    name: "ai-projects",
    tag: "workshop",
    url: WORKSHOP,
    line: "Where the newest work lives: Steady, Stutter Coach, the logistics agent, and the credit-risk notebook.",
  },
  {
    name: "Loan-Defaulter",
    tag: "build",
    url: "https://github.com/ksingh0804/Loan-Defaulter",
    line: "Home Credit probability-of-default analysis. Same project as projects/loan-defaulter in the workshop.",
  },
  {
    name: "greenleaf-market",
    tag: "build",
    url: "https://github.com/ksingh0804/greenleaf-market",
    line: "Grocery store demo: Next.js 14, FastAPI, SQLite, JWT auth, cart, fake checkout, admin.",
  },
  ...NOTEBOOKS.map((n) => ({
    name: n.name,
    tag: "study",
    url: n.url,
    line: n.line,
  })),
  {
    name: "ksingh0804",
    tag: "profile",
    url: "https://github.com/ksingh0804/ksingh0804",
    line: "Profile README. This file is the front door of the account.",
  },
  {
    name: "vs_code_python_github",
    tag: "scratch",
    url: "https://github.com/ksingh0804/vs_code_python_github",
    line: "Scratch space from the editor.",
  },
  {
    name: "simpleGame",
    tag: "scratch",
    url: "https://github.com/ksingh0804/simpleGame",
    line: "Scratch space.",
  },
];

const PROJECTS = {
  steady: {
    title: "Steady",
    summary: "A free, private, in-browser toolkit for people who stutter. It is on the public web.",
    paragraphs: [
      "No account and no paid API. Echo (delayed auditory feedback, pitch shift, masking), a pacing metronome, breathing, technique drills, paced reading with a live coach, an interview practice set, picture description, conversation practice, and CBT/ACT tools for avoidance.",
      "The public site is the thing to try. Wired headphones matter for Echo, otherwise the mic feeds back. An iOS shell wraps the same UI in WKWebView; the browser build is the one to open.",
      "Steady is a practice tool. It is explicit that it does not replace a speech-language pathologist.",
    ],
    links: [
      { label: "Open the live app", href: "https://ksingh0804.github.io/ai-projects/" },
      { label: "iPhone frame preview", href: "https://ksingh0804.github.io/ai-projects/iphone.html" },
      { label: "Source in the workshop", href: `${WORKSHOP}/tree/master/projects/steady-voice` },
    ],
    openFirst: ["README.md", "index.html", "audio.js", "app.js"],
    stack: "HTML, CSS, JavaScript, Web Audio, Web Speech, SwiftUI shell",
  },
  loan: {
    title: "Loan Defaulter",
    summary: "Credit-risk analysis on Home Credit applications. The question is who is likely to miss a payment.",
    paragraphs: [
      "About 307,511 applications and a default rate near 8.1%. A classifier that always predicts repayment is about 92% accurate and catches no defaults. The notebook is built around that fact.",
      "It keeps external credit scores (EXT_SOURCE_2 and EXT_SOURCE_3), treats DAYS_EMPLOYED = 365243 as a sentinel for pensioners, and builds burden ratios. Gender stays in the EDA and out of the model. Fitting is leakage-safe: a sklearn Pipeline learns imputation and encoding on the training fold only.",
      "The write-up compares a majority dummy, logistic regression with and without class weight, train-only oversampling, and histogram gradient boosting. The decision cutoff is a cost-weighted threshold, with a missed default treated as several times as expensive as a false reject.",
      "Send people to the standalone repository. The same project also lives in the workshop at projects/loan-defaulter. The Kaggle CSV is not in git; the README says where to put it.",
    ],
    links: [
      { label: "Standalone repository", href: "https://github.com/ksingh0804/Loan-Defaulter" },
      { label: "Copy in the workshop", href: `${WORKSHOP}/tree/master/projects/loan-defaulter` },
    ],
    openFirst: ["README.md", "Loan Defaulter Analysis.ipynb"],
    stack: "pandas, NumPy, scikit-learn, matplotlib, seaborn",
  },
  rag: {
    title: "RAG Logistics Agent",
    summary: "A local tool-calling agent over logistics SOP documents, plus calculators you can check by hand.",
    paragraphs: [
      "Ollama does chat and embeddings. Chroma stores the vectors. Streamlit is the UI. The agent chooses a tool: search the SOP PDFs, compute EOQ, estimate safety stock, or look up a sample inventory file.",
      "Document answers have to come from retrieved text. If the context is missing, the agent says it does not know.",
      "This one runs on your machine. It is not hosted. The folder also has architecture notes and an interview prep guide.",
    ],
    links: [
      { label: "Source in the workshop", href: `${WORKSHOP}/tree/master/projects/rag-logistics-agent` },
    ],
    openFirst: ["README.md", "agent.py", "tools.py", "ingest.py"],
    stack: "Python, LangChain, Ollama, Chroma, Streamlit, pypdf",
  },
  coach: {
    title: "Stutter Coach",
    summary: "A browser voice-practice app with live feedback, a weekly plan, and short conversation rounds.",
    paragraphs: [
      "It uses the Web Speech API. There is no key and no account. Exercises include live coaching, small talk, gentle onset, slow reading, and hard consonants.",
      "Steady is the broader toolkit (echo, pacing, reading, interview practice, confidence tools). Stutter Coach is the focused practice loop: speak, get a score, continue.",
      "Run it locally. The README starts a server on http://127.0.0.1:8787. Opening the file directly blocks the microphone.",
    ],
    links: [
      { label: "Source in the workshop", href: `${WORKSHOP}/tree/master/projects/stutter-coach` },
    ],
    openFirst: ["README.md", "app.js", "realtime-coach.js"],
    stack: "HTML, CSS, JavaScript, Web Speech API",
  },
  greenleaf: {
    title: "Greenleaf Market",
    summary: "A grocery store demo with a catalog, cart, checkout, accounts, and an admin desk.",
    paragraphs: [
      "The front end is Next.js 14 with TypeScript and Tailwind. The API is FastAPI with SQLAlchemy. SQLite is created and seeded on first boot. Auth is JWT. The cart lives in the browser; the server re-prices the order before checkout.",
      "Payments go through a provider interface. The working provider is a manual fake checkout, with a slot left for Stripe. Admin routes for products, categories, and order status are gated on the server.",
      "Run both processes locally. The README has the commands. Treat the seeded admin account as a local demo credential and change it before any real deploy.",
    ],
    links: [
      { label: "Repository", href: "https://github.com/ksingh0804/greenleaf-market" },
    ],
    openFirst: ["README.md", "backend/", "frontend/"],
    stack: "Next.js 14, TypeScript, Tailwind, FastAPI, SQLite, JWT",
  },
  travis: {
    title: "Travis Prep",
    summary: "A live interview-practice page for a library IT role at Travis AFB.",
    paragraphs: [
      "Ten scenario questions with draft answers, quick-fire flashcards, and questions to ask the panel. It is preparation material for a Technical Information Specialist interview.",
      "The page is already deployed next to Steady. It is a practice drill, separate from the data and product work.",
    ],
    links: [
      { label: "Open Travis Prep", href: "https://ksingh0804.github.io/ai-projects/career-launch/" },
    ],
    openFirst: ["docs/career-launch/index.html", "docs/career-launch/app.js"],
    stack: "HTML, CSS, JavaScript",
  },
};

const ALIASES = {
  steady: "steady",
  voice: "steady",
  "steady-voice": "steady",
  loan: "loan",
  credit: "loan",
  defaulter: "loan",
  "loan-defaulter": "loan",
  rag: "rag",
  logistics: "rag",
  agent: "rag",
  coach: "coach",
  stutter: "coach",
  "stutter-coach": "coach",
  greenleaf: "greenleaf",
  market: "greenleaf",
  "greenleaf-market": "greenleaf",
  travis: "travis",
  career: "travis",
  studies: "studies",
  study: "studies",
  notebooks: "studies",
  notebook: "studies",
  ipl: "ipl",
  stocks: "stocks",
  "stock-sentiment": "stocks",
  sentiment: "stocks",
  heart: "heart",
  cardio: "heart",
  cardiovascular: "heart",
  covid: "covid",
  covid19: "covid",
  cancer: "cancer",
  breast: "cancer",
  books: "books",
  book: "books",
  fires: "fires",
  fire: "fires",
  forest: "fires",
  scratch: "scratch",
};

const COMMANDS = [
  ["tour", "Start the four-part briefing"],
  ["next", "Next part of the briefing"],
  ["back", "Previous part of the briefing"],
  ["projects", "The work, and the id to open next"],
  ["open <id>", "A single project, with the link and the first file"],
  ["map", "How the repositories fit together"],
  ["live", "Pages you can click and use now"],
  ["repos", "Every public repository, labeled"],
  ["skills", "The stack I will actually talk about"],
  ["contact", "How to reach Kaustubh"],
  ["pin", "The short list if you only have a few minutes"],
  ["whoami", "Who this account belongs to"],
  ["ls", "List the guide's files"],
  ["cd <dir>", "Move around the guide"],
  ["cat <file>", "Read a file in the guide"],
  ["help", "Show this list"],
  ["clear", "Clear the screen"],
];

export function createState() {
  return { cwd: "/", chapter: 0, focus: "", highlights: [] };
}

export function projectIds() {
  return ["steady", "loan", "rag", "coach", "greenleaf", "studies", "travis", "scratch", ...NOTEBOOKS.map((n) => n.id)];
}

export function commandNames() {
  return [
    "tour",
    "brief",
    "interview",
    "next",
    "back",
    "projects",
    "open",
    "map",
    "live",
    "repos",
    "skills",
    "stack",
    "contact",
    "email",
    "pin",
    "shortlist",
    "whoami",
    "about",
    "ls",
    "cd",
    "cat",
    "pwd",
    "help",
    "commands",
    "clear",
    "voice",
  ];
}

function renderProject(project) {
  return [
    card({
      kicker: "Project",
      title: project.title,
      summary: project.summary,
      points: project.paragraphs,
      links: project.links.map((item, index) => ({ ...item, primary: index === 0 })),
      meta: project.stack,
      files: project.openFirst.join("  ·  "),
    }),
  ];
}

function renderNotebook(notebook) {
  return [
    card({
      kicker: "Study",
      title: notebook.name,
      summary: notebook.line,
      points: ["One dataset, one question, a README. Read it after the builds."],
      links: [{ label: "Repository", href: notebook.url, primary: true }],
    }),
  ];
}

function studiesLines() {
  const lines = [
    text("Studies", "title"),
    text("Smaller notebook repositories. Each one is a single dataset and a single question. Read them after the builds."),
    gap(),
  ];
  for (const notebook of NOTEBOOKS) {
    lines.push(text(`${notebook.id.padEnd(8)} ${notebook.name}`, "label"));
    lines.push(text(notebook.line, "dim"));
    lines.push(linkLine(notebook.url, notebook.url));
    lines.push(gap());
  }
  lines.push(text("Open one with `open ipl`, `open stocks`, `open cancer`, and so on.", "dim"));
  return lines;
}

function mapLines() {
  return [
    text("Map of github.com/ksingh0804", "title"),
    text("Read the account in this order."),
    gap(),
    text("1  Profile", "label"),
    text("github.com/ksingh0804 is the front door. The README there should take a minute."),
    linkLine(PROFILE, PROFILE),
    gap(),
    text("2  Workshop", "label"),
    text("ai-projects holds the newest work: Steady, Stutter Coach, the logistics agent, and the credit-risk notebook."),
    linkLine(WORKSHOP, WORKSHOP),
    gap(),
    text("3  Standalone builds", "label"),
    text("Loan-Defaulter and greenleaf-market are one idea each, in their own repositories."),
    gap(),
    text("4  Studies", "label"),
    text("IPL, Stock-Sentiment, Cardiovascular-Analysis, Covid19-Analysis, Breast-Cancer-Prediction, Book-Recommendation, Forest-Fires-Prediction."),
    gap(),
    text("5  Scratch space", "label"),
    text("vs_code_python_github and simpleGame. Useful to the author. Safe for a visitor to pass over."),
    gap(),
    text("6  This guide", "label"),
    text("ARCHIVIST is the map. It lives on GitHub Pages next to Steady."),
    linkLine(GUIDE, GUIDE),
  ];
}

export function bootLines() {
  return [
    card({
      kicker: "ARCHIVIST",
      title: "I explain this GitHub.",
      summary: "Kaustubh Singh builds data analysis, machine-learning studies, and small products you can run.",
      points: [
        "Press Enter for a four-part briefing.",
        "Or open a name: steady, loan, rag, greenleaf.",
      ],
      links: [
        { label: "Steady, live", href: "https://ksingh0804.github.io/ai-projects/", primary: true },
        { label: "Profile", href: PROFILE },
      ],
    }),
  ];
}

const CHAPTERS = [
  {
    title: "Who",
    summary: "Kaustubh Singh. This GitHub is a workshop for data analysis, machine learning, a document agent, and small products you can run.",
    points: [
      "The profile is the front door. The repository ai-projects is where the newest work lives.",
      "The left column is the map. This window is the explanation.",
    ],
    links: [],
    highlights: [],
    speech: "Kaustubh Singh. This GitHub is a workshop for data analysis, machine learning, a document agent, and small products you can run.",
    suggestions: ["next", "projects", "contact"],
  },
  {
    title: "Open these three",
    summary: "The map on the left is lit for these. They are the three worth a hiring read.",
    points: [
      "Steady — a live, private speech toolkit in the browser.",
      "Loan Defaulter — about 307,000 Home Credit applications. A model that always predicts repayment is about 92% accurate and still misses every default.",
      "RAG Logistics Agent — a local tool-calling agent over SOP documents, inside ai-projects.",
    ],
    links: [
      { label: "Open Steady", href: "https://ksingh0804.github.io/ai-projects/", primary: true },
      { label: "Loan Defaulter", href: "https://github.com/ksingh0804/Loan-Defaulter" },
      { label: "Logistics agent", href: `${WORKSHOP}/tree/master/projects/rag-logistics-agent` },
    ],
    highlights: ["steady", "loan", "rag"],
    speech: "If you open three things, open Steady, the loan default analysis, and the logistics agent.",
    suggestions: ["open steady", "open loan", "open rag", "next"],
  },
  {
    title: "How the account is organized",
    summary: "Thirteen public repositories, in an order.",
    points: [
      "ai-projects is the workshop: Steady, Stutter Coach, the logistics agent, and the credit notebook.",
      "greenleaf-market and Loan-Defaulter are standalone builds.",
      "Seven notebook repositories are studies: cricket, stock headlines, cardiovascular data, COVID-19, breast-cancer classification, books, and forest fires.",
      "vs_code_python_github and simpleGame are scratch space.",
    ],
    links: [
      { label: "Workshop", href: WORKSHOP, primary: true },
      { label: "Greenleaf", href: "https://github.com/ksingh0804/greenleaf-market" },
    ],
    highlights: ["greenleaf", "coach", "studies", "scratch"],
    speech: "ai-projects is the workshop. Greenleaf and Loan Defaulter stand alone. The notebooks are studies. Two repositories are scratch space.",
    suggestions: ["next", "map", "repos", "open greenleaf"],
  },
  {
    title: "What to look for",
    summary: "Read the first paragraph of the README. Check that a stranger can run it. Notice what the write-up left for later. That is the signal in this account.",
    points: [],
    links: [
      { label: "Steady", href: "https://ksingh0804.github.io/ai-projects/", primary: true },
      { label: "Loan Defaulter", href: "https://github.com/ksingh0804/Loan-Defaulter" },
      { label: "Workshop", href: WORKSHOP },
    ],
    highlights: ["steady", "loan"],
    speech: "In any repository, read the first paragraph, check that a stranger can run it, and notice what the write-up left for later.",
    suggestions: ["projects", "open steady", "contact", "pin"],
  },
];

export function chapterCount() {
  return CHAPTERS.length;
}

function showChapter(n) {
  const index = Math.min(Math.max(n, 1), CHAPTERS.length);
  const chapter = CHAPTERS[index - 1];
  return result(
    [
      card({
        kicker: `Briefing ${index} / ${CHAPTERS.length}`,
        title: chapter.title,
        summary: chapter.summary,
        points: chapter.points,
        links: chapter.links,
        next: index < CHAPTERS.length,
        done: index === CHAPTERS.length,
      }),
    ],
    {
      chapter: index,
      focus: "",
      highlights: chapter.highlights,
      speech: chapter.speech,
      suggestions: chapter.suggestions,
      mood: "talk",
    }
  );
}

export function atlas() {
  return [
    {
      label: "Open these",
      items: [
        { id: "steady", name: "Steady", note: "Live app" },
        { id: "loan", name: "Loan Defaulter", note: "Credit risk" },
        { id: "rag", name: "Logistics agent", note: "Workshop" },
        { id: "greenleaf", name: "Greenleaf", note: "Full-stack" },
      ],
    },
    {
      label: "Also here",
      items: [
        { id: "coach", name: "Stutter Coach", note: "Voice practice" },
        { id: "travis", name: "Travis Prep", note: "Live drill" },
        { id: "studies", name: "Studies", note: "7 notebooks" },
        { id: "scratch", name: "Scratch", note: "Working notes" },
      ],
    },
  ];
}

function contactLines() {
  return [
    text("Contact", "title"),
    text("Email is the direct line. The GitHub profile is the public record of the work."),
    gap(),
    linkLine(EMAIL, `mailto:${EMAIL}`),
    linkLine(PROFILE, PROFILE),
    linkLine("Interactive guide", GUIDE),
  ];
}

function skillsLines() {
  return [
    text("Stack", "title"),
    text("These are the tools the public code actually uses."),
    gap(),
    text("Python", "label"),
    text("pandas, NumPy, scikit-learn, Jupyter. Analysis, leakage-safe pipelines, imbalanced classification."),
    gap(),
    text("Agents", "label"),
    text("LangChain, Ollama, Chroma, Streamlit. Tool routing over SOP PDFs, with calculators beside retrieval."),
    gap(),
    text("Web", "label"),
    text("Browser JavaScript, HTML, CSS. FastAPI, Next.js, TypeScript, SQLite, JWT."),
    gap(),
    text("Product", "label"),
    text("A public GitHub Pages app (Steady), plus a small SwiftUI shell around the same UI."),
  ];
}

function liveLines() {
  return [
    text("Live now", "title"),
    text("Steady, the speech toolkit.", "label"),
    linkLine("https://ksingh0804.github.io/ai-projects/", "https://ksingh0804.github.io/ai-projects/"),
    linkLine("iPhone frame", "https://ksingh0804.github.io/ai-projects/iphone.html"),
    gap(),
    text("This guide.", "label"),
    linkLine(GUIDE, GUIDE),
    gap(),
    text("Travis Prep, a library IT interview drill.", "label"),
    linkLine("https://ksingh0804.github.io/ai-projects/career-launch/", "https://ksingh0804.github.io/ai-projects/career-launch/"),
    gap(),
    text("The logistics agent, Stutter Coach, Greenleaf, and the notebooks run locally. Each README has the commands.", "dim"),
  ];
}

function projectsLines() {
  const rows = [
    ["steady", "Live speech toolkit. Public site."],
    ["loan", "Home Credit default risk. Standalone repo."],
    ["rag", "Local tool-calling agent over logistics SOPs."],
    ["coach", "Browser voice practice with live feedback."],
    ["greenleaf", "Grocery demo. Next.js, FastAPI, JWT, admin."],
    ["studies", "Notebook studies: cricket, NLP, health, books, fires."],
    ["travis", "Live interview-practice page for a library IT role."],
  ];
  const lines = [text("Projects", "title"), text("Type `open` and an id."), gap()];
  for (const [id, line] of rows) {
    lines.push(text(id, "label"));
    lines.push(text(line));
  }
  return lines;
}

function reposLines() {
  const lines = [
    text("Public repositories", "title"),
    text("Labeled so the list has an order. Workshop and builds first. Studies next. Scratch space last."),
    gap(),
  ];
  for (const repo of REPOS) {
    lines.push(text(`${repo.tag.padEnd(10)} ${repo.name}`, "label"));
    lines.push(text(repo.line, "dim"));
    lines.push(linkLine(repo.url, repo.url));
    lines.push(gap());
  }
  return lines;
}

function pinLines() {
  return [
    text("Short list", "title"),
    text("If you have a few minutes, these three are enough."),
    gap(),
    text("ai-projects", "label"),
    text("The workshop. Inside it, open Steady first if you want something running, then the logistics agent."),
    linkLine(WORKSHOP, WORKSHOP),
    gap(),
    text("Loan-Defaulter", "label"),
    text("The credit-risk notebook, with the business problem in the first screen of the README."),
    linkLine("https://github.com/ksingh0804/Loan-Defaulter", "https://github.com/ksingh0804/Loan-Defaulter"),
    gap(),
    text("greenleaf-market", "label"),
    text("The full-stack demo: browse, cart, checkout, account, admin."),
    linkLine("https://github.com/ksingh0804/greenleaf-market", "https://github.com/ksingh0804/greenleaf-market"),
  ];
}

function whoamiLines() {
  return [
    text("Kaustubh Singh", "title"),
    text("I build data analysis, machine-learning studies, and small products a stranger can run."),
    gap(),
    text("The account is ksingh0804. This guide is the map. The code is in the repositories `map` lists."),
    gap(),
    linkLine(EMAIL, `mailto:${EMAIL}`),
    linkLine(PROFILE, PROFILE),
  ];
}

function helpLines() {
  const lines = [text("Commands", "title"), gap()];
  for (const [name, blurb] of COMMANDS) {
    lines.push(text(name.padEnd(14) + blurb));
  }
  lines.push(gap());
  lines.push(text("Press Enter on an empty line to start the briefing.", "dim"));
  lines.push(text("Tab completes. Up and down walk through recent commands.", "dim"));
  return lines;
}

function fileBody(path) {
  if (path === "/about.md") return whoamiLines();
  if (path === "/map.md") return mapLines();
  if (path === "/contact.md") return contactLines();
  if (path === "/skills.md") return skillsLines();
  if (path === "/projects/steady.md") return renderProject(PROJECTS.steady);
  if (path === "/projects/loan.md") return renderProject(PROJECTS.loan);
  if (path === "/projects/rag.md") return renderProject(PROJECTS.rag);
  if (path === "/projects/coach.md") return renderProject(PROJECTS.coach);
  if (path === "/projects/greenleaf.md") return renderProject(PROJECTS.greenleaf);
  if (path === "/projects/travis.md") return renderProject(PROJECTS.travis);
  if (path === "/projects/studies.md") return studiesLines();
  for (const notebook of NOTEBOOKS) {
    if (path === `/projects/${notebook.id}.md`) return renderNotebook(notebook);
  }
  return null;
}

const FILE_PATHS = [
  "/about.md",
  "/map.md",
  "/contact.md",
  "/skills.md",
  "/projects/steady.md",
  "/projects/loan.md",
  "/projects/rag.md",
  "/projects/coach.md",
  "/projects/greenleaf.md",
  "/projects/travis.md",
  "/projects/studies.md",
  ...NOTEBOOKS.map((n) => `/projects/${n.id}.md`),
];

export function normalize(path) {
  const parts = [];
  for (const segment of String(path || "").split("/")) {
    if (!segment || segment === ".") continue;
    if (segment === "..") parts.pop();
    else parts.push(segment);
  }
  return `/${parts.join("/")}`;
}

export function resolvePath(cwd, arg) {
  if (!arg || arg === "~") return "/";
  if (arg.startsWith("/")) return normalize(arg);
  if (arg.startsWith("~/")) return normalize(arg.slice(1));
  return normalize(`${cwd === "/" ? "" : cwd}/${arg}`);
}

function isDir(path) {
  if (path === "/") return true;
  const prefix = `${path}/`;
  return FILE_PATHS.some((item) => item.startsWith(prefix));
}

function listDir(path) {
  const prefix = path === "/" ? "/" : `${path}/`;
  const names = new Set();
  for (const item of FILE_PATHS) {
    if (!item.startsWith(prefix)) continue;
    const rest = item.slice(prefix.length);
    const [head, ...tail] = rest.split("/");
    names.add(tail.length ? `${head}/` : head);
  }
  return [...names].sort();
}

function result(lines, extra = {}) {
  return {
    lines,
    suggestions: extra.suggestions || ["tour", "projects", "map", "live", "contact"],
    speech: extra.speech || "",
    mood: extra.mood || "talk",
    clear: Boolean(extra.clear),
    cwd: extra.cwd,
    voice: extra.voice,
    chapter: extra.chapter,
    focus: extra.focus,
    highlights: extra.highlights,
  };
}

function openThing(id) {
  const key = ALIASES[id.toLowerCase()];
  if (!key) {
    return result(
      [
        text(`I don't have a project called ${id}.`, "error"),
        text("Try `projects` for ids, or `open studies` for the notebooks."),
      ],
      { mood: "alert", suggestions: ["projects", "open steady", "open loan", "help"], focus: "", highlights: [] }
    );
  }
  if (key === "scratch") {
    return result(
      [
        text("Scratch space", "title"),
        text("vs_code_python_github and simpleGame are working notes. The portfolio is the builds above them."),
        gap(),
        linkLine("vs_code_python_github", "https://github.com/ksingh0804/vs_code_python_github"),
        linkLine("simpleGame", "https://github.com/ksingh0804/simpleGame"),
      ],
      {
        focus: "scratch",
        highlights: ["scratch"],
        mood: "idle",
        speech: "Two repositories are scratch space. The portfolio is the builds above them.",
        suggestions: ["projects", "pin", "map"],
      }
    );
  }
  if (key === "studies") {
    return result(studiesLines(), {
      focus: "studies",
      highlights: ["studies"],
      speech: "The notebook repositories are studies. Open one by name, or read the list.",
      suggestions: ["open ipl", "open loan", "open steady", "map"],
    });
  }
  const notebook = NOTEBOOKS.find((item) => item.id === key);
  if (notebook) {
    return result(renderNotebook(notebook), {
      focus: notebook.id,
      highlights: ["studies"],
      speech: notebook.line,
      suggestions: ["studies", "projects", "map"],
    });
  }
  const project = PROJECTS[key];
  return result(renderProject(project), {
    focus: key,
    highlights: [key],
    speech: `${project.title}. ${project.summary}`,
    suggestions: ["projects", "live", "map", "contact"],
  });
}

export function run(raw, state = createState()) {
  const input = String(raw ?? "");
  const trimmed = input.trim();
  if (!trimmed) {
    const chapter = state.chapter || 0;
    if (chapter >= 1 && chapter < CHAPTERS.length) return showChapter(chapter + 1);
    if (chapter >= CHAPTERS.length) {
      return result(
        [text("Briefing complete. Type projects, or tour to start again.", "dim")],
        { mood: "idle", suggestions: ["projects", "open steady", "tour", "contact"], speech: "" }
      );
    }
    return showChapter(1);
  }

  const parts = trimmed.split(/\s+/).filter((part) => !part.startsWith("-"));
  const cmd = (parts[0] || "").toLowerCase();
  const args = parts.slice(1);
  const cwd = state.cwd || "/";

  switch (cmd) {
    case "help":
    case "commands":
    case "?":
      return result(helpLines(), {
        speech: "Type tour for the briefing, projects for the work, or map for how the account is organized.",
        suggestions: ["tour", "projects", "map", "contact"],
      });
    case "tour":
    case "brief":
    case "interview":
      if ((args[0] || "").toLowerCase() === "all") {
        return result(
          CHAPTERS.map((chapter, index) =>
            card({
              kicker: `Briefing ${index + 1} / ${CHAPTERS.length}`,
              title: chapter.title,
              summary: chapter.summary,
              points: chapter.points,
              links: chapter.links,
            })
          ),
          {
            chapter: CHAPTERS.length,
            speech: CHAPTERS[0].speech,
            suggestions: ["projects", "open steady", "contact"],
          }
        );
      }
      return showChapter(1);
    case "next":
      return showChapter(Math.min((state.chapter || 0) + 1, CHAPTERS.length) || 1);
    case "back":
      return showChapter(Math.max((state.chapter || 1) - 1, 1));
    case "whoami":
    case "about":
      return result(whoamiLines(), {
        speech: "Kaustubh Singh. Data analysis, machine learning studies, and small products a stranger can run.",
      });
    case "map":
      return result(mapLines(), {
        speech: "Start at the profile, then the ai-projects workshop, then the standalone builds. Notebooks are studies. Two repos are scratch space.",
      });
    case "projects":
    case "ls-projects":
      return result(projectsLines(), {
        speech: "The projects are Steady, loan defaulter, the logistics agent, Stutter Coach, Greenleaf, the notebook studies, and Travis Prep.",
        suggestions: ["open steady", "open loan", "open rag", "open greenleaf"],
      });
    case "open":
      if (!args[0]) {
        return result(
          [text("Usage: open <id>", "error"), text("Ids: " + projectIds().join("  "), "dim")],
          { mood: "alert", suggestions: ["open steady", "open loan", "open rag", "projects"] }
        );
      }
      return openThing(args[0]);
    case "live":
      return result(liveLines(), {
        speech: "Steady is live on GitHub Pages, and so is this guide. Travis Prep is a live interview drill.",
        suggestions: ["open steady", "open travis", "projects"],
      });
    case "repos":
      return result(reposLines(), {
        speech: "Thirteen public repositories. The workshop and the two standalone builds come first. Two repos are scratch space.",
      });
    case "skills":
    case "stack":
      return result(skillsLines(), {
        speech: "Python and scikit-learn, a local retrieval agent, and web apps in JavaScript, FastAPI, and Next.js.",
      });
    case "contact":
    case "email":
      return result(contactLines(), {
        speech: `Email ${EMAIL}.`,
        suggestions: ["tour", "projects", "pin"],
      });
    case "pin":
    case "shortlist":
      return result(pinLines(), {
        speech: "The short list is ai-projects, Loan-Defaulter, and greenleaf-market.",
        suggestions: ["open steady", "open loan", "open greenleaf"],
      });
    case "pwd":
      return result([text(cwd === "/" ? "~" : `~${cwd}`)], { mood: "idle", speech: "" });
    case "ls": {
      const target = args[0] ? resolvePath(cwd, args[0]) : cwd;
      if (fileBody(target)) {
        return result([text(target.split("/").pop())], { mood: "idle" });
      }
      if (!isDir(target)) {
        return result([text(`No such directory: ${target}`, "error")], { mood: "alert" });
      }
      const names = listDir(target);
      return result(names.length ? names.map((name) => text(name)) : [text("(empty)", "dim")], {
        mood: "idle",
        speech: "",
      });
    }
    case "cd": {
      const target = resolvePath(cwd, args[0] || "~");
      if (!isDir(target)) {
        return result([text(`Not a directory: ${args[0] || target}`, "error")], { mood: "alert" });
      }
      return result([text(target === "/" ? "~" : `~${target}`, "dim")], { mood: "idle", cwd: target, speech: "" });
    }
    case "cat": {
      if (!args[0]) return result([text("Usage: cat <file>", "error")], { mood: "alert" });
      const target = resolvePath(cwd, args[0]);
      const body = fileBody(target);
      if (!body) {
        const message = isDir(target) ? `${args[0]} is a directory. Try ls.` : `No such file: ${args[0]}`;
        return result([text(message, "error")], { mood: "alert" });
      }
      return result(body, { speech: "" });
    }
    case "clear":
      return result([text("ARCHIVIST ready.", "dim")], {
        clear: true,
        mood: "idle",
        speech: "",
        chapter: 0,
        focus: "",
        highlights: [],
        suggestions: ["tour", "projects", "map", "help"],
      });
    case "voice": {
      const mode = (args[0] || "").toLowerCase();
      if (mode === "on") return result([text("Voice on. I will read the next replies.", "dim")], { voice: "on", mood: "talk" });
      if (mode === "off") return result([text("Voice off.", "dim")], { voice: "off", mood: "idle", speech: "" });
      return result([text("Usage: voice on   or   voice off", "dim")], { mood: "idle" });
    }
    case "sudo":
      return result(
        [
          text("That command is unnecessary.", "title"),
          text("If the work fits, send a note and name the repository you opened."),
          gap(),
          linkLine(EMAIL, `mailto:${EMAIL}`),
        ],
        { speech: "If the work fits, send a note and name the repository you opened.", suggestions: ["contact", "pin", "tour"] }
      );
    case "hello":
    case "hi":
      return result(
        [text("Hello. Type `tour` and I will walk the GitHub, or `projects` if you already know you want the work.")],
        { suggestions: ["tour", "projects", "map"] }
      );
    default:
      return result(
        [text(`Unknown command: ${cmd}`, "error"), text("Type `help` for the list.", "dim")],
        { mood: "alert", suggestions: ["help", "tour", "projects", "map"] }
      );
  }
}

export function complete(buffer, state = createState()) {
  const endsSpace = /\s$/.test(buffer);
  const parts = buffer.trim().split(/\s+/).filter(Boolean);
  const cwd = state.cwd || "/";
  const token = !parts.length || endsSpace ? "" : parts[parts.length - 1];
  const head = !parts.length || endsSpace ? parts : parts.slice(0, -1);
  const completingCommand = head.length === 0;
  const command = (head[0] || "").toLowerCase();

  let choices = [];
  if (completingCommand) choices = commandNames();
  else if (command === "open" && head.length === 1) choices = projectIds();
  else if (command === "voice" && head.length === 1) choices = ["on", "off"];
  else if (command === "cd" && head.length === 1) {
    choices = listDir(cwd)
      .filter((name) => name.endsWith("/"))
      .map((name) => name.slice(0, -1));
    choices.push("..");
  } else if ((command === "cat" || command === "ls") && head.length === 1) {
    choices = listDir(cwd).map((name) => name.replace(/\/$/, ""));
  } else {
    return { matches: [], replacement: buffer };
  }

  const matches = [...new Set(choices)].filter((choice) => choice.startsWith(token)).sort();
  if (!matches.length) return { matches: [], replacement: buffer };
  if (matches.length === 1) {
    return { matches, replacement: `${[...head, matches[0]].join(" ")} ` };
  }
  return { matches, replacement: [...head, sharedPrefix(matches)].join(" ") };
}

function sharedPrefix(values) {
  if (!values.length) return "";
  let prefix = values[0];
  for (const value of values.slice(1)) {
    while (!value.startsWith(prefix)) prefix = prefix.slice(0, -1);
  }
  return prefix;
}

export function plainText(lines) {
  return lines
    .map((line) => {
      if (line.type === "gap") return "";
      if (line.type === "actions") return (line.items || []).map((item) => item.label).join(" ");
      if (line.type === "card") {
        const bits = [line.kicker, line.title, line.summary, ...(line.points || [])];
        for (const link of line.links || []) bits.push(link.label, link.href);
        if (line.meta) bits.push(line.meta);
        if (line.files) bits.push(line.files);
        if (line.done) bits.push("Briefing complete");
        return bits.filter(Boolean).join("\n");
      }
      return line.text || "";
    })
    .join("\n");
}
