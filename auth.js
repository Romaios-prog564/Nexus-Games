/* ===== AUTH.JS - Authentication Logic ===== */

const Auth = {
  /** Return all registered users from localStorage */
  getUsers() {
    return JSON.parse(localStorage.getItem('gamehub_users') || '[]');
  },

  /** Save users array to localStorage */
  saveUsers(users) {
    localStorage.setItem('gamehub_users', JSON.stringify(users));
  },

  /** Get currently logged-in user */
  getCurrentUser() {
    return JSON.parse(localStorage.getItem('gamehub_session') || 'null');
  },

  /** Set session (login) */
  setSession(user) {
    localStorage.setItem('gamehub_session', JSON.stringify(user));
  },

  /** Clear session (logout) */
  logout() {
    localStorage.removeItem('gamehub_session');
    const base = window.location.pathname.replace(/\/[^/]*$/, '/');
    window.location.href = base + 'index.html';
  },

  /** Register a new user. Returns { success, error } */
  register(username, password) {
    username = username.trim();
    if (!username || !password) return { success: false, error: 'All fields are required.' };
    if (username.length < 3) return { success: false, error: 'Username must be at least 3 characters.' };
    if (password.length < 4) return { success: false, error: 'Password must be at least 4 characters.' };

    const users = this.getUsers();
    if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
      return { success: false, error: 'Username already taken. Choose another.' };
    }

    const newUser = { username, password, createdAt: Date.now() };
    users.push(newUser);
    this.saveUsers(users);
    return { success: true };
  },

  /** Login a user. Returns { success, error, user } */
  login(username, password) {
    username = username.trim();
    if (!username || !password) return { success: false, error: 'All fields are required.' };

    const users = this.getUsers();
    const user = users.find(
      u => u.username.toLowerCase() === username.toLowerCase() && u.password === password
    );

    if (!user) return { success: false, error: 'Invalid username or password.' };
    this.setSession(user);
    return { success: true, user };
  },

  /** Redirect to dashboard if already logged in */
  redirectIfLoggedIn() {
    if (this.getCurrentUser()) {
      const base = window.location.pathname.replace(/\/[^/]*$/, '/');
      window.location.href = base + 'dashboard.html';
    }
  },

  /** Redirect to login if not logged in */
  requireAuth() {
    if (!this.getCurrentUser()) {
      const base = window.location.pathname.replace(/\/[^/]*$/, '/');
      window.location.href = base + 'login.html';
    }
  }
};

/* ===== HIGH SCORES ===== */
const Scores = {
  getKey(username, game) {
    return `gamehub_score_${username}_${game}`;
  },

  getHighScore(username, game) {
    return parseInt(localStorage.getItem(this.getKey(username, game)) || '0');
  },

  saveHighScore(username, game, score) {
    const current = this.getHighScore(username, game);
    if (score > current) {
      localStorage.setItem(this.getKey(username, game), score);
      return true; // new record!
    }
    return false;
  }
};

/* ===== PARTICLE SYSTEM (shared) ===== */
function initParticles(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });

  const particles = Array.from({ length: 80 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4,
    r: Math.random() * 1.5 + 0.5,
    alpha: Math.random() * 0.5 + 0.1,
    color: Math.random() > 0.5 ? '0, 245, 255' : '139, 0, 255'
  }));

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color}, ${p.alpha})`;
      ctx.fill();
    });
    requestAnimationFrame(animate);
  }
  animate();
}
