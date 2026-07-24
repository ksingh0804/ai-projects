const QUESTIONS = [
  {
    kicker: "Opening",
    q: "Tell us about yourself and why you’re interested in this Technical Information Specialist role at the Travis Library.",
    draft: [
      "My name is Kaustubh Singh. I currently work on Travis AFB at the Commissary, so I already understand how the base runs and how important reliable customer service is for military members and families.",
      "Technically, I have a computer science background and I’m comfortable troubleshooting systems, documenting issues, and solving problems in a structured way. In the Army I was accountable for equipment and records, and I’ve spent years helping people when a process or system isn’t working under time pressure.",
      "I’m interested in this role because it’s hands-on impact: when the library computers, printers, and Wi‑Fi work, people can study, print paperwork, and get things done. I want a technical job that serves the Travis community directly — keep stations usable, help patrons calmly, follow security rules, and escalate cleanly to base IT when needed.",
    ],
    keywords: "Travis already · tech troubleshooting · patrons first · escalate cleanly",
  },
  {
    kicker: "Triage",
    q: "A patron says Computer #4 won’t start. Walk me through exactly what you do.",
    draft: [
      "First I’d make sure the patron isn’t stuck — I’d move them to a working computer so they can keep going while I check Station 4.",
      "Then I’d confirm the symptom: no power, powers on but won’t boot, or login/network issue. I’d check power strip, cables, monitor versus tower.",
      "If it powers on, I’d look for error messages and test whether it’s really the PC or login, internet, or printing. If I can’t fix it quickly with authorized steps, I’d take it out of service, document station ID, time, what I saw, and what I tried.",
      "If it’s CAC, domain, or hardware beyond local fix, I’d escalate to base IT — then follow up so Station 4 gets back online.",
    ],
    keywords: "alternate station → power/cables → symptom → document → escalate",
  },
  {
    kicker: "Prioritize",
    q: "It’s Saturday morning. Three of eight public PCs have no internet, the public printer is jammed, and a student needs to print a form before an appointment in 20 minutes. How do you prioritize?",
    draft: [
      "I’d prioritize the student with the 20-minute deadline first — clear the jam or print another allowed way so they make their appointment.",
      "Next I’d protect service: move people to the five working computers and note which stations are offline.",
      "Then I’d treat the three offline PCs as one problem. Same symptom often means a shared cause. I’d check whether staff machines still have internet.",
      "If it’s network-wide, I’d escalate early to base IT with location, time, and impact — and log everything for a clean handoff.",
    ],
    keywords: "deadline first → alternate stations → shared cause → escalate early",
  },
  {
    kicker: "Printer",
    q: "A patron’s document is stuck in the print queue, and they keep clicking Print. What do you do?",
    draft: [
      "First I’d stop the extra prints politely — “Hold on, I’ll clear the queue so we don’t print ten copies.”",
      "Then I’d check paper, toner, jam, offline status, and whether they selected the right printer.",
      "I’d clear stuck jobs, restart the spooler if policy allows, then print once and confirm — especially for pay-for-print.",
      "If that station keeps failing, I’d move them, mark the station, and log what I found.",
    ],
    keywords: "stop clicking → check hardware → clear queue → one reprint",
  },
  {
    kicker: "Security",
    q: "Someone can’t log in with their CAC. What do you do — and what do you not do?",
    draft: [
      "I’d help them get unblocked without breaking security: card seated, try another reader, right certificate selected, check if that station’s reader is faulty.",
      "If the library has a guest path for non-CAC tasks, I’d offer that. PIN lock or PKI issues go to base IT.",
      "I would not ask for or take their PIN, hold their CAC, bypass security, or log them in with my credentials.",
    ],
    keywords: "another reader → guest path → escalate PKI → never PIN / never bypass",
  },
  {
    kicker: "Wi‑Fi",
    q: "A patron says the Wi‑Fi is broken. How do you troubleshoot?",
    draft: [
      "Confirm phone or laptop and the error. Make sure they’re on the correct SSID — guest versus official.",
      "Forget network, toggle Wi‑Fi or airplane mode, reconnect. Test another device in the same spot.",
      "Check whether wired public computers still have internet to isolate wireless vs broader outage.",
      "Restart an AP only if authorized; otherwise ticket with location and time, and offer a wired PC as a workaround.",
    ],
    keywords: "correct SSID → device steps → wired vs wireless → ticket + workaround",
  },
  {
    kicker: "Software",
    q: "A student needs Zoom and Microsoft Word for a homework deadline, but the PC doesn’t have Zoom. What do you do?",
    draft: [
      "I wouldn’t download or install software from the internet onto a public library PC — stick to the approved image.",
      "I’d look for an allowed workaround: browser Zoom/Office, another station with the software, or staff-assisted options if permitted.",
      "If Zoom is a recurring need, I’d log a request to add it through the proper approval chain — not install it on the spot.",
    ],
    keywords: "no random installs → approved workaround → request via channel",
  },
  {
    kicker: "Policy",
    q: "You notice a patron viewing content that violates the library’s acceptable-use policy. What do you do?",
    draft: [
      "I’d follow the written procedure — discreet interrupt, calmly state the rule, offer help with legitimate use.",
      "If they refuse or content is illegal/safety-related, involve a supervisor and Security Forces per SOP.",
      "Document facts only — time, station, what was observed. Stay professional, not confrontational.",
    ],
    keywords: "written SOP → discreet → escalate if needed → facts only",
  },
  {
    kicker: "Behavioral",
    q: "Tell me about a time you helped someone who was frustrated because a system wasn’t working.",
    draft: [
      "Situation: At the Travis AFB Commissary, customers get frustrated when a process slows them down near a deadline.",
      "Task: Keep the interaction calm and get them unblocked fast.",
      "Action: Listen, restate what they need, give a workaround first, then fix or document the root issue in plain language.",
      "Result: They left with what they needed; the issue was logged so it didn’t keep hitting the next person.",
      "Bridge: Same approach in the library — get the patron printing or online first, then fix or escalate the computer.",
    ],
    keywords: "STAR · workaround first · calm · document · bridge to library",
  },
  {
    kicker: "Escalate",
    q: "When do you fix an issue yourself, and when do you escalate to base IT?",
    draft: [
      "Local if trained and authorized: cables, peripherals, paper/toner/jam, clear print queue, reboot, basic guest Wi‑Fi steps.",
      "Escalate: CAC/PKI, domain, switch/AP/firewall, malware suspicion, image corruption, hardware needing parts.",
      "When I escalate I include station ID, error, steps already tried, and how many patrons are affected.",
    ],
    keywords: "local fixes vs security/network · good ticket details",
  },
];

const FLASH = [
  {
    q: "Static IP vs DHCP?",
    a: "Static = set by hand. DHCP = automatic lease. Public labs usually use DHCP.",
  },
  {
    q: "What is a print spooler?",
    a: "Windows service that manages print jobs. Restarting often clears stuck queues — if policy allows.",
  },
  {
    q: "Network cable?",
    a: "Ethernet (RJ-45). Confirm link lights on the NIC or switch.",
  },
  {
    q: "“No internet” first steps?",
    a: "Physical link → got an IP/DHCP? → DNS → try another site → one PC vs all.",
  },
  {
    q: "Malware suspicion?",
    a: "Follow SOP (often isolate), escalate to IT/security, don’t let them keep using that box.",
  },
  {
    q: "Unknown USB?",
    a: "Follow library policy. Never plug unknown USBs into staff or admin machines.",
  },
  {
    q: "OPSEC on public PCs?",
    a: "No sensitive/classified work. Clear sessions. Watch shoulder-surfing. Follow posted rules.",
  },
];

const ASK = [
  { text: "What’s the biggest recurring tech pain for the library right now?", best: true },
  { text: "Who images and patches the public PCs — library staff or base IT — and what’s the ticket path for network vs hardware?", best: true },
  { text: "What does a successful first 30 days look like for training?", best: true },
  { text: "On evenings or weekends, is tech coverage alone on desk — and who do I call if half the lab goes down?", best: true },
  { text: "How many public stations are there?", best: false },
  { text: "Is printing free or pay-for-print, and who restocks toner and paper?", best: false },
  { text: "Which networks can patrons use, and what’s off-limits on public machines?", best: false },
  { text: "Is there already a daily or weekly smoke test for stations and printers?", best: false },
];

let index = 0;
let draftOpen = false;

const els = {
  label: document.getElementById("progress-label"),
  bar: document.getElementById("progress-bar"),
  kicker: document.getElementById("prompt-kicker"),
  q: document.getElementById("prompt-q"),
  draft: document.getElementById("draft"),
  draftBody: document.getElementById("draft-body"),
  keywords: document.getElementById("keywords"),
  reveal: document.getElementById("reveal-btn"),
  hide: document.getElementById("hide-btn"),
  prev: document.getElementById("prev-btn"),
  next: document.getElementById("next-btn"),
  flashGrid: document.getElementById("flash-grid"),
  askList: document.getElementById("ask-list"),
  roleplayBtn: document.getElementById("roleplay-reveal"),
  roleplayDraft: document.getElementById("roleplay-draft"),
};

function renderQuestion() {
  const item = QUESTIONS[index];
  const n = QUESTIONS.length;
  els.label.textContent = `Question ${index + 1} of ${n}`;
  els.bar.style.width = `${((index + 1) / n) * 100}%`;
  els.kicker.textContent = item.kicker;
  els.q.textContent = item.q;
  els.draftBody.innerHTML = item.draft.map((p) => `<p>${p}</p>`).join("");
  els.keywords.innerHTML = `<strong>Keywords:</strong> ${item.keywords}`;
  setDraftVisible(false);
  els.prev.disabled = index === 0;
  els.next.textContent = index === n - 1 ? "Finish ✓" : "Next →";
}

function setDraftVisible(open) {
  draftOpen = open;
  els.draft.hidden = !open;
  els.reveal.hidden = open;
  els.hide.hidden = !open;
}

els.reveal.addEventListener("click", () => setDraftVisible(true));
els.hide.addEventListener("click", () => setDraftVisible(false));
els.prev.addEventListener("click", () => {
  if (index > 0) {
    index -= 1;
    renderQuestion();
  }
});
els.next.addEventListener("click", () => {
  if (index < QUESTIONS.length - 1) {
    index += 1;
    renderQuestion();
  } else {
    document.getElementById("ask-them").scrollIntoView({ behavior: "smooth" });
  }
});

els.roleplayBtn.addEventListener("click", () => {
  const open = els.roleplayDraft.hidden;
  els.roleplayDraft.hidden = !open;
  els.roleplayBtn.textContent = open ? "Hide response" : "Show strong response";
});

FLASH.forEach((item) => {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "flash";
  btn.innerHTML = `<span class="flash-q">${item.q}</span><span class="flash-a">${item.a}</span>`;
  btn.addEventListener("click", () => btn.classList.toggle("is-open"));
  els.flashGrid.appendChild(btn);
});

ASK.forEach((item) => {
  const li = document.createElement("li");
  if (item.best) li.className = "best";
  li.innerHTML = `${item.best ? '<span class="badge">Best</span>' : ""}${item.text}`;
  els.askList.appendChild(li);
});

renderQuestion();
