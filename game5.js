/* ===== GAME 5: BRICK BREAKER ===== */

Auth.requireAuth();
const user = Auth.getCurrentUser();
const GAME_ID = 'brick-breaker';

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

const W = 480, H = 540;
canvas.width = W; canvas.height = H;

const PADDLE_W = 90, PADDLE_H = 12;
const PADDLE_Y = H - 40;
const BALL_R = 8;
const BRICK_ROWS = 5, BRICK_COLS = 8;
const BRICK_W = 48, BRICK_H = 18, BRICK_PAD = 5;
const BRICK_OFFSET_X = (W - (BRICK_COLS * (BRICK_W + BRICK_PAD) - BRICK_PAD)) / 2;
const BRICK_OFFSET_Y = 50;

const BRICK_COLORS = ['#ff4466', '#ff8800', '#ffdd00', '#00f5ff', '#8b00ff'];
const BRICK_POINTS = [50, 40, 30, 20, 10];

let state = 'idle';
let paddle, ball, bricks, score, hiScore, animId, gems;
hiScore = Scores.getHighScore(user.username, GAME_ID);

// DOM
const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlay-title');
const overlayScoreVal = document.getElementById('overlay-score-val');
const overlayHi = document.getElementById('overlay-hi');
const startBtn = document.getElementById('start-btn');
const scoreDisplay = document.getElementById('score-display');
const hiDisplay = document.getElementById('hi-display');
hiDisplay.textContent = hiScore;

// Mouse / Touch paddle control
let pointerX = W / 2;
canvas.addEventListener('mousemove', e => {
  const rect = canvas.getBoundingClientRect();
  pointerX = (e.clientX - rect.left) * (W / rect.width);
});
canvas.addEventListener('touchmove', e => {
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  pointerX = (e.touches[0].clientX - rect.left) * (W / rect.width);
}, { passive: false });

function makeBricks() {
  const arr = [];
  for (let r = 0; r < BRICK_ROWS; r++) {
    for (let c = 0; c < BRICK_COLS; c++) {
      arr.push({
        x: BRICK_OFFSET_X + c * (BRICK_W + BRICK_PAD),
        y: BRICK_OFFSET_Y + r * (BRICK_H + BRICK_PAD),
        color: BRICK_COLORS[r],
        pts: BRICK_POINTS[r],
        alive: true
      });
    }
  }
  return arr;
}

function startGame() {
  state = 'playing';
  score = 0;
  paddle = { x: W / 2 - PADDLE_W / 2 };
  const angle = (50 + Math.random() * 40) * Math.PI / 180;
  const speed = 5;
  ball = {
    x: W / 2, y: PADDLE_Y - 20,
    vx: Math.cos(angle) * speed * (Math.random() > 0.5 ? 1 : -1),
    vy: -Math.sin(angle) * speed
  };
  bricks = makeBricks();
  gems = [];
  overlay.classList.add('hidden');
  scoreDisplay.textContent = 0;
  loop();
}

function loop() {
  if (state !== 'playing') return;
  animId = requestAnimationFrame(loop);
  update();
  draw();
}

function update() {
  // Paddle follows pointer
  paddle.x = Math.max(0, Math.min(W - PADDLE_W, pointerX - PADDLE_W / 2));

  // Ball movement
  ball.x += ball.vx;
  ball.y += ball.vy;

  // Wall bounces
  if (ball.x - BALL_R < 0) { ball.x = BALL_R; ball.vx = Math.abs(ball.vx); }
  if (ball.x + BALL_R > W) { ball.x = W - BALL_R; ball.vx = -Math.abs(ball.vx); }
  if (ball.y - BALL_R < 0) { ball.y = BALL_R; ball.vy = Math.abs(ball.vy); }

  // Paddle collision
  if (ball.y + BALL_R > PADDLE_Y && ball.y + BALL_R < PADDLE_Y + PADDLE_H &&
      ball.x > paddle.x && ball.x < paddle.x + PADDLE_W && ball.vy > 0) {
    ball.vy = -Math.abs(ball.vy);
    const rel = (ball.x - (paddle.x + PADDLE_W / 2)) / (PADDLE_W / 2);
    ball.vx = rel * 6;
  }

  // Ball fell off bottom
  if (ball.y > H + 20) { gameOver(); return; }

  // Brick collisions
  for (const b of bricks) {
    if (!b.alive) continue;
    if (ball.x + BALL_R > b.x && ball.x - BALL_R < b.x + BRICK_W &&
        ball.y + BALL_R > b.y && ball.y - BALL_R < b.y + BRICK_H) {
      b.alive = false;
      score += b.pts;
      scoreDisplay.textContent = score;
      // Determine which side was hit
      const overlapL = (ball.x + BALL_R) - b.x;
      const overlapR = (b.x + BRICK_W) - (ball.x - BALL_R);
      const overlapT = (ball.y + BALL_R) - b.y;
      const overlapB = (b.y + BRICK_H) - (ball.y - BALL_R);
      const minH = Math.min(overlapL, overlapR);
      const minV = Math.min(overlapT, overlapB);
      if (minH < minV) ball.vx *= -1; else ball.vy *= -1;
      // 20% chance to drop a gem
      if (Math.random() < 0.2) {
        gems.push({ x: b.x + BRICK_W / 2, y: b.y + BRICK_H / 2, vy: 2.5, alive: true });
      }
      break;
    }
  }

  // Gems fall
  gems.forEach(g => {
    if (!g.alive) return;
    g.y += g.vy;
    if (g.y + 8 > PADDLE_Y && g.y - 8 < PADDLE_Y + PADDLE_H &&
        g.x > paddle.x && g.x < paddle.x + PADDLE_W) {
      score += 25;
      scoreDisplay.textContent = score;
      g.alive = false;
    }
    if (g.y > H + 20) g.alive = false;
  });
  gems = gems.filter(g => g.alive);

  // Win!
  if (bricks.every(b => !b.alive)) gameWin();
}

function draw() {
  ctx.fillStyle = '#070718';
  ctx.fillRect(0, 0, W, H);

  // Bricks
  bricks.forEach(b => {
    if (!b.alive) return;
    ctx.shadowColor = b.color;
    ctx.shadowBlur = 12;
    ctx.fillStyle = b.color;
    ctx.beginPath();
    ctx.roundRect(b.x, b.y, BRICK_W, BRICK_H, 3);
    ctx.fill();
    // Shine highlight
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    ctx.fillRect(b.x + 3, b.y + 2, BRICK_W - 6, 4);
  });

  // Gems (diamonds)
  gems.forEach(g => {
    ctx.shadowColor = '#ffdd00';
    ctx.shadowBlur = 18;
    ctx.fillStyle = '#ffdd00';
    ctx.beginPath();
    ctx.moveTo(g.x, g.y - 9);
    ctx.lineTo(g.x + 7, g.y);
    ctx.lineTo(g.x, g.y + 9);
    ctx.lineTo(g.x - 7, g.y);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
  });

  // Paddle
  ctx.shadowColor = '#00f5ff';
  ctx.shadowBlur = 20;
  const padGrad = ctx.createLinearGradient(paddle.x, PADDLE_Y, paddle.x + PADDLE_W, PADDLE_Y);
  padGrad.addColorStop(0, '#0044cc');
  padGrad.addColorStop(1, '#00f5ff');
  ctx.fillStyle = padGrad;
  ctx.beginPath();
  ctx.roundRect(paddle.x, PADDLE_Y, PADDLE_W, PADDLE_H, 5);
  ctx.fill();

  // Ball
  ctx.shadowColor = '#ff00ff';
  ctx.shadowBlur = 22;
  const ballGrad = ctx.createRadialGradient(ball.x - 2, ball.y - 2, 1, ball.x, ball.y, BALL_R);
  ballGrad.addColorStop(0, '#ffffff');
  ballGrad.addColorStop(1, '#ff00ff');
  ctx.fillStyle = ballGrad;
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, BALL_R, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Hint text
  ctx.fillStyle = 'rgba(255,215,0,0.5)';
  ctx.font = '10px Orbitron, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('💎 +25 GEMS', 8, H - 10);
  ctx.textAlign = 'center';
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

function gameWin() {
  state = 'dead';
  cancelAnimationFrame(animId);
  const isNew = Scores.saveHighScore(user.username, GAME_ID, score);
  hiScore = Scores.getHighScore(user.username, GAME_ID);
  hiDisplay.textContent = hiScore;
  overlayTitle.textContent = '🏆 YOU WIN!';
  overlayScoreVal.textContent = score;
  overlayHi.textContent = isNew ? `🏆 NEW RECORD: ${score}` : `BEST: ${hiScore}`;
  startBtn.textContent = 'PLAY AGAIN';
  overlay.classList.remove('hidden');
}

startBtn.addEventListener('click', startGame);
overlayTitle.textContent = 'BRICK BREAKER';
overlayScoreVal.textContent = '';
overlayHi.textContent = `BEST: ${hiScore}`;
startBtn.textContent = 'START GAME';
v
