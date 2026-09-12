/**
 * DA ROAST BOT - Frontend Application Logic (v1.0 • B.Tech Edition)
 * Vanilla JavaScript implementation for:
 * - Real-time conversational AI integration & session memory
 * - Roast level selector (Friendly, Normal, Savage)
 * - ROAST ME spotlight with consistent intensity scoring (0-100)
 * - 6-persona AI switching (College Friend, Strict Professor, Best Friend, Deadpan AI, Savage Friend, Villain)
 * - Roast history tracking & achievement milestones
 * - Web Speech API (Voice-to-Text & Speech Synthesis with stop control)
 * - Web Audio API sound synthesis
 * - Live stats & settings management
 */

(function () {
  'use strict';

  // Achievement Definitions (Section 16)
  const ACHIEVEMENTS_DEF = [
    {
      id: 'firstBlood',
      icon: '🏆',
      title: 'FIRST BLOOD',
      desc: 'Received your first roast.',
      check: (stats) => stats.roasts >= 1,
    },
    {
      id: 'fireStarter',
      icon: '🔥',
      title: 'FIRE STARTER',
      desc: 'Generated 10 roasts.',
      check: (stats) => stats.roasts >= 10,
    },
    {
      id: 'survivor',
      icon: '💀',
      title: 'SURVIVOR',
      desc: 'Survived 25 savage roasts.',
      check: (stats) => stats.savage >= 25,
    },
    {
      id: 'nuclearVictim',
      icon: '☢️',
      title: 'NUCLEAR VICTIM',
      desc: 'Received a roast with intensity over 85.',
      check: (stats, lastIntensity) => lastIntensity && lastIntensity >= 85,
    },
    {
      id: 'selfAware',
      icon: '🤡',
      title: 'SELF AWARE',
      desc: 'Clicked ROAST ME 5 or more times.',
      check: (stats) => stats.roastMeClicks >= 5,
    },
  ];

  const MODE_DESCRIPTIONS = {
    friendly: 'Light teasing. No emotional damage.',
    normal: 'Your average college-friend disrespect.',
    savage: 'Enter at your own risk.',
  };

  // State Management
  const state = {
    conversationId: localStorage.getItem('da_roast_convo_id') || null,
    currentMode: localStorage.getItem('da_roast_mode') || 'normal',
    currentPersonality: localStorage.getItem('da_roast_personality') || 'college-friend',
    theme: localStorage.getItem('da_roast_theme') || 'funny',
    soundEnabled: localStorage.getItem('da_roast_sound') !== 'false',
    ttsEnabled: localStorage.getItem('da_roast_tts') === 'true',
    autoscroll: localStorage.getItem('da_roast_autoscroll') !== 'false',
    isGenerating: false,
    isListening: false,
    isSpeaking: false,
    speechRecognition: null,
    messagesCount: 0,
    stats: loadStats(),
    history: loadHistory(),
    achievements: loadAchievements(),
  };

  function loadStats() {
    try {
      const saved = localStorage.getItem('da_roast_stats');
      return saved ? JSON.parse(saved) : { convos: 1, roasts: 0, savage: 0, questions: 0, roastMeClicks: 0 };
    } catch (e) {
      return { convos: 1, roasts: 0, savage: 0, questions: 0, roastMeClicks: 0 };
    }
  }

  function saveStats() {
    localStorage.setItem('da_roast_stats', JSON.stringify(state.stats));
    updateStatsDisplay();
  }

  function loadHistory() {
    try {
      const saved = localStorage.getItem('da_roast_history');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  }

  function saveHistory() {
    localStorage.setItem('da_roast_history', JSON.stringify(state.history.slice(0, 50)));
  }

  function loadAchievements() {
    try {
      const saved = localStorage.getItem('da_roast_achievements');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  }

  function saveAchievements() {
    localStorage.setItem('da_roast_achievements', JSON.stringify(state.achievements));
  }

  // DOM Elements
  const elements = {
    chatViewport: document.getElementById('chatViewport'),
    welcomeScreen: document.getElementById('welcomeScreen'),
    messagesContainer: document.getElementById('messagesContainer'),
    chatForm: document.getElementById('chatForm'),
    userInput: document.getElementById('userInput'),
    sendBtn: document.getElementById('sendBtn'),
    micBtn: document.getElementById('micBtn'),
    typingIndicator: document.getElementById('typingIndicator'),
    statusText: document.getElementById('statusText'),
    headerRoastBtn: document.getElementById('headerRoastBtn'),
    clearChatBtn: document.getElementById('clearChatBtn'),
    openSettingsBtn: document.getElementById('openSettingsBtn'),
    openPersonalityBtn: document.getElementById('openPersonalityBtn'),
    openHistoryBtn: document.getElementById('openHistoryBtn'),
    openAchievementsBtn: document.getElementById('openAchievementsBtn'),
    // Roast Level
    roastLevelSelector: document.getElementById('roastLevelSelector'),
    levelBtns: document.querySelectorAll('.level-btn'),
    modeDescription: document.getElementById('modeDescription'),
    // Stats elements
    statConvos: document.getElementById('statConvos'),
    statRoasts: document.getElementById('statRoasts'),
    statSavage: document.getElementById('statSavage'),
    statQuestions: document.getElementById('statQuestions'),
    // Modals
    roastShowcaseModal: document.getElementById('roastShowcaseModal'),
    showcaseRoastText: document.getElementById('showcaseRoastText'),
    showcaseModePill: document.getElementById('showcaseModePill'),
    showcaseTime: document.getElementById('showcaseTime'),
    intensityTierBadge: document.getElementById('intensityTierBadge'),
    intensityNumber: document.getElementById('intensityNumber'),
    intensityBar: document.getElementById('intensityBar'),
    closeRoastModalBtn: document.getElementById('closeRoastModalBtn'),
    copyShowcaseBtn: document.getElementById('copyShowcaseBtn'),
    listenShowcaseBtn: document.getElementById('listenShowcaseBtn'),
    roastAgainBtn: document.getElementById('roastAgainBtn'),
    // Personality Modal
    personalityModal: document.getElementById('personalityModal'),
    closePersonalityModalBtn: document.getElementById('closePersonalityModalBtn'),
    donePersonalityBtn: document.getElementById('donePersonalityBtn'),
    personaCards: document.querySelectorAll('.persona-card'),
    // History Modal
    historyModal: document.getElementById('historyModal'),
    historyList: document.getElementById('historyList'),
    closeHistoryModalBtn: document.getElementById('closeHistoryModalBtn'),
    doneHistoryBtn: document.getElementById('doneHistoryBtn'),
    clearHistoryBtn: document.getElementById('clearHistoryBtn'),
    // Achievements Modal
    achievementsModal: document.getElementById('achievementsModal'),
    achievementsList: document.getElementById('achievementsList'),
    closeAchievementsModalBtn: document.getElementById('closeAchievementsModalBtn'),
    doneAchievementsBtn: document.getElementById('doneAchievementsBtn'),
    // Settings Modal
    settingsModal: document.getElementById('settingsModal'),
    closeSettingsBtn: document.getElementById('closeSettingsBtn'),
    modalSettingsDoneBtn: document.getElementById('modalSettingsDoneBtn'),
    modalClearConvoBtn: document.getElementById('modalClearConvoBtn'),
    resetStatsBtn: document.getElementById('resetStatsBtn'),
    themeSelect: document.getElementById('themeSelect'),
    soundToggle: document.getElementById('soundToggle'),
    ttsToggle: document.getElementById('ttsToggle'),
    autoscrollToggle: document.getElementById('autoscrollToggle'),
    diagStatus: document.getElementById('diagStatus'),
    diagAiEngine: document.getElementById('diagAiEngine'),
    diagDb: document.getElementById('diagDb'),
    diagSessionId: document.getElementById('diagSessionId'),
    toastContainer: document.getElementById('toastContainer'),
  };

  // Web Audio Synthesizer (Zero asset dependencies)
  const soundFX = {
    ctx: null,
    init() {
      if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioCtx();
      }
    },
    play(type) {
      if (!state.soundEnabled) return;
      try {
        this.init();
        if (!this.ctx) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);

        if (type === 'send') {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(320, now);
          osc.frequency.exponentialRampToValueAtTime(640, now + 0.1);
          gain.gain.setValueAtTime(0.14, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
          osc.start(now);
          osc.stop(now + 0.1);
        } else if (type === 'receive') {
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(540, now);
          osc.frequency.exponentialRampToValueAtTime(420, now + 0.15);
          gain.gain.setValueAtTime(0.18, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
          osc.start(now);
          osc.stop(now + 0.15);
        } else if (type === 'roast') {
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(180, now);
          osc.frequency.exponentialRampToValueAtTime(380, now + 0.12);
          osc.frequency.exponentialRampToValueAtTime(120, now + 0.25);
          gain.gain.setValueAtTime(0.18, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
          osc.start(now);
          osc.stop(now + 0.25);
        } else if (type === 'achievement') {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(440, now);
          osc.frequency.setValueAtTime(554.37, now + 0.1);
          osc.frequency.setValueAtTime(659.25, now + 0.2);
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
          osc.start(now);
          osc.stop(now + 0.35);
        } else if (type === 'duck') {
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(620, now);
          osc.frequency.exponentialRampToValueAtTime(320, now + 0.14);
          gain.gain.setValueAtTime(0.18, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);
          osc.start(now);
          osc.stop(now + 0.14);
        }
      } catch (e) {
        // Audio error silent fallback
      }
    },
  };

  /**
   * Adaptive Ambient Canvas
   * - Funny Theme: Floating relatable college meme particles (🤡, 💀, 🐛, ☕, ⚡, 📉, 🫠, 🦆, 🔥)
   * - Sunset / Other Themes: Sunlit golden dust motes drifting in sunbeams
   */
  function setupNeuralCanvas() {
    const canvas = document.getElementById('neuralCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const count = Math.min(26, Math.max(16, Math.floor(width / 52)));
    const particles = [];

    const funnyIcons = ['🤡', '💀', '🐛', '☕', '⚡', '📉', '🫠', '🦆', '🔥', '📚', '🤦‍♂️'];
    const sunsetTones = [
      { r: 255, g: 224, b: 168 },
      { r: 255, g: 196, b: 140 },
      { r: 255, g: 172, b: 132 },
      { r: 255, g: 245, b: 220 }
    ];

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.28,
        vy: -0.15 - Math.random() * 0.25,
        radius: Math.random() * 1.6 + 1.0,
        emoji: funnyIcons[i % funnyIcons.length],
        fontSize: Math.floor(Math.random() * 8 + 18),
        tone: sunsetTones[i % sunsetTones.length],
        alpha: Math.random() * 0.35 + 0.25,
        rotation: (Math.random() - 0.5) * 0.5,
        rotSpeed: (Math.random() - 0.5) * 0.01,
        pulseSpeed: 0.015 + Math.random() * 0.02,
        pulseOffset: Math.random() * Math.PI * 2,
      });
    }

    let time = 0;

    function drawFrame() {
      ctx.clearRect(0, 0, width, height);
      time += 1;
      const isFunny = (state.theme === 'funny');

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const currentAlpha = Math.max(0.08, p.alpha + Math.sin(time * p.pulseSpeed + p.pulseOffset) * 0.15);

        if (isFunny) {
          // Render floating hilarious meme emoji
          ctx.save();
          ctx.translate(p.x, p.y);
          p.rotation += p.rotSpeed;
          ctx.rotate(p.rotation);
          ctx.globalAlpha = currentAlpha * 0.75;
          ctx.font = `${p.fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(p.emoji, 0, 0);
          ctx.restore();
        } else {
          // Render soft golden dust mote
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 3);
          grad.addColorStop(0, `rgba(${p.tone.r}, ${p.tone.g}, ${p.tone.b}, ${currentAlpha})`);
          grad.addColorStop(0.5, `rgba(${p.tone.r}, ${p.tone.g}, ${p.tone.b}, ${currentAlpha * 0.35})`);
          grad.addColorStop(1, `rgba(${p.tone.r}, ${p.tone.g}, ${p.tone.b}, 0)`);

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * 3, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * 0.75, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${p.tone.r}, ${p.tone.g}, ${p.tone.b}, ${Math.min(1, currentAlpha * 1.5)})`;
          ctx.fill();
        }

        if (!prefersReducedMotion) {
          p.x += p.vx;
          p.y += p.vy;

          if (p.x < -25) p.x = width + 25;
          else if (p.x > width + 25) p.x = -25;
          if (p.y < -25) p.y = height + 25;
          else if (p.y > height + 25) p.y = -25;
        }
      }
    }

    if (prefersReducedMotion) {
      drawFrame();
    } else {
      function animate() {
        drawFrame();
        requestAnimationFrame(animate);
      }
      animate();
    }

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      if (prefersReducedMotion) {
        drawFrame();
      }
    });
  }

  /**
   * Application Initialization
   */
  function init() {
    setupNeuralCanvas();
    applyTheme(state.theme);
    setupSession();
    setupRoastLevelSelector();
    setupSuggestedPrompts();
    setupInputEvents();
    setupVoiceInput();
    setupModals();
    setupKeyboardShortcuts();
    updateStatsDisplay();
    checkBackendHealth();
    renderWelcomeState();
    setupInteractiveDuck();
  }

  const DUCK_WISDOMS = [
    '🦆 Duck: "Have you tried turning your brain off and back on again?"',
    '🦆 Duck: "It works on localhost:5000, ship the entire dormitory."',
    '🦆 Duck: "Blame the TA. It\'s written on the dorm wall."',
    '🦆 Duck: "If it compiles on the first try, DO NOT TOUCH IT."',
    '🦆 Duck: "75% attendance is just a social construct."',
    '🦆 Duck: "Ctrl+C and Ctrl+V is the real foundation of engineering."',
    '🦆 Duck: "Viva Examiner can\'t ask hard questions if you talk fast enough."',
    '🦆 Duck: "Progress > Perfection. Backlogs > Sleep."',
    '🦆 Duck: "There are no bugs, only undocumented final-year features."'
  ];

  function setupInteractiveDuck() {
    const duckBtn = document.getElementById('interactiveDuck');
    if (!duckBtn) return;

    let duckIndex = 0;
    duckBtn.addEventListener('click', () => {
      soundFX.play('duck');
      duckBtn.classList.add('quacking');
      setTimeout(() => duckBtn.classList.remove('quacking'), 450);

      const quote = DUCK_WISDOMS[duckIndex % DUCK_WISDOMS.length];
      duckIndex++;
      showToast(quote, 'achievement');
    });
  }

  function setupSession() {
    if (!state.conversationId) {
      state.conversationId = 'convo_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem('da_roast_convo_id', state.conversationId);
    }
    if (elements.diagSessionId) elements.diagSessionId.textContent = state.conversationId;
  }

  function applyTheme(theme) {
    state.theme = theme;
    document.body.dataset.theme = theme;
    localStorage.setItem('da_roast_theme', theme);
    if (elements.themeSelect) elements.themeSelect.value = theme;
    if (elements.statusText) {
      elements.statusText.textContent = theme === 'funny' ? 'RUNNING ON 2 RED BULLS ⚡' : 'AI ONLINE';
    }
  }

  function renderWelcomeState() {
    if (state.messagesCount === 0) {
      elements.welcomeScreen.classList.remove('hidden');
    } else {
      elements.welcomeScreen.classList.add('hidden');
    }
  }

  /**
   * Roast Level Selector (Section 8)
   */
  function setupRoastLevelSelector() {
    elements.levelBtns.forEach((btn) => {
      const mode = btn.dataset.mode;
      const isActive = mode === state.currentMode;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-checked', isActive);

      btn.addEventListener('click', () => {
        if (state.currentMode === mode) return;
        state.currentMode = mode;
        localStorage.setItem('da_roast_mode', mode);

        elements.levelBtns.forEach((b) => {
          const active = b.dataset.mode === mode;
          b.classList.toggle('active', active);
          b.setAttribute('aria-checked', active);
        });

        if (elements.modeDescription) {
          elements.modeDescription.textContent = MODE_DESCRIPTIONS[mode] || '';
        }

        soundFX.play('send');
        showToast(`Roast level: ${mode.toUpperCase()}`, 'info');
      });
    });

    if (elements.modeDescription) {
      elements.modeDescription.textContent = MODE_DESCRIPTIONS[state.currentMode] || '';
    }
  }

  /**
   * Suggested Prompts (Section 5)
   * Clicking a suggestion puts it in the input field
   */
  function setupSuggestedPrompts() {
    const chips = document.querySelectorAll('.prompt-chip');
    chips.forEach((chip) => {
      chip.addEventListener('click', () => {
        const prompt = chip.dataset.prompt;
        elements.userInput.value = prompt;
        elements.userInput.dispatchEvent(new Event('input'));
        elements.userInput.focus();
        showToast('Prompt inserted. Press Enter to send!', 'info');
      });
    });
  }

  /**
   * Input Form & Auto-Expanding Textarea
   */
  function setupInputEvents() {
    const { userInput, sendBtn, chatForm } = elements;

    userInput.addEventListener('input', () => {
      userInput.style.height = 'auto';
      const scrollHeight = Math.min(userInput.scrollHeight, 120);
      userInput.style.height = scrollHeight + 'px';

      const length = userInput.value.trim().length;
      sendBtn.disabled = length === 0 || state.isGenerating;
    });

    userInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (!sendBtn.disabled && !state.isGenerating) {
          chatForm.requestSubmit();
        }
      }
    });

    chatForm.addEventListener('submit', handleSendMessage);
  }

  /**
   * Send Message to Backend (Section 6)
   */
  async function handleSendMessage(e) {
    e.preventDefault();
    if (state.isGenerating) return;

    const message = elements.userInput.value.trim();
    if (!message) return;

    // Reset input
    elements.userInput.value = '';
    elements.userInput.style.height = 'auto';
    elements.sendBtn.disabled = true;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Append user message
    appendUserMessage(message, timeStr);
    state.messagesCount++;
    renderWelcomeState();

    // Stats update
    state.stats.questions++;
    saveStats();

    soundFX.play('send');
    showTypingIndicator(true);
    state.isGenerating = true;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          mode: state.currentMode,
          conversationId: state.conversationId,
          personality: state.currentPersonality,
        }),
      });

      const data = await res.json();
      showTypingIndicator(false);
      state.isGenerating = false;

      if (data.success) {
        if (data.conversationId) {
          state.conversationId = data.conversationId;
          localStorage.setItem('da_roast_convo_id', data.conversationId);
          if (elements.diagSessionId) elements.diagSessionId.textContent = data.conversationId;
        }

        appendBotMessage({
          content: data.reply,
          mode: data.mode || state.currentMode,
          personality: data.personality || state.currentPersonality,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });

        soundFX.play('receive');

        if (state.ttsEnabled) {
          speakText(data.reply);
        }
      } else {
        appendBotMessage({
          content: data.error || "The AI server is taking an unscheduled coffee break. Try again in a moment.",
          mode: state.currentMode,
          personality: state.currentPersonality,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isError: true,
        });
        showToast(data.error || 'Server error', 'error');
      }
    } catch (err) {
      showTypingIndicator(false);
      state.isGenerating = false;
      appendBotMessage({
        content: "Network error or server unreachable. Check backend connection.",
        mode: state.currentMode,
        personality: state.currentPersonality,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true,
      });
      showToast('Server unreachable', 'error');
    }

    elements.userInput.focus();
  }

  /**
   * Append User Message (Section 6 & 23)
   */
  function appendUserMessage(content, time) {
    const row = document.createElement('div');
    row.className = 'message-row user-row';
    row.innerHTML = `
      <div class="msg-avatar user-avatar"><span>👤</span></div>
      <div class="msg-bubble-wrapper">
        <div class="msg-meta">
          <span class="msg-sender">YOU</span>
          <span class="msg-time">${time}</span>
        </div>
        <div class="msg-bubble user-bubble">
          <p>${escapeHtml(content)}</p>
        </div>
      </div>
    `;
    elements.messagesContainer.appendChild(row);
    scrollToBottom();
  }

  /**
   * Append Bot Message (Section 6 & 23)
   */
  function appendBotMessage({ content, mode, personality, timestamp, isError = false }) {
    const row = document.createElement('div');
    row.className = 'message-row bot-row';

    const modeClass = `mode-${(mode || 'normal').toLowerCase()}`;
    const modeLabel = (mode || 'normal').toUpperCase();
    const persLabel = formatPersonalityName(personality);

    row.innerHTML = `
      <div class="msg-avatar bot-avatar"><span>🤖</span></div>
      <div class="msg-bubble-wrapper">
        <div class="msg-meta">
          <span class="msg-sender">🤖 DA BOT</span>
          <span class="msg-mode-tag ${modeClass}">${modeLabel}${persLabel ? ` • ${persLabel}` : ''}</span>
          <span class="msg-time">${timestamp || 'Just now'}</span>
        </div>
        <div class="msg-bubble bot-bubble ${isError ? 'error-bubble' : ''}">
          ${formatBotHtml(content)}
        </div>
        <div class="msg-actions">
          <button class="msg-action-btn copy-btn" title="Copy message" onclick="window.daRoastApp.copyText(this)">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            <span>Copy</span>
          </button>
          <button class="msg-action-btn speak-btn" title="Read aloud" onclick="window.daRoastApp.speakText(this)">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
            <span>Listen</span>
          </button>
          <button class="msg-action-btn thumbs-btn" title="Good roast" onclick="window.daRoastApp.rateResponse(this, 'up')">
            <span>👍</span>
          </button>
          <button class="msg-action-btn thumbs-btn" title="Weak roast" onclick="window.daRoastApp.rateResponse(this, 'down')">
            <span>👎</span>
          </button>
        </div>
      </div>
    `;

    elements.messagesContainer.appendChild(row);
    scrollToBottom();
  }

  function formatPersonalityName(id) {
    const map = {
      'college-friend': 'COLLEGE FRIEND',
      'strict-professor': 'PROFESSOR',
      'best-friend': 'BEST FRIEND',
      'deadpan-ai': 'DEADPAN AI',
      'savage-friend': 'SAVAGE',
      'motivational-villain': 'VILLAIN',
    };
    return map[id] || '';
  }

  function formatBotHtml(raw) {
    if (!raw) return '';
    const paragraphs = raw.split(/\n\n+/);
    return paragraphs
      .map((p) => {
        let text = escapeHtml(p.trim());
        // Bold: **text**
        text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // Inline code: `code`
        text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
        // Simple line breaks
        text = text.replace(/\n/g, '<br>');
        return `<p>${text}</p>`;
      })
      .join('');
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function scrollToBottom() {
    if (!state.autoscroll) return;
    setTimeout(() => {
      elements.chatViewport.scrollTop = elements.chatViewport.scrollHeight;
    }, 40);
  }

  function showTypingIndicator(show) {
    if (!elements.typingIndicator) return;
    if (show) {
      elements.typingIndicator.classList.remove('hidden');
      scrollToBottom();
    } else {
      elements.typingIndicator.classList.add('hidden');
    }
  }

  /**
   * ROAST ME Feature & Intensity Scoring (Sections 9 & 10)
   */
  async function triggerRoastMe() {
    soundFX.play('roast');
    state.stats.roastMeClicks++;
    state.stats.roasts++;
    if (state.currentMode === 'savage') state.stats.savage++;
    saveStats();

    // Open showcase modal in loading state
    elements.showcaseRoastText.textContent = 'Summoning a roast from the furnace...';
    elements.showcaseModePill.textContent = `${state.currentMode.toUpperCase()} MODE`;
    elements.showcaseTime.textContent = 'Just now';
    elements.roastShowcaseModal.classList.remove('hidden');

    try {
      const res = await fetch(`/api/roast/random?mode=${state.currentMode}`);
      const data = await res.json();

      if (data.success) {
        const roastText = data.roast;
        elements.showcaseRoastText.textContent = roastText;

        // Calculate consistent intensity score (Section 10)
        const intensity = calculateRoastIntensity(roastText, state.currentMode);
        const tier = getIntensityTier(intensity);

        elements.intensityNumber.textContent = `${intensity} / 100`;
        elements.intensityTierBadge.textContent = tier.label;
        elements.intensityTierBadge.style.background = tier.bg;
        elements.intensityTierBadge.style.color = tier.color;
        elements.intensityBar.style.width = `${intensity}%`;

        // Record in history (Section 14)
        state.history.unshift({
          text: roastText,
          mode: state.currentMode,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          intensity,
          tierLabel: tier.label,
        });
        saveHistory();

        // Check achievements (Section 16)
        checkAchievements(intensity);

        if (state.ttsEnabled) {
          speakText(roastText);
        }
      } else {
        elements.showcaseRoastText.textContent = 'The roasting furnace is cooling down. Try again.';
      }
    } catch (e) {
      elements.showcaseRoastText.textContent = 'Failed to summon roast. Backend offline.';
    }
  }

  /**
   * Consistent Roast Intensity Calculation (Section 10)
   * Deterministic calculation based on mode, length, and punch words
   */
  function calculateRoastIntensity(text, mode) {
    let base = 50;
    if (mode === 'friendly') base = 25;
    if (mode === 'normal') base = 55;
    if (mode === 'savage') base = 82;

    // Deterministic hash of string characters
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = (hash + text.charCodeAt(i) * (i + 1)) % 25;
    }

    // Keyword spice modifiers
    const spicyWords = ['infinite', 'loop', 'head', 'cyberpunk', 'pentium', 'attendance', 'backlog', 'crypto', 'oxygen', 'router'];
    const hits = spicyWords.filter((w) => text.toLowerCase().includes(w)).length;

    let score = base + (hash - 10) + hits * 3;
    return Math.max(12, Math.min(98, score));
  }

  function getIntensityTier(score) {
    if (score <= 20) return { label: '😇 Harmless', bg: 'rgba(16, 185, 129, 0.2)', color: '#34d399' };
    if (score <= 50) return { label: '😏 Mild', bg: 'rgba(6, 182, 212, 0.2)', color: '#38bdf8' };
    if (score <= 75) return { label: '🔥 Spicy', bg: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24' };
    if (score <= 90) return { label: '💀 Dangerous', bg: 'rgba(244, 63, 94, 0.2)', color: '#fb7185' };
    return { label: '☢️ Nuclear', bg: 'rgba(225, 29, 72, 0.3)', color: '#fda4af' };
  }

  /**
   * Achievement Checking Engine (Section 16)
   */
  function checkAchievements(lastIntensity) {
    ACHIEVEMENTS_DEF.forEach((ach) => {
      if (!state.achievements[ach.id] && ach.check(state.stats, lastIntensity)) {
        state.achievements[ach.id] = true;
        saveAchievements();
        soundFX.play('achievement');
        showToast(`🏆 UNLOCKED: ${ach.title} — ${ach.desc}`, 'achievement');
      }
    });
  }

  /**
   * Voice Input - Web Speech API (Section 11)
   */
  function setupVoiceInput() {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRec) {
      elements.micBtn.addEventListener('click', () => {
        showToast('Voice input is not supported in this browser.', 'error');
      });
      return;
    }

    const recognition = new SpeechRec();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      state.isListening = true;
      elements.micBtn.classList.add('listening');
      showToast('Listening... Speak your question now.', 'info');
    };

    recognition.onresult = (event) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      elements.userInput.value = transcript;
      elements.userInput.dispatchEvent(new Event('input'));
    };

    recognition.onerror = (event) => {
      state.isListening = false;
      elements.micBtn.classList.remove('listening');
      if (event.error !== 'no-speech') {
        showToast(`Mic error: ${event.error}`, 'error');
      }
    };

    recognition.onend = () => {
      state.isListening = false;
      elements.micBtn.classList.remove('listening');
      elements.userInput.focus();
    };

    elements.micBtn.addEventListener('click', () => {
      if (state.isListening) {
        recognition.stop();
      } else {
        try {
          recognition.start();
        } catch (e) {
          recognition.stop();
        }
      }
    });
  }

  /**
   * Voice Output (Speech Synthesis) (Section 12)
   */
  function speakText(text) {
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const clean = text.replace(/<[^>]*>/g, '').replace(/[\*\#_`]/g, '');
      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.rate = 1.03;
      utterance.pitch = 0.95;

      utterance.onstart = () => { state.isSpeaking = true; };
      utterance.onend = () => { state.isSpeaking = false; };
      utterance.onerror = () => { state.isSpeaking = false; };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('TTS Error:', e);
    }
  }

  function stopSpeech() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      state.isSpeaking = false;
    }
  }

  /**
   * Modals Management
   */
  function setupModals() {
    // 1. ROAST ME Header Button
    elements.headerRoastBtn.addEventListener('click', triggerRoastMe);
    elements.closeRoastModalBtn.addEventListener('click', () => elements.roastShowcaseModal.classList.add('hidden'));
    elements.roastAgainBtn.addEventListener('click', triggerRoastMe);

    elements.copyShowcaseBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(elements.showcaseRoastText.innerText).then(() => {
        showToast('Roast copied to clipboard!', 'success');
      });
    });

    elements.listenShowcaseBtn.addEventListener('click', () => {
      speakText(elements.showcaseRoastText.innerText);
    });

    // 2. Personality Modal (Section 13)
    elements.openPersonalityBtn.addEventListener('click', () => {
      elements.personaCards.forEach((c) => {
        c.classList.toggle('active', c.dataset.persona === state.currentPersonality);
      });
      elements.personalityModal.classList.remove('hidden');
    });

    elements.closePersonalityModalBtn.addEventListener('click', () => elements.personalityModal.classList.add('hidden'));
    elements.donePersonalityBtn.addEventListener('click', () => elements.personalityModal.classList.add('hidden'));

    elements.personaCards.forEach((card) => {
      card.addEventListener('click', () => {
        const pers = card.dataset.persona;
        state.currentPersonality = pers;
        localStorage.setItem('da_roast_personality', pers);

        elements.personaCards.forEach((c) => c.classList.toggle('active', c.dataset.persona === pers));
        soundFX.play('send');
        showToast(`AI Persona set to: ${card.querySelector('.persona-name').innerText}`, 'info');
      });
    });

    // 3. Roast History Modal (Section 14)
    elements.openHistoryBtn.addEventListener('click', () => {
      renderHistoryList();
      elements.historyModal.classList.remove('hidden');
    });

    elements.closeHistoryModalBtn.addEventListener('click', () => elements.historyModal.classList.add('hidden'));
    elements.doneHistoryBtn.addEventListener('click', () => elements.historyModal.classList.add('hidden'));

    elements.clearHistoryBtn.addEventListener('click', () => {
      if (!confirm('Clear all recorded roasts from history?')) return;
      state.history = [];
      saveHistory();
      renderHistoryList();
      showToast('Roast history cleared.', 'info');
    });

    // 4. Achievements Modal (Section 16)
    elements.openAchievementsBtn.addEventListener('click', () => {
      renderAchievementsList();
      elements.achievementsModal.classList.remove('hidden');
    });

    elements.closeAchievementsModalBtn.addEventListener('click', () => elements.achievementsModal.classList.add('hidden'));
    elements.doneAchievementsBtn.addEventListener('click', () => elements.achievementsModal.classList.add('hidden'));

    // 5. Settings Modal (Section 17)
    elements.openSettingsBtn.addEventListener('click', () => {
      checkBackendHealth();
      elements.themeSelect.value = state.theme;
      elements.soundToggle.checked = state.soundEnabled;
      elements.ttsToggle.checked = state.ttsEnabled;
      elements.autoscrollToggle.checked = state.autoscroll;
      elements.settingsModal.classList.remove('hidden');
    });

    elements.closeSettingsBtn.addEventListener('click', () => elements.settingsModal.classList.add('hidden'));
    elements.modalSettingsDoneBtn.addEventListener('click', () => elements.settingsModal.classList.add('hidden'));

    elements.themeSelect.addEventListener('change', (e) => applyTheme(e.target.value));
    elements.soundToggle.addEventListener('change', (e) => {
      state.soundEnabled = e.target.checked;
      localStorage.setItem('da_roast_sound', state.soundEnabled);
    });
    elements.ttsToggle.addEventListener('change', (e) => {
      state.ttsEnabled = e.target.checked;
      localStorage.setItem('da_roast_tts', state.ttsEnabled);
    });
    elements.autoscrollToggle.addEventListener('change', (e) => {
      state.autoscroll = e.target.checked;
      localStorage.setItem('da_roast_autoscroll', state.autoscroll);
    });

    elements.resetStatsBtn.addEventListener('click', () => {
      if (!confirm('Reset all local statistics and achievements?')) return;
      state.stats = { convos: 1, roasts: 0, savage: 0, questions: 0, roastMeClicks: 0 };
      state.achievements = {};
      saveStats();
      saveAchievements();
      showToast('Statistics reset to zero.', 'info');
    });

    // 6. Clear Chat Action
    const executeClearChat = async () => {
      if (!confirm('Clear your conversation history?')) return;
      stopSpeech();

      try {
        await fetch('/api/chat/clear', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ conversationId: state.conversationId }),
        });

        elements.messagesContainer.innerHTML = '';
        state.messagesCount = 0;
        renderWelcomeState();

        // Increment conversation counter
        state.stats.convos++;
        saveStats();

        // Fresh session ID
        state.conversationId = 'convo_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
        localStorage.setItem('da_roast_convo_id', state.conversationId);
        if (elements.diagSessionId) elements.diagSessionId.textContent = state.conversationId;

        showToast('Conversation wiped. Tabula rasa.', 'success');
      } catch (e) {
        showToast('Failed to clear conversation on server', 'error');
      }
    };

    elements.clearChatBtn.addEventListener('click', executeClearChat);
    elements.modalClearConvoBtn.addEventListener('click', () => {
      elements.settingsModal.classList.add('hidden');
      executeClearChat();
    });

    // Close modal on backdrop click
    document.querySelectorAll('.modal-backdrop').forEach((backdrop) => {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) backdrop.classList.add('hidden');
      });
    });
  }

  function renderHistoryList() {
    if (!state.history.length) {
      elements.historyList.innerHTML = '<div class="history-empty">No roasts recorded yet. Click "ROAST ME" to generate your first burn!</div>';
      return;
    }

    elements.historyList.innerHTML = state.history
      .map(
        (item) => `
        <div class="history-item">
          <div class="history-item-header">
            <span class="roast-mode-pill">${item.mode.toUpperCase()}</span>
            <span style="color: var(--text-muted);">${item.time}</span>
            <span style="font-weight: 700; color: var(--text-main); font-family: var(--font-mono);">${item.intensity}/100</span>
          </div>
          <p class="history-text">"${escapeHtml(item.text)}"</p>
        </div>
      `
      )
      .join('');
  }

  function renderAchievementsList() {
    elements.achievementsList.innerHTML = ACHIEVEMENTS_DEF.map((ach) => {
      const isUnlocked = !!state.achievements[ach.id];
      return `
        <div class="achievement-card ${isUnlocked ? 'unlocked' : ''}">
          <div class="achievement-icon">${ach.icon}</div>
          <div class="achievement-details">
            <div class="achievement-name">${ach.title}</div>
            <div class="achievement-desc">${ach.desc}</div>
          </div>
          <div class="achievement-status-badge">${isUnlocked ? 'UNLOCKED' : 'LOCKED'}</div>
        </div>
      `;
    }).join('');
  }

  function updateStatsDisplay() {
    if (elements.statConvos) elements.statConvos.textContent = state.stats.convos || 0;
    if (elements.statRoasts) elements.statRoasts.textContent = state.stats.roasts || 0;
    if (elements.statSavage) elements.statSavage.textContent = state.stats.savage || 0;
    if (elements.statQuestions) elements.statQuestions.textContent = state.stats.questions || 0;
  }

  async function checkBackendHealth() {
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      if (data.status === 'online') {
        if (elements.statusText) {
          elements.statusText.textContent = state.theme === 'funny' ? 'RUNNING ON 2 RED BULLS ⚡' : 'AI ONLINE';
        }
        if (elements.diagStatus) elements.diagStatus.textContent = 'ONLINE (Express v4)';
        if (elements.diagAiEngine) {
          elements.diagAiEngine.textContent = data.ai.openaiConfigured
            ? 'OpenAI Live'
            : 'Resilient College Fallback';
        }
        if (elements.diagDb) {
          elements.diagDb.textContent = `In-Memory (${data.database.activeConversations} active)`;
        }
      }
    } catch (e) {
      if (elements.statusText) elements.statusText.textContent = 'OFFLINE';
      if (elements.diagStatus) elements.diagStatus.textContent = 'UNREACHABLE';
    }
  }

  function setupKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-backdrop').forEach((m) => m.classList.add('hidden'));
        stopSpeech();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        elements.clearChatBtn.click();
      }
    });
  }

  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<span>${message}</span>`;
    elements.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3600);
  }

  // Global exports for inline HTML actions
  window.daRoastApp = {
    copyText(btn) {
      const bubble = btn.closest('.msg-bubble-wrapper').querySelector('.msg-bubble');
      if (!bubble) return;
      navigator.clipboard.writeText(bubble.innerText).then(() => {
        showToast('Message copied!', 'success');
        const span = btn.querySelector('span');
        if (span) {
          span.textContent = 'Copied!';
          setTimeout(() => (span.textContent = 'Copy'), 1500);
        }
      });
    },

    speakText(btn) {
      if (state.isSpeaking) {
        stopSpeech();
        const span = btn.querySelector('span');
        if (span) span.textContent = 'Listen';
        return;
      }

      const bubble = btn.closest('.msg-bubble-wrapper').querySelector('.msg-bubble');
      if (!bubble) return;
      speakText(bubble.innerText);

      const span = btn.querySelector('span');
      if (span) {
        span.textContent = 'Stop';
        setTimeout(() => { if (span) span.textContent = 'Listen'; }, 6000);
      }
      showToast('Reading response aloud...', 'info');
    },

    rateResponse(btn, type) {
      const parent = btn.parentElement;
      parent.querySelectorAll('.thumbs-btn').forEach((b) => b.classList.remove('active-feedback'));
      btn.classList.add('active-feedback');
      showToast(type === 'up' ? 'Thanks! Roast appreciated.' : 'Feedback recorded. Bot will calibrate burns.', 'info');
    },
  };

  // Launch on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
