/* ===== GAME 7: FLAPPY ORB ===== */

Auth.requireAuth();
const user = Auth.getCurrentUser();
const GAME_ID = 'flappy-orb';

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

const W = 400, H = 600;
canvas.width = W; canvas.height = H;

// ---- Config ----
const GRAVITY = 0.38;
const FLAP_FORCE = -7.5;
const PIPE_W = 52;
const PIPE_GAP = 185;
const PIPE_SPEED_BASE = 2.4;
const ORB_R = 14;
const ORB_X = 90;

// ---- State ----
let state = 'idle';
let orb, pipes, score, hiScore, particles_game, animId, frameCount, displayProgress = 0;
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
function doFlap() {
  if (state === 'idle' || state === 'dead') return;
  orb.vy = FLAP_FORCE;
  spawnParticle(orb.x, orb.y, '#cc88ff');
}
document.addEventListener('keydown', e => {
  if (e.code === 'Space' || e.key === 'ArrowUp') { e.preventDefault(); doFlap(); }
});
canvas.addEventListener('click', doFlap);
canvas.addEventListener('touchstart', e => { e.preventDefault(); doFlap(); }, { passive: false });

// ---- Helpers ----
function spawnParticle(x, y, color) {
  for (let i = 0; i < 5; i++) {
    particles_game.push({
      x, y,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4 - 1,
      life: 1, color, r: Math.random() * 3 + 1.5
    });
  }
}

function getPipeSpeed() {
  return PIPE_SPEED_BASE + Math.min(score * 0.004, 3.5);
}

function makePipe(x) {
  const topH = 80 + Math.random() * (H - PIPE_GAP - 160);
  return { x, topH, scored: false };
}

// ---- Game ----
function startGame() {
  state = 'playing';
  score = 0;
  frameCount = 0;
  displayProgress = 0;
  particles_game = [];
  orb = { x: ORB_X, y: H / 2, vy: 0 };
  pipes = [makePipe(W + 80), makePipe(W + 80 + 240), makePipe(W + 80 + 480)];
  overlay.classList.add('hidden');
  scoreDisplay.textContent = 0;
  loop();
}

function loop() {
  if (state !== 'playing') return;
  animId = requestAnimationFrame(loop);
  frameCount++;
  update();
  draw();
}

function update() {
  // Orb physics
  orb.vy += GRAVITY;
  orb.y += orb.vy;

  // Hit ceiling or floor
  if (orb.y - ORB_R < 0 || orb.y + ORB_R > H) { gameOver(); return; }

  const speed = getPipeSpeed();

  // Move pipes
  for (const p of pipes) {
    p.x -= speed;

    // Score when orb passes pipe center
    if (!p.scored && p.x + PIPE_W < ORB_X) {
      p.scored = true;
      score++;
      scoreDisplay.textContent = score;
    }

    // Collision with pipe
    if (
      ORB_X + ORB_R > p.x &&
      ORB_X - ORB_R < p.x + PIPE_W
    ) {
      if (orb.y - ORB_R < p.topH || orb.y + ORB_R > p.topH + PIPE_GAP) {
        spawnParticle(orb.x, orb.y, '#ff44aa');
        gameOver();
        return;
      }
    }
  }

  // Remove off-screen pipes, add new
  pipes = pipes.filter(p => p.x + PIPE_W > -10);
  const lastPipe = pipes[pipes.length - 1];
  if (!lastPipe || lastPipe.x < W - 100) {
    pipes.push(makePipe(W + 60));
  }

  // Particles
  particles_game.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += 0.12; p.life -= 0.045; });
  particles_game = particles_game.filter(p => p.life > 0);
}

function getBarColor(score) {
  if (score < 5)   return { bar: '#00f5ff', glow: '#00f5ff', blur: 8 };
  if (score < 10)  return { bar: '#00ff88', glow: '#00ff88', blur: 8 };
  if (score < 20)  return { bar: '#ffdd00', glow: '#ffdd00', blur: 8 };
  if (score < 30)  return { bar: '#ff8800', glow: '#ff8800', blur: 10 };
  if (score < 50)  return { bar: '#ff0033', glow: '#ff0033', blur: 12 };
  return { bar: '#8b00ff', glow: '#aa44ff', blur: 22 };
}

function draw() {
  // Background
  const grd = ctx.createLinearGradient(0, 0, 0, H);
  grd.addColorStop(0, '#04001a');
  grd.addColorStop(1, '#050510');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, W, H);

  // Stars
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  for (let i = 0; i < 35; i++) {
    ctx.beginPath();
    ctx.arc((i * 173 + 20) % W, (i * 113 + 15) % H, 0.7, 0, Math.PI * 2);
    ctx.fill();
  }

  // Pipes
  const pipeColor = '#8b00ff';
  const pipeLit = '#aa44ff';
  pipes.forEach(p => {
    // Top pipe
    ctx.shadowColor = pipeColor;
    ctx.shadowBlur = 14;
    const grad1 = ctx.createLinearGradient(p.x, 0, p.x + PIPE_W, 0);
    grad1.addColorStop(0, '#3a0070');
    grad1.addColorStop(0.5, '#6a00cc');
    grad1.addColorStop(1, '#3a0070');
    ctx.fillStyle = grad1;
    ctx.fillRect(p.x, 0, PIPE_W, p.topH);
    // Top cap
    ctx.fillStyle = pipeLit;
    ctx.fillRect(p.x - 4, p.topH - 14, PIPE_W + 8, 14);

    // Bottom pipe
    const botY = p.topH + PIPE_GAP;
    const grad2 = ctx.createLinearGradient(p.x, 0, p.x + PIPE_W, 0);
    grad2.addColorStop(0, '#3a0070');
    grad2.addColorStop(0.5, '#6a00cc');
    grad2.addColorStop(1, '#3a0070');
    ctx.fillStyle = grad2;
    ctx.fillRect(p.x, botY, PIPE_W, H - botY);
    // Bottom cap
    ctx.fillStyle = pipeLit;
    ctx.fillRect(p.x - 4, botY, PIPE_W + 8, 14);
    ctx.shadowBlur = 0;

    // Glow line in gap center
    ctx.strokeStyle = 'rgba(200,100,255,0.08)';
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 10]);
    ctx.beginPath();
    ctx.moveTo(p.x + PIPE_W / 2, p.topH);
    ctx.lineTo(p.x + PIPE_W / 2, p.topH + PIPE_GAP);
    ctx.stroke();
    ctx.setLineDash([]);
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

  // Orb
  const orbGrad = ctx.createRadialGradient(orb.x - 4, orb.y - 4, 2, orb.x, orb.y, ORB_R);
  orbGrad.addColorStop(0, '#ffffff');
  orbGrad.addColorStop(0.3, '#ff44ff');
  orbGrad.addColorStop(1, '#6600cc');
  ctx.shadowColor = '#cc44ff';
  ctx.shadowBlur = 24;
  ctx.fillStyle = orbGrad;
  ctx.beginPath(); ctx.arc(orb.x, orb.y, ORB_R, 0, Math.PI * 2); ctx.fill();

  // Eye — fixed position
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.beginPath();
  ctx.ellipse(orb.x + 5, orb.y - 4, 5, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#220044';
  ctx.beginPath();
  ctx.arc(orb.x + 6, orb.y - 4, 2.5, 0, Math.PI * 2);
  ctx.fill();
  // Mouth — small arc fixed on orb
  ctx.strokeStyle = 'rgba(255,255,255,0.85)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(orb.x + 5, orb.y + 3, 4, 0.1, Math.PI - 0.1);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Distance bar — cyclic within each color band, stops full at 50+
  const cappedScore = Math.min(score, 50);
  let targetProgress;
  if (score >= 50) {
    targetProgress = 1;
  } else if (score < 5)  { targetProgress = score / 5; }
  else if (score < 10)   { targetProgress = (score - 5) / 5; }
  else if (score < 20)   { targetProgress = (score - 10) / 10; }
  else if (score < 30)   { targetProgress = (score - 20) / 10; }
  else                   { targetProgress = (score - 30) / 20; }
  // Detect band change (reset display instantly, then lerp up)
  if (targetProgress < (displayProgress - 0.05)) displayProgress = 0;
  displayProgress += (targetProgress - displayProgress) * 0.04;
  const progress = displayProgress;
  const { bar: barColor, glow: glowColor, blur: glowBlur } = getBarColor(cappedScore);
  ctx.fillStyle = 'rgba(255,255,255,0.05)';
  ctx.fillRect(W - 10, 10, 6, H - 20);
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = glowBlur;
  ctx.fillStyle = barColor;
  ctx.fillRect(W - 10, H - 10 - (H - 20) * progress, 6, (H - 20) * progress);
  ctx.shadowBlur = 0;
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
overlayTitle.textContent = 'FLAPPY ORB';
overlayScoreVal.textContent = '';
overlayHi.textContent = `BEST: ${hiScore}`;
startBtn.textContent = 'START GAME';
