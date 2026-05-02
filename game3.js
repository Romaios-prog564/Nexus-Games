/* ===== GAME 3: TARGET SHOOTER ===== */

Auth.requireAuth();
const user = Auth.getCurrentUser();
const GAME_ID = 'target-shooter';

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

const W = 700, H = 520;
canvas.width = W; canvas.height = H;

// ---- Config ----
const GAME_DURATION = 30; // seconds
const BASE_SPAWN_RATE = 1.8; // seconds between spawns

// ---- State ----
let state = 'idle';
let score, timeLeft, hiScore, targets, effects, animId, lastSpawn, lastTime, spawnInterval;
hiScore = Scores.getHighScore(user.username, GAME_ID);

// ---- DOM ----
const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlay-title');
const overlayScoreVal = document.getElementById('overlay-score-val');
const overlayHi = document.getElementById('overlay-hi');
const startBtn = document.getElementById('start-btn');
const scoreDisplay = document.getElementById('score-display');
const hiDisplay = document.getElementById('hi-display');
const timerDisplay = document.getElementById('timer-display');
hiDisplay.textContent = hiScore;

// ---- Target class ----
class Target {
  constructor() {
    this.reset();
  }

  reset() {
    // Pseudo-3D: farther = smaller and higher up, closer = bigger and lower
    this.depth = Math.random(); // 0 = far, 1 = close
    const horizW = W * 0.6;
    const horizH = H * 0.35;
    this.cx = W / 2 + (Math.random() - 0.5) * horizW;
    this.cy = H * 0.15 + (1 - this.depth) * horizH + Math.random() * 40;
    this.baseR = 18 + this.depth * 28;
    this.r = this.baseR;
    this.alive = true;
    this.life = 2.5 - this.depth * 1.0; // seconds to live
    this.born = performance.now() / 1000;
    this.wobble = Math.random() * Math.PI * 2;
    this.wobbleSpeed = 1 + Math.random();
    this.points = Math.round(10 + (1 - this.depth) * 20); // far targets worth more
    this.color = `hsl(${Math.random() * 60 + 330}, 100%, 60%)`;
    this.glowColor = this.color;
    // Shrink over time
    this.shrinking = false;
  }
}

// ---- Hit effects ----
class HitEffect {
  constructor(x, y, points, color) {
    this.x = x; this.y = y;
    this.text = `+${points}`;
    this.color = color;
    this.life = 1;
    this.vy = -1.5;
    this.particles = Array.from({ length: 10 }, () => ({
      x, y,
      vx: (Math.random() - 0.5) * 8,
      vy: (Math.random() - 0.5) * 8,
      r: Math.random() * 4 + 2, life: 1
    }));
  }
}

class MissEffect {
  constructor(x, y) {
    this.x = x; this.y = y;
    this.life = 1;
    this.r = 5;
  }
}

// ---- Init ----
function startGame() {
  state = 'playing';
  score = 0; timeLeft = GAME_DURATION;
  targets = []; effects = [];
  lastSpawn = 0; lastTime = performance.now() / 1000;
  spawnInterval = BASE_SPAWN_RATE;
  overlay.classList.add('hidden');
  canvas.style.cursor = 'crosshair';
  loop();
}

function loop() {
  if (state !== 'playing') return;
  animId = requestAnimationFrame(loop);

  const now = performance.now() / 1000;
  const dt = now - lastTime;
  lastTime = now;

  update(dt, now);
  draw(now);
}

function update(dt, now) {
  // Timer
  timeLeft -= dt;
  if (timeLeft <= 0) { timeLeft = 0; draw(now); gameOver(); return; }
  timerDisplay.textContent = Math.ceil(timeLeft);
  scoreDisplay.textContent = score;

  // Difficulty: spawn faster over time
  const elapsed = GAME_DURATION - timeLeft;
  spawnInterval = Math.max(0.5, BASE_SPAWN_RATE - elapsed * 0.04);

  // Spawn targets
  if (now - lastSpawn > spawnInterval) {
    targets.push(new Target());
    lastSpawn = now;
  }

  // Update targets
  targets.forEach(t => {
    t.wobble += t.wobbleSpeed * dt;
    // Shrink near end of life
    const age = now - t.born;
    const progress = age / t.life;
    if (progress > 0.7) {
      t.r = t.baseR * (1 - (progress - 0.7) / 0.3 * 0.5);
    }
    if (age > t.life) t.alive = false;
  });
  targets = targets.filter(t => t.alive);

  // Update effects
  effects.forEach(e => {
    if (e instanceof HitEffect) {
      e.y += e.vy; e.life -= dt * 1.5;
      e.particles.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += 0.2; p.life -= dt * 2; });
    } else if (e instanceof MissEffect) {
      e.r += dt * 60; e.life -= dt * 3;
    }
  });
  effects = effects.filter(e => e.life > 0);
}

function draw(now) {
  // 3D Room background
  ctx.fillStyle = '#080818';
  ctx.fillRect(0, 0, W, H);

  // Floor
  const floorY = H * 0.55;
  const floorGrad = ctx.createLinearGradient(0, floorY, 0, H);
  floorGrad.addColorStop(0, 'rgba(0,245,255,0.04)');
  floorGrad.addColorStop(1, 'rgba(0,245,255,0.02)');
  ctx.fillStyle = floorGrad;
  ctx.fillRect(0, floorY, W, H - floorY);

  // 3D grid floor perspective lines
  ctx.strokeStyle = 'rgba(0,245,255,0.06)';
  ctx.lineWidth = 1;
  const vp = { x: W / 2, y: floorY };
  for (let i = 0; i <= 10; i++) {
    const x = i * W / 10;
    ctx.beginPath();
    ctx.moveTo(x, H);
    ctx.lineTo(vp.x, vp.y);
    ctx.stroke();
  }
  for (let j = 0; j <= 6; j++) {
    const t_val = j / 6;
    const y = floorY + (H - floorY) * t_val;
    const xStart = W / 2 - (W / 2) * t_val;
    const xEnd = W / 2 + (W / 2) * t_val;
    ctx.beginPath(); ctx.moveTo(xStart, y); ctx.lineTo(xEnd, y); ctx.stroke();
  }

  // Back wall grid
  ctx.strokeStyle = 'rgba(139,0,255,0.06)';
  for (let i = 0; i <= 8; i++) {
    const x = i * W / 8;
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, floorY); ctx.stroke();
  }
  for (let j = 0; j <= 5; j++) {
    const y = j * floorY / 5;
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }

  // Horizon glow line
  ctx.shadowColor = '#00f5ff';
  ctx.shadowBlur = 15;
  ctx.strokeStyle = 'rgba(0,245,255,0.3)';
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(0, floorY); ctx.lineTo(W, floorY); ctx.stroke();
  ctx.shadowBlur = 0;

  // Draw targets (sorted by depth, farthest first)
  const sorted = [...targets].sort((a, b) => a.depth - b.depth);
  sorted.forEach(t => {
    const wobbleX = Math.sin(t.wobble) * 3;
    const wobbleY = Math.cos(t.wobble * 0.7) * 2;
    const x = t.cx + wobbleX, y = t.cy + wobbleY;
    const r = t.r;
    const age = (performance.now() / 1000 - t.born) / t.life;

    // Shadow on floor
    if (t.depth > 0.4) {
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      ctx.ellipse(x, floorY - 5, r * 0.6, r * 0.15, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Target rings
    ctx.shadowColor = t.color;
    ctx.shadowBlur = 25;

    // Outer ring
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.strokeStyle = t.color;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Middle ring
    ctx.beginPath();
    ctx.arc(x, y, r * 0.65, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Inner fill
    const grad = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 1, x, y, r * 0.35);
    grad.addColorStop(0, 'rgba(255,255,255,0.9)');
    grad.addColorStop(1, t.color);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, r * 0.35, 0, Math.PI * 2);
    ctx.fill();

    // Crosshair lines
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x - r, y); ctx.lineTo(x + r, y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x, y - r); ctx.lineTo(x, y + r); ctx.stroke();

    // Timer ring (shrinks)
    ctx.beginPath();
    ctx.arc(x, y, r + 5, -Math.PI / 2, -Math.PI / 2 + (1 - age) * Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.shadowBlur = 0;
  });

  // Effects
  effects.forEach(e => {
    if (e instanceof HitEffect) {
      // Particles
      e.particles.forEach(p => {
        if (p.life <= 0) return;
        ctx.globalAlpha = p.life;
        ctx.fillStyle = e.color;
        ctx.shadowColor = e.color;
        ctx.shadowBlur = 8;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      });
      ctx.globalAlpha = e.life;
      ctx.shadowColor = e.color;
      ctx.shadowBlur = 15;
      ctx.fillStyle = '#fff';
      ctx.font = `bold 22px Orbitron, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(e.text, e.x, e.y);
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    } else if (e instanceof MissEffect) {
      ctx.globalAlpha = e.life;
      ctx.strokeStyle = '#ff4466';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2); ctx.stroke();
      ctx.globalAlpha = 1;
    }
  });

  // Timer bar
  const barProgress = timeLeft / GAME_DURATION;
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(0, H - 6, W, 6);
  const tc = barProgress > 0.5 ? '#00f5ff' : barProgress > 0.25 ? '#ffaa00' : '#ff4466';
  ctx.fillStyle = tc;
  ctx.shadowColor = tc;
  ctx.shadowBlur = 10;
  ctx.fillRect(0, H - 6, W * barProgress, 6);
  ctx.shadowBlur = 0;
}

// ---- Click handler ----
canvas.addEventListener('click', e => {
  if (state !== 'playing') return;
  const rect = canvas.getBoundingClientRect();
  const scaleX = W / rect.width, scaleY = H / rect.height;
  const mx = (e.clientX - rect.left) * scaleX;
  const my = (e.clientY - rect.top) * scaleY;

  let hit = false;
  for (let i = targets.length - 1; i >= 0; i--) {
    const t = targets[i];
    const wobbleX = Math.sin(t.wobble) * 3, wobbleY = Math.cos(t.wobble * 0.7) * 2;
    const dx = mx - (t.cx + wobbleX), dy = my - (t.cy + wobbleY);
    if (Math.sqrt(dx * dx + dy * dy) < t.r) {
      // Hit!
      score += t.points;
      effects.push(new HitEffect(t.cx + wobbleX, t.cy + wobbleY, t.points, t.color));
      targets.splice(i, 1);
      hit = true;
      break;
    }
  }

  if (!hit) {
    effects.push(new MissEffect(mx, my));
  }
});

function gameOver() {
  state = 'dead';
  cancelAnimationFrame(animId);
  canvas.style.cursor = 'default';
  const isNew = Scores.saveHighScore(user.username, GAME_ID, score);
  hiScore = Scores.getHighScore(user.username, GAME_ID);
  hiDisplay.textContent = hiScore;
  overlayTitle.textContent = 'TIME\'S UP!';
  overlayScoreVal.textContent = score;
  overlayHi.textContent = isNew ? `🏆 NEW RECORD: ${score}` : `BEST: ${hiScore}`;
  startBtn.textContent = 'PLAY AGAIN';
  overlay.classList.remove('hidden');
}

startBtn.addEventListener('click', startGame);
overlayTitle.textContent = 'TARGET SHOOTER';
overlayScoreVal.textContent = '';
overlayHi.textContent = `BEST: ${hiScore}`;
startBtn.textContent = 'START GAME';
