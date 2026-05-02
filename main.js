/* ===== MAIN.JS - Dashboard Logic ===== */

document.addEventListener('DOMContentLoaded', () => {
  // Require auth
  Auth.requireAuth();

  const user = Auth.getCurrentUser();

  // Display username
  const usernameEl = document.getElementById('username-display');
  if (usernameEl) usernameEl.textContent = user.username;

  // Display high scores on cards + scores section
  const games = ['cube-runner', 'ball-jump', 'target-shooter'];
  games.forEach(game => {
    const score = Scores.getHighScore(user.username, game);
    const el = document.getElementById(`score-${game}`);
    if (el) el.textContent = score;
  });

  // Logout button
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      Auth.logout();
    });
  }

  // Card click ripple effect
  document.querySelectorAll('.game-card').forEach(card => {
    card.addEventListener('click', function(e) {
      e.preventDefault();
      const href = this.getAttribute('href');
      const ripple = document.createElement('span');
      const rect = this.getBoundingClientRect();
      ripple.style.cssText = `
        position:absolute;
        border-radius:50%;
        background:rgba(0,245,255,0.3);
        width:20px;height:20px;
        left:${e.clientX - rect.left - 10}px;
        top:${e.clientY - rect.top - 10}px;
        transform:scale(0);
        animation:ripple-anim 0.5s linear;
        pointer-events:none;
      `;
      this.appendChild(ripple);
      setTimeout(() => { if (href) window.location.href = href; }, 350);
      setTimeout(() => ripple.remove(), 600);
    });
  });

  // Add ripple keyframe dynamically
  const style = document.createElement('style');
  style.textContent = '@keyframes ripple-anim { to { transform:scale(20);opacity:0; } }';
  document.head.appendChild(style);

  // Init particles
  initParticles('particles-canvas');
});
