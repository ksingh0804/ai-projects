/* Steady — content & data, grounded in wiki/sources/stuttering-research.md */
window.STEADY_CONTENT = {

  // ---- Fluency-shaping + modification technique trainers (research §2) ----
  techniques: [
    {
      id: "breathing",
      family: "Fluency shaping",
      name: "Diaphragmatic breathing",
      short: "Calm, steady airflow from the belly — the foundation for relaxed speech.",
      why: "Speech rides on breath. Belly (abdominal) breathing regulates airflow and lowers tension in the throat and chest before you ever make a sound.",
      steps: [
        "Sit tall, shoulders loose. Put one hand on your belly.",
        "Breathe in slowly through the nose for ~4 counts — feel the belly rise, not the chest.",
        "Let the breath out gently for ~6 counts.",
        "On the next out-breath, start a word as you exhale — never on an empty tank.",
      ],
      drill: ["calm", "easy", "ready", "slow and steady"],
    },
    {
      id: "gentle-onset",
      family: "Fluency shaping",
      name: "Gentle (easy) onset",
      short: "Start voicing softly instead of hitting the first sound hard.",
      why: "Blocks often come from slamming the vocal folds shut on the first sound. Easing voice in — like a soft 'h' before a vowel — keeps airflow moving.",
      steps: [
        "Take a relaxed belly breath.",
        "Begin the first sound very softly, almost a whisper, then grow the volume.",
        "For vowels, imagine a light 'h' in front: 'hhhapple', 'hheasy'.",
        "Keep the air flowing through the start of the word.",
      ],
      drill: ["apple", "open", "every", "I am ready", "always", "okay"],
    },
    {
      id: "prolonged",
      family: "Fluency shaping",
      name: "Prolonged / stretched speech",
      short: "Stretch the vowels and slow the rate to take the time pressure off.",
      why: "Slowing down and stretching sounds gives your speech system time to coordinate. Start very slow, then build toward a natural rate.",
      steps: [
        "Pick a short phrase. Stretch every vowel: 'mmyy naaame iiis...'.",
        "Aim slow first (~80–110 words/min), like gentle slow motion.",
        "Keep the stretch smooth — glide between sounds, don't bounce.",
        "As it feels easy, shorten the stretch toward natural speed.",
      ],
      drill: ["my name is", "thank you very much", "could you help me", "have a good day"],
    },
    {
      id: "continuous",
      family: "Fluency shaping",
      name: "Continuous phonation",
      short: "Keep the voice switched 'on' across the whole phrase, like singing.",
      why: "Choppy, stop-start speech invites blocks. Linking words with continuous voicing (borrowed from singing) keeps momentum.",
      steps: [
        "Say a phrase as one connected stream: 'how-are-you-today'.",
        "Don't fully stop the voice between words — glide.",
        "Breathe at phrase boundaries, not mid-phrase.",
        "Feel the hum of voicing stay alive the whole way.",
      ],
      drill: ["how are you today", "nice to meet you", "I would like a coffee"],
    },
    {
      id: "light-contact",
      family: "Fluency shaping",
      name: "Light articulatory contact",
      short: "Touch lips, tongue and teeth lightly on hard consonants.",
      why: "Plosives (p, b, t, d, k, g) tempt you to press hard and block. Light contact lets air keep moving so the sound releases easily.",
      steps: [
        "Notice the pressure on p / b / t / k.",
        "Make the contact feather-light — barely touch.",
        "Let a little air leak through as you release.",
        "Pair with a gentle onset on the following vowel.",
      ],
      drill: ["paper", "Peter", "table", "coffee", "ticket", "because"],
    },
    {
      id: "pausing",
      family: "Fluency shaping",
      name: "Pausing & phrasing",
      short: "Break speech into chunks and pause on purpose between them.",
      why: "Planned pauses give your brain time to prepare the next chunk and release time pressure — the opposite of rushing to beat a block.",
      steps: [
        "Split a sentence into 2–4 word chunks.",
        "Pause briefly (a relaxed breath) between chunks.",
        "Pausing is confident, not a failure — own it.",
        "Use the pause to set up a gentle onset on the next chunk.",
      ],
      drill: ["I was thinking | that maybe | we could meet | on Friday"],
    },
    {
      id: "prep-set",
      family: "Stuttering modification",
      name: "Preparatory set",
      short: "Ease into a word you expect to be hard — before you hit it.",
      why: "Van Riper modification. Instead of bracing for a feared word, you pre-plan an easy, slow, lightly-contacted start so the moment is smoother.",
      steps: [
        "Spot a word you expect to block on.",
        "Slow down just before it.",
        "Start it with a gentle onset and light contact, stretched.",
        "Move forward — you're shaping the moment, not avoiding it.",
      ],
      drill: ["My name is ___", "I'd like to ___", "Can I get a ___"],
    },
    {
      id: "pull-out",
      family: "Stuttering modification",
      name: "Pull-out",
      short: "Already stuck? Ease out of the block mid-word instead of forcing.",
      why: "When you're in a block, don't push harder. Slow the tension down inside the word and glide out smoothly.",
      steps: [
        "Notice you're blocking — pause the struggle.",
        "Reduce the tension where you feel it (lips/throat/tongue).",
        "Slowly stretch and slide out of the sound.",
        "Continue the word gently — no restart needed.",
      ],
      drill: ["b—b—because → b-b-b...ease out: 'beee-cause'"],
    },
    {
      id: "cancellation",
      family: "Stuttering modification",
      name: "Cancellation",
      short: "After a stutter, stop, pause, then say the word again — easily.",
      why: "Cancellation teaches your system a calmer way to produce a word right after a hard moment, reducing fear over time.",
      steps: [
        "Finish the stuttered word.",
        "Stop. Take a calm pause (a second or two).",
        "Say the word again slowly with gentle onset + light contact.",
        "Continue. You've just rehearsed the easy version.",
      ],
      drill: ["...(stutter)... pause ... 'water' (easy) ... continue"],
    },
  ],

  // ---- Breathing patterns for the guided breathing tool ----
  breathing: {
    box: { name: "Box breathing", phases: [["Breathe in", 4], ["Hold", 4], ["Breathe out", 4], ["Hold", 4]] },
    relax478: { name: "4-7-8 calming", phases: [["Breathe in", 4], ["Hold", 7], ["Breathe out", 8]] },
    speech: { name: "Speech breath (in 4 / speak 6)", phases: [["Breathe in", 4], ["Speak as you exhale", 6]] },
  },

  // ---- Reading passages for pacing practice (original, neutral; tagged by level) ----
  passages: [
    // --- Easy: short, soft sounds, lots of natural pause points ---
    {
      level: "Easy",
      title: "An easy morning",
      text: "The morning was calm and quiet. I made a cup of tea and sat by the window. There was no rush to be anywhere. I took my time with every sip, and with every word I said out loud. Slow is steady, and steady is enough.",
    },
    {
      level: "Easy",
      title: "The walk",
      text: "We walked along the river while the sun came up. The water moved slowly, and so did we. Nobody was in a hurry. I noticed the birds, the cool air, and the easy sound of my own breathing. One step, then the next.",
    },
    {
      level: "Easy",
      title: "Three slow breaths",
      text: "Before I speak, I take a slow breath. I let my shoulders drop. I am allowed to pause. I am allowed to take my time. There is no race here. My voice is mine, and it can move as gently as I like.",
    },
    {
      level: "Easy",
      title: "Short and simple",
      text: "I like tea. I like quiet mornings. I like the sound of rain. Each line is short. Each line has a clear end. I stop, I breathe, and then I begin again.",
    },

    // --- Vowel / easy-onset practice ---
    {
      level: "Onsets",
      title: "Easy onsets (vowels)",
      text: "Apples and oranges. Open the door. Every evening I unwind. I am okay. Each of these words begins with a vowel, so I ease the voice in softly, almost like a gentle sigh, and let the sound grow.",
    },
    {
      level: "Onsets",
      title: "Gentle starts",
      text: "I am here. I am calm. I am ready. Always, easily, openly, I begin. I float into the first sound instead of pushing it. The air leads, and the voice follows.",
    },

    // --- Real-life scenarios ---
    {
      level: "Real life",
      title: "Ordering coffee",
      text: "Hello. Could I please get a small coffee with milk? Thank you. Yes, that is all for now. Have a good day. I can pause whenever I need to. The person in front of me can wait a moment, and that is okay.",
    },
    {
      level: "Real life",
      title: "Answering the phone",
      text: "Hello, this is Sam speaking. Yes, I can help with that. Could you give me one moment, please? Thank you for waiting. Let me check and get back to you. Have a great day, and goodbye.",
    },
    {
      level: "Real life",
      title: "Introducing yourself",
      text: "Hi, my name is Alex. It is nice to meet you. I work in design, and I really enjoy it. By the way, I stutter sometimes, so I might pause on a word, but I will get there. Thanks for your patience.",
    },
    {
      level: "Real life",
      title: "Small talk at work",
      text: "Good morning, everyone. How was your weekend? Mine was relaxing, thank you. I caught up on some reading and went for a long walk. What about you? I would love to hear about it.",
    },
    {
      level: "Real life",
      title: "A short interview answer",
      text: "Thank you for the question. In my last role, I led a small team and we shipped a new feature on time. I learned to plan carefully and to ask for help early. I think those habits would help here too.",
    },

    // --- Harder: consonants, clusters, numbers ---
    {
      level: "Harder",
      title: "Hard consonants",
      text: "Peter packed a paper bag by the back door. The kettle clicked, the toast popped, and the dog barked twice. Each tricky sound gets a light, gentle touch, and a little air to carry it along.",
    },
    {
      level: "Harder",
      title: "Tricky clusters",
      text: "The street was bright and breezy. Strong springs of clear water splashed across the stones. I tried to speak slowly through the tricky clusters, keeping each contact light so the sounds could glide instead of stick.",
    },
    {
      level: "Harder",
      title: "Numbers and dates",
      text: "My meeting is on Tuesday the twelfth at three o'clock. My number is five, five, five, one, two, three, four. The total comes to fourteen dollars and sixty cents. Numbers can be tricky, so I say them slowly and clearly.",
    },
    {
      level: "Harder",
      title: "Saying your address",
      text: "I live at twenty-two Maple Street, near the corner of Third Avenue. The postcode ends in seven. If you reach the blue bakery, you have gone too far. Take your time; the words will come.",
    },

    // --- Longer narrative for stamina + phrasing ---
    {
      level: "Story",
      title: "The lighthouse (longer)",
      text: "On the edge of the coast there stood an old lighthouse. Every night its light swept slowly across the water, steady and patient, never rushing. Sailors far out at sea trusted that rhythm. It did not flash in panic or race against the dark. It simply turned, again and again, at its own calm pace. The keeper liked to say that the light was never in a hurry, and neither was he. He climbed the stairs slowly, he spoke slowly, and he found that the days felt longer and kinder for it. When visitors came, he told them the same thing: you do not have to rush to be understood. You only have to keep turning, like the light, steady and sure.",
    },
    {
      level: "Story",
      title: "The garden (longer)",
      text: "She planted the garden one seed at a time. There was no way to hurry it, and she had stopped trying. Each morning she walked the rows, checked the soil, and gave a little water where it was needed. Some seeds sprouted quickly and some took weeks, but every one came up in its own time. She learned not to compare them. A slow seed was not a failed seed; it was simply on a different schedule. By late summer the whole garden was full and green, and no one could tell which plants had been the slow ones. Growth, she decided, was never about speed. It was about showing up, gently, day after day.",
    },
  ],

  // ---- Confidence toolkit: starter exposure ladder suggestions (research §5) ----
  exposureSuggestions: [
    "Say 'hello' to one stranger today",
    "Order something out loud instead of pointing",
    "Make one short phone call",
    "Ask a shop assistant where something is",
    "Introduce yourself with your name (no substitution)",
    "Voluntarily speak once in a meeting or class",
    "Leave a voice message on purpose",
    "Tell a short story without rushing",
    "Self-disclose: tell one person 'I stutter sometimes'",
    "Ask a question you'd normally avoid",
  ],

  // ---- CBT thought-reframing pairs (research §5) ----
  cbtThoughts: [
    { unhelpful: "If I stutter, people will think I'm incapable.", balanced: "Stuttering has nothing to do with intelligence or ability. My message matters more than how smoothly it comes out." },
    { unhelpful: "I must hide my stutter at all costs.", balanced: "Hiding feeds the fear and the tension. Being open often makes speaking easier and listeners kinder." },
    { unhelpful: "That phone call will be a disaster.", balanced: "I can pause, breathe, and use my techniques. Even if I stutter, the call can still go fine." },
    { unhelpful: "I should avoid words I might block on.", balanced: "Avoidance shrinks my world. I'd rather say what I mean and stutter than hide and stay silent." },
    { unhelpful: "Everyone is judging my speech.", balanced: "Most listeners are focused on what I'm saying, not how. The harshest critic is usually me." },
  ],

  // ---- Self-disclosure ("advertising") script templates (research §5) ----
  disclosureTemplates: [
    "Just so you know, I stutter sometimes — I might pause, but I'll get there.",
    "Heads up: I have a stutter, so give me a second if I block on a word.",
    "I stutter, so I speak a little slowly on purpose. Thanks for your patience.",
    "Quick note — I stutter. No need to finish my sentences, I've got it.",
  ],

  // ---- Daily non-avoidance challenges ----
  dailyChallenges: [
    "Use a gentle onset on the very first word you say to someone today.",
    "Say one word you'd normally swap for an easier one.",
    "Add a deliberate pause in the middle of a sentence — and own it.",
    "Make eye contact through a stutter instead of looking away.",
    "Stutter openly once without trying to hide it. Notice you survived.",
    "Use slow, stretched speech for one whole conversation.",
    "Tell one person that you stutter.",
  ],

  // ---- Learn: facts vs myths (research §1) ----
  facts: [
    { myth: "Stuttering is caused by anxiety or nervousness.", fact: "It's a neurological, often genetic condition. Anxiety can make it worse, but it isn't the cause." },
    { myth: "People who stutter are less intelligent.", fact: "Stuttering has zero link to intelligence. It's about speech timing in the brain, not ability." },
    { myth: "Stuttering is caused by bad parenting or trauma.", fact: "Research finds no such cause. It runs in families — 60–70% have a relative who stutters." },
    { myth: "If you just slow down / relax, you'll stop stuttering.", fact: "Techniques help, but stuttering isn't a willpower problem. There's no instant cure." },
    { myth: "Finishing their sentences is helpful.", fact: "It usually isn't. Give time, keep eye contact, and let the person speak." },
    { myth: "Few people stutter.", fact: "~1% of adults — about 80 million people worldwide. You're far from alone." },
  ],

  facLinks: [
    { label: "Stuttering Foundation", url: "https://www.stutteringhelp.org" },
    { label: "National Stuttering Association (US)", url: "https://westutter.org" },
    { label: "STAMMA (UK)", url: "https://stamma.org" },
    { label: "Find a speech-language pathologist (ASHA)", url: "https://www.asha.org/profind/" },
  ],
};
