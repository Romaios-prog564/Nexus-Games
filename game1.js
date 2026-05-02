/* ===== GAME 1: CUBE RUNNER ===== */

Auth.requireAuth();
const user = Auth.getCurrentUser();
const GAME_ID = 'cube-runner';

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// ---- Config ----
const W = 600, H = 500;
canvas.width = W; canvas.height = H;

const LANE_COUNT = 3;
const LANE_W = W / LANE_COUNT;
const PLAYER_SIZE = 36;
const OBS_W = 44, OBS_H = 44;
const GROUND_Y = H - 60;

// ---- State ----
let state = 'idle'; // idle | playing | dead
let score = 0, hiScore = Scores.getHighScore(user.username, GAME_ID);
let playerLane = 1, playerY = GROUND_Y;
let obstacles = [], particles_game = [];
let speed = 4, frameCount = 0;
let lastObstacleFrame = 0;
let moveLeft = false, moveRight = false;
let animId;

// ---- DOM ----
const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlay-title');
const overlayScoreVal = document.getElementById('overlay-score-val');
const overlayHi = document.getElementById('overlay-hi');
const startBtn = document.getElementById('start-btn');
const scoreDisplay = document.getElementById('score-display');
const hiDisplay = document.getElementById('hi-display');

hiDisplay.textContent = hiScore;

function getLaneX(lane) { return lane * LANE_W + LANE_W / 2; }

// ---- Drawing Helpers ----
function drawCube3D(x, y, w, h, color, accent) {
  const depth = 10;
  // Top face
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.moveTo(x - w / 2, y - h / 2);
  ctx.lineTo(x + w / 2, y - h / 2);
  ctx.lineTo(x + w / 2 + depth, y - h / 2 - depth);
  ctx.lineTo(x - w / 2 + depth, y - h / 2 - depth);
  ctx.closePath();
  ctx.fill();
  // Side face
  ctx.fillStyle = `rgba(0,0,0,0.4)`;
  ctx.beginPath();
  ctx.moveTo(x + w / 2, y - h / 2);
  ctx.lineTo(x + w / 2, y + h / 2);
  ctx.lineTo(x + w / 2 + depth, y + h / 2 - depth);
  ctx.lineTo(x + w / 2 + depth, y - h / 2 - depth);
  ctx.closePath();
  ctx.fill();
  // Front face
  ctx.fillStyle = color;
  ctx.fillRect(x - w / 2, y - h / 2, w, h);
  // Glow
  ctx.shadowColor = color;
  ctx.shadowBlur = 20;
  ctx.fillStyle = color;
  ctx.fillRect(x - w / 2, y - h / 2, w, h);
  ctx.shadowBlur = 0;
}

function spawnParticle(x, y, color) {
  for (let i = 0; i < 8; i++) {
    particles_game.push({
      x, y,
      vx: (Math.random() - 0.5) * 6,
      vy: (Math.random() - 0.5) * 6 - 2,
      life: 1,
      color
    });
  }
}

// ---- Input ----
document.addEventListener('keydown', e => {
  if (state !== 'playing') return;
  if (e.key === 'ArrowLeft' || e.key === 'a') movePlayerLeft();
  if (e.key === 'ArrowRight' || e.key === 'd') movePlayerRight();
});

function movePlayerLeft() {
  if (playerLane > 0) { spawnParticle(getLaneX(playerLane), playerY, '#00f5ff'); playerLane--; }
}
function movePlayerRight() {
  if (playerLane < LANE_COUNT - 1) { spawnParticle(getLaneX(playerLane), playerY, '#00f5ff'); playerLane++; }
}

// Touch / buttons
document.getElementById('btn-left')?.addEventListener('click', movePlayerLeft);
document.getElementById('btn-right')?.addEventListener('click', movePlayerRight);

let swipeStartX = 0;
canvas.addEventListener('touchstart', e => { swipeStartX = e.touches[0].clientX; }, { passive: true });
canvas.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - swipeStartX;
  if (dx < -40) movePlayerLeft();
  if (dx > 40) movePlayerRight();
});

// ---- Game Logic ----
function startGame() {
  state = 'playing';
  score = 0; frameCount = 0; speed = 4;
  playerLane = 1; obstacles = []; particles_game = [];
  lastObstacleFrame = 80;
  overlay.classList.add('hidden');
  scoreDisplay.textContent = 0;
  loop();
}

function loop() {
  if (state !== 'playing') return;
  animId = requestAnimationFrame(loop);
  frameCount++;
  speed = 4 + frameCount * 0.003;
  score = Math.floor(frameCount / 6);
  scoreDisplay.textContent = score;

  // Spawn obstacles
  if (frameCount - lastObstacleFrame > Math.max(50, 110 - frameCount * 0.05)) {
    const lane = Math.floor(Math.random() * LANE_COUNT);
    obstacles.push({ lane, y: -OBS_H, x: getLaneX(lane) });
    lastObstacleFrame = frameCount;
  }

  // Move obstacles
  obstacles.forEach(o => { o.y += speed; });
  obstacles = obstacles.filter(o => o.y < H + 60);

  // Collision detection
  const px = getLaneX(playerLane);
  for (const o of obstacles) {
    if (
      Math.abs(o.x - px) < (PLAYER_SIZE + OBS_W) / 2 - 5 &&
      Math.abs(o.y - playerY) < (PLAYER_SIZE + OBS_H) / 2 - 5
    ) {
      gameOver();
      return;
    }
  }

  // Update particles
  particles_game.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += 0.2; p.life -= 0.04; });
  particles_game = particles_game.filter(p => p.life > 0);

  draw();
}

function draw() {
  // Background
  ctx.fillStyle = '#070718';
  ctx.fillRect(0, 0, W, H);

  // Grid floor
  ctx.strokeStyle = 'rgba(0,245,255,0.08)';
  ctx.lineWidth = 1;
  for (let x = 0; x <= W; x += 40) {
    ctx.beginPath(); ctx.moveTo(x, GROUND_Y + 20); ctx.lineTo(x, H); ctx.stroke();
  }
  for (let y = GROUND_Y + 20; y <= H; y += 20) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }

  // Lane dividers
  ctx.strokeStyle = 'rgba(255,255,255,0.04)';
  ctx.lineWidth = 1;
  ctx.setLineDash([10, 15]);
  for (let i = 1; i < LANE_COUNT; i++) {
    ctx.beginPath(); ctx.moveTo(i * LANE_W, 0); ctx.lineTo(i * LANE_W, GROUND_Y); ctx.stroke();
  }
  ctx.setLineDash([]);

  // Ground line
  ctx.shadowColor = '#00f5ff';
  ctx.shadowBlur = 15;
  ctx.strokeStyle = '#00f5ff';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, GROUND_Y + 18); ctx.lineTo(W, GROUND_Y + 18); ctx.stroke();
  ctx.shadowBlur = 0;

  // Obstacles
  obstacles.forEach(o => {
    drawCube3D(o.x, o.y, OBS_W, OBS_H, '#ff004c', '#ff3366');
  });

  // Player
  drawCube3D(getLaneX(playerLane), playerY, PLAYER_SIZE, PLAYER_SIZE, '#00f5ff', '#66ffff');

  // Particles
  particles_game.forEach(p => {
    ctx.globalAlpha = p.life;
    ctx.fillStyle = p.color;
    ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI * 2); ctx.fill();
  });
  ctx.globalAlpha = 1;

  // Speed indicator
  const barW = Math.min(200, (speed - 4) / 6 * 200);
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(10, 10, 210, 8);
  ctx.fillStyle = `hsl(${120 - barW * 0.6}, 100%, 50%)`;
  ctx.fillRect(10, 10, barW, 8);
  ctx.fillStyle = 'rgba(180,200,255,0.4)';
  ctx.font = '10px Orbitron';
  ctx.fillText('SPEED', 220, 18);
}

function gameOver() {
  state = 'dead';
  cancelAnimationFrame(animId);
  const isNew = Scores.saveHighScore(user.username, GAME_ID, score);
  hiScore = Scores.getHighScore(user.username, GAME_ID);
  hiDisplay.textContent = hiScore;

  // Death explosion
  spawnParticle(getLaneX(playerLane), playerY, '#00f5ff');
  spawnParticle(getLaneX(playerLane), playerY, '#ff00ff');
  draw();

  overlayTitle.textContent = 'GAME OVER';
  overlayScoreVal.textContent = score;
  overlayHi.textContent = isNew ? `🏆 NEW RECORD: ${score}` : `BEST: ${hiScore}`;
  startBtn.textContent = 'PLAY AGAIN';
  overlay.classList.remove('hidden');
}

// ---- Start ----
startBtn.addEventListener('click', startGame);

// Init overlay
overlayTitle.textContent = 'CUBE RUNNER';
overlayScoreVal.textContent = '';
overlayHi.textContent = `BEST: ${hiScore}`;
startBtn.textContent = 'START GAME';
