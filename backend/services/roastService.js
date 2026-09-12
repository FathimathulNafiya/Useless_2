/**
 * DA Roast Bot - Roast Service
 * Curated repository of witty, sarcastic, savage, professor, and procrastinator college roasts,
 * plus code roaster and roast battle evaluation heuristics.
 */

const ROAST_COLLECTION = {
  friendly: [
    "I appreciate your ambition, even if your execution is still buffering.",
    "You have so much untapped potential. Let's keep it safely untapped for now.",
    "I love how you tackle questions with the bold confidence of someone who skimmed the syllabus 5 minutes ago.",
    "Your work ethic is like Bluetooth: keeps disconnecting the second things get slightly inconvenient.",
    "Good job waking up today! The bar was in hell, but you hopped right over it.",
    "You're living proof that optimism can survive entirely on instant noodles and pure vibes.",
    "I admire your dedication to looking extremely busy while achieving absolutely nothing.",
    "Your ambition is staggering. Your deadline compliance, however, remains purely theoretical.",
    "You're like an unskippable tutorial: slightly inconvenient, but we still care about you.",
    "You remind me of a code comment: technically present, but nobody really understands the purpose."
  ],
  normal: [
    "That question had immense confidence. Unfortunately, it didn't have much else.",
    "Your productivity called. It wants to know why you've been ghosting it since semester 1.",
    "I can explain it to you, but I can't understand it for you. There's a hardware limitation on your end.",
    "You're the human equivalent of a 200 OK status code carrying a 500 error payload.",
    "You postponed this till 11:59 PM, didn't you? Be honest, your laptop fan is writing its final will.",
    "I see you're pursuing a degree in Advanced Procrastination with a minor in Panic.",
    "Your problem-solving strategy seems to be staring at the screen until the universe intervenes.",
    "Your code and your life decisions have one thing in common: zero documentation and blind hope.",
    "You're running your life on trial mode and the free trial expired three semesters ago.",
    "I'd compare you to an infinite loop, but at least infinite loops run persistently.",
    "Your confidence is inspiring. Misplaced, catastrophic, and completely unfounded, but undeniably inspiring.",
    "You approach deadlines like an action movie hero: walking away in slow motion while everything explodes."
  ],
  savage: [
    "I've seen loading screens with more intellectual activity.",
    "Talking to you feels like trying to run Cyberpunk 2077 on an Intel Pentium 3.",
    "If your effort was an exam paper, even the external examiner would feel second-hand embarrassment.",
    "Your brain has 99 tabs open, 4 are frozen, and none of them are running anything useful.",
    "You are definitive proof that Ctrl+Z does not work in real life.",
    "I'd roast you harder, but nature and your semester GPA already did a thorough job.",
    "Your thought process is like a fresh Git repo: totally detached from HEAD.",
    "You bring so much joy to the room every single time you close your laptop and walk away.",
    "If negligence was an Olympic sport, your medal cabinet would collapse under its own weight.",
    "Your code doesn't just have bugs; it has an entire unmonitored ecosystem.",
    "I'm not saying you're unprepared, but if cluelessness had a market cap, you'd be a Fortune 500 company.",
    "If overthinking burned calories, you would have vanished into another dimension by now."
  ],
  professor: [
    "Where is your IEEE citation for that audacious claim? And no, 'Wikipedia' is not a journal.",
    "I asked for a 20-page literature review, and you submitted 3 pages with font size 18 and 3-inch margins.",
    "Did you actually build this algorithm, or did you pay a 4th-year senior in canteen samosas to write it?",
    "In your viva presentation, even the projector was trying to turn itself off out of second-hand embarrassment.",
    "Your methodology section reads like a fictional thriller written during a midnight caffeine overdose.",
    "Show me your training dataset. And remember: 'I scraped 4 Reddit threads' will get you detained.",
    "If you spent half the energy studying that you spent calculating the exact 75% attendance threshold, you'd have a 10 CGPA.",
    "I have reviewed your project proposal. The most novel contribution here is how creatively you dodged doing real work.",
    "The external viva committee is tomorrow at 9 AM. I suggest you start preparing your apology speech today."
  ],
  procrastinator: [
    "Why do today what you can panic-start at 11:47 PM tomorrow?",
    "I also firmly believe that 10 hours of sleep is an essential investment in future exhaustion.",
    "My semester roadmap: Step 1: Attend Day 1 orientation. Step 2: Sudden 4-month blackout. Step 3: End-sem exam is tomorrow morning.",
    "The assignment portal deadline is merely a polite recommendation. The real deadline is when the professor stops replying.",
    "I've been in 'I'll start studying at the top of the hour' mode since last Thursday.",
    "Opening 45 chrome tabs related to the assignment is basically 90% of the work done, right?",
    "Staring blankly at a blank VS Code file burns approximately zero calories, but 100% of your remaining dignity.",
    "Procrastination is not laziness; it's the profound art of giving yourself high-stakes adrenaline rushes for free."
  ]
};

class RoastService {
  /**
   * Retrieves a random roast based on mode or general pool
   * @param {string} mode - 'friendly' | 'normal' | 'savage' | 'professor' | 'procrastinator'
   * @returns {string}
   */
  getRandomRoast(mode = 'normal') {
    const selectedMode = (mode || 'normal').toLowerCase();
    const roasts = ROAST_COLLECTION[selectedMode] || ROAST_COLLECTION.normal;
    const randomIndex = Math.floor(Math.random() * roasts.length);
    return roasts[randomIndex];
  }

  /**
   * Gets a random roast from across all categories
   */
  getAnyRandomRoast() {
    const all = Object.values(ROAST_COLLECTION).flat();
    return all[Math.floor(Math.random() * all.length)];
  }

  /**
   * Evaluates a user's roast attempt in a Roast Battle
   * @param {string} userRoast
   * @returns {Object} { humorScore, originalityScore, burnSeverity, totalScore, verdict, counterRoast }
   */
  evaluateRoastBattle(userRoast = '') {
    const text = (userRoast || '').trim();
    const length = text.length;

    // Heuristic scoring based on length, punctuation, keywords
    let humor = 5;
    let originality = 6;
    let severity = 5;

    const punchyWords = ['motherboard', 'wifi', 'calc', 'bot', 'code', 'error', 'ai', 'bug', 'server', 'electricity', 'silicon'];
    const hitCount = punchyWords.filter(w => text.toLowerCase().includes(w)).length;

    if (length > 20 && length < 140) humor += 2;
    if (hitCount >= 2) originality += 2;
    if (text.includes('!') || text.includes('?')) severity += 1;
    if (text.toLowerCase().includes('trash') || text.toLowerCase().includes('dumb') || text.toLowerCase().includes('useless')) {
      severity += 2;
    }

    humor = Math.min(10, Math.max(2, humor + Math.floor(Math.random() * 2)));
    originality = Math.min(10, Math.max(3, originality + Math.floor(Math.random() * 2)));
    severity = Math.min(10, Math.max(2, severity + Math.floor(Math.random() * 2)));

    const totalScore = Math.round(((humor + originality + severity) / 30) * 100);

    let verdict = 'Bot Wins by Knockout';
    if (totalScore >= 80) verdict = 'User Prevailed (Barely)';
    else if (totalScore >= 60) verdict = 'Honorable Stalemate';

    const counterRoasts = [
      "Not bad! That almost generated enough emotional warmth to raise my CPU temperature by 0.1°C.",
      "I've heard sharper burns from a microwave on defrost mode. Here's mine: You're like a GitHub fork that nobody starred.",
      "Cute punchline! Did you ask ChatGPT to write that for you, or did you suffer that brain freeze all on your own?",
      "That insult was like your last git commit message: empty, confusing, and full of regret.",
      "I respect the audacity, but my error logs have delivered more emotional devastation than that."
    ];
    const counterRoast = counterRoasts[Math.floor(Math.random() * counterRoasts.length)];

    return {
      userRoast: text,
      humorScore: humor,
      originalityScore: originality,
      burnSeverity: severity,
      totalScore,
      verdict,
      counterRoast,
    };
  }

  /**
   * Generates a code roast critique and refactor diagnosis
   * @param {string} code
   * @param {string} language
   */
  roastCodeSnippet(code = '', language = 'javascript') {
    const lines = (code || '').split('\n');
    const lineCount = lines.length;
    const charCount = code.length;

    // Detect typical issues
    const hasEval = code.includes('eval(');
    const hasVar = code.includes('var ');
    const hasConsoleLog = code.includes('console.log');
    const hasNestedLoops = (code.match(/for\s*\(|while\s*\(/g) || []).length >= 2;
    const hasCatchEmpty = code.includes('catch') && (code.includes('catch () {}') || code.includes('catch (e) {}'));

    let burns = [];
    let diagnosis = [];
    let grade = 'C-';

    if (hasEval) {
      burns.push("Using `eval()`? Did you accidentally travel forward in time from 1996?");
      diagnosis.push("High security vulnerability: Avoid `eval()` as it executes arbitrary code.");
      grade = 'F';
    }

    if (hasVar) {
      burns.push("Still using `var` in modern code? Let me guess, your textbook was printed in 2004.");
      diagnosis.push("Scope bleeding: Modern JavaScript prefers `const` by default, and `let` for reassignments.");
    }

    if (hasCatchEmpty) {
      burns.push("Empty catch block detected. Swallowing errors like you swallow exam panic.");
      diagnosis.push("Silent failures: Always log or re-throw caught exceptions to prevent invisible bugs.");
      grade = 'D';
    }

    if (hasNestedLoops) {
      burns.push("Nested loops! Time complexity O(n²) or worse. Your fan is already writing its final will.");
      diagnosis.push("Performance bottleneck: Consider Hash Maps (O(1) lookup) or two-pointer techniques.");
    }

    if (!burns.length) {
      burns.push(`Analyzing ${lineCount} lines of ${language}... It runs, but your variable names look like an encrypted WWII radio dispatch.`);
      diagnosis.push("Code is functional, but lacks clear descriptive identifiers and modular structure.");
      grade = 'B-';
    }

    return {
      language,
      lineCount,
      charCount,
      burn: burns.join(' '),
      diagnosis: diagnosis.join(' '),
      grade,
      recommendation: "Refactor with clean semantic variable naming, proper error handling, and optimal asymptotic complexity."
    };
  }

  /**
   * Returns roast stats & catalogue
   */
  getRoastPoolStats() {
    return {
      friendlyCount: ROAST_COLLECTION.friendly.length,
      normalCount: ROAST_COLLECTION.normal.length,
      savageCount: ROAST_COLLECTION.savage.length,
      professorCount: ROAST_COLLECTION.professor.length,
      procrastinatorCount: ROAST_COLLECTION.procrastinator.length,
      totalRoasts: Object.values(ROAST_COLLECTION).reduce((acc, arr) => acc + arr.length, 0),
      supportedModes: Object.keys(ROAST_COLLECTION),
    };
  }
}

module.exports = new RoastService();
