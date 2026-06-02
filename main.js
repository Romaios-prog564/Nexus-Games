/* ===== MAIN.JS - Dashboard Logic ===== */

document.addEventListener('DOMContentLoaded', () => {
  Auth.requireAuth();
  const user = Auth.getCurrentUser();

  // Display username
  const usernameEl = document.getElementById('username-display');
  if (usernameEl) usernameEl.textContent = user.username;

  // Display high scores on cards
  const games = ['cube-runner', 'ball-jump', 'target-shooter', 'snake', 'brick-breaker', 'memory-match', 'flappy-orb'];
  games.forEach(game => {
    const score = Scores.getHighScore(user.username, game);
    const el = document.getElementById(`score-${game}`);
    if (el) el.textContent = score;
  });

  // Apply translations
  I18n.apply();

  // Active language button
  function updateLangButtons() {
    const lang = I18n.getCurrentLang();
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });
  }
  updateLangButtons();

  // Language buttons
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      I18n.setLang(btn.dataset.lang);
      I18n.apply();
      updateLangButtons();
    });
  });

  // Sound toggle
  const soundToggle = document.getElementById('sound-toggle');
  let soundOn = localStorage.getItem('gamehub_sound') !== 'off';
  function updateSoundBtn() {
    soundToggle.textContent = soundOn ? I18n.t('on') : I18n.t('off');
    soundToggle.classList.toggle('off', !soundOn);
  }
  updateSoundBtn();
  soundToggle?.addEventListener('click', () => {
    soundOn = !soundOn;
    localStorage.setItem('gamehub_sound', soundOn ? 'on' : 'off');
    updateSoundBtn();
  });

  // Particles toggle
  const particlesToggle = document.getElementById('particles-toggle');
  let particlesOn = localStorage.getItem('gamehub_particles') !== 'off';
  function updateParticlesBtn() {
    particlesToggle.textContent = particlesOn ? I18n.t('on') : I18n.t('off');
    particlesToggle.classList.toggle('off', !particlesOn);
  }
  updateParticlesBtn();
  particlesToggle?.addEventListener('click', () => {
    particlesOn = !particlesOn;
    localStorage.setItem('gamehub_particles', particlesOn ? 'on' : 'off');
    updateParticlesBtn();
    // Reload to apply particle change
    location.reload();
  });

  // Clear high scores
  document.getElementById('clear-scores-btn')?.addEventListener('click', () => {
    if (!confirm('Clear ALL high scores? This cannot be undone.')) return;
    games.forEach(g => localStorage.removeItem(`gamehub_score_${user.username}_${g}`));
    games.forEach(g => {
      const el = document.getElementById(`score-${g}`);
      if (el) el.textContent = 0;
      const statEl = document.getElementById(`stat-${g}`);
      if (statEl) statEl.textContent = 0;
    });
    const totalEl = document.getElementById('stat-total');
    if (totalEl) totalEl.textContent = 0;
    document.getElementById('settings-overlay').classList.remove('open');
  });

  // ---- Star Rating ----
  const savedRating = localStorage.getItem('gamehub_rating');
  const starBtns = document.querySelectorAll('.star-btn');
  const ratingThanks = document.getElementById('rating-thanks');

  const ratingMessages = ['😐 Thanks for your feedback!', '😕 Sorry to hear that! We\'ll improve!', '😊 Glad you like it!', '😄 Awesome, thank you!', '🌟 You\'re amazing, thank you so much!'];

  function highlightStars(n) {
    starBtns.forEach(s => {
      const v = parseInt(s.dataset.star);
      s.style.color = v <= n ? '#ffdd00' : 'rgba(180,200,255,0.25)';
      s.style.textShadow = v <= n ? '0 0 10px rgba(255,220,0,0.8)' : 'none';
    });
  }

  if (savedRating) {
    highlightStars(parseInt(savedRating));
    ratingThanks.style.display = 'block';
    ratingThanks.innerHTML = `<span style="color:rgba(0,245,255,0.7);font-size:0.75rem;font-family:'Rajdhani',sans-serif;">You rated ${savedRating}/5 ★ — thank you!</span>`;
    starBtns.forEach(s => s.style.pointerEvents = 'none');
  }

  starBtns.forEach(btn => {
    btn.addEventListener('mouseenter', () => { if (!savedRating) highlightStars(parseInt(btn.dataset.star)); });
    btn.addEventListener('mouseleave', () => { if (!savedRating) highlightStars(0); });
    btn.addEventListener('click', () => {
      if (localStorage.getItem('gamehub_rating')) return;
      const val = parseInt(btn.dataset.star);
      localStorage.setItem('gamehub_rating', val);
      highlightStars(val);
      // Burst animation
      starBtns.forEach((s, i) => {
        s.style.pointerEvents = 'none';
        setTimeout(() => {
          s.style.transform = 'scale(1.6) rotate(20deg)';
          s.style.transition = 'transform 0.2s ease';
          setTimeout(() => { s.style.transform = 'scale(1) rotate(0deg)'; }, 200);
        }, i * 80);
      });
      setTimeout(() => {
        ratingThanks.style.display = 'block';
        ratingThanks.innerHTML = `<span style="color:rgba(0,245,255,0.7);font-size:0.75rem;font-family:'Rajdhani',sans-serif;">${ratingMessages[val-1]}</span>`;
      }, 500);
    });
  });

  // Settings logout
  document.getElementById('settings-logout')?.addEventListener('click', () => Auth.logout());

  // Settings modal open/close
  const settingsOverlay = document.getElementById('settings-overlay');
  document.getElementById('settings-btn')?.addEventListener('click', () => settingsOverlay.classList.add('open'));
  document.getElementById('settings-close')?.addEventListener('click', () => settingsOverlay.classList.remove('open'));
  settingsOverlay?.addEventListener('click', e => {
    if (e.target === settingsOverlay) settingsOverlay.classList.remove('open');
  });

  // Card click ripple
  document.querySelectorAll('.game-card').forEach(card => {
    card.addEventListener('click', function(e) {
      e.preventDefault();
      const href = this.getAttribute('href');
      const ripple = document.createElement('span');
      const rect = this.getBoundingClientRect();
      ripple.style.cssText = `
        position:absolute;border-radius:50%;background:rgba(0,245,255,0.3);
        width:20px;height:20px;
        left:${e.clientX - rect.left - 10}px;top:${e.clientY - rect.top - 10}px;
        transform:scale(0);animation:ripple-anim 0.5s linear;pointer-events:none;
      `;
      this.appendChild(ripple);
      setTimeout(() => { if (href) window.location.href = href; }, 350);
      setTimeout(() => ripple.remove(), 600);
    });
  });

  // Ripple keyframe
  const style = document.createElement('style');
  style.textContent = '@keyframes ripple-anim { to { transform:scale(20);opacity:0; } }';
  document.head.appendChild(style);

  // Init particles (respects setting)
  if (localStorage.getItem('gamehub_particles') !== 'off') {
    initParticles('particles-canvas');
  }
});
