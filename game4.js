/* ===== GAME 4: SNAKE ===== */

Auth.requireAuth();
const user = Auth.getCurrentUser();
const GAME_ID = 'snake';

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

const CELL = 20;
const COLS = 20, ROWS = 20;
const W = COLS * CELL, H = ROWS * CELL;
canvas.width = W; canvas.height = H;

let state = 'idle';
let snake, dir, nextDir, food, gem, score, hiScore, animId, lastMove;
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

// Keyboard input
document.addEventListener('keydown', e => {
  const map = { ArrowUp: 'u', ArrowDown: 'd', ArrowLeft: 'l', ArrowRight: 'r', w: 'u', s: 'd', a: 'l', d: 'r' };
  if (map[e.key]) {
    const opposite = { u: 'd', d: 'u', l: 'r', r: 'l' };
    if (opposite[map[e.key]] !== dir) nextDir = map[e.key];
    e.preventDefault();
  }
  if ((state === 'idle' || state === 'dead') && (e.key === ' ' || e.key === 'Enter')) startGame();
});

// Touch swipe
let touchStart = null;
canvas.addEventListener('touchstart', e => {
  touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
}, { passive: true });
canvas.addEventListener('touchend', e => {
  if (!touchStart) return;
  const dx = e.changedTouches[0].clientX - touchStart.x;
  const dy = e.changedTouches[0].clientY - touchStart.y;
  const opposite = { u: 'd', d: 'u', l: 'r', r: 'l' };
  let nd = null;
  if (Math.abs(dx) > Math.abs(dy)) nd = dx > 0 ? 'r' : 'l';
  else nd = dy > 0 ? 'd' : 'u';
  if (nd && opposite[nd] !== dir) nextDir = nd;
  touchStart = null;
});

function randCell(exclude = []) {
  let pos;
  do {
    pos = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
  } while (exclude.some(e => e.x === pos.x && e.y === pos.y));
  return pos;
}

function startGame() {
  state = 'playing';
  score = 0; lastMove = 0;
  snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
  dir = 'r'; nextDir = 'r';
  food = randCell(snake);
  gem = null;
  overlay.classList.add('hidden');
  scoreDisplay.textContent = 0;
  requestAnimationFrame(loop);
}

function getSpeed() { return Math.max(80, 200 - score * 1.5); }

let gemTimer = 0;

function loop(ts) {
  if (state !== 'playing') return;
  animId = requestAnimationFrame(loop);

  if (ts - lastMove > getSpeed()) {
    lastMove = ts;
    dir = nextDir;
    move();
  }
  draw();
}

function move() {
  const head = { ...snake[0] };
  if (dir === 'r') head.x++;
  if (dir === 'l') head.x--;
  if (dir === 'u') head.y--;
  if (dir === 'd') head.y++;

  // Wrap around walls
  head.x = (head.x + COLS) % COLS;
  head.y = (head.y + ROWS) % ROWS;

  // Self collision
  if (snake.some(s => s.x === head.x && s.y === head.y)) { gameOver(); return; }

  snake.unshift(head);

  // Eat food
  if (head.x === food.x && head.y === food.y) {
    score += 10;
    scoreDisplay.textContent = score;
    food = randCell(snake);
    // Spawn gem every 50 points
    if (score % 50 === 0 && !gem) {
      gem = randCell([...snake, food]);
      gem.born = Date.now();
    }
  } else {
    snake.pop();
  }

  // Collect gem
  if (gem && head.x === gem.x && head.y === gem.y) {
    score += 25;
    scoreDisplay.textContent = score;
    gem = null;
  }

  // Gem expires after 8 seconds
  if (gem && Date.now() - gem.born > 8000) gem = null;
}

function draw() {
  // Background
  ctx.fillStyle = '#070718';
  ctx.fillRect(0, 0, W, H);

  // Grid lines
  ctx.strokeStyle = 'rgba(0,245,255,0.04)';
  ctx.lineWidth = 0.5;
  for (let x = 0; x <= COLS; x++) {
    ctx.beginPath(); ctx.moveTo(x * CELL, 0); ctx.lineTo(x * CELL, H); ctx.stroke();
  }
  for (let y = 0; y <= ROWS; y++) {
    ctx.beginPath(); ctx.moveTo(0, y * CELL); ctx.lineTo(W, y * CELL); ctx.stroke();
  }

  // Food (glowing red dot)
  ctx.shadowColor = '#ff4466';
  ctx.shadowBlur = 18;
  ctx.fillStyle = '#ff4466';
  ctx.beginPath();
  ctx.arc(food.x * CELL + CELL / 2, food.y * CELL + CELL / 2, CELL / 2 - 3, 0, Math.PI * 2);
  ctx.fill();

  // Gem (golden diamond, pulsing)
  if (gem) {
    const pulse = Math.sin(Date.now() / 180) * 0.3 + 0.7;
    const gx = gem.x * CELL + CELL / 2;
    const gy = gem.y * CELL + CELL / 2;
    ctx.shadowColor = '#ffdd00';
    ctx.shadowBlur = 20 * pulse;
    ctx.fillStyle = `rgba(255,215,0,${pulse})`;
    ctx.beginPath();
    ctx.moveTo(gx, gy - CELL / 2 + 2);
    ctx.lineTo(gx + CELL / 2 - 2, gy);
    ctx.lineTo(gx, gy + CELL / 2 - 2);
    ctx.lineTo(gx - CELL / 2 + 2, gy);
    ctx.closePath();
    ctx.fill();
  }

  // Snake
  snake.forEach((s, i) => {
    const isHead = i === 0;
    ctx.shadowColor = isHead ? '#00f5ff' : 'rgba(139,0,255,0.5)';
    ctx.shadowBlur = isHead ? 20 : 8;
    const alpha = 1 - (i / snake.length) * 0.5;
    ctx.fillStyle = isHead ? '#00f5ff' : `rgba(139,0,255,${alpha})`;
    ctx.beginPath();
    ctx.roundRect(s.x * CELL + 1, s.y * CELL + 1, CELL - 2, CELL - 2, 3);
    ctx.fill();
  });
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
overlayTitle.textContent = 'SNAKE';
overlayScoreVal.textContent = '';
overlayHi.textContent = `BEST: ${hiScore}`;
startBtn.textContent = 'START GAME';
