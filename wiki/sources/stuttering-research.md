---
title: Stuttering — Research Synthesis
type: source
tags: [stuttering, speech-therapy, research, evidence, daf, cbt, act, accessibility]
created: 2026-06-28
updated: 2026-06-28
---

# Stuttering — Research Synthesis

Web research compiled to ground the design of a genuinely useful, evidence-based app for people who stutter (PWS). Sources are linked inline.

## 1. What stuttering is (facts, not myths)

- Stuttering is a **neurological, often genetic** speech-fluency condition — differences in how the brain handles speech timing, initiation, and motor coordination. It is **not** caused by anxiety, trauma, low intelligence, or bad parenting. ([Stuttering Foundation FAQ](https://www.stutteringhelp.org/faq), [WeStutter — causes](https://www.westutter.org/post/causes-of-stuttering), [AIS facts](https://www.stutteringtreatment.org/blog/facts-about-stuttering))
- **Prevalence:** ~1% of adults; **~80 million people worldwide**; ~5–8% of children go through a stuttering period, ~75–80% recover naturally. Affects ~4× more males than females. ([StatPearls](https://www.ncbi.nlm.nih.gov/books/NBK603738/))
- **Genetics:** ~60–70% of PWS have a family member who stutters.
- Core behaviors: **repetitions** (li-li-like), **prolongations** (llllike), **blocks** (silent stoppages), often with physical tension and secondary movements.
- Anxiety/stress **worsen** stuttering but are **comorbid effects, not the cause**. ~60% of adults in one cohort met criteria for social phobia.

**Design implication:** lead with respect and accurate education; avoid "cure" language; support both fluency *and* acceptance.

## 2. The two evidence-based therapy families (use both)

[Expressable](https://www.expressable.com/learning-center/stuttering/fluency-shaping-vs-stuttering-modification) · [Stuttering Therapy Online](https://www.stutteringtherapyonline.com/fluency-shaping-vs-stuttering-modification.html) · [JSLHR RCT](https://pubs.asha.org/doi/10.1044/2023_JSLHR-23-00224)

### Fluency shaping (speech restructuring) — change how you speak
- **Diaphragmatic (abdominal) breathing** — regulate airflow, reduce tension.
- **Gentle / easy onset** — start voicing softly (e.g., soft "h" before vowels: "hhhello").
- **Prolonged speech** — stretch vowels/consonants, slow the rate (start very slow ~80–110 wpm, build up).
- **Continuous phonation** — keep the voice "on" across words (borrowed from singing).
- **Light articulatory contacts** — touch lips/tongue/teeth lightly so airflow isn't blocked.
- Programs: Camperdown, prolonged-speech protocols.

### Stuttering modification (Van Riper, 4 phases) — stutter more easily, less fear
1. **Identification** of one's own stuttering behaviors.
2. **Desensitization** to fear/negative feelings.
3. **Modification** of moments: **cancellation** (stop, pause, redo easily), **pull-out** (ease out of a block mid-word), **preparatory set** (ease into a feared word).
4. **Stabilization** via self-monitoring.

Most clinicians now use an **integrated** approach. ([RCT combined approach + psychomotor](https://doi.org/10.1111/1460-6984.70038))

## 3. Rhythm / pacing — one of the strongest fluency inducers

- **Choral speech** (speaking in unison) reduces stuttering **~90–100%** in reading and is more effective than altered auditory feedback. ([JSLHR 2024](https://doi.org/10.1044/2024_jslhr-24-00405))
- **Metronome-timed / syllable-timed speech** reliably increases fluency regardless of severity and **reduces articulatory variability** to control levels. ([PLOS One](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0309612), [Waesche/Phonetics 2025](https://doi.org/10.1016/j.wocn.2025.101432))
- **Syllable-timed speech** = say each syllable on a beat with minimal stress differentiation; effective even in young children. ([UNM PDF](https://www.unm.edu/~atneel/shs531/syll_timed_tx.pdf))

**Design implication:** a metronome + visual pacing trainer is high-value, simple, and offline.

## 4. Altered auditory feedback (DAF / FAF / MAF / AAF)

- **DAF** plays your voice back with a small delay (~50–200 ms), inducing slower, choral-like speech. Helps **~1 in 3**; immediate reductions in some studies, but meta-analyses show **mixed/heterogeneous** evidence for DAF alone; **FAF+DAF** combos tend to do better. ([online DAF](https://korayulusan.github.io/delayed-auditory-feedback-online/), [meta-analysis](https://www.jstage.jst.go.jp/article/asjsc/6/1/6_SC-2026-14/_article/-char/en), [systematic review](https://www.scielo.br/j/jsbf/a/FXcbPbMm4PfKfhmRrrKv5Wm/?lang=en))
- **Masked (MAF)** and **amplified (AAF)** auditory feedback both reduced disfluencies in moderate and severe groups without hurting speech rate; DAF benefit largest for **severe** stuttering. ([BJORL](https://www.scielo.br/j/bjorl/a/B8p74fxrqhZLjtQK6B3x9Nd/?format=pdf&lang=en))
- Effects are often **temporary** and **vary by person**; works best as practice support, not a cure.

**User pain points with existing apps (gap to exploit):** Bluetooth headphones add unreliable latency (DAF needs **wired** headphones); core features locked behind paywalls; bugs in tracking. ([Stutter Stars review](https://www.stutterstars.com/10-stuttering-therapy-apps-reviewed-a-guide-for-parents-and-adults/), DAF Pro store reviews)

**Design implication:** ship a **free, offline DAF/FAF/MAF/AAF** tool built on the Web Audio API with a clear "use wired headphones" warning.

## 5. Psychological dimension — anxiety, avoidance, acceptance

- **CBT** (cognitive restructuring + graded exposure) produces sustained reductions in social anxiety/avoidance; **ACT/mindfulness** improves psychological flexibility and quality of life. Both work best **combined with speech therapy**. ([CBT vs MAGT RCT](https://doi.org/10.4103/abr.abr_322_21), [CBT package trial](https://pubs.asha.org/doi/10.1044/1092-4388(2008/07-0070)), [ACT review](https://pubs.asha.org/doi/10.1044/ffd22.1.34))
- **Avoidance** (word/situation substitution, silence, texting instead of calling, secondary movements) **feeds the fear cycle**. Reducing avoidance is central. ([avoidance worksheet](https://stutteringrecovery.org/avoidance-reduction-worksheet/), [McGuire](https://www.mcguireprogramme.com/breaking-the-cycle-changing-our-response-to-anxiety-instead-of-avoiding-it/))
- **Self-disclosure ("advertising")** — openly stating you stutter — improves listener perception, confidence, and reduces avoidance. ([AIS facts](https://www.stutteringtreatment.org/blog/facts-about-stuttering))

**Design implication:** include an **exposure/avoidance-reduction ladder**, **CBT thought-reframing**, **self-disclosure script builder**, and a daily **non-avoidance challenge**.

## 6. Practice principles

- **Consistency > duration**: short daily practice beats long rare sessions; ~20–45 min/day typical. Structure: warm-up (breathing) → drills → real-world transfer. ([Dr Fluency routine](https://www.drfluencyusa.com/stuttering-fluency-shaping-techniques/), [STAMMA prolonged-speech leaflet](https://stamma.org/sites/default/files/2020-01/Slow%20Prolonged%20Speech%20leaflet_1.pdf))
- **Record yourself** and review; gradually increase difficulty and transfer technique into real situations.
- Apps **can** give daily practice, teach techniques, track progress, offer privacy; they **cannot** replace diagnosis, personalized adaptation, or fully address emotions → always recommend an SLP.

## 7. Feature spec derived from research (→ "Steady" app)

| Feature | Grounded in |
|---|---|
| Real-time **DAF/FAF/MAF/AAF** (Web Audio, wired-headphone notice) | §4 |
| **Metronome + visual pacing** (syllable-timed/rhythmic) | §3 |
| **Breathing guide** (box / 4-7-8 diaphragmatic) | §2 fluency shaping |
| **Technique trainers** (gentle onset, prolonged, continuous phonation, light contact, pausing; modification: prep-set, pull-out, cancellation) | §2 |
| **Reading/pacing practice** with moving highlight (+optional DAF) | §2, §6 |
| **Confidence toolkit**: exposure ladder, CBT reframe, self-disclosure builder, daily challenge | §5 |
| **Learn**: facts vs myths, when to see an SLP | §1 |
| **Progress**: streaks, session log, exposure wins (localStorage, private) | §6 |

Constraints: free, no accounts, no paid APIs, offline-capable, accessible (keyboard, ARIA, reduced-motion, large text), respectful tone, clear non-medical disclaimer.
