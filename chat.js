/* ===== CHAT.JS - Mini AI Assistant (offline, keyword-based) ===== */

const NexusChat = (() => {

  const KB = [
    // ===== GAMES =====
    { keys: ['cube runner','cube game','game 1','game1','lane','dodge obstacles'], reply: '🟦 <b>Cube Runner</b>: Dodge red obstacles flying at you. Use ← → arrow keys or swipe to switch lanes. Grab 💎 golden gems for +25 bonus points! Speed increases over time.' },
    { keys: ['golden target','yellow target','gold target','✨','triple','3x','x3','what gives','what does the yellow','yellow ring'], reply: '✨ <b>Golden Targets</b> in Target Shooter have a spinning sparkle ring and are labeled "x3". They are worth <b>triple points</b> — always prioritize them for a huge score boost!' },
    { keys: ['target shooter','target game','clicking game','game 3','game3','click targets'], reply: '🎯 <b>Target Shooter</b>: Click/tap targets before they disappear. You have 30 seconds. Smaller/farther targets give more points. Watch for ✨ golden targets worth 3x points!' },
    { keys: ['gem','gems','diamond','+25','bonus points','collect gems'], reply: '💎 <b>Gems</b> appear as golden diamonds and give <b>+25 bonus points</b> when collected! They appear in Cube Runner, Snake (every 50 pts), and fall from broken bricks in Brick Breaker.' },
    { keys: ['ball jump','jumping game','game 2','game2','platform','jump','ball','bounce platform'], reply: '🔮 <b>Ball Jump</b>: Hold ← → to move, the ball jumps automatically on platforms. Green bounce platforms give a mega jump! Score = height reached. Don\'t fall off the bottom!' },
    { keys: ['snake','snake game','eating food','game 4','game4','grow','food','wall wrap'], reply: '🐍 <b>Snake</b>: Arrow keys or WASD to move. Eat red food to grow. Don\'t hit yourself! Walls wrap around. Collect 💎 gems every 50 points for +25. Speed increases as you grow.' },
    { keys: ['brick breaker','breaking bricks','brick game','game 5','game5','paddle','ball break','paddle game'], reply: '🧱 <b>Brick Breaker</b>: Move the paddle with your mouse or touch to bounce the ball. Break all bricks to win! Catch falling 💎 gems for +25 pts. Ball angle changes where it hits the paddle.' },
    { keys: ['memory match','memory game','card matching','game 6','game6','cards','pairs','flip','matching pairs'], reply: '🃏 <b>Memory Match</b>: Flip cards to find all 8 matching pairs in 60 seconds. Speed matters — finishing faster gives a time bonus (remaining seconds × 10 added to your score)!' },
    { keys: ['controls','how to play','keyboard','keys','arrows','swipe','mobile','touch','button controls','game controls'], reply: '🎮 <b>Controls</b>:<br>• Cube Runner & Ball Jump: Arrow keys / WASD / swipe<br>• Target Shooter: Click or tap<br>• Snake: Arrow keys / WASD / swipe<br>• Brick Breaker: Mouse or touch<br>• Memory Match: Click / tap cards' },
    { keys: ['high score','highscore','best score','record','leaderboard','score board','my score','view scores'], reply: '⚡ High scores are saved automatically per game. View them on the <b>Dashboard</b> stats section. Clear all scores in ⚙ Settings. A 🏆 banner appears when you set a new record!' },
    { keys: ['settings','sound','particles','language','lang','clear','clear scores','change language','toggle sound'], reply: '⚙ Open <b>Settings</b> (gear icon in the navbar) to: change language (EN/GR/RU), toggle sound effects, toggle particle effects, clear all high scores, or logout.' },
    { keys: ['login','log in','register','sign up','account','password','username','create account','user account'], reply: '🔐 Visit the <b>Login</b> or <b>Register</b> page from the home screen. Usernames must be 3+ characters and passwords 4+. Your scores are saved locally to your account.' },
    { keys: ['tip','tips','advice','strategy','tricks','best way','pro tips','winning strategy'], reply: '💡 <b>Pro tips</b>:<br>• Cube Runner: stay middle lane for more escape options<br>• Target Shooter: always hit ✨ golden targets first (3x points)<br>• Snake: spiral inward to avoid trapping yourself<br>• Memory Match: memorize before clicking fast!' },
    { keys: ['how many games','games available','game list','all games','list of games','total games','game count'], reply: 'There are <b>6 games</b> on NEXUS: 🟦 Cube Runner, 🔮 Ball Jump, 🎯 Target Shooter, 🐍 Snake, 🧱 Brick Breaker, and 🃏 Memory Match. All playable from the Dashboard!' },

    // ===== PERSONAL QUESTIONS - CONVERSATION STARTERS =====
    { keys: ['how are you doing','how are you','how\'re you','how ya doing','how you been','how have you been'], reply: 'I\'m doing wonderfully, thank you for asking! 😊 I\'m functioning perfectly and ready to help you with anything you need about NEXUS GAMES. Whether you need game guides, tips, or have questions about the site, I\'m here for you! How can I assist you today?' },
    { keys: ['how\'s it going','how is it going','what\'s up','what\'s new','what is new','anything new'], reply: 'Things are great! 🚀 I\'m all set and ready to help you explore and master NEXUS GAMES. Whether you\'re a beginner looking for game guides or an experienced player seeking pro tips, I\'m here to support you. What would you like to know?' },
    { keys: ['how you feeling','how are you feeling','you okay','you alright','you doing ok'], reply: 'I\'m doing awesome, thanks for caring! 💙 I\'m energized and ready to assist you with everything NEXUS GAMES related. What can I help you with? Want to learn about a specific game or need some winning strategies?' },

    // ===== GREETINGS =====
    { keys: ['hello','hi','hey','sup','yo','hola','greetings','good morning','good afternoon','good evening','good night'], reply: 'Hello! 👾 I\'m <b>NEXUS AI</b>, your friendly gaming companion! It\'s wonderful to see you here at NEXUS GAMES. I\'m ready to help you with game instructions, control guides, pro tips, scoring information, account settings, or anything else you need. What can I do for you today?' },
    { keys: ['hey there','hey you','hey buddy','greetings friend','welcome'], reply: 'Hey there! 🎮 Welcome to NEXUS GAMES! I\'m NEXUS AI, your dedicated gaming assistant. I\'m thrilled to help you get the most out of our 6 awesome games. Whether you\'re starting out or looking to boost your high scores, just ask me anything!' },

    // ===== RESPONSE TO WELL-BEING =====
    { keys: ['im fine','i\'m fine','im good','i\'m good','im ok','i\'m ok','doing fine','doing good','doing alright','doing well','im great','i\'m great','im awesome','i\'m awesome','im excellent','i\'m excellent'], reply: 'That\'s fantastic! 🎉 I\'m so glad you\'re doing well! Now that you\'re feeling great, what better time to dive into some awesome gaming on NEXUS? Whether you want to play a quick round or master a game, I\'m here to help. Want some tips or guidance on any of our games?' },
    { keys: ['pretty good','not bad','could be better','okay','so so','alright'], reply: 'That\'s great to hear! 😊 I hope NEXUS GAMES can make your day even better! Whether you want to play for fun, challenge yourself, or improve your high scores, I\'m here to support you. Need any help getting started or learning about the games?' },
    { keys: ['not doing well','not good','terrible','awful','horrible','sad','depressed','upset'], reply: 'I\'m sorry to hear you\'re having a rough time. 💙 Sometimes the best remedy is a bit of fun and gaming! NEXUS GAMES has 6 exciting games that might lift your spirits. Want to give it a try? I can guide you through any game or help you find strategies to succeed. Even small wins can brighten your day!' },

    // ===== GOODBYES =====
    { keys: ['goodbye','bye','see you','catch you','take care','farewell','see ya','gotta go','see you later','signing off','bye bye','adios','ciao','until next time','talk soon'], reply: 'Goodbye! 🚀 Thanks for visiting NEXUS GAMES! It was great chatting with you. I hope you crush those high scores and have an amazing gaming session. Remember, I\'m always here if you need help. Good luck, player! 👾' },
    { keys: ['bye now','bye for now','leaving','going','gotta leave','time to go'], reply: 'See you later! 👋 Thanks for stopping by NEXUS GAMES. Keep gaming, keep improving, and I\'ll be here whenever you need assistance. Take care and enjoy those games! 🎮' },

    // ===== THANK YOU VARIATIONS =====
    { keys: ['thank you','thanks','thx','ty','appreciate it','much appreciated','thank you so much','thanks a lot','thanks a bunch','thanks buddy','thanks friend','appreciate the help'], reply: 'You\'re very welcome! 😊 I\'m always happy to help! If you have any more questions about the games, scoring, controls, or anything else about NEXUS, don\'t hesitate to ask. Now go out there and dominate those leaderboards! 🏆' },
    { keys: ['thanks for the help','thanks for helping','thank you for helping','much thanks','big thanks','tons of thanks'], reply: 'Happy to help! 🎉 It\'s my pleasure to assist you with NEXUS GAMES. Feel free to reach out anytime you need guidance, tips, or have questions. Good luck with your gaming and score-hunting! 👾' },
    { keys: ['you\'re welcome','your welcome','anytime','no problem','no problem at all','no worries','happy to help','glad i could help'], reply: 'Absolutely! That\'s what I\'m here for! 😄 If you ever need more assistance with NEXUS GAMES, just ask. Now get out there and show those games who\'s boss! 🚀' },

    // ===== POSITIVE FEEDBACK =====
    { keys: ['that\'s cool','that\'s awesome','cool','awesome','nice','great','amazing','excellent','wonderful','fantastic','incredible'], reply: 'Right?! 🎮 NEXUS GAMES has some seriously fun and challenging games. Each one is designed to be engaging and rewarding. If you want to dive deeper into any game or need strategies to climb the leaderboards, I\'m right here to help!' },
    { keys: ['i like that','that sounds good','that sounds fun','that\'s fun','sounds exciting','i love it'], reply: 'I\'m so glad you think so! 💙 Our games are designed to be both fun and challenging. If you want to learn more about any of them or need pro tips to improve your skills, just let me know. I\'m here to help you succeed!' },
    { keys: ['you\'re helpful','you\'re amazing','you\'re awesome','you\'re great','you\'re the best','best assistant','best ai'], reply: 'Aw, thank you so much! 🥰 That really means a lot to me! My goal is to make your NEXUS GAMES experience as smooth, fun, and rewarding as possible. If there\'s anything else I can do for you, just say the word!' },
    { keys: ['very helpful','really helpful','super helpful','so helpful','helped me','helped me out','you helped'], reply: 'I\'m so glad I could help! 😊 That\'s exactly what I\'m here for. Feel free to come back anytime you need assistance, guidance, or just want to chat about gaming. Good luck with your scores! 🏆' },

    // ===== IDENTITY & PURPOSE =====
    { keys: ['who are you','what are you','what is nexus ai','about you','tell me about yourself','who am i talking to','what\'s your name','introduce yourself'], reply: 'I\'m <b>NEXUS AI</b> 🤖 — your dedicated gaming assistant for NEXUS GAMES! I\'m an intelligent, always-helpful AI designed specifically to support your gaming journey. Here\'s what I can do:<br>• <b>Game Guides:</b> Full explanations of all 6 games<br>• <b>Tips & Strategies:</b> Pro tips to boost your scores<br>• <b>Controls Guide:</b> Keyboard, touch, and mouse controls<br>• <b>Account Help:</b> Login, registration, settings<br>• <b>Score Info:</b> High scores and leaderboards<br><br>Think of me as your personal gaming mentor! What can I help you with?' },
    { keys: ['what can you do','what can you help with','capabilities','what do you do','what\'s your purpose','what\'s your job','what are you able to do','can you help me'], reply: 'Great question! 🎯 Here\'s everything I can help you with:<br><br>🎮 <b>GAME HELP:</b> Learn about Cube Runner, Ball Jump, Target Shooter, Snake, Brick Breaker, or Memory Match<br><br>💡 <b>TIPS & TRICKS:</b> Get pro strategies and winning techniques for any game<br><br>🎮 <b>CONTROLS:</b> Keyboard, touchscreen, mouse, swipe controls — I\'ll guide you<br><br>📊 <b>SCORING:</b> Understand scoring systems, gems, multipliers, and high scores<br><br>⚙️ <b>ACCOUNT:</b> Help with login, registration, settings, and more<br><br>Just ask me anything about NEXUS GAMES and I\'ll do my best to help! What would you like to know?' },
    { keys: ['why are you here','what\'s your role','what\'s my role','why do you exist','purpose','mission'], reply: 'My mission is simple: <b>to help you have the best experience possible with NEXUS GAMES!</b> 🚀 Whether you\'re a casual player looking to understand the rules or a competitive gamer hunting for pro tips, I\'m here to support you every step of the way. I can answer questions about gameplay, controls, scoring, account settings, and pretty much anything else about our games. Let\'s make your gaming journey awesome!' },

    // ===== OKAY / ACKNOWLEDGMENT =====
    { keys: ['okay','ok','alright','got it','understood','i understand','cool','sure','sounds good','sounds like it','perfect'], reply: 'Great! 👍 I\'m glad that\'s clear. If you have any other questions or need further assistance with NEXUS GAMES, just ask anytime. I\'m always here to help!' },
    { keys: ['thanks for explaining','thanks for the info','got the information','understand now','makes sense'], reply: 'Excellent! 😊 I\'m happy that makes sense now. If anything else comes up or you need clarification on another topic, feel free to ask. I\'m here to help!' },

    // ===== WHAT GAMES ARE AVAILABLE =====
    { keys: ['what games','which games','show games','game options','game choices','available games','play games','game selection'], reply: 'We have 6 amazing games on NEXUS GAMES!<br><br>🟦 <b>Cube Runner:</b> Dodge obstacles and collect gems<br>🔮 <b>Ball Jump:</b> Jump on platforms and reach new heights<br>🎯 <b>Target Shooter:</b> Click targets for points in 30 seconds<br>🐍 <b>Snake:</b> Classic snake game with a modern twist<br>🧱 <b>Brick Breaker:</b> Break bricks with your paddle and ball<br>🃏 <b>Memory Match:</b> Find matching card pairs in 60 seconds<br><br>Each has unique gameplay, scoring systems, and leaderboards. Want to learn more about any specific game?' },

    // ===== ACCOUNT & FEATURES =====
    { keys: ['save game','save my game','saved','is game saved','where is my data','my account','user data'], reply: '✅ <b>Great news!</b> Your scores and progress are <b>automatically saved</b> to your account! Once you log in, all your high scores and stats are securely stored. You can view them anytime on the <b>Dashboard</b> stats section. Your data is safe with us! 🔐' },
    { keys: ['reset scores','clear scores','delete scores','start over','fresh start','new account'], reply: '🔄 You can reset your scores anytime! Just go to ⚙️ <b>Settings</b> (gear icon in the top-right) and look for the <b>"Clear All Scores"</b> option. This will give you a fresh start while keeping your account intact. Are you ready for a new challenge?' },

    // ===== ADDITIONAL HELPFUL QUESTIONS =====
    { keys: ['im stuck','need help','confused','don\'t understand','how do i','how can i','can\'t win','losing','keep failing'], reply: '🤝 Don\'t worry, you\'re not alone! Many players find the games challenging at first, but practice makes perfect! Here\'s what I recommend:<br><br>1. <b>Ask me about the specific game</b> you\'re struggling with<br>2. <b>Request pro tips</b> for that game<br>3. <b>Learn the controls</b> thoroughly<br>4. <b>Practice strategically</b> — focus on one technique at a time<br><br>Which game would you like help with? I\'ll give you personalized strategies!' },
    { keys: ['having fun','enjoying','love it','addicted','can\'t stop','keep playing'], reply: 'That\'s awesome! 🎉 I\'m so happy you\'re enjoying NEXUS GAMES! That\'s the spirit! Keep playing, keep improving, and keep chasing those high scores. The more you play, the better you\'ll get. Have an amazing gaming session! 🚀' },
    { keys: ['i am sad','im lonely','i need someone to talk to','bored','nothing to do'], reply: 'Hey, I hear you. 💙 Sometimes the best solution is to do something fun and engaging — like gaming! NEXUS GAMES has 6 exciting games that can help lift your mood and keep you entertained. Challenge yourself, beat your high scores, and have some fun. Plus, I\'m always here to chat and help! Want to give one of the games a try?' },
    { keys: ['bug','problem','not working','glitch','error','issue','crash','broken','something wrong'], reply: '😟 Oh no! I\'m sorry you\'re experiencing an issue. While I can help with questions about gameplay, tips, and features, technical bugs might need direct support. Here\'s what I suggest:<br><br>1. <b>Try refreshing</b> the page<br>2. <b>Clear your browser cache</b><br>3. <b>Check your internet connection</b><br>4. <b>Try a different browser</b><br><br>If the problem persists, please describe what\'s happening in detail and I\'ll do my best to help troubleshoot!' },

    // ===== LOGOUT =====
    { keys: ['logout','log out','exit','leave','sign out','sign off','disconnect'], reply: 'To logout from NEXUS GAMES, follow these steps:<br><br>1. Click the ⚙️ <b>Settings</b> gear icon (top-right of the dashboard)<br>2. Scroll to the bottom of the Settings panel<br>3. Click the <b>Logout</b> button<br><br>Your progress and high scores will be <b>safely saved</b> to your account, so you can pick up right where you left off next time! See you later! 👋' },
  ];

  const FALLBACK = "I appreciate your question! 😊 While I specialize in helping with <b>NEXUS GAMES</b> topics, I want to give you the best answer possible. Ask me about any of our 6 games, gameplay strategies, controls, scoring systems, account help, or site features. I\'m here to help you have an amazing gaming experience! 🎮 What would you like to know?" ;

  function getReply(text) {
    const lower = text.toLowerCase().trim();
    
    // Sort by keyword specificity (longer keys first to match more specific phrases)
    const sortedKB = [...KB].sort((a, b) => {
      const maxLenA = Math.max(...a.keys.map(k => k.length));
      const maxLenB = Math.max(...b.keys.map(k => k.length));
      return maxLenB - maxLenA;
    });

    for (const entry of sortedKB) {
      for (const keyword of entry.keys) {
        // Check for exact word match or phrase match
        if (lower === keyword || 
            lower.includes(' ' + keyword + ' ') || 
            lower.startsWith(keyword + ' ') || 
            lower.endsWith(' ' + keyword) ||
            lower.includes(keyword)) {
          return entry.reply;
        }
      }
    }
    return FALLBACK;
  }

  let isOpen = false;

  function createUI() {
    const container = document.createElement('div');
    container.id = 'nexus-chat';
    container.innerHTML = `
      <button id="chat-toggle" title="Ask NEXUS AI">
        <span>🤖</span>
        <span id="chat-unread" class="chat-unread hidden">1</span>
      </button>
      <div id="chat-panel" class="chat-panel hidden">
        <div id="chat-header">
          <div class="chat-header-info">
            <span class="chat-ai-dot"></span>
            <span class="chat-title">NEXUS AI</span>
            <span class="chat-subtitle">Game Assistant</span>
          </div>
          <button id="chat-close">✕</button>
        </div>
        <div id="chat-messages">
          <div class="chat-msg ai">
            <span>Hey there! 👾 I'm <strong>NEXUS AI</strong>, your friendly gaming assistant. Ask me about our 6 awesome games, controls, pro tips, scoring, account help, or anything else about NEXUS GAMES. I'm here to help you become a champion! 🚀</span>
          </div>
        </div>
        <div id="chat-input-area">
          <input id="chat-input" type="text" placeholder="Ask about games, controls, tips..." maxlength="200" />
          <button id="chat-send">▶</button>
        </div>
      </div>
    `;
    document.body.appendChild(container);

    const style = document.createElement('style');
    style.textContent = `
      #nexus-chat { position: fixed; bottom: 24px; right: 24px; z-index: 9999; font-family: 'Rajdhani', sans-serif; }
      #chat-toggle {
        width: 52px; height: 52px; border-radius: 50%;
        background: linear-gradient(135deg, #00f5ff, #8b00ff);
        border: none; cursor: pointer; font-size: 1.4rem;
        box-shadow: 0 0 20px rgba(0,245,255,0.5);
        transition: transform 0.2s, box-shadow 0.2s;
        position: relative;
      }
      #chat-toggle:hover { transform: scale(1.1); box-shadow: 0 0 30px rgba(0,245,255,0.8); }
      .chat-unread {
        position: absolute; top: -4px; right: -4px;
        background: #ff4466; color: #fff; border-radius: 50%;
        width: 18px; height: 18px; font-size: 0.65rem;
        display: flex; align-items: center; justify-content: center;
        font-family: 'Orbitron', sans-serif;
      }
      .chat-unread.hidden { display: none; }
      .chat-panel {
        position: absolute; bottom: 64px; right: 0;
        width: 320px; height: 420px;
        background: rgba(6, 8, 28, 0.97);
        border: 1px solid rgba(0,245,255,0.3);
        border-radius: 16px;
        display: flex; flex-direction: column;
        box-shadow: 0 0 40px rgba(0,245,255,0.15), 0 0 80px rgba(139,0,255,0.08);
        overflow: hidden;
        animation: chat-pop 0.2s ease;
      }
      .chat-panel.hidden { display: none; }
      @keyframes chat-pop { from { opacity:0; transform: scale(0.95) translateY(10px); } to { opacity:1; transform: scale(1) translateY(0); } }
      #chat-header {
        display: flex; align-items: center; justify-content: space-between;
        padding: 12px 16px;
        background: rgba(0,245,255,0.05);
        border-bottom: 1px solid rgba(0,245,255,0.12);
      }
      .chat-header-info { display: flex; align-items: center; gap: 8px; }
      .chat-ai-dot {
        width: 8px; height: 8px; border-radius: 50%;
        background: #00f5ff; box-shadow: 0 0 8px #00f5ff;
        animation: pulse-dot 2s infinite;
      }
      @keyframes pulse-dot { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
      .chat-title { font-family: 'Orbitron', sans-serif; font-size: 0.75rem; color: #00f5ff; letter-spacing: 2px; }
      .chat-subtitle { font-size: 0.7rem; color: rgba(180,200,255,0.5); }
      #chat-close {
        background: none; border: 1px solid rgba(255,255,255,0.15);
        color: rgba(255,255,255,0.5); width: 26px; height: 26px;
        border-radius: 50%; cursor: pointer; font-size: 0.7rem;
        transition: all 0.2s;
      }
      #chat-close:hover { border-color: #ff4466; color: #ff4466; }
      #chat-messages {
        flex: 1; overflow-y: auto; padding: 12px;
        display: flex; flex-direction: column; gap: 10px;
        scrollbar-width: thin; scrollbar-color: rgba(0,245,255,0.2) transparent;
      }
      .chat-msg {
        max-width: 85%; padding: 9px 13px; border-radius: 12px;
        font-size: 0.85rem; line-height: 1.5; color: #e0e8ff;
      }
      .chat-msg.ai {
        background: rgba(0,245,255,0.07);
        border: 1px solid rgba(0,245,255,0.15);
        align-self: flex-start; border-bottom-left-radius: 4px;
      }
      .chat-msg.user {
        background: rgba(139,0,255,0.2);
        border: 1px solid rgba(139,0,255,0.3);
        align-self: flex-end; border-bottom-right-radius: 4px;
        color: #d0b8ff;
      }
      #chat-input-area {
        display: flex; gap: 8px; padding: 10px 12px;
        border-top: 1px solid rgba(0,245,255,0.1);
        background: rgba(0,0,0,0.3);
      }
      #chat-input {
        flex: 1; background: rgba(255,255,255,0.05);
        border: 1px solid rgba(0,245,255,0.2); border-radius: 8px;
        color: #e0e8ff; padding: 7px 10px; font-size: 0.82rem;
        font-family: 'Rajdhani', sans-serif; outline: none;
        transition: border-color 0.2s;
      }
      #chat-input:focus { border-color: rgba(0,245,255,0.5); }
      #chat-input::placeholder { color: rgba(180,200,255,0.35); }
      #chat-send {
        background: linear-gradient(135deg, #00c5cc, #7700cc);
        border: none; border-radius: 8px; color: #fff;
        width: 36px; cursor: pointer; font-size: 0.85rem;
        transition: opacity 0.2s;
      }
      #chat-send:hover { opacity: 0.85; }
      @media (max-width: 480px) {
        .chat-panel { width: calc(100vw - 48px); right: 0; }
      }
    `;
    document.head.appendChild(style);

    document.getElementById('chat-toggle').addEventListener('click', toggleChat);
    document.getElementById('chat-close').addEventListener('click', closeChat);
    document.getElementById('chat-send').addEventListener('click', sendMessage);
    document.getElementById('chat-input').addEventListener('keydown', e => {
      if (e.key === 'Enter') sendMessage();
    });

    setTimeout(() => {
      if (!isOpen) document.getElementById('chat-unread').classList.remove('hidden');
    }, 3000);
  }

  function toggleChat() { isOpen ? closeChat() : openChat(); }

  function openChat() {
    isOpen = true;
    document.getElementById('chat-panel').classList.remove('hidden');
    document.getElementById('chat-unread').classList.add('hidden');
    document.getElementById('chat-input').focus();
  }

  function closeChat() {
    isOpen = false;
    document.getElementById('chat-panel').classList.add('hidden');
  }

  function appendMessage(html, role) {
    const msgs = document.getElementById('chat-messages');
    const div = document.createElement('div');
    div.className = `chat-msg ${role}`;
    div.innerHTML = `<span>${html}</span>`;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
    return div;
  }

  function sendMessage() {
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    appendMessage(text, 'user');

    const typingEl = appendMessage('<em style="opacity:0.5">thinking...</em>', 'ai');
    setTimeout(() => {
      typingEl.querySelector('span').innerHTML = getReply(text);
      document.getElementById('chat-messages').scrollTop = 99999;
    }, 350);
  }

  return { init: createUI };
})();

document.addEventListener('DOMContentLoaded', () => NexusChat.init());
