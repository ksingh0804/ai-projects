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

  // ---- Daily reading: sentence banks for generating a fresh passage each day ----
  // A date-seeded generator combines one intro + several bodies + one closer,
  // so the "Today's reading" passage is new every day and effectively never repeats.
  dailyReading: {
    titles: [
      "Today's reading", "A fresh page", "Today, gently", "Your daily read",
      "One calm passage", "Today's practice", "A new start", "Steady today",
    ],
    intros: [
      "Today I give myself permission to speak slowly.",
      "This is a fresh morning, and a fresh start.",
      "I begin this passage calmly, with an easy breath.",
      "There is no rush in these words.",
      "I let the first sound arrive softly.",
      "Today my voice belongs to me, and it can take its time.",
      "I settle in, relax my shoulders, and begin.",
      "Each word here is a small, gentle step.",
      "I read this slowly, the way calm water moves.",
      "Right now, the only task is to speak with ease.",
      "I open my mouth, let the air lead, and start.",
      "This page is just for practice, so I can relax.",
    ],
    bodies: [
      "I pause between phrases, and the pause feels good.",
      "When a word feels hard, I slow down and ease into it.",
      "The breath comes first, and the voice follows.",
      "I touch each consonant lightly, like a soft tap.",
      "If I stutter, I keep going, calm and kind to myself.",
      "I stretch the vowels and let them carry the line.",
      "A gentle start makes the rest of the sentence easier.",
      "I notice my pace, and I bring it down a little.",
      "There is room here to breathe, so I use it.",
      "My shoulders are loose and my jaw is relaxed.",
      "I let the words connect smoothly, one into the next.",
      "Slowing down is not falling behind; it is staying steady.",
      "I keep my eyes up and my breathing low.",
      "Every calm sentence trains my voice a little more.",
      "I am allowed to take a full second before I speak.",
      "The room is patient, and so am I.",
      "I read for ease, not for speed.",
      "When I block, I soften the tension and slide forward.",
      "One phrase at a time is more than enough.",
      "I trust the air to do most of the work.",
      "Quiet confidence sounds like an unhurried voice.",
      "I let go of the need to be perfect.",
      "Smooth airflow makes the tricky sounds gentler.",
      "I treat each pause as a small, useful rest.",
      "My voice can be slow and still be strong.",
      "I forgive the bumps and stay with the flow.",
      "A steady rhythm carries me through the line.",
      "I speak as if there is all the time in the world.",
      "Calm in, calm out, calm words between.",
      "I keep the contacts light and the air moving.",
    ],
    closers: [
      "I finish this page proud that I showed up today.",
      "That is enough for now, and enough is plenty.",
      "I close gently, breathing easy, ready for the day.",
      "Steady wins, one calm sentence at a time.",
      "I did this slowly, and I did this well.",
      "Tomorrow there will be a new page, and I will be here.",
      "My voice carried me through, gently and surely.",
      "I leave the rush behind and keep the calm.",
    ],
  },

  // ---- Daily 50: topic bank for 50 fresh reading/speaking prompts every day ----
  // A date-seeded shuffle picks 50 of these subjects each day (new set + new wording),
  // and the generator wraps each in a short, readable passage for paced reading and
  // impromptu-speaking practice. >50 subjects so each day's 50 are distinct.
  readingTopics: {
    subjects: [
      // daily life & routines
      "my morning routine", "a slow morning", "my ideal weekend", "keeping a tidy room",
      "my favorite way to relax", "a productive day", "my evening wind-down", "running errands",
      "a to-do list", "waking up early", "a lazy afternoon", "my daily commute",
      "spring cleaning", "making the bed", "a quiet night in", "my favorite chore",
      // food & drink
      "coffee versus tea", "a good cup of coffee", "my favorite meal", "the perfect breakfast",
      "a recipe I want to try", "cooking at home", "my favorite fruit", "the smell of fresh bread",
      "my favorite drink", "a warm cup of tea", "street food", "baking on a weekend",
      "a home-cooked dinner", "my comfort food", "trying a new restaurant", "the perfect sandwich",
      "chocolate", "a summer barbecue", "fresh vegetables from a garden", "a bowl of soup",
      // places & travel
      "a place I'd love to visit", "my hometown", "a place that feels like home", "a long train ride",
      "my ideal holiday", "the local market", "a memorable trip", "city life versus the countryside",
      "a favorite corner of my home", "a road trip", "getting lost in a new city", "a mountain view",
      "the beach", "a small village", "airports", "a weekend away",
      // nature & weather
      "the ocean", "the night sky", "the moon", "the stars at night", "rainy days",
      "the smell of rain", "the changing seasons", "my favorite season", "snow in winter",
      "the first snowfall", "the first day of spring", "the sound of waves", "a walk in the woods",
      "a calm lake", "the sea breeze", "a summer storm", "autumn leaves", "a bright morning sky",
      "the sound of birds", "a garden in bloom", "wildflowers", "a gentle breeze",
      // hobbies & activities
      "a hobby I enjoy", "gardening", "board games with friends", "going for a swim",
      "walking in the park", "a long walk", "writing by hand", "the joy of reading",
      "music I love", "a song stuck in my head", "the perfect playlist", "photography",
      "drawing or painting", "riding a bike", "playing a sport", "learning an instrument",
      "watching the sunrise", "watching the sunset", "stargazing", "collecting something",
      // learning & work
      "a skill I want to learn", "learning a language", "learning to cook", "my dream job",
      "technology in daily life", "a teacher I remember", "a lesson I learned the hard way",
      "the value of practice", "asking good questions", "working with a team", "taking notes",
      "a project I'm proud of", "trying something new", "a goal for this year", "public speaking",
      // people & relationships
      "an old friend", "a kind stranger", "small acts of kindness", "a good conversation",
      "my best friend", "family traditions", "a mentor in my life", "saying thank you",
      "meeting new people", "spending time with family", "a favorite neighbor", "helping someone out",
      // memories & reflection
      "a favorite memory", "old photographs", "childhood games", "a book that stayed with me",
      "my favorite photograph", "a new beginning", "an act of courage", "the value of patience",
      "the value of sleep", "the simple things", "a moment I felt proud", "something I'm grateful for",
      "a habit I'd like to build", "slowing down", "the power of a deep breath", "being present",
      "a dream I remember", "what makes me laugh", "a challenge I overcame", "letting go of worry",
      // comfort & senses
      "a comfortable chair", "a cozy evening", "a good night's rest", "the perfect blanket",
      "a warm bath", "candlelight", "the smell of coffee in the morning", "soft music",
      "a favorite sweater", "the feeling of sunshine", "a crackling fire", "clean sheets",
      // little pleasures
      "my favorite color", "a festival I enjoy", "my favorite animal", "a good pen",
      "fresh flowers", "a favorite quote", "a rainy Sunday", "a quiet afternoon",
      "a favorite word", "the smell of a new book", "a perfect temperature", "a good stretch",
      "watching the clouds", "a cup of something warm", "the last movie I watched", "my weekend plans",
    ],
    intros: [
      "Today I'd like to talk about {t}.",
      "Let me say a few words about {t}.",
      "Here is my topic for today: {t}.",
      "I've been thinking about {t} lately.",
      "If I had a minute to speak, I would choose {t}.",
      "Let's take a calm moment to talk about {t}.",
      "My subject right now is {t}.",
      "I want to share a few easy thoughts on {t}.",
    ],
    middles: [
      "It is something that comes up in everyday life.",
      "There is more to it than you might first think.",
      "Some people love it, and some people do not, and that is okay.",
      "I could probably talk about it for a whole minute without rushing.",
      "When I slow down, I find I have plenty to say.",
      "It reminds me that small things can be interesting.",
      "I do not need to hurry to make my point.",
      "There are a few different sides to consider here.",
      "Honestly, it is worth a little reflection.",
      "I notice new details whenever I pay attention to it.",
      "It connects to a lot of other things, if you think about it.",
      "I would be curious to hear what other people think too.",
      "It is a comfortable subject to practise my speech on.",
      "Even a simple topic can fill a calm minute.",
      "I like that I can speak about it at my own pace.",
      "It brings back a few pleasant memories.",
      "There is no right or wrong answer with this one.",
      "I find it easy to picture as I describe it.",
      "It is the kind of thing I could explain to a friend.",
      "Taking my time, I can add one idea after another.",
    ],
    closers: [
      "And that is a little of what I think about {t}.",
      "So that is my calm minute on {t}.",
      "Anyway, those are my thoughts on {t} for today.",
      "That is enough on {t} for now.",
      "I will leave it there, steady and relaxed.",
      "Thanks for letting me practise on {t}.",
    ],
  },

  // ---- Interview: daily data-engineering Q&A practice ----
  // The app selects 10 of these every day. Each item is written as a
  // speakable answer so it can be pushed into Reading practice.
  interviewQuestions: [
    {
      question: "What is the difference between ETL and ELT?",
      answer: "ETL extracts data, transforms it before loading, and then writes clean data into the warehouse. ELT extracts and loads raw data first, then transforms it inside the warehouse or lakehouse. Modern cloud warehouses often prefer ELT because compute scales well near storage, raw history is preserved, and teams can rebuild models without re-ingesting source data.",
      focus: "pipelines",
    },
    {
      question: "How do you design an idempotent data pipeline?",
      answer: "An idempotent pipeline can be safely rerun without creating duplicates or corrupting output. I use deterministic partition keys, stable primary keys, merge or upsert logic, checkpoints, and replace-partition writes. I also separate raw immutable input from curated output so a failed run can be retried from a known source of truth.",
      focus: "reliability",
    },
    {
      question: "What is a slowly changing dimension?",
      answer: "A slowly changing dimension tracks changes to descriptive attributes over time. Type 1 overwrites the value, Type 2 keeps history with effective dates and current flags, and Type 3 keeps limited previous values in extra columns. I choose Type 2 when historical reporting must answer what was true at the time of an event.",
      focus: "warehousing",
    },
    {
      question: "How would you handle duplicate events in a streaming pipeline?",
      answer: "I would define an event identity, such as source event id plus timestamp and source system. Then I would deduplicate within a watermark window for late data and use an idempotent sink such as merge by event id. For critical pipelines, I would also track duplicate rates as a data quality metric.",
      focus: "streaming",
    },
    {
      question: "What is the purpose of data partitioning?",
      answer: "Partitioning stores data by a column such as date, region, or tenant so queries can scan less data. Good partitions match common filters and keep file counts balanced. Bad partitions, like high-cardinality user ids, can create too many tiny files and make reads slower instead of faster.",
      focus: "performance",
    },
    {
      question: "What is a data quality check you always add?",
      answer: "I usually start with freshness, row count, null checks on required keys, uniqueness on primary keys, and accepted ranges for important measures. These checks catch missing loads, duplicate records, and schema issues early. I also make quality failures visible through alerts and quarantine tables instead of silently dropping records.",
      focus: "quality",
    },
    {
      question: "How do you backfill a production table safely?",
      answer: "I backfill from raw immutable data into a separate staging target or isolated partitions first. I validate counts, keys, and sample aggregates against the existing table. Then I swap or merge in controlled batches, keep rollback options, and communicate expected load on the warehouse before running the job.",
      focus: "operations",
    },
    {
      question: "What is the difference between a data lake and a data warehouse?",
      answer: "A data lake stores raw or semi-structured data cheaply and flexibly, often in object storage. A warehouse stores modeled, governed data optimized for analytics. A lakehouse combines parts of both by adding table formats, transactions, schema evolution, and performance features on top of lake storage.",
      focus: "architecture",
    },
    {
      question: "Explain a star schema.",
      answer: "A star schema has a central fact table connected to dimension tables. The fact table stores measurable events like orders, trades, or page views. Dimensions store descriptive context like customer, product, date, or region. This design is easy for analysts to query and works well for BI performance.",
      focus: "modeling",
    },
    {
      question: "How do you optimize a slow SQL query?",
      answer: "I start by reading the query plan and checking scan volume, joins, filters, and aggregations. Then I reduce columns and rows early, filter on partition columns, avoid unnecessary cross joins, fix skewed joins, and pre-aggregate when needed. I also verify that changes improve both runtime and cost.",
      focus: "sql",
    },
    {
      question: "What is schema evolution and why does it matter?",
      answer: "Schema evolution is the controlled change of table structure over time, such as adding columns, changing types, or deprecating fields. It matters because producers and consumers often deploy independently. Good pipelines validate schemas, support backward-compatible changes, and fail loudly on breaking changes.",
      focus: "governance",
    },
    {
      question: "How do you handle late-arriving data?",
      answer: "I define an acceptable lateness window based on business requirements. In batch, I rerun affected partitions. In streaming, I use watermarks and state retention. For reporting, I make the data freshness and correction behavior clear so users understand when numbers may still change.",
      focus: "streaming",
    },
    {
      question: "What is a watermark in stream processing?",
      answer: "A watermark is the system's estimate that events earlier than a certain event time have mostly arrived. It lets the engine close windows and emit results while still allowing a defined amount of late data. The tradeoff is between waiting longer for completeness and producing results quickly.",
      focus: "streaming",
    },
    {
      question: "What are small files and why are they a problem?",
      answer: "Small files happen when a pipeline writes too many tiny output files. They hurt performance because query engines spend more time listing, opening, and planning files than scanning useful data. I fix this with compaction, sensible batch sizes, partition tuning, and table maintenance jobs.",
      focus: "lakehouse",
    },
    {
      question: "What is data lineage?",
      answer: "Data lineage shows where data came from, how it changed, and where it is consumed. It helps with debugging, compliance, impact analysis, and trust. At minimum, I track source tables, transformations, job versions, output tables, and owners for important datasets.",
      focus: "governance",
    },
    {
      question: "How would you test a data pipeline?",
      answer: "I test transformations with small deterministic fixtures, validate schema and data quality checks, and run integration tests against representative source samples. I also test retries, empty inputs, late data, duplicate input, and failure recovery because production data pipelines fail in operational ways.",
      focus: "testing",
    },
    {
      question: "What is exactly-once processing?",
      answer: "Exactly-once means each event affects the final result one time, even when retries or failures happen. In practice, it depends on source offsets, checkpointing, deterministic processing, and idempotent writes. I do not assume exactly-once from a tool alone; I design the full pipeline to make duplicates harmless.",
      focus: "streaming",
    },
    {
      question: "How do you choose between batch and streaming?",
      answer: "I choose based on business latency, complexity, cost, and correctness needs. Batch is simpler and often enough for daily or hourly analytics. Streaming is useful when decisions need low latency, such as fraud detection or operational monitoring, but it adds state, ordering, and recovery complexity.",
      focus: "architecture",
    },
    {
      question: "What is a surrogate key?",
      answer: "A surrogate key is an artificial key generated by the warehouse, often for dimension tables. It gives stable joins even when natural business keys change or are reused. In Type 2 dimensions, surrogate keys are especially useful because one business entity can have multiple historical versions.",
      focus: "warehousing",
    },
    {
      question: "What is the difference between a fact and a dimension?",
      answer: "A fact is a measurable event or transaction, such as an order amount, click, or trade. A dimension describes the context around that event, such as date, customer, product, or location. Facts usually grow quickly, while dimensions are smaller and change more slowly.",
      focus: "modeling",
    },
    {
      question: "How do you monitor a data pipeline?",
      answer: "I monitor job success, runtime, freshness, row counts, data quality checks, cost, and downstream SLA impact. I prefer alerts that explain the broken dataset and likely owner, not just that a job failed. For important pipelines, dashboards should show trend and recent incidents.",
      focus: "operations",
    },
    {
      question: "What is a CDC pipeline?",
      answer: "CDC means change data capture. It captures inserts, updates, and deletes from a source database and sends them downstream. A good CDC pipeline preserves ordering, handles schema changes, tracks offsets, and applies changes idempotently into the target system.",
      focus: "ingestion",
    },
    {
      question: "How do you manage PII in a data platform?",
      answer: "I classify sensitive fields, restrict access by role, encrypt data in transit and at rest, and mask or tokenize data when possible. I also limit raw access, log usage, define retention policies, and make sure downstream datasets do not accidentally expose sensitive attributes.",
      focus: "security",
    },
    {
      question: "What is orchestration in data engineering?",
      answer: "Orchestration coordinates pipeline tasks, dependencies, schedules, retries, and alerts. Tools like Airflow, Dagster, or Prefect do not process the data themselves; they manage when and how jobs run. Good orchestration makes failure recovery and observability easier.",
      focus: "orchestration",
    },
    {
      question: "How do you design a warehouse table for analysts?",
      answer: "I start with the business question, grain, dimensions, and measures. Then I make names clear, define one row per grain, document assumptions, and include quality checks. The best table is not just technically correct; it is easy for analysts to use without hidden traps.",
      focus: "analytics",
    },
    {
      question: "What is data skew?",
      answer: "Data skew happens when some keys or partitions contain much more data than others. It can make distributed jobs slow because a few workers do most of the work. I address it with salting, broadcast joins, repartitioning, better keys, or handling heavy hitters separately.",
      focus: "performance",
    },
    {
      question: "What is a medallion architecture?",
      answer: "A medallion architecture organizes data into bronze, silver, and gold layers. Bronze stores raw ingested data, silver cleans and conforms it, and gold provides business-ready datasets. The pattern helps separate concerns and makes data quality improvements traceable.",
      focus: "lakehouse",
    },
    {
      question: "How do you handle a breaking schema change from a source team?",
      answer: "First I detect it with schema validation and stop unsafe downstream writes. Then I confirm whether the change is intentional, assess impacted datasets, and either adapt transformations or ask for a backward-compatible producer change. I communicate impact and backfill if needed.",
      focus: "operations",
    },
    {
      question: "What is the role of dbt in a data stack?",
      answer: "dbt is mainly for transforming data in the warehouse using SQL plus software engineering practices. It supports models, tests, documentation, lineage, and deployments. I would still use separate tools for ingestion, orchestration, and heavy non-SQL processing when needed.",
      focus: "tools",
    },
    {
      question: "Explain primary key, foreign key, and unique constraint.",
      answer: "A primary key uniquely identifies each row in a table. A foreign key references a key in another table and represents a relationship. A unique constraint guarantees that a column or group of columns does not repeat. In analytics systems, these may be enforced or documented depending on the engine.",
      focus: "sql",
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
