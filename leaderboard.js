/* ===== LEADERBOARD.JS - Top 10 per game from all local users ===== */

const GAME_NAMES = {
  'cube-runner':     '🟦 Cube Runner',
  'ball-jump':       '🔮 Ball Jump',
  'target-shooter':  '🎯 Target Shooter',
  'snake':           '🐍 Snake',
  'brick-breaker':   '🧱 Brick Breaker',
  'memory-match':    '🃏 Memory Match'
};

function getLeaderboard(game) {
  const users = JSON.parse(localStorage.getItem('gamehub_users') || '[]');
  return users
    .map(u => ({
      username: u.username,
      score: parseInt(localStorage.getItem(`gamehub_score_${u.username}_${game}`) || '0')
    }))
    .filter(e => e.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
}

function renderLeaderboard(game, currentUser) {
  const entries = getLeaderboard(game);
  if (entries.length === 0) {
    return '<div class="lb-empty">No scores yet. Be the first to play! 🎮</div>';
  }
  const medals = ['🥇', '🥈', '🥉'];
  return entries.map((e, i) => {
    const rank = medals[i] || `<span class="lb-num">#${i + 1}</span>`;
    const isMe = e.username === currentUser;
    return `<div class="lb-row${isMe ? ' lb-me' : ''}" style="--delay:${i * 0.06}s">
      <span class="lb-rank">${rank}</span>
      <span class="lb-name">${e.username}${isMe ? ' <span class="lb-you">YOU</span>' : ''}</span>
      <span class="lb-score">${e.score.toLocaleString()}</span>
    </div>`;
  }).join('');
}

document.addEventListener('DOMContentLoaded', () => {
  const currentUser = Auth.getCurrentUser()?.username || '';
  const games = Object.keys(GAME_NAMES);
  let activeGame = games[0];

  // ---- Build modal ----
  const modal = document.createElement('div');
  modal.id = 'lb-overlay';
  modal.className = 'settings-overlay';
  modal.innerHTML = `
    <div class="lb-card">
      <button class="settings-close" id="lb-close">✕</button>
      <div class="settings-title">🏆 LEADERBOARD</div>
      <div class="lb-tabs" id="lb-tabs"></div>
      <div id="lb-content"></div>
    </div>
  `;
  document.body.appendChild(modal);

  function renderTabs() {
    document.getElementById('lb-tabs').innerHTML = games.map(g =>
      `<button class="lb-tab${g === activeGame ? ' active' : ''}" data-game="${g}">${GAME_NAMES[g]}</button>`
    ).join('');
    document.querySelectorAll('.lb-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        activeGame = btn.dataset.game;
        renderTabs();
        document.getElementById('lb-content').innerHTML = renderLeaderboard(activeGame, currentUser);
      });
    });
  }

  function openLeaderboard() {
    activeGame = games[0];
    renderTabs();
    document.getElementById('lb-content').innerHTML = renderLeaderboard(activeGame, currentUser);
    modal.classList.add('open');
  }

  document.getElementById('lb-btn')?.addEventListener('click', openLeaderboard);
  document.getElementById('lb-close').addEventListener('click', () => modal.classList.remove('open'));
  modal.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('open'); });

  // ---- Styles ----
  const style = document.createElement('style');
  style.textContent = `
    .lb-card {
      background: rgba(8,12,35,0.98);
      border: 1px solid rgba(0,245,255,0.3);
      border-radius: 20px;
      padding: 2rem;
      width: 90%;
      max-width: 460px;
      position: relative;
      box-shadow: 0 0 60px rgba(0,245,255,0.1), 0 0 120px rgba(139,0,255,0.08);
      animation: card-in 0.3s ease;
      max-height: 80vh;
      overflow-y: auto;
    }
    .lb-tabs {
      display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 1rem;
    }
    .lb-tab {
      padding: 0.3rem 0.65rem; border-radius: 6px; font-size: 0.72rem;
      background: rgba(0,0,0,0.4); border: 1px solid rgba(0,245,255,0.15);
      color: rgba(180,200,255,0.55); cursor: pointer;
      font-family: 'Rajdhani', sans-serif; transition: all 0.2s;
    }
    .lb-tab:hover { border-color: rgba(0,245,255,0.5); color: rgba(0,245,255,0.8); }
    .lb-tab.active { border-color: #00f5ff; color: #00f5ff; box-shadow: 0 0 10px rgba(0,245,255,0.2); }
    .lb-row {
      display: flex; align-items: center; gap: 12px;
      padding: 0.6rem 0.9rem; border-radius: 10px; margin-bottom: 6px;
      background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06);
      animation: lb-slide calc(var(--delay, 0s) + 0.15s) ease both;
    }
    @keyframes lb-slide { from { opacity:0; transform: translateX(-16px); } to { opacity:1; transform: translateX(0); } }
    .lb-row:nth-child(1) { border-color: rgba(255,215,0,0.3); background: rgba(255,215,0,0.05); }
    .lb-row:nth-child(2) { border-color: rgba(192,192,192,0.25); background: rgba(192,192,192,0.03); }
    .lb-row:nth-child(3) { border-color: rgba(205,127,50,0.25); background: rgba(205,127,50,0.03); }
    .lb-me { border-color: rgba(0,245,255,0.45) !important; background: rgba(0,245,255,0.07) !important; }
    .lb-rank { min-width: 30px; text-align: center; font-size: 1.15rem; }
    .lb-num { color: rgba(180,200,255,0.45); font-family: 'Orbitron',sans-serif; font-size: 0.65rem; }
    .lb-name { flex: 1; color: #e0e8ff; font-family: 'Rajdhani',sans-serif; font-size: 0.9rem; }
    .lb-you { background: #00f5ff; color: #000; border-radius: 4px; padding: 1px 5px; font-size: 0.6rem; font-family: 'Orbitron',sans-serif; vertical-align: middle; margin-left: 4px; }
    .lb-score { font-family: 'Orbitron',sans-serif; font-size: 0.8rem; color: #00f5ff; letter-spacing: 1px; }
    .lb-empty { text-align:center; color: rgba(180,200,255,0.4); padding: 2rem; font-family: 'Rajdhani',sans-serif; font-size: 0.9rem; }
  `;
  document.head.appendChild(style);
});
