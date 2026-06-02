/* ===== NEXUS CHAT AI ASSISTANT ===== */

const NexusChat = (() => {

  const knowledge = [
    // Greetings
    { keys: ['hello','hi','hey','sup','yo','greetings','good morning','good evening','good afternoon'],
      reply: "Hey! 👋 Welcome to Nexus Games! I'm your AI assistant. Ask me about any game, controls, tips, or your account!" },
    { keys: ['how are you','how r u','you ok'],
      reply: "I'm running at 100%! Ready to help you dominate the leaderboards. 😎 What do you need?" },
    { keys: ['what are you','who are you','what is nexus','what is this'],
      reply: "I'm the Nexus Games AI — your in-hub assistant. Nexus has 7 arcade games: Cube Runner, Ball Jump, Target Shooter, Snake, Brick Breaker, Memory Match, and Flappy Orb. Ask me anything!" },

    // Game 1 — Cube Runner
    { keys: ['cube runner','cube game','game 1','game1','game 01'],
      reply: "🟦 **Cube Runner** — Dodge obstacles in a 3-lane neon runner! Use ← → arrow keys or swipe to switch lanes. The game speeds up over time. Collect 💎 gems that fall from broken cubes for big bonus points. How far can you go?" },
    { keys: ['cube runner controls','cube controls','how to play cube'],
      reply: "Cube Runner controls: ← / → arrow keys to switch lanes. On mobile, swipe left/right. Gems appear randomly — don't miss them!" },
    { keys: ['cube runner tips','cube tips','cube runner strategy'],
      reply: "Cube Runner tips: Stay in the middle lane — it gives you more reaction time. Always grab 💎 gems when it's safe. At high speeds, anticipate obstacles early!" },

    // Game 2 — Ball Jump
    { keys: ['ball jump','ball game','game 2','game2','game 02'],
      reply: "🔮 **Ball Jump** — Jump from platform to platform, climbing as high as possible! Use ← → or A/D to move left/right. Star ⭐ platforms give you a mega bounce. Watch for the 🚀 **jetpack** — grab it for a 5-second powered flight! The distance bar on the right changes color as you go higher and stops at 3500." },
    { keys: ['jetpack','jet pack','ball jump jetpack'],
      reply: "🚀 The Jetpack in Ball Jump spawns every ~1,250–1,750 points of height. Grab it to fly freely for 5 seconds! A fuel bar shows how much boost is left. It's a rare, high-value power-up!" },
    { keys: ['ball jump controls','how to play ball jump','ball jump tips'],
      reply: "Ball Jump: Use ← → arrow keys or A/D to move. The ball auto-jumps on platforms. Green platforms give a super bounce! Grab the jetpack when it appears — it's your ticket to huge height gains." },
    { keys: ['ball jump bar','distance bar ball','height bar'],
      reply: "The side bar in Ball Jump tracks your height progress. It cycles through colors every 500 units — cyan → green → yellow → orange → red → purple — and locks at the top once you hit 3500!" },

    // Game 3 — Target Shooter
    { keys: ['target shooter','target game','game 3','game3','game 03'],
      reply: "🎯 **Target Shooter** — Click/tap targets in a pseudo-3D space before they disappear. Normal targets give points; rare ✨ **golden targets** give triple points! The timer ticks down, but hitting targets resets it slightly. Aim for combos!" },
    { keys: ['target shooter tips','how to play target','target controls'],
      reply: "Target Shooter: Click targets fast! Golden ones (rare, sparkly) are worth 3x. Targets shrink and fade — hit them early for max points. Keep your combo alive!" },

    // Game 4 — Snake
    { keys: ['snake','snake game','game 4','game4','game 04'],
      reply: "🐍 **Snake** — Classic snake in a neon arena! Use arrow keys or WASD to steer. Eat red 🔴 food to grow and score +10. Collect the golden 💎 gem for +25 points AND a blazing **5-second speed boost** — the snake turns gold and the arena flashes! The gem expires after 8 seconds if not collected." },
    { keys: ['snake gem','snake boost','snake speed','golden gem snake'],
      reply: "In Snake, the 💎 golden gem spawns every 50 points. Collecting it gives +25 points and a **5-second speed boost** — the snake speeds up 2x and turns gold! A yellow countdown bar shows at the top. Plan your path before grabbing it!" },
    { keys: ['snake controls','how to play snake','snake tips'],
      reply: "Snake controls: Arrow keys or WASD on desktop. Swipe on mobile. The snake wraps around walls — use that to your advantage! Time the speed boost carefully so you don't crash." },

    // Game 5 — Brick Breaker
    { keys: ['brick breaker','brick game','game 5','game5','game 05'],
      reply: "🧱 **Brick Breaker** — Move your paddle to bounce the ball and break all bricks! Catch falling 💎 gems for bonus points. Clear the whole board to win. The ball gets faster as you progress!" },
    { keys: ['brick breaker tips','how to play brick','brick controls'],
      reply: "Brick Breaker: Move mouse or touch to control the paddle. Don't let the ball fall! Aim for the top rows first. 💎 gems fall from broken bricks — catch them for extra points." },

    // Game 6 — Memory Match
    { keys: ['memory match','memory game','memory','game 6','game6','game 06'],
      reply: "🃏 **Memory Match** — Flip cards to find all matching pairs before time runs out! The faster you finish, the higher your score bonus. Remember where you saw each card — your memory is your weapon!" },
    { keys: ['memory match tips','how to play memory','memory tips'],
      reply: "Memory Match tips: Scan the first few flips carefully. Try to remember positions rather than just what you see. Speed matters — finishing quickly gives a big score multiplier!" },

    // Game 7 — Flappy Orb
    { keys: ['flappy orb','flappy','flappy bird','game 7','game7','game 07'],
      reply: "🔵 **Flappy Orb** — Tap, click, or press Space to flap through neon purple gates! Don't hit the pipes or the ceiling/floor. The game gets faster as your distance grows. The color-shifting bar on the right tracks your progress and locks at 3500. How far can you fly?" },
    { keys: ['flappy orb tips','how to play flappy','flappy controls'],
      reply: "Flappy Orb: Tap/click/Space to flap. Small taps = small lift — rhythm is key! Gates speed up over time. The side bar cycles cyan → green → yellow → orange → red → purple and stops at 3500." },

    // Scores & Leaderboard
    { keys: ['high score','highscore','best score','my score','scores'],
      reply: "Your high scores are saved locally on this device. Check the ⚡ YOUR STATS section at the bottom of the dashboard, or click 🏆 for the leaderboard to see top scores per game!" },
    { keys: ['leaderboard','top scores','ranking','who is best'],
      reply: "Click the 🏆 trophy button in the top-right to open the leaderboard! It shows top 10 scores per game. Your name lights up in the list if you're there." },
    { keys: ['clear scores','reset scores','delete scores'],
      reply: "You can clear all your high scores in ⚙ Settings → CLEAR ALL. Warning: this can't be undone!" },

    // Account
    { keys: ['logout','log out','sign out'],
      reply: "To log out, click ⚙ Settings (top-right) and scroll to the bottom for the LOGOUT button." },
    { keys: ['register','sign up','create account'],
      reply: "You can create an account from the login page. Click 'Don't have an account?' to register!" },
    { keys: ['username','change name','profile'],
      reply: "Your username is set when you register. It's shown in the top-right of the dashboard. Currently it can't be changed after registration." },

    // Settings
    { keys: ['settings','setting','sound','music','particles','effects','language'],
      reply: "Click ⚙ in the top-right to open Settings! You can change the language (EN/GR/RU), toggle sound effects, toggle particle effects, rate the hub, or clear your scores." },
    { keys: ['language','greek','russian','english','translate'],
      reply: "Nexus Games supports 🇬🇧 English, 🇬🇷 Greek, and 🇷🇺 Russian! Switch language in ⚙ Settings." },

    // Fun / misc
    { keys: ['which game','best game','recommend','favorite','favourite'],
      reply: "My recommendation? Try 🔮 Ball Jump for a chill climbing challenge, or 🔵 Flappy Orb if you want a tough reflex test. 🐍 Snake is great for quick sessions. All 7 games are worth a try!" },
    { keys: ['how many games','number of games','games list','all games'],
      reply: "There are **7 games** in Nexus: Cube Runner, Ball Jump, Target Shooter, Snake, Brick Breaker, Memory Match, and Flappy Orb. More coming soon!" },
    { keys: ['bug','broken','not working','issue','problem','glitch','error'],
      reply: "Sorry to hear that! Try refreshing the page. If the problem persists, clearing your high scores in Settings can sometimes help. You can also try a different browser." },
    { keys: ['mobile','phone','touch','tablet'],
      reply: "Nexus Games is mobile-friendly! All games support touch controls. Cube Runner: swipe. Ball Jump: tap left/right buttons. Snake: swipe. Flappy Orb: tap anywhere." },
    { keys: ['tip','tips','advice','help','guide','how to'],
      reply: "General tips: 1️⃣ Play all 7 games to find your favourite. 2️⃣ Always grab collectibles (💎 gems, 🚀 jetpacks). 3️⃣ Check the leaderboard 🏆 to know what scores to beat. 4️⃣ Practice makes perfect!" },
    { keys: ['thanks','thank you','ty','thx','cheers'],
      reply: "Anytime! Good luck out there and happy gaming! 🎮" },
    { keys: ['bye','goodbye','cya','see you','later'],
      reply: "See you on the leaderboard! 🏆 Good luck!" },
  ];

  function getReply(input) {
    const lower = input.toLowerCase().trim();
    for (const entry of knowledge) {
      if (entry.keys.some(k => lower.includes(k))) return entry.reply;
    }
    return "Hmm, I'm not sure about that! Try asking about a specific game (like 'how to play Snake'), controls, tips, or your scores. 🎮";
  }

  function formatReply(text) {
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
  }

  function init() {
    // Inject CSS
    const style = document.createElement('style');
    style.textContent = `
      #nexus-chat-toggle {
        position: fixed; bottom: 24px; right: 24px; z-index: 9000;
        width: 52px; height: 52px; border-radius: 50%;
        background: linear-gradient(135deg, #6600cc, #00f5ff);
        border: none; cursor: pointer; font-size: 1.4rem;
        box-shadow: 0 0 20px rgba(0,245,255,0.4), 0 0 40px rgba(102,0,204,0.3);
        transition: transform 0.2s, box-shadow 0.2s;
        display: flex; align-items: center; justify-content: center;
      }
      #nexus-chat-toggle:hover {
        transform: scale(1.12);
        box-shadow: 0 0 30px rgba(0,245,255,0.6), 0 0 60px rgba(102,0,204,0.4);
      }
      #nexus-chat-badge {
        position: absolute; top: -4px; right: -4px;
        width: 18px; height: 18px; border-radius: 50%;
        background: #ff4466; color: #fff;
        font-size: 0.65rem; font-family: 'Orbitron', sans-serif;
        display: flex; align-items: center; justify-content: center;
        border: 2px solid #050510;
      }
      #nexus-chat-panel {
        position: fixed; bottom: 88px; right: 24px; z-index: 8999;
        width: 320px; max-height: 440px;
        background: rgba(6,8,28,0.97);
        border: 1px solid rgba(0,245,255,0.25);
        border-radius: 18px;
        display: flex; flex-direction: column;
        box-shadow: 0 0 40px rgba(0,245,255,0.1), 0 0 80px rgba(102,0,204,0.1);
        overflow: hidden;
        transform: scale(0.85) translateY(20px);
        opacity: 0;
        pointer-events: none;
        transition: transform 0.25s cubic-bezier(0.175,0.885,0.32,1.275), opacity 0.25s ease;
      }
      #nexus-chat-panel.open {
        transform: scale(1) translateY(0);
        opacity: 1;
        pointer-events: all;
      }
      #nexus-chat-header {
        padding: 0.9rem 1rem;
        background: linear-gradient(90deg, rgba(102,0,204,0.4), rgba(0,245,255,0.15));
        border-bottom: 1px solid rgba(0,245,255,0.12);
        display: flex; align-items: center; gap: 0.6rem;
      }
      #nexus-chat-header .chat-dot { width:8px;height:8px;border-radius:50%;background:#00f5ff;box-shadow:0 0 6px #00f5ff;animation:pulse-dot 1.5s ease infinite; }
      @keyframes pulse-dot { 0%,100%{opacity:1}50%{opacity:0.3} }
      #nexus-chat-header span {
        font-family: 'Orbitron', sans-serif; font-size: 0.65rem;
        color: #00f5ff; letter-spacing: 2px; flex:1;
      }
      #nexus-chat-close {
        background: none; border: none; color: rgba(255,255,255,0.4);
        cursor: pointer; font-size: 1rem; transition: color 0.2s;
        line-height:1;
      }
      #nexus-chat-close:hover { color: #ff4466; }
      #nexus-chat-messages {
        flex: 1; overflow-y: auto; padding: 0.8rem;
        display: flex; flex-direction: column; gap: 0.6rem;
        scrollbar-width: thin; scrollbar-color: rgba(0,245,255,0.2) transparent;
      }
      .chat-msg {
        max-width: 88%; padding: 0.55rem 0.8rem;
        border-radius: 12px; font-family: 'Rajdhani', sans-serif;
        font-size: 0.88rem; line-height: 1.4;
        animation: msg-in 0.25s ease;
      }
      @keyframes msg-in { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
      .chat-msg.user {
        align-self: flex-end;
        background: linear-gradient(135deg, rgba(102,0,204,0.5), rgba(0,245,255,0.2));
        border: 1px solid rgba(0,245,255,0.2);
        color: #e0f0ff;
      }
      .chat-msg.ai {
        align-self: flex-start;
        background: rgba(255,255,255,0.05);
        border: 1px solid rgba(255,255,255,0.08);
        color: #c8d8f0;
      }
      /* Typing indicator */
      .chat-msg.typing {
        display: flex; align-items: center; gap: 4px;
        padding: 0.6rem 0.8rem;
      }
      .typing-dot {
        width: 7px; height: 7px; border-radius: 50%;
        background: #00f5ff;
        animation: typing-bounce 1.2s ease infinite;
        box-shadow: 0 0 6px rgba(0,245,255,0.6);
      }
      .typing-dot:nth-child(2) { animation-delay: 0.2s; background: #aa44ff; box-shadow: 0 0 6px rgba(170,68,255,0.6); }
      .typing-dot:nth-child(3) { animation-delay: 0.4s; background: #ff44aa; box-shadow: 0 0 6px rgba(255,68,170,0.6); }
      @keyframes typing-bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-7px)} }
      /* Fade-in text reveal */
      .chat-msg.ai.reveal { animation: text-reveal 0.4s ease; }
      @keyframes text-reveal { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:translateY(0)} }
      #nexus-chat-input-row {
        display: flex; gap: 0.5rem;
        padding: 0.7rem; border-top: 1px solid rgba(0,245,255,0.1);
        background: rgba(0,0,0,0.3);
      }
      #nexus-chat-input {
        flex: 1; background: rgba(255,255,255,0.05);
        border: 1px solid rgba(0,245,255,0.2); border-radius: 10px;
        color: #e0f0ff; font-family: 'Rajdhani', sans-serif;
        font-size: 0.88rem; padding: 0.4rem 0.7rem;
        outline: none; transition: border-color 0.2s;
      }
      #nexus-chat-input:focus { border-color: rgba(0,245,255,0.5); }
      #nexus-chat-input::placeholder { color: rgba(180,200,255,0.3); }
      #nexus-chat-send {
        background: linear-gradient(135deg, #6600cc, #00f5ff);
        border: none; border-radius: 10px;
        color: #fff; font-family: 'Orbitron', sans-serif;
        font-size: 0.7rem; padding: 0.4rem 0.7rem;
        cursor: pointer; transition: opacity 0.2s, transform 0.1s;
        letter-spacing: 1px;
      }
      #nexus-chat-send:hover { opacity: 0.85; }
      #nexus-chat-send:active { transform: scale(0.95); }
    `;
    document.head.appendChild(style);

    // Inject HTML
    const toggleBtn = document.createElement('button');
    toggleBtn.id = 'nexus-chat-toggle';
    toggleBtn.innerHTML = '🤖<span id="nexus-chat-badge">1</span>';
    document.body.appendChild(toggleBtn);

    const panel = document.createElement('div');
    panel.id = 'nexus-chat-panel';
    panel.innerHTML = `
      <div id="nexus-chat-header">
        <div class="chat-dot"></div>
        <span>NEXUS AI ASSISTANT</span>
        <button id="nexus-chat-close">✕</button>
      </div>
      <div id="nexus-chat-messages"></div>
      <div id="nexus-chat-input-row">
        <input id="nexus-chat-input" type="text" placeholder="Ask me anything..." maxlength="200" />
        <button id="nexus-chat-send">SEND</button>
      </div>
    `;
    document.body.appendChild(panel);

    const messagesEl = document.getElementById('nexus-chat-messages');
    const inputEl = document.getElementById('nexus-chat-input');
    const badge = document.getElementById('nexus-chat-badge');
    let panelOpen = false;

    function addMsg(text, type, reveal = false) {
      const div = document.createElement('div');
      div.className = `chat-msg ${type}${reveal ? ' reveal' : ''}`;
      div.innerHTML = formatReply(text);
      messagesEl.appendChild(div);
      messagesEl.scrollTop = messagesEl.scrollHeight;
      return div;
    }

    function addTypingIndicator() {
      const div = document.createElement('div');
      div.className = 'chat-msg ai typing';
      div.innerHTML = `<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>`;
      messagesEl.appendChild(div);
      messagesEl.scrollTop = messagesEl.scrollHeight;
      return div;
    }

    function sendMessage() {
      const text = inputEl.value.trim();
      if (!text) return;
      inputEl.value = '';
      badge.style.display = 'none';

      addMsg(text, 'user');

      // Show typing indicator for 2.5–3 seconds, then reveal answer
      const typingEl = addTypingIndicator();
      const delay = 2500 + Math.random() * 600;

      setTimeout(() => {
        typingEl.remove();
        const reply = getReply(text);
        addMsg(reply, 'ai', true);
      }, delay);
    }

    toggleBtn.addEventListener('click', () => {
      panelOpen = !panelOpen;
      panel.classList.toggle('open', panelOpen);
      badge.style.display = 'none';
      if (panelOpen) {
        if (messagesEl.children.length === 0) {
          // Welcome message instantly (no delay for the first greeting)
          addMsg("Hey! 👋 I'm the Nexus AI. Ask me about any game, controls, tips, or your scores!", 'ai');
        }
        setTimeout(() => inputEl.focus(), 300);
      }
    });

    document.getElementById('nexus-chat-close').addEventListener('click', () => {
      panelOpen = false;
      panel.classList.remove('open');
    });

    document.getElementById('nexus-chat-send').addEventListener('click', sendMessage);
    inputEl.addEventListener('keydown', e => { if (e.key === 'Enter') sendMessage(); });
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', () => NexusChat.init());
