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
      "No account. Echo, pacing, reading, interview practice, and conversation. Wired headphones for Echo, or the mic feeds back.",
      "It does not replace a speech-language pathologist. An iOS shell wraps the same UI. Open the browser build.",
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
      "About 307,511 applications, default rate near 8.1%. Always predicting repayment is about 92% accurate and catches no defaults.",
      "Keeps EXT_SOURCE_2 and EXT_SOURCE_3. DAYS_EMPLOYED = 365243 is a pensioner sentinel. Gender stays in the EDA and out of the model. A sklearn Pipeline fits on the training fold only.",
      "The cutoff is cost-weighted: a missed default costs more than a false reject. The Kaggle CSV is not in git.",
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
      "Ollama does chat and embeddings. Chroma stores the vectors. Streamlit is the UI.",
      "Tools: search the SOP PDFs, compute EOQ, estimate safety stock, or look up a sample inventory file. If the context is missing, the agent says it does not know.",
      "Runs on your machine. It is not hosted.",
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
      "Web Speech API. No key and no account. Speak, get a score, continue.",
      "Steady is the broader toolkit. This is the focused practice loop.",
      "Run it locally on http://127.0.0.1:8787. Opening the file directly blocks the microphone.",
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
      "Next.js 14 and TypeScript on the front. FastAPI, SQLite, and JWT on the API. The server re-prices the cart before checkout.",
      "Checkout is a fake provider, with a slot left for Stripe. Treat the seeded admin account as a local demo credential.",
    ],
    links: [
      { label: "Repository", href: "https://github.com/ksingh0804/greenleaf-market" },
    ],
    openFirst: ["README.md", "backend/", "frontend/"],
    stack: "Next.js 14, TypeScript, Tailwind, FastAPI, SQLite, JWT",
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
  return ["steady", "loan", "rag", "coach", "greenleaf", "studies", "scratch", ...NOTEBOOKS.map((n) => n.id)];
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
  return [
    card({
      kicker: "Studies",
      title: "Seven notebooks",
      summary: "Each one is a single dataset and a single question. Read them after the builds.",
      rows: NOTEBOOKS.map((notebook) => ({
        label: notebook.name,
        detail: notebook.line,
        href: notebook.url,
      })),
      points: ["Open one with open ipl, open stocks, or open cancer."],
    }),
  ];
}

function mapLines() {
  return [
    card({
      kicker: "Map",
      title: "Read the account in this order",
      summary: "Profile, then the workshop, then standalone builds. Notebooks are studies. Two repositories are scratch space.",
      rows: [
        { label: "1  Profile", detail: "github.com/ksingh0804 is the front door.", href: PROFILE },
        {
          label: "2  Workshop",
          detail: "ai-projects holds Steady, Stutter Coach, the logistics agent, and the credit-risk notebook.",
          href: WORKSHOP,
        },
        {
          label: "3  Builds",
          detail: "Loan-Defaulter and greenleaf-market are one idea each.",
          href: "https://github.com/ksingh0804/Loan-Defaulter",
        },
        {
          label: "4  Studies",
          detail:
            "IPL, Stock-Sentiment, Cardiovascular-Analysis, Covid19-Analysis, Breast-Cancer-Prediction, Book-Recommendation, Forest-Fires-Prediction.",
        },
        { label: "5  Scratch", detail: "vs_code_python_github and simpleGame. Safe for a visitor to pass over." },
        { label: "6  This guide", detail: "ARCHIVIST lives on GitHub Pages next to Steady.", href: GUIDE },
      ],
    }),
  ];
}

export function bootLines() {
  return [
    card({
      kicker: "ARCHIVIST",
      title: "I explain this GitHub.",
      summary: "Kaustubh Singh builds data analysis, machine-learning studies, and small products you can run.",
      cue: "Press Enter. Four parts, about a minute.",
      points: ["Or open a name: steady, loan, rag, greenleaf."],
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
    cue: "The left column is the map. This window is the explanation.",
    points: ["The profile is the front door. ai-projects is where the newest work lives."],
    links: [{ label: "Profile", href: PROFILE, primary: true }],
    highlights: [],
    speech: "Kaustubh Singh. This GitHub is a workshop for data analysis, machine learning, a document agent, and small products you can run.",
    suggestions: ["next", "projects", "contact"],
  },
  {
    title: "Open these three",
    summary: "These are the three worth a hiring read.",
    cue: "Amber on the map marks these three.",
    points: [
      "Steady — a live speech toolkit. No account.",
      "Loan Defaulter — about 307,000 applications. Always predicting repayment is about 92% accurate and still misses every default.",
      "Logistics agent — local tool-calling over SOP documents, inside the workshop.",
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
    cue: "Workshop, then builds, then studies, then scratch.",
    points: [
      "ai-projects holds Steady, Stutter Coach, the logistics agent, and the credit notebook.",
      "greenleaf-market and Loan-Defaulter stand alone.",
      "Seven notebooks are studies. vs_code_python_github and simpleGame are scratch space.",
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
    summary: "That is the signal in this account.",
    cue: "Three checks, in any repository.",
    points: [
      "Read the first paragraph of the README.",
      "Check that a stranger can run it.",
      "Notice what the write-up left for later.",
    ],
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
          cue: chapter.cue,
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

export function labelFor(id) {
  const item = atlas()
    .flatMap((group) => group.items)
    .find((entry) => entry.id === id);
  if (item) return item.name;
  const notebook = NOTEBOOKS.find((entry) => entry.id === id);
  if (notebook) return notebook.name;
  const project = PROJECTS[id];
  if (project) return project.title;
  return id || "";
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
        { id: "studies", name: "Studies", note: "7 notebooks" },
        { id: "scratch", name: "Scratch", note: "Working notes" },
      ],
    },
  ];
}

function contactLines() {
  return [
    card({
      kicker: "Contact",
      title: "Email is the direct line",
      summary: "The GitHub profile is the public record of the work.",
      links: [
        { label: EMAIL, href: `mailto:${EMAIL}`, primary: true },
        { label: "Profile", href: PROFILE },
        { label: "This guide", href: GUIDE },
      ],
    }),
  ];
}

function skillsLines() {
  return [
    card({
      kicker: "Stack",
      title: "What the public code uses",
      points: [
        "Python — pandas, NumPy, scikit-learn, Jupyter. Leakage-safe pipelines and imbalanced classification.",
        "Agents — LangChain, Ollama, Chroma, Streamlit. Tool routing over SOP PDFs.",
        "Web — browser JavaScript, FastAPI, Next.js, TypeScript, SQLite, JWT.",
        "Product — Steady on GitHub Pages, plus a small SwiftUI shell around the same UI.",
      ],
    }),
  ];
}

function liveLines() {
  return [
    card({
      kicker: "Live",
      title: "Open these in a browser",
      summary: "The logistics agent, Stutter Coach, Greenleaf, and the notebooks run locally. Each README has the commands.",
      links: [
        { label: "Steady", href: "https://ksingh0804.github.io/ai-projects/", primary: true },
        { label: "iPhone frame", href: "https://ksingh0804.github.io/ai-projects/iphone.html" },
        { label: "This guide", href: GUIDE },
      ],
    }),
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
  ];
  return [
    card({
      kicker: "Projects",
      title: "Open one",
      summary: "Choose a name. The card that follows has the link.",
      rows: rows.map(([id, detail]) => ({ label: id, detail, command: `open ${id}` })),
    }),
  ];
}

function reposLines() {
  return [
    card({
      kicker: "Repositories",
      title: "Thirteen public repositories",
      summary: "Workshop and builds first. Studies next. Scratch space last.",
      rows: REPOS.map((repo) => ({
        label: `${repo.tag}  ${repo.name}`,
        detail: repo.line,
        href: repo.url,
      })),
    }),
  ];
}

function pinLines() {
  return [
    card({
      kicker: "Short list",
      title: "If you only have a few minutes",
      rows: [
        {
          label: "ai-projects",
          detail: "The workshop. Open Steady first if you want something running, then the logistics agent.",
          href: WORKSHOP,
        },
        {
          label: "Loan-Defaulter",
          detail: "The credit-risk notebook. The business problem is in the first screen of the README.",
          href: "https://github.com/ksingh0804/Loan-Defaulter",
        },
        {
          label: "greenleaf-market",
          detail: "The full-stack demo: browse, cart, checkout, account, admin.",
          href: "https://github.com/ksingh0804/greenleaf-market",
        },
      ],
    }),
  ];
}

function whoamiLines() {
  return [
    card({
      kicker: "Who",
      title: "Kaustubh Singh",
      summary: "I build data analysis, machine-learning studies, and small products a stranger can run.",
      points: ["The account is ksingh0804. This guide is the map."],
      links: [
        { label: EMAIL, href: `mailto:${EMAIL}`, primary: true },
        { label: "Profile", href: PROFILE },
      ],
    }),
  ];
}

function helpLines() {
  return [
    card({
      kicker: "Commands",
      title: "What you can type",
      summary: "Enter on an empty line continues the briefing. Tab completes. Up and down walk recent commands.",
      points: COMMANDS.map(([name, blurb]) => `${name} — ${blurb}`),
    }),
  ];
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
        card({
          kicker: "Missing",
          title: id,
          summary: `I don't have a project called ${id}.`,
          points: ["Try projects for ids, or open studies for the notebooks."],
        }),
      ],
      { mood: "alert", suggestions: ["projects", "open steady", "open loan", "help"], focus: "", highlights: [] }
    );
  }
  if (key === "scratch") {
    return result(
      [
        card({
          kicker: "Scratch",
          title: "Working notes",
          summary: "vs_code_python_github and simpleGame are working notes. The portfolio is the builds above them.",
          links: [
            { label: "vs_code_python_github", href: "https://github.com/ksingh0804/vs_code_python_github" },
            { label: "simpleGame", href: "https://github.com/ksingh0804/simpleGame", primary: true },
          ],
        }),
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
        [
          card({
            kicker: "Done",
            title: "Briefing complete",
            summary: "Type projects, or tour to start again.",
            links: [
              { label: "Email", href: `mailto:${EMAIL}`, primary: true },
              { label: "Steady", href: "https://ksingh0804.github.io/ai-projects/" },
              { label: "Loan Defaulter", href: "https://github.com/ksingh0804/Loan-Defaulter" },
            ],
          }),
        ],
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
              cue: chapter.cue,
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
    case "chapter": {
      const n = Number(args[0]);
      if (!Number.isInteger(n) || n < 1 || n > CHAPTERS.length) {
        return result([text("Usage: chapter 1, chapter 2, chapter 3, or chapter 4.", "error")], { mood: "alert" });
      }
      return showChapter(n);
    }
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
        speech: "The projects are Steady, loan defaulter, the logistics agent, Stutter Coach, Greenleaf, and the notebook studies.",
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
        speech: "Steady is live on GitHub Pages, and so is this guide.",
        suggestions: ["open steady", "projects"],
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
        const bits = [line.kicker, line.title, line.summary, line.cue, ...(line.points || [])];
        for (const link of line.links || []) bits.push(link.label, link.href);
        for (const row of line.rows || []) bits.push(row.label, row.detail, row.href);
        if (line.meta) bits.push(line.meta);
        if (line.files) bits.push(line.files);
        if (line.done) bits.push("Briefing complete");
        return bits.filter(Boolean).join("\n");
      }
      return line.text || "";
    })
    .join("\n");
}
