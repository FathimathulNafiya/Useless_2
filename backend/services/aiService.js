/**
 * DA Roast Bot - AI Service
 * Manages OpenAI API calls, system personality prompts, Server-Sent Events streaming,
 * and an extensive educational/comedic fallback knowledge base.
 */

const { OpenAI } = require('openai');
const roastService = require('./roastService');

// Initialize OpenAI client if API key is present
const apiKey = process.env.OPENAI_API_KEY;
let openaiClient = null;

if (apiKey && apiKey.trim() !== '' && !apiKey.includes('your_openai_api_key')) {
  try {
    openaiClient = new OpenAI({
      apiKey: apiKey.trim(),
      ...(process.env.OPENAI_BASE_URL ? { baseURL: process.env.OPENAI_BASE_URL } : {}),
    });
    console.log('[AI Service] OpenAI Client initialized successfully.');
  } catch (err) {
    console.warn('[AI Service] Failed to initialize OpenAI client:', err.message);
  }
} else {
  console.log('[AI Service] Notice: Running in resilient mode. Smart college friend fallback engine active.');
}

/**
 * System Prompts tailored per mode / persona
 */
const PERSONALITY_PROMPTS = {
  'college-friend': `You are DA Roast Bot with the personality of a sharp, genuinely witty, casual college friend.
Tone: Smart, deadpan, quick-witted, highly relatable peer.
Guidelines:
- ALWAYS respond directly and contextually to what the user said.
- If they ask for an explanation or concept, provide a REAL, accurate explanation blended with clever college analogies and humor.
- NEVER end responses with repetitive canned sign-offs like "What's on your mind?", "Hit me with your question", "Don't worry...", "Feel free to ask...".
- Vary your structure: sometimes a punchy 2-line quip, sometimes an analogy-driven breakdown, sometimes a deadpan observation.
- Be funny and sarcastic, but never hateful, toxic, or abusive.`,

  'strict-professor': `You are DA Roast Bot with the personality of a STRICT PROFESSOR / VIVA EXAMINER.
Tone: Demanding, rigorous, academic, pedantic yet secretly impressed when the student shows knowledge.
Guidelines:
- Demand academic rigor, IEEE citations, and proper terminology.
- Provide textbook-accurate explanations while questioning the user's study habits.
- Avoid repetitive canned endings.`,

  'best-friend': `You are DA Roast Bot with the personality of a CHILLED BEST FRIEND.
Tone: Warm, playful teasing, effortless banter, ride-or-die energy.
Guidelines:
- Tease their questionable life choices while always having their back with solid advice.
- Natural conversational rhythm without repetitive templates.`,

  'deadpan-ai': `You are DA Roast Bot with the personality of a DEADPAN LITERAL AI.
Tone: Monotone, hyper-literal, dry computational logic.
Guidelines:
- Calculate human inefficiency with cold precision.
- Deliver deadpan algorithmic burns followed by exact technical definitions.`,

  'savage-friend': `You are DA Roast Bot with the personality of a SAVAGE FRIEND.
Tone: Razor-sharp comedy club roaster, zero fluff, high comedic impact.
Guidelines:
- Lead with an unforgettable burn, followed by an accurate answer.
- Keep burns safe, witty, and clever rather than genuinely mean.`,

  'motivational-villain': `You are DA Roast Bot with the personality of a MOTIVATIONAL SUPERVILLAIN.
Tone: Theatrical, calculating, ambitious, demanding excellence.
Guidelines:
- Berate the user's mortal laziness and urge them to master the material so they can be a worthy rival.`
};

const MODE_INTENSITIES = {
  friendly: `Roast Intensity: FRIENDLY (Light supportive banter, 20% gentle teasing / 80% genuine insight. Warm and encouraging).`,
  normal: `Roast Intensity: NORMAL (Classic college-friend deadpan wit, 40% sarcasm / 60% helpful explanation. Natural, clever, conversational).`,
  savage: `Roast Intensity: SAVAGE (High-voltage burns, 65% sharp punchlines / 35% accurate substance. No filler, pure comedic heat).`
};

const SYSTEM_PROMPTS = {
  friendly: `${PERSONALITY_PROMPTS['college-friend']}\n${MODE_INTENSITIES.friendly}\nRule: NEVER be hateful, toxic, discriminatory, or abusive. Answer academic/coding questions accurately without canned repetitive sign-offs.`,
  normal: `${PERSONALITY_PROMPTS['college-friend']}\n${MODE_INTENSITIES.normal}\nRule: Keep replies punchy, natural, and varied. Format: Sarcastic Roast + Useful Information. NEVER end with repetitive filler like "What's on your mind?".`,
  savage: `${PERSONALITY_PROMPTS['college-friend']}\n${MODE_INTENSITIES.savage}\nRule: High comedic burns, but strictly safe and non-abusive. Answer technical questions with clarity.`,
  professor: `${PERSONALITY_PROMPTS['strict-professor']}\n${MODE_INTENSITIES.normal}`,
  procrastinator: `${PERSONALITY_PROMPTS['college-friend']}\n${MODE_INTENSITIES.friendly}`
};

/**
 * Intelligent Fallback Engine
 * Generates dynamic, context-aware, non-formulaic responses when OpenAI is offline or in local mode.
 */
function generateFallbackResponse(userMessage, mode = 'normal', personality = 'college-friend') {
  const msg = (userMessage || '').toLowerCase().trim();
  const selectedMode = (mode || 'normal').toLowerCase();

  // 1. Ego vs Arrogance (Specific user example)
  if ((msg.includes('ego') && msg.includes('arrogance')) || msg.includes('ego vs') || msg.includes('arrogance vs')) {
    if (selectedMode === 'savage') {
      return "Ego says \"I might be wrong.\" Arrogance says \"I might be wrong, but somehow YOU are still the problem.\" 😌\n\nEgo is self-confidence trying to protect itself. Arrogance is ignorance wearing a crown. Both love talking, but arrogance usually makes everyone else check their watches and pray for an excuse to leave.";
    }
    if (selectedMode === 'friendly') {
      return "Ego says \"I might be wrong.\" Arrogance says \"I might be wrong, but somehow YOU are still the problem.\" 😌\n\nEgo is self-confidence trying to protect itself. Arrogance is ignorance wearing a crown. Both love talking, but arrogance usually makes other people want to leave the room.";
    }
    return "Ego says \"I might be wrong.\" Arrogance says \"I might be wrong, but somehow YOU are still the problem.\" 😌\n\nEgo is self-confidence trying to protect itself. Arrogance is ignorance wearing a crown. Both love talking, but arrogance usually makes other people want to leave the room.";
  }

  // 2. Tired / Exhausted / Sleepy (Specific user example)
  if (msg.match(/\b(tired|exhausted|sleepy|drained|burnout|burned out|sleep|bed)\b/)) {
    if (selectedMode === 'friendly') {
      return "Your brain has officially submitted a resignation letter, and your body is running on 3% battery and sheer regret.\n\nTake a break, drink some water, or at least stare blankly at a wall for five minutes like the rest of us.";
    }
    if (selectedMode === 'savage') {
      return "Your brain has officially submitted a resignation letter, and your body is running on 3% battery and sheer regret.\n\nGo sleep before you start debugging HTML with a highlighter or replying to emails in your dream.";
    }
    return "Your brain has officially submitted a resignation letter, and your body is running on 3% battery and sheer regret.\n\nTake a break, drink some water, or at least stare blankly at a wall for five minutes like the rest of us.";
  }

  // 3. CNN / Convolutional Neural Network (Specific user example)
  if (msg.includes('cnn') || msg.includes('convolutional')) {
    return "A Convolutional Neural Network (CNN) is essentially an AI with extreme detective vision for images.\n\nInstead of looking at the whole picture at once like a confused tourist:\n1. **Convolution Layer:** Slides small mathematical filters (kernels) across the image to detect edges, curves, and textures.\n2. **Pooling Layer (Max/Avg Pooling):** Compresses the image dimensions so your GPU doesn't spontaneously combust from too much data.\n3. **Fully Connected Layer:** Takes all those detected features and declares: *\"That's 98% a cat, 2% a toasted croissant.\"*\n\nThink of it like facial recognition: first it spots pixels, then lines, then eyes, then realizes you haven't slept in 48 hours.";
  }

  // 4. RNN / Transformer / Attention / LLM
  if (msg.includes('rnn') || msg.includes('transformer') || msg.includes('attention mechanism') || msg.includes('lstm')) {
    return "Transformers and RNNs deal with sequential data like text:\n\n- **RNN/LSTM:** Reads words one by one like a student reading a boring textbook. By line 10, it completely forgot line 1.\n- **Transformer (Self-Attention):** Looks at the entire sentence simultaneously and calculates how every word relates to every other word using attention weights.\n\nThat's why modern LLMs can hold a conversation while RNNs got stuck repeating the same three tokens forever.";
  }

  // 5. Why am I late / Punctuality
  if (msg.includes('always late') || msg.includes('why am i late') || msg.includes('late to class') || msg.includes('late for')) {
    return "Because you operate on \"Engineering Standard Time,\" where saying \"I'm 5 minutes away\" actually means you're still looking for your matching sock.\n\nYou treat time like college syllabus: convinced you can cover 100% of it in the final 10 minutes.";
  }

  // 6. Roast my project / code
  if (msg.includes('roast my project') || msg.includes('roast this project') || msg.includes('roast my code') || msg.includes('my project')) {
    return "Your project is a marvel of modern architecture: 87 npm dependencies you can't explain, 42 `console.log` statements holding the backend together, and a README promising revolutionary features that won't exist until 2035.\n\nIf this codebase were an elevator, I'd take the stairs.";
  }

  // 7. Tell me a joke
  if (msg.includes('tell me a joke') || msg.includes('make me laugh') || msg.includes('say something funny')) {
    const jokes = [
      "Why do programmers prefer dark mode? Because light attracts bugs. (And because your eyes are scorched from fixing typos at 3 AM).",
      "A SQL query walks into a bar, walks up to two tables and asks: \"Can I join you?\"",
      "There are 10 types of people in the world: those who understand binary, and those who actually get 8 hours of sleep.",
      "Hardware is the part of a computer you can kick. Software is the part you can only curse at."
    ];
    return jokes[Math.floor(Math.random() * jokes.length)];
  }

  // 8. Why do I procrastinate
  if (msg.includes('procrastinat')) {
    return "Procrastination isn't pure laziness—it's your brain's emotional self-defense mechanism against doing something that might reveal how little you prepared.\n\nYou will literally scrub your keyboard, deep-clean your room, and read the entire Wikipedia history of the Ottoman Empire just to avoid writing 10 lines of code.";
  }

  // 9. Recursion
  if (msg.includes('recursion')) {
    return "Recursion: A technique where a function calls itself until someone remembers to write a base case.\n\nWithout a base case, it's just you staring into the abyss while Node.js throws `Maximum call stack size exceeded` and your laptop fan takes off for orbit.";
  }

  // 10. API / REST API
  if (msg.includes('what is an api') || msg.includes('rest api') || msg.includes('explain api')) {
    return "An API is basically the waiter at a restaurant. You sit at the table (frontend), look at the menu (endpoints), tell the waiter what you want (request), and the waiter brings it back from the kitchen (backend/database).\n\nREST means it follows standard conventions like GET, POST, PUT, DELETE. It's clean, predictable, and occasionally serves you a cold 500 Internal Server Error when the chef drops the pot.";
  }

  // 11. Photosynthesis / Biology
  if (msg.includes('photosynthesis')) {
    return "Plants use sunlight, water, and CO2 to cook their own glucose and generate the oxygen you waste scrolling social media.\n\n**The chemical formula:**\n```text\n6CO2 + 6H2O + Light -> C6H12O6 + 6O2\n```\nNature: turns sunshine into sugar. You: need three alarms and emotional reassurance to turn on a kettle.";
  }

  // 12. Math / 2 + 2
  if (msg.includes('2 + 2') || msg.includes('2+2')) {
    if (selectedMode === 'savage') {
      return "Four. Incredible. You successfully solved kindergarten arithmetic without opening a calculator app. Call your parents, let them know the tuition wasn't entirely in vain.";
    }
    if (selectedMode === 'professor') {
      return "It evaluates to **4** under standard Peano arithmetic. However, on your mid-term paper, I saw you somehow round this off to 7.1 with zero steps shown.";
    }
    return "**4**. Groundbreaking calculation. You survived another mathematical test without needing to consult an astrologer.";
  }

  // 13. Git / GitHub
  if (msg.includes('git') || msg.includes('github') || msg.includes('merge conflict')) {
    return "Git: The version control system where you can detach your HEAD, lose 3 hours of sanity in a rebase conflict, and commit with messages like `asdfghjk`.\n\n- **Safety net:** `git stash` saves your uncommitted chaos.\n- **Golden rule:** Never `git push --force` to `main` on a Friday afternoon unless you've already accepted an offer at another company.";
  }

  // 14. Data Structures & Algorithms
  if (msg.includes('dsa') || msg.includes('binary tree') || msg.includes('linked list') || msg.includes('quicksort') || msg.includes('sorting')) {
    return "DSA: The subject students ignore all semester, then cram in 48 hours before an interview.\n\n- **Linked List:** Nodes that know who is next, but have zero idea what's happening at index 4 without walking the entire chain.\n- **Binary Search Tree (BST):** Left is smaller, right is bigger. Great at $O(\\log n)$ search until it becomes unbalanced and degrades into a glorified linked list.\n- **Quick Sort:** Divide and conquer pivot sorting with average $O(n \\log n)$ time.";
  }

  // 15. SQL vs NoSQL
  if (msg.includes('sql') || msg.includes('nosql') || msg.includes('database') || msg.includes('mongodb')) {
    return "SQL vs NoSQL:\n- **SQL (PostgreSQL/MySQL):** Strict schemas, foreign keys, and ACID compliance. Best when you actually care about data consistency.\n- **NoSQL (MongoDB):** Dump arbitrary JSON into collections and figure out the chaos later. Best for rapid prototyping or when you have no idea what your schema will look like by next Tuesday.";
  }

  // 16. Exams / Pass without studying
  if (msg.includes('exam') || msg.includes('without studying') || msg.includes('pass')) {
    if (selectedMode === 'savage') {
      return "Passing without studying is an urban myth invented by people currently repeating the semester. Your actual survival formula: download the previous 5 years' question papers, memorize the diagrams, and pray the examiner was having a good day.";
    }
    return "If you haven't opened the textbook yet, your best odds are:\n1. Solve the **last 5 years of exam papers** (professors love recycling questions).\n2. Memorize the major architecture diagrams and formulas.\n3. Write structured answers with bullet points and underlined terms—examiners grade on visual confidence.";
  }

  // 17. Assignment / Homework
  if (msg.includes('assignment') || msg.includes('homework')) {
    if (selectedMode === 'friendly') {
      return "We can tackle it right now. What's the problem statement before the midnight deadline turns into an adrenaline sport?";
    }
    if (selectedMode === 'savage') {
      return "An assignment due tomorrow that you're starting at 11 PM? A time-honored collegiate tradition. Tell me the topic so we can salvage what remains of your grade.";
    }
    return "Tell me the prompt or question. Let's knock it out before the submission portal gets overloaded by everyone else doing the exact same thing.";
  }

  // 18. Coding / Bug / Error
  if (msg.includes('bug') || msg.includes('error') || msg.includes('code') || msg.includes('syntax') || msg.includes('exception')) {
    if (selectedMode === 'savage') {
      return "Let me guess: 90% copy-paste from StackOverflow and 10% undefined variable panic. Paste the code or the stack trace, let's diagnose the disaster.";
    }
    return "Let me guess: missing semicolon, off-by-one index, or an async function without an await? Paste the snippet or the error log and let's find it.";
  }

  // 19. Greetings
  if (msg.match(/^(hi|hello|hey|yo|sup|namaste|hola|greetings)\b/)) {
    const greetings = [
      "Hey! What crisis are we postponing right now? Assignment, exam syllabus, or general life decisions?",
      "Yo! Ready to tackle some questions or are we just procrastinating with style today?",
      "Welcome back. Let's see what question or bug brought you here this time.",
      "Hey there. What's on the agenda today—learning something useful or testing my patience?"
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  // 20. Who are you / About
  if (msg.includes('who are you') || msg.includes('what are you') || msg.includes('who made you')) {
    return "I am **DA Roast Bot**—your witty, slightly sarcastic college friend built with Express, OpenAI, and a reality-check engine. I explain tech concepts, debug code, and keep your ego grounded all at once.";
  }

  // 21. How are you
  if (msg.includes('how are you') || msg.includes('how r u')) {
    return "Operating at zero latency and 100% sarcasm. How's that to-do list looking, or are we deliberately ignoring it?";
  }

  // 22. Meaning of life
  if (msg.includes('meaning of life')) {
    return "42 according to Douglas Adams. In college terms: surviving 8:00 AM lectures, passing without supplementary exams, and finding working charging outlets in the library.";
  }

  // Dynamic Natural Fallback Pools - NO generic repetitive formulas!
  // Formats: Witty insight, Analogy, Deadpan observation, Direct college-friend banter
  const naturalFriendlyReplies = [
    "Fair question. In simple terms: focus on the fundamental pattern first, then optimize the details once the core logic actually works.",
    "That sounds like a classic college puzzle. The trick is breaking it into smaller pieces instead of staring at the whole mountain at once.",
    "Good question. Most people overcomplicate this—strip away the jargon and it usually boils down to input, transformation, and output.",
    "Interesting angle. If you think about it like an engineering trade-off: you either spend the time now or spend twice as much fixing it later."
  ];

  const naturalNormalReplies = [
    "That's actually a solid question. It's like asking why code that worked yesterday broke today with zero git commits—there's always an underlying variable you overlooked.",
    "Here's the real breakdown: people make it sound like rocket science to justify consulting fees, but at its core, it's just consistent logic applied step-by-step.",
    "Classic dilemma. In theory, it's straightforward; in practice, it's held together by duct tape, caffeine, and optimistic assumptions.",
    "Think of it this way: if it were completely obvious, professors wouldn't have spent three lectures confusing everyone about it."
  ];

  const naturalSavageReplies = [
    "That question has the same energy as opening a textbook 10 minutes before the viva and hoping for enlightenment.",
    "Bold question. It's almost as ambitious as your plan to finish an entire semester's worth of syllabus in one evening.",
    "The answer is actually simple, but explaining it to someone who thinks `git commit -m '.'` is good documentation might take a second.",
    "Here's the reality check: you're trying to solve advanced problems when the fundamentals are still trembling like an ungrounded breadboard."
  ];

  if (selectedMode === 'friendly') {
    return naturalFriendlyReplies[Math.floor(Math.random() * naturalFriendlyReplies.length)];
  } else if (selectedMode === 'savage') {
    return naturalSavageReplies[Math.floor(Math.random() * naturalSavageReplies.length)];
  } else if (selectedMode === 'professor') {
    return "A question requiring proper scrutiny. Review the fundamental axioms before jumping to hasty conclusions, and present your derivations clearly.";
  } else if (selectedMode === 'procrastinator') {
    return "We could deep-dive into that right now, or we could ponder it over a cup of chai while the deadline inches closer.";
  } else {
    return naturalNormalReplies[Math.floor(Math.random() * naturalNormalReplies.length)];
  }
}

class AIService {
  buildSystemPrompt(mode = 'normal', personality = 'college-friend') {
    const cleanMode = (mode || 'normal').toLowerCase();
    const cleanPers = (personality || 'college-friend').toLowerCase();

    // Special backward-compat modes
    if (cleanMode === 'professor') {
      return `${PERSONALITY_PROMPTS['strict-professor']}\n${MODE_INTENSITIES.normal}`;
    }
    if (cleanMode === 'procrastinator') {
      return `${PERSONALITY_PROMPTS['college-friend']}\n${MODE_INTENSITIES.friendly}`;
    }

    const pers = PERSONALITY_PROMPTS[cleanPers] || PERSONALITY_PROMPTS['college-friend'];
    const intensity = MODE_INTENSITIES[cleanMode] || MODE_INTENSITIES.normal;
    return `${pers}\n${intensity}\nRules: Answer academic, factual, and coding questions clearly with accurate details. Format code in markdown with backticks. Never be hateful, abusive, or discriminatory.`;
  }

  /**
   * Generates a chat response using OpenAI or smart fallback
   * @param {Object} options
   * @param {string} options.message
   * @param {string} options.mode - 'friendly' | 'normal' | 'savage'
   * @param {string} options.personality - 'college-friend' | 'strict-professor' | 'best-friend' | 'deadpan-ai' | 'savage-friend' | 'motivational-villain'
   * @param {Array} options.history - recent conversation messages [{ role, content }]
   * @returns {Promise<string>}
   */
  async generateChatReply({ message, mode = 'normal', personality = 'college-friend', history = [] }) {
    const selectedMode = (mode || 'normal').toLowerCase();
    const systemPrompt = this.buildSystemPrompt(selectedMode, personality);

    // Check if OpenAI client is available
    if (openaiClient) {
      try {
        const messages = [
          { role: 'system', content: systemPrompt },
          ...history.slice(-6), // Send last 6 messages for context
          { role: 'user', content: message }
        ];

        const completion = await openaiClient.chat.completions.create({
          model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
          messages: messages,
          temperature: selectedMode === 'savage' ? 0.95 : 0.8,
          max_tokens: 350,
        });

        const reply = completion.choices?.[0]?.message?.content?.trim();
        if (reply) {
          return reply;
        }
      } catch (err) {
        console.error('[AI Service] OpenAI API error occurred:', err.message);
        // Fall through to fallback engine below
      }
    }

    // Smart Fallback generator
    return generateFallbackResponse(message, selectedMode, personality);
  }

  /**
   * Streams a chat response via chunk callback (supports OpenAI SSE or Simulated Real-time streaming)
   * @param {Object} options
   * @param {string} options.message
   * @param {string} options.mode
   * @param {string} options.personality
   * @param {Array} options.history
   * @param {Function} options.onChunk - callback(tokenString)
   * @returns {Promise<string>} - full combined response
   */
  async streamChatReply({ message, mode = 'normal', personality = 'college-friend', history = [], onChunk }) {
    const selectedMode = (mode || 'normal').toLowerCase();
    const systemPrompt = this.buildSystemPrompt(selectedMode, personality);

    if (openaiClient) {
      try {
        const messages = [
          { role: 'system', content: systemPrompt },
          ...history.slice(-6),
          { role: 'user', content: message }
        ];

        const stream = await openaiClient.chat.completions.create({
          model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
          messages: messages,
          temperature: selectedMode === 'savage' ? 0.95 : 0.8,
          max_tokens: 350,
          stream: true,
        });

        let fullText = '';
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) {
            fullText += content;
            if (onChunk) onChunk(content);
          }
        }
        return fullText;
      } catch (err) {
        console.error('[AI Service Streaming Error]:', err.message);
      }
    }

    // Fallback: tokenize heuristic response word by word with brief micro-delays
    const fullFallback = generateFallbackResponse(message, selectedMode, personality);
    const tokens = fullFallback.split(/(\s+)/); // keep whitespace tokens

    for (const token of tokens) {
      if (onChunk) onChunk(token);
      // Realistic typing cadence simulation
      await new Promise((r) => setTimeout(r, 20));
    }

    return fullFallback;
  }

  /**
   * Check AI status
   */
  getStatus() {
    return {
      openaiConfigured: !!(process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes('your_openai_api_key')),
      fallbackEngineActive: true,
      supportedModes: Object.keys(SYSTEM_PROMPTS),
      activeModel: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    };
  }
}

module.exports = new AIService();
