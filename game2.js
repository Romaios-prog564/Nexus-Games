/* ===== GAME 2: BALL JUMP ===== */

Auth.requireAuth();
const user = Auth.getCurrentUser();
const GAME_ID = 'ball-jump';

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

const W = 400, H = 600;
canvas.width = W; canvas.height = H;

// ---- Config ----
const GRAVITY = 0.35;
const JUMP_FORCE = -10;
const PLATFORM_W = 80, PLATFORM_H = 12;
const BALL_R = 14;

// ---- State ----
let state = 'idle';
let ball, platforms, cameraY, score, hiScore, particles_game, animId;
hiScore = Scores.getHighScore(user.username, GAME_ID);

// ---- DOM ----
const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlay-title');
const overlayScoreVal = document.getElementById('overlay-score-val');
const overlayHi = document.getElementById('overlay-hi');
const startBtn = document.getElementById('start-btn');
const scoreDisplay = document.getElementById('score-display');
const hiDisplay = document.getElementById('hi-display');
hiDisplay.textContent = hiScore;

// ---- Input ----
let leftHeld = false, rightHeld = false;
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft' || e.key === 'a') leftHeld = true;
  if (e.key === 'ArrowRight' || e.key === 'd') rightHeld = true;
});
document.addEventListener('keyup', e => {
  if (e.key === 'ArrowLeft' || e.key === 'a') leftHeld = false;
  if (e.key === 'ArrowRight' || e.key === 'd') rightHeld = false;
});

document.getElementById('btn-left')?.addEventListener('mousedown', () => leftHeld = true);
document.getElementById('btn-left')?.addEventListener('mouseup', () => leftHeld = false);
document.getElementById('btn-right')?.addEventListener('mousedown', () => rightHeld = true);
document.getElementById('btn-right')?.addEventListener('mouseup', () => rightHeld = false);
document.getElementById('btn-left')?.addEventListener('touchstart', () => leftHeld = true, { passive: true });
document.getElementById('btn-left')?.addEventListener('touchend', () => leftHeld = false);
document.getElementById('btn-right')?.addEventListener('touchstart', () => rightHeld = true, { passive: true });
document.getElementById('btn-right')?.addEventListener('touchend', () => rightHeld = false);

// ---- Helpers ----
function makePlatform(x, y) {
  const type = Math.random() > 0.85 ? 'bounce' : 'normal';
  return { x, y, w: PLATFORM_W, h: PLATFORM_H, type };
}

function spawnParticle(x, y, color) {
  for (let i = 0; i < 6; i++) {
    particles_game.push({
      x, y,
      vx: (Math.random() - 0.5) * 5,
      vy: Math.random() * -4 - 1,
      life: 1, color, r: Math.random() * 4 + 2
    });
  }
}

// ---- Init ----
function startGame() {
  state = 'playing';
  score = 0;
  cameraY = 0;
  particles_game = [];
  ball = { x: W / 2, y: H - 100, vx: 0, vy: -8, r: BALL_R };

  // Generate initial platforms
  platforms = [{ x: W / 2 - PLATFORM_W / 2, y: H - 60, w: PLATFORM_W, h: PLATFORM_H, type: 'normal' }];
  for (let i = 1; i <= 20; i++) {
    platforms.push(makePlatform(
      Math.random() * (W - PLATFORM_W),
      H - 60 - i * 60
    ));
  }

  overlay.classList.add('hidden');
  loop();
}

function loop() {
  if (state !== 'playing') return;
  animId = requestAnimationFrame(loop);
  update();
  draw();
}

function update() {
  // Move ball
  if (leftHeld) ball.vx = Math.max(ball.vx - 0.6, -5);
  else if (rightHeld) ball.vx = Math.min(ball.vx + 0.6, 5);
  else ball.vx *= 0.88;

  ball.vy += GRAVITY;
  ball.x += ball.vx;
  ball.y += ball.vy;

  // Wrap horizontally
  if (ball.x < -BALL_R) ball.x = W + BALL_R;
  if (ball.x > W + BALL_R) ball.x = -BALL_R;

  // Camera follow (only move up)
  const targetCameraY = ball.y - H * 0.4;
  if (targetCameraY < cameraY) cameraY = targetCameraY;

  // Score = height traveled
  score = Math.max(score, Math.floor(-cameraY / 10));
  scoreDisplay.textContent = score;

  // Platform collision (only when falling)
  if (ball.vy > 0) {
    for (const p of platforms) {
      const screenY = p.y - cameraY;
      if (
        ball.x + BALL_R > p.x &&
        ball.x - BALL_R < p.x + p.w &&
        ball.y + BALL_R > p.y &&
        ball.y + BALL_R < p.y + p.h + ball.vy + 2
      ) {
        ball.y = p.y - BALL_R;
        ball.vy = p.type === 'bounce' ? JUMP_FORCE * 1.5 : JUMP_FORCE;
        spawnParticle(ball.x, ball.y + BALL_R, p.type === 'bounce' ? '#00ff88' : '#00f5ff');
      }
    }
  }

  // Spawn new platforms above visible area
  let topY = Math.min(...platforms.map(p => p.y));
  while (topY - cameraY > -H) {
    const newY = topY - (50 + Math.random() * 40);
    platforms.push(makePlatform(Math.random() * (W - PLATFORM_W), newY));
    topY = newY;
  }

  // Remove platforms far below
  platforms = platforms.filter(p => p.y - cameraY < H + 200);

  // Update particles
  particles_game.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += 0.15; p.life -= 0.04; });
  particles_game = particles_game.filter(p => p.life > 0);

  // Game over: fell below screen
  if (ball.y - cameraY > H + 50) gameOver();
}

function draw() {
  // Background with gradient
  const grd = ctx.createLinearGradient(0, 0, 0, H);
  grd.addColorStop(0, '#070030');
  grd.addColorStop(1, '#050510');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, W, H);

  // Distant stars
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  for (let i = 0; i < 40; i++) {
    const sx = (i * 137 + 50) % W;
    const sy = ((i * 97 + 30) % H);
    ctx.beginPath();
    ctx.arc(sx, sy, 0.7, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.save();
  ctx.translate(0, -cameraY);

  // Draw platforms
  platforms.forEach(p => {
    const isOnScreen = p.y - cameraY > -20 && p.y - cameraY < H + 20;
    if (!isOnScreen) return;

    const color = p.type === 'bounce' ? '#00ff88' : '#00f5ff';
    ctx.shadowColor = color;
    ctx.shadowBlur = 12;

    // Platform gradient
    const grad = ctx.createLinearGradient(p.x, p.y, p.x + p.w, p.y + p.h);
    grad.addColorStop(0, p.type === 'bounce' ? '#00ff88' : '#0055ff');
    grad.addColorStop(1, p.type === 'bounce' ? '#00aa55' : '#00f5ff');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(p.x, p.y, p.w, p.h, 4);
    ctx.fill();

    // Shine
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.fillRect(p.x + 4, p.y + 2, p.w - 8, 3);
    ctx.shadowBlur = 0;
  });

  // Particles
  particles_game.forEach(p => {
    ctx.globalAlpha = p.life;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 8;
    ctx.fillStyle = p.color;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
  });
  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;

  // Draw ball
  const ballGrad = ctx.createRadialGradient(ball.x - 4, ball.y - 4, 2, ball.x, ball.y, BALL_R);
  ballGrad.addColorStop(0, '#ffffff');
  ballGrad.addColorStop(0.3, '#ff00ff');
  ballGrad.addColorStop(1, '#8b00ff');
  ctx.shadowColor = '#ff00ff';
  ctx.shadowBlur = 20;
  ctx.fillStyle = ballGrad;
  ctx.beginPath(); ctx.arc(ball.x, ball.y, BALL_R, 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur = 0;

  ctx.restore();

  // Height bar on right
  const maxH = 5000;
  const progress = Math.min(score / 500, 1);
  ctx.fillStyle = 'rgba(255,255,255,0.05)';
  ctx.fillRect(W - 10, 10, 6, H - 20);
  ctx.fillStyle = '#ff00ff';
  ctx.fillRect(W - 10, H - 10 - (H - 20) * progress, 6, (H - 20) * progress);
}

function gameOver() {
  state = 'dead';
  cancelAnimationFrame(animId);
  const isNew = Scores.saveHighScore(user.username, GAME_ID, score);
  hiScore = Scores.getHighScore(user.username, GAME_ID);
  hiDisplay.textContent = hiScore;
  overlayTitle.textContent = 'GAME OVER';
  overlayScoreVal.textContent = score;
  overlayHi.textContent = isNew ? `🏆 NEW RECORD: ${score}` : `BEST: ${hiScore}`;
  startBtn.textContent = 'PLAY AGAIN';
  overlay.classList.remove('hidden');
}

startBtn.addEventListener('click', startGame);
overlayTitle.textContent = 'BALL JUMP';
overlayScoreVal.textContent = '';
overlayHi.textContent = `BEST: ${hiScore}`;
startBtn.textContent = 'START GAME';
