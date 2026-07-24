# Interview Scenario — Technical Information Specialist  
**Library · Travis AFB**

**Core job:** Keep library public computers, printers, Wi‑Fi, and related tech working so patrons (military members, families, retirees, DoD civilians) can research, print, study, and complete official tasks.

**Your angle:** Travis AFB Commissary + Army logistics background = base culture, customer service under pressure, accountability, and comfort with DoD systems. CS/data skills = troubleshooting method, documentation, and calm problem-solving. Sell reliability and people skills first; deep engineering second.

---

## Scene setting (use in your intro)

You’re interviewing with the Library Director and/or a GS supervisor. Expect a mix of:

1. Behavioral (“Tell me about a time…”)
2. Technical troubleshooting (walk through a broken PC)
3. Customer service with stressed patrons
4. Base/security awareness (CAC, OPSEC, appropriate use)
5. Prioritization when several machines are down at once

**30-second open:**

> “I’ve worked on Travis AFB at the Commissary, so I already understand base operations, customer flow, and the expectation that services stay up. My background is technical — computers, systems, and solving problems methodically — and I’ve spent years helping people under time pressure. For this role I’d focus on keeping every public station usable: quick triage, clear communication with patrons, solid documentation, and escalating to base IT when it’s beyond local fix.”

---

## Part A — Practical scenario questions & model answers

### 1. Opening walkthrough

**Q:** A patron says Computer #4 won’t start. Walk me through what you do.

**A:**
1. Acknowledge the patron and check whether they need a quick alternate machine while I work.
2. Confirm symptoms: no power vs. power but no boot vs. login/network issue.
3. Power path: outlet, power strip, cable, monitor vs. tower.
4. If it powers on: safe mode / last known good only if policy allows; otherwise note error messages.
5. Check network/printer if OS is up — many “broken computer” tickets are login, browser, or print queue.
6. Document station ID, time, error, steps tried; tag out of service if needed.
7. Escalate to base/network support if it’s CAC, domain, or hardware beyond local spare parts.
8. Seat the patron at a working station and follow up when #4 is back.

---

### 2. Multiple failures at once

**Q:** It’s Saturday morning. Three of eight public PCs won’t connect to the internet, the public printer is jammed, and a student needs to print a form before an appointment in 20 minutes. What do you prioritize?

**A:**
1. **Patron with a hard deadline first** — clear the jam or redirect print to another device / staff printer if allowed; get their document out.
2. **Restore access capacity** — move people to working PCs; post a short “stations 2–4 offline” note.
3. **Triage the three offline PCs together** — same symptom often means shared cause (AP, switch, DHCP, proxy, filter). Check if staff PCs/Wi‑Fi work to isolate scope.
4. **Escalate early** if it’s network-wide — don’t burn 45 minutes reboot-looping every station.
5. Log everything so the next shift and base IT have a clean handoff.

*Principle:* Service continuity for the patron beats perfect diagnosis in the first five minutes.

---

### 3. Printer / print queue

**Q:** A patron’s document is stuck in the print queue and they keep clicking Print. How do you handle it?

**A:**
- Stop additional jobs politely (“I’ll clear the queue so we don’t print ten copies”).
- Check paper, toner, jam, offline status, correct printer selected.
- Clear stuck jobs from the queue; restart spooler only if local policy allows.
- Reprint once; confirm page count/cost if pay-for-print is used.
- If the driver or station is corrupted, switch them to another PC and flag that station.

---

### 4. Slow / freezing PC

**Q:** Computers are extremely slow after lunch. What’s your approach?

**A:**
- Ask how many users and what apps (browser tabs, streaming, large PDFs).
- Check Task Manager / Activity Monitor for CPU, memory, disk, network.
- Close runaway tabs/processes; reboot if session is degraded.
- Note if it’s one machine (local) vs. all (image, update, filter, bandwidth).
- Check whether a Windows update or AV scan is running.
- If recurring after lunch, look for pattern (class group, bandwidth saturation) and recommend scheduled maintenance or more stations.

---

### 5. Login / CAC / account issues

**Q:** Someone can’t log in with their CAC. What do you do — and what don’t you do?

**A:**
**Do:** Verify card is seated, try another reader/station, check certificate selection, confirm PIN isn’t locked (without asking them to share the PIN), check if the station has reader drivers/middleware, offer guest/public login path if the library provides one for non-CAC tasks.
**Don’t:** Take their PIN, store CAC, bypass security, or “fix” access with your credentials.
**Escalate:** CAC/PKI issues to base IT / DEERS-related help as appropriate; stay in your lane.

---

### 6. Inappropriate use / policy

**Q:** You notice a patron viewing content that violates library acceptable-use policy. What do you do?

**A:**
- Follow the library’s written procedure — don’t invent policy.
- Typically: discreet interruption, state the rule calmly, offer to help with legitimate research.
- If they refuse or the content is illegal/hostile, involve supervisor / Security Forces as the SOP requires.
- Document factually (time, station, what was observed) — no gossip.
- Protect other patrons’ experience; stay professional, not confrontational.

---

### 7. Software a patron needs

**Q:** A student says they need Zoom and Microsoft Word for a homework deadline. The PC doesn’t have Zoom.

**A:**
- Check approved software list / image — don’t install unapproved apps on a DoD/public machine.
- Alternatives: browser-based Zoom/Office if allowed, another station with the software, or staff-assisted options.
- If it’s a recurring need, log a request to add it to the standard image through the proper approval chain.
- Never download random installers from the web onto a public library PC.

---

### 8. Wi‑Fi complaint

**Q:** “The Wi‑Fi is broken.” How do you troubleshoot?

**A:**
1. Confirm phone vs. laptop; ask for error message.
2. Verify they’re on the correct SSID (guest vs. official).
3. Forget network / toggle Wi‑Fi / airplane mode.
4. Test with another device in the same spot (dead zone vs. account).
5. Check whether library wired PCs have internet (isolates wireless).
6. Restart AP only if authorized; otherwise ticket to network shop with location and time.
7. Offer a wired public PC as interim workaround.

---

### 9. Documentation & handoff

**Q:** How would you track computer issues in this library?

**A:**
Simple, consistent log (spreadsheet or ticket system):
- Station ID / asset tag  
- Date/time, reporter  
- Symptom vs. confirmed cause  
- Steps taken  
- Status: open / waiting on IT / resolved  
- Parts used (cable, toner, mouse)

Also: out-of-service signs, spare peripherals labeled, and a weekly “all stations smoke test” checklist (boot, login, browser, print test page).

---

### 10. Working with base IT

**Q:** When do you fix it yourself vs. escalate?

**A:**
| Fix locally (if trained/authorized) | Escalate |
|-------------------------------------|----------|
| Cables, peripherals, paper/toner/jam | Domain/CAC/PKI |
| Clear print queue, reboot station | Switch/AP/firewall |
| Browser profile reset per SOP | Hardware failure needing parts/warranty |
| Re-seat reader, swap known-good mouse/KB | Image corruption / malware suspicion |
| Guest Wi‑Fi basic steps | Anything touching security controls |

Escalate with: station ID, error text/screenshot, steps already tried, impact (# of patrons blocked).

---

## Part B — Behavioral questions (STAR-ready)

### 11. Customer under stress

**Q:** Tell me about a time you helped someone who was frustrated with a system that wasn’t working.

**A (pattern — plug in Commissary/Army example):**
- **S:** Patron/customer blocked by a system issue near a deadline.
- **T:** Restore service and keep the interaction calm.
- **A:** Listened, restated the goal, gave a workaround first, then fixed/root-caused, explained next steps without jargon.
- **R:** They completed their task; issue was logged so it didn’t repeat.

*Travis-specific hook:* “At the Commissary I deal with people who need answers fast. Same mindset here — get them unblocked, then fix the machine.”

---

### 12. Attention to detail / accountability

**Q:** This role requires keeping accurate IT and inventory-type records. Give an example.

**A:** Point to property accountability / inventory audits / WAWF-EDA documentation — emphasize serial numbers, status, and audit trail. Libraries track assets too; same discipline.

---

### 13. Learning something new quickly

**Q:** You may need to learn a library ILS, print-management software, or filtering tools. How do you ramp up?

**A:**
- Read the SOP / vendor quick-start first.
- Shadow one full open-to-close if possible.
- Keep a personal cheat sheet of the 10 most common tickets.
- Practice on a non-public station before changing production settings.
- Ask “what am I not allowed to change?” on day one.

---

### 14. Teamwork with non-technical staff

**Q:** Librarians aren’t always IT people. How do you support them?

**A:**
- Translate: “The printer can’t see the network” → “I’ll reconnect it; use Station 2 for now.”
- One-page guides for common patron asks (print double-sided, save to USB safely, join Wi‑Fi).
- Never make staff feel foolish for escalating — early escalation prevents bigger outages.

---

### 15. Why this job / why Travis Library?

**A:**
> “I already work on Travis and care about base community services. This role is practical impact: when the computers work, people can study, file paperwork, and stay connected. I like troubleshooting, I like helping people face-to-face, and I want a technical role that serves the Travis community directly.”

---

## Part C — Quick-fire technical checks (short answers)

| Question | Short answer |
|----------|--------------|
| What’s a static IP vs DHCP? | Static = manually set; DHCP = automatic lease from server. Public labs usually DHCP. |
| What is a print spooler? | Windows service that manages print jobs; restarting often clears stuck queues (if allowed). |
| Cable for network? | Ethernet (RJ-45). Also confirm link lights on NIC/switch. |
| First step when “no internet”? | Confirm physical link → IP address/DHCP → DNS → try another site → scope (one PC vs all). |
| Malware suspicion? | Disconnect from network if SOP says so, don’t power-cycle away evidence if directed otherwise, escalate to IT/security, don’t let patron continue on that box. |
| USB / personal devices? | Follow library policy; scan if tools exist; never plug unknown USBs into staff/admin machines. |
| OPSEC on public PCs? | Remind users public machines aren’t for sensitive/classified work; clear sessions; watch shoulder-surfing; follow posted rules. |

---

## Part D — Questions *you* should ask them

1. How many public stations, and who images/patches them — library staff or base IT?
2. What’s the ticketing path for network vs. hardware?
3. Is there a standard daily/weekly tech checklist already?
4. Print management system (pay-for-print)? Who refills toner/paper?
5. Guest Wi‑Fi vs. official network — what are patrons allowed to use?
6. What’s the biggest recurring tech pain for the library right now?
7. Training plan for the first 30 days?
8. Shift coverage — evenings/weekends/alone on desk?

---

## Part E — Mini role-play (practice aloud)

**Interviewer:** “I’m a spouse, my CAC won’t read, and I need to print my spouse’s orders in 15 minutes.”

**Strong response structure:**
1. Empathy + time acknowledgment  
2. Alternate path now (another reader / guest print workflow / staff-assisted print if policy allows)  
3. Parallel triage on the failing station  
4. No request for PIN; no policy shortcuts  
5. Confirm they leave with the printed document  
6. Log the CAC reader failure for IT  

---

## Closing line

> “I’m reliable, I’m already familiar with Travis, and I’ll treat every public computer like mission equipment — checked, documented, and ready for the next patron.”
