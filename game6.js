/* ===== GAME 6: MEMORY MATCH ===== */

Auth.requireAuth();
const user = Auth.getCurrentUser();
const GAME_ID = 'memory-match';

const SYMBOLS = ['⚡', '🔮', '🎯', '💎', '🌀', '⭐', '🔥', '👾'];

let state = 'idle';
let cards, flipped, matchedCount, score, hiScore, timerInterval, timeLeft, canFlip;
hiScore = Scores.getHighScore(user.username, GAME_ID);

const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlay-title');
const overlayScoreVal = document.getElementById('overlay-score-val');
const overlayHi = document.getElementById('overlay-hi');
const startBtn = document.getElementById('start-btn');
const scoreDisplay = document.getElementById('score-display');
const hiDisplay = document.getElementById('hi-display');
const timerDisplay = document.getElementById('timer-display');
const grid = document.getElementById('card-grid');
hiDisplay.textContent = hiScore;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function startGame() {
  state = 'playing';
  score = 0; matchedCount = 0; flipped = []; canFlip = true;
  timeLeft = 60;
  timerDisplay.textContent = timeLeft;
  overlay.classList.add('hidden');

  const pairs = [...SYMBOLS, ...SYMBOLS];
  cards = shuffle(pairs).map((sym, i) => ({ id: i, sym, revealed: false, matched: false }));

  renderGrid();

  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timeLeft--;
    timerDisplay.textContent = timeLeft;
    if (timeLeft <= 0) { clearInterval(timerInterval); gameOver(); }
  }, 1000);
}

function renderGrid() {
  grid.innerHTML = '';
  cards.forEach((card, i) => {
    const el = document.createElement('div');
    el.className = 'mem-card' +
      (card.revealed || card.matched ? ' revealed' : '') +
      (card.matched ? ' matched' : '');
    el.innerHTML = `<div class="mem-face front">${card.sym}</div><div class="mem-face back">?</div>`;
    if (!card.revealed && !card.matched) {
      el.addEventListener('click', () => flipCard(i));
    }
    grid.appendChild(el);
  });
}

function flipCard(i) {
  if (!canFlip || state !== 'playing') return;
  const card = cards[i];
  if (card.revealed || card.matched || flipped.length >= 2) return;

  card.revealed = true;
  flipped.push(i);
  renderGrid();

  if (flipped.length === 2) {
    canFlip = false;
    const [a, b] = flipped;
    if (cards[a].sym === cards[b].sym) {
      // Match found
      setTimeout(() => {
        cards[a].matched = cards[b].matched = true;
        cards[a].revealed = cards[b].revealed = false;
        matchedCount += 2;
        score += 100;
        scoreDisplay.textContent = score;
        flipped = [];
        canFlip = true;
        renderGrid();
        if (matchedCount === 16) gameWin();
      }, 400);
    } else {
      // No match — flip back
      setTimeout(() => {
        cards[a].revealed = cards[b].revealed = false;
        flipped = [];
        canFlip = true;
        renderGrid();
      }, 900);
    }
  }
}

function gameWin() {
  state = 'dead';
  clearInterval(timerInterval);
  const timeBonus = timeLeft * 10;
  score += timeBonus;
  scoreDisplay.textContent = score;
  const isNew = Scores.saveHighScore(user.username, GAME_ID, score);
  hiScore = Scores.getHighScore(user.username, GAME_ID);
  hiDisplay.textContent = hiScore;
  overlayTitle.textContent = '🏆 COMPLETE!';
  overlayScoreVal.textContent = score;
  overlayHi.textContent = isNew ? `🏆 NEW RECORD: ${score}` : `BEST: ${hiScore}`;
  startBtn.textContent = 'PLAY AGAIN';
  overlay.classList.remove('hidden');
}

function gameOver() {
  if (state === 'dead') return;
  state = 'dead';
  clearInterval(timerInterval);
  const isNew = Scores.saveHighScore(user.username, GAME_ID, score);
  hiScore = Scores.getHighScore(user.username, GAME_ID);
  hiDisplay.textContent = hiScore;
  overlayTitle.textContent = "TIME'S UP!";
  overlayScoreVal.textContent = score;
  overlayHi.textContent = isNew ? `🏆 NEW RECORD: ${score}` : `BEST: ${hiScore}`;
  startBtn.textContent = 'PLAY AGAIN';
  overlay.classList.remove('hidden');
}

startBtn.addEventListener('click', startGame);
overlayTitle.textContent = 'MEMORY MATCH';
overlayScoreVal.textContent = '';
overlayHi.textContent = `BEST: ${hiScore}`;
startBtn.textContent = 'START GAME';
