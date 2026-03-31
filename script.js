/* ============================================================
   🌈 신나는 구구단 나라 — script.js
   ============================================================ */

'use strict';

/* ──────────────────────────────────────────
   1. 별똥별 배경 생성
────────────────────────────────────────── */
(function createStars() {
  const container = document.getElementById('bgStars');
  for (let i = 0; i < 60; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    const size = Math.random() * 3 + 1;
    star.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      top: ${Math.random() * 100}%;
      left: ${Math.random() * 100}%;
      animation-duration: ${Math.random() * 8 + 5}s;
      animation-delay: ${Math.random() * 8}s;
    `;
    container.appendChild(star);
  }
})();

/* ──────────────────────────────────────────
   2. 마스코트 클릭 이벤트
────────────────────────────────────────── */
const MASCOTS = ['🐱','🐸','🦊','🐧','🦄','🐉','🚀','⭐','🌈','🎉'];
let mascotIdx = 0;
document.getElementById('mascot').addEventListener('click', () => {
  mascotIdx = (mascotIdx + 1) % MASCOTS.length;
  document.getElementById('mascot').textContent = MASCOTS[mascotIdx];
  playSound('pop');
});

/* ──────────────────────────────────────────
   3. 탭 전환
────────────────────────────────────────── */
function switchTab(name) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
  document.getElementById('tab-' + name).classList.add('active');
  document.getElementById('tab-' + name + '-btn').classList.add('active');
  playSound('click');
}

/* ──────────────────────────────────────────
   4. [외우기 탭] 구구단 카드
────────────────────────────────────────── */
const DAN_COLORS = {};
(function initColors() {
  const hues = [0, 30, 45, 90, 150, 180, 210, 270, 330, 10, 40, 60, 120, 170, 200, 240, 290, 310, 350, 20];
  for (let i = 2; i <= 20; i++) {
    DAN_COLORS[i] = `hsl(${hues[(i-1)%hues.length]}, 85%, 65%)`;
  }
})();

const EMOJIS = ['🐰','🐸','🦊','🐧','🦄','🐉','🚀','⭐','🌈','🎉','🍎','🍦','🎈','💎','🛸','🍒','🎸','🏆','🍀','🪐'];

function initSelectors() {
  const danSelector = document.getElementById('danSelector');
  const fillSelect = document.getElementById('fillDanSelect');
  
  if (danSelector) {
    danSelector.innerHTML = '';
    for (let i = 2; i <= 20; i++) {
      const btn = document.createElement('button');
      btn.className = 'dan-btn';
      btn.id = 'dan-btn-' + i;
      btn.style.backgroundColor = DAN_COLORS[i];
      btn.style.color = (i === 4 || i === 7 || i === 9) ? '#333' : '#fff'; // Some colors need dark text
      btn.innerHTML = `${i}단 ${EMOJIS[(i-2)%EMOJIS.length]}`;
      btn.onclick = () => showDan(i);
      danSelector.appendChild(btn);
    }
  }

  if (fillSelect) {
    for (let i = 2; i <= 20; i++) {
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = `${i}단`;
      fillSelect.appendChild(opt);
    }
  }
}

function showDan(n) {
  // 선택된 버튼 표시
  document.querySelectorAll('.dan-btn').forEach(b => b.classList.remove('selected'));
  document.getElementById('dan-btn-' + n).classList.add('selected');

  const grid = document.getElementById('cardsGrid');
  grid.innerHTML = '';
  playSound('click');

  for (let i = 1; i <= 9; i++) {
    const answer = n * i;
    const card = document.createElement('div');
    card.className = 'mul-card';
    card.style.animationDelay = `${(i - 1) * 0.05}s`;
    card.innerHTML = `
      <div class="card-inner">
        <div class="card-front">
          <span>${n} × ${i}</span>
        </div>
        <div class="card-back" style="background: linear-gradient(135deg, ${DAN_COLORS[n]}, #fff3)">
          <span>${n} × ${i} = <strong>${answer}</strong></span>
        </div>
      </div>`;
    card.addEventListener('click', () => playSound('flip'));
    grid.appendChild(card);
  }
}

/* ──────────────────────────────────────────
   5. [퀴즈 탭] 로직
────────────────────────────────────────── */
let quizLevel = 'easy';
let quizScore = 0;
let quizTotal = 0;
let quizCombo = 0;
let currentAnswer = 0;
let currentA = 0, currentB = 0;
let quizActive = false;

function setLevel(lvl) {
  quizLevel = lvl;
  document.querySelectorAll('.level-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('level-' + lvl).classList.add('active');
  playSound('click');
}

function getRange() {
  if (quizLevel === 'easy')   return [2, 9];
  if (quizLevel === 'hard')   return [2, 20];
  return [2, 12];
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

let quizTimer = null;
const TIME_LIMIT = 5; // 5초

function startQuiz() {
  quizScore = 0; quizTotal = 0; quizCombo = 0;
  updateStats();
  document.getElementById('quizStartBtn').classList.add('hidden');
  quizActive = true;
  nextQuestion();
}

function startTimer() {
  stopTimer();
  const timerContainer = document.getElementById('timerContainer');
  const timerBar = document.getElementById('timerBar');
  timerContainer.style.display = 'block';
  
  let timeLeft = TIME_LIMIT;
  timerBar.style.transform = 'scaleX(1)';
  timerBar.style.background = 'linear-gradient(90deg, #1dd1a1, #ffd32a, #ff6b6b)';

  quizTimer = setInterval(() => {
    timeLeft -= 0.1;
    const progress = timeLeft / TIME_LIMIT;
    timerBar.style.transform = `scaleX(${progress})`;
    
    if (progress < 0.3) {
      timerBar.style.background = '#ff4757';
    }

    if (timeLeft <= 0) {
      stopTimer();
      handleTimeout();
    }
  }, 100);
}

function stopTimer() {
  if (quizTimer) clearInterval(quizTimer);
  quizTimer = null;
}

function handleTimeout() {
  if (!quizActive) return;
  const dummyBtn = document.createElement('button'); // 가짜 버튼
  checkAnswer(-1, dummyBtn); // -1은 오답 보장 (시간 초과)
  document.getElementById('quizFeedback').textContent = '⏰ 시간 초과! 서둘러야 해요!';
}

function nextQuestion() {
  document.getElementById('quizNextBtn').classList.add('hidden');
  document.getElementById('quizFeedback').textContent = '';

  const [min, max] = getRange();
  currentA = randInt(min, max);
  currentB = quizLevel === 'hard'
    ? randInt(1, 9)
    : randInt(1, 9);
  currentAnswer = currentA * currentB;

  document.getElementById('quizQuestion').textContent = `${currentA} × ${currentB} = ?`;

  // 4지선다 생성
  const wrongSet = new Set([currentAnswer]);
  const choices = [currentAnswer];
  const maxPossible = currentA * 9 + 20; // 대략적인 오답 범위
  while (choices.length < 4) {
    const fake = randInt(Math.max(1, currentAnswer - 20), currentAnswer + 20);
    if (fake > 0 && !wrongSet.has(fake)) {
      wrongSet.add(fake);
      choices.push(fake);
    }
  }
  choices.sort(() => Math.random() - 0.5);

  const choicesEl = document.getElementById('quizChoices');
  choicesEl.innerHTML = '';
  choices.forEach((val, idx) => {
    const btn = document.createElement('button');
    btn.className = 'choice-btn';
    btn.textContent = val;
    btn.id = 'choice-btn-' + idx;
    btn.onclick = () => checkAnswer(val, btn);
    choicesEl.appendChild(btn);
  });

  quizTotal++;
  updateStats();
  startTimer();
}

function checkAnswer(val, btn) {
  if (!quizActive) return;
  stopTimer();
  document.getElementById('timerContainer').style.display = 'none';

  document.querySelectorAll('.choice-btn').forEach(b => b.disabled = true);

  if (val === currentAnswer) {
    btn.classList.add('correct');
    quizScore++;
    quizCombo++;
    document.getElementById('quizFeedback').textContent =
      quizCombo >= 3 ? `🔥 ${quizCombo}연속 콤보! 대단해요!` : '🎉 정답이에요! 훌륭해요!';
    updateStats();
    fireCombo(quizCombo);
    playSound('correct');
    if (quizCombo >= 3) launchConfetti();
  } else {
    btn.classList.add('wrong');
    quizCombo = 0;
    document.getElementById('quizFeedback').textContent =
      `😅 아쉽! 정답은 ${currentAnswer}이에요`;
    updateStats();
    shakeCard();
    playSound('wrong');
    // 정답 버튼 하이라이트
    document.querySelectorAll('.choice-btn').forEach(b => {
      if (parseInt(b.textContent) === currentAnswer) b.classList.add('correct');
    });
  }

  document.getElementById('quizNextBtn').classList.remove('hidden');
}

function updateStats() {
  const scoreEl = document.getElementById('scoreDisplay');
  const comboEl = document.getElementById('comboDisplay');
  const totalEl = document.getElementById('totalDisplay');

  scoreEl.textContent = quizScore;
  comboEl.textContent = quizCombo;
  totalEl.textContent = quizTotal;

  // pop 애니메이션
  [scoreEl, comboEl, totalEl].forEach(el => {
    el.classList.remove('pop');
    void el.offsetWidth;
    el.classList.add('pop');
  });

  const comboBox = document.getElementById('comboBox');
  if (quizCombo >= 3) comboBox.classList.add('on-fire');
  else comboBox.classList.remove('on-fire');
}

function shakeCard() {
  const card = document.getElementById('quizCard');
  card.style.animation = 'none';
  void card.offsetWidth;
  card.style.animation = 'shake 0.5s ease';
  setTimeout(() => { card.style.animation = ''; }, 600);
}

function fireCombo(combo) {
  if (combo < 3) return;
  // 화면 가운데에 콤보 텍스트 표시
  const el = document.createElement('div');
  el.textContent = `🔥 ${combo} COMBO!!`;
  el.style.cssText = `
    position:fixed; top:50%; left:50%; transform:translate(-50%,-50%);
    font-family:'Jua',sans-serif; font-size:3.5rem; color:#ffd32a;
    text-shadow:0 0 30px #ff6b6b; z-index:9999;
    animation: comboFly 1.2s ease forwards; pointer-events:none;
  `;
  const styleId = 'combo-style';
  if (!document.getElementById(styleId)) {
    const st = document.createElement('style');
    st.id = styleId;
    st.textContent = `@keyframes comboFly {
      0%   { opacity:0; transform:translate(-50%,-50%) scale(0.4); }
      30%  { opacity:1; transform:translate(-50%,-60%) scale(1.2); }
      70%  { opacity:1; transform:translate(-50%,-65%) scale(1); }
      100% { opacity:0; transform:translate(-50%,-90%) scale(0.8); }
    }`;
    document.head.appendChild(st);
  }
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1300);
}

/* ──────────────────────────────────────────
   6. 폭죽 (Confetti) — Canvas
────────────────────────────────────────── */
let confettiParticles = [];
let confettiRAF = null;

function launchConfetti() {
  const canvas = document.getElementById('confettiCanvas');
  const ctx = canvas.getContext('2d');
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;

  const colors = ['#ff6b6b','#ffd32a','#1dd1a1','#54a0ff','#ff9f43','#9b59b6','#a3cb38'];
  confettiParticles = Array.from({length: 120}, () => ({
    x: Math.random() * canvas.width,
    y: -10,
    r: Math.random() * 8 + 4,
    color: colors[Math.floor(Math.random() * colors.length)],
    vx: (Math.random() - 0.5) * 4,
    vy: Math.random() * 4 + 2,
    angle: Math.random() * Math.PI * 2,
    spin: (Math.random() - 0.5) * 0.2,
    alpha: 1,
    shape: Math.random() > 0.5 ? 'rect' : 'circle'
  }));

  if (confettiRAF) cancelAnimationFrame(confettiRAF);

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    confettiParticles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      if (p.shape === 'rect') {
        ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 1.6);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.r / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.06;
      p.angle += p.spin;
      if (p.y > canvas.height * 0.7) p.alpha -= 0.025;
    });
    confettiParticles = confettiParticles.filter(p => p.alpha > 0);
    if (confettiParticles.length > 0) {
      confettiRAF = requestAnimationFrame(draw);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }
  draw();
}

/* ──────────────────────────────────────────
   7. [써봐 탭] 빈칸 채우기 로직
────────────────────────────────────────── */
let fillData = []; // { dan, i, answer, isBlank }

function setupFill() {
  const selectEl = document.getElementById('fillDanSelect');
  const val = selectEl.value;
  const danList = val === 'all' 
    ? Array.from({length: 19}, (_, i) => i + 2) // 2~20
    : [parseInt(val)];

  fillData = [];
  const grid = document.getElementById('fillGrid');
  grid.innerHTML = '';

  document.getElementById('fillResult').classList.add('hidden');
  document.getElementById('checkFillBtn').classList.remove('hidden');

  danList.forEach(dan => {
    const block = document.createElement('div');
    block.className = 'fill-dan-block';
    const emoji = EMOJIS[(dan-2)%EMOJIS.length];
    block.innerHTML = `<div class="fill-dan-title" style="color:${DAN_COLORS[dan]}">${dan}단 ${emoji}</div>`;

    for (let i = 1; i <= 9; i++) {
      const answer = dan * i;
      // 약 40% 확률로 빈칸
      const isBlank = Math.random() < 0.4;
      fillData.push({ dan, i, answer, isBlank, inputId: `fill-${dan}-${i}` });

      const row = document.createElement('div');
      row.className = 'fill-row';

      if (isBlank) {
        row.innerHTML = `
          <span>${dan}</span>
          <span>×</span>
          <span>${i}</span>
          <span>=</span>
          <input type="number" class="fill-input" id="fill-${dan}-${i}"
                 min="0" max="200" placeholder="?" />`;
      } else {
        row.innerHTML = `
          <span>${dan}</span>
          <span>×</span>
          <span>${i}</span>
          <span>=</span>
          <span class="fill-static">${answer}</span>`;
      }
      block.appendChild(row);
    }
    grid.appendChild(block);
  });
  playSound('click');
}

function checkFill() {
  let correct = 0;
  let total = 0;
  let anyBlank = false;

  fillData.forEach(item => {
    if (!item.isBlank) return;
    total++;
    const el = document.getElementById(item.inputId);
    if (!el) return;
    const val = parseInt(el.value);
    el.classList.remove('correct-cell', 'wrong-cell');
    if (isNaN(val) || el.value.trim() === '') {
      anyBlank = true;
      el.classList.add('wrong-cell');
    } else if (val === item.answer) {
      correct++;
      el.classList.add('correct-cell');
    } else {
      el.classList.add('wrong-cell');
    }
  });

  if (anyBlank) {
    playSound('wrong');
    return;
  }

  const resultEl  = document.getElementById('fillResult');
  const emojiEl   = document.getElementById('fillResultEmoji');
  const msgEl     = document.getElementById('fillResultMsg');

  if (correct === total) {
    emojiEl.textContent = '🏆';
    msgEl.textContent = `완벽해요! ${total}개 모두 맞혔어요! 🎉`;
    resultEl.classList.remove('hidden');
    launchConfetti();
    playSound('complete');
    document.getElementById('checkFillBtn').classList.add('hidden');
    showBadge(total);
  } else {
    emojiEl.textContent = '😅';
    msgEl.textContent = `${total}개 중 ${correct}개 맞혔어요! 다시 도전해봐요!`;
    resultEl.classList.remove('hidden');
    playSound('wrong');
  }
}

/* ──────────────────────────────────────────
   8. 숫자 입력 팝업 (모달)
────────────────────────────────────────── */
let currentModalInputId = null;

function openModal(dan, i, inputId) {
  currentModalInputId = inputId;
  document.getElementById('modalProblem').textContent = `${dan} × ${i} = ?`;
  document.getElementById('modalInput').value = '';
  document.getElementById('modalInput').max = dan * i + 50; 
  document.getElementById('inputModal').classList.remove('hidden');
  setTimeout(() => document.getElementById('modalInput').focus(), 50);
}

function closeModal(e) {
  if (e.target.id === 'inputModal') closeModalManual();
}

function closeModalManual() {
  document.getElementById('inputModal').classList.add('hidden');
  currentModalInputId = null;
}

function submitModalAnswer() {
  if (!currentModalInputId) return;
  const val = document.getElementById('modalInput').value;
  const target = document.getElementById(currentModalInputId);
  if (target) target.value = val;
  closeModalManual();
}

document.getElementById('modalInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') submitModalAnswer();
});

/* ──────────────────────────────────────────
   9. 배지 팝업
────────────────────────────────────────── */
function showBadge(count) {
  document.getElementById('badgeMsg').textContent = `${count}개의 빈칸을 모두 맞혔어요! 구구단 마스터! 👑`;
  document.getElementById('badgeOverlay').classList.remove('hidden');
}

function closeBadge() {
  document.getElementById('badgeOverlay').classList.add('hidden');
  playSound('click');
}

/* ──────────────────────────────────────────
   10. Web Audio API — 사운드 이펙트
────────────────────────────────────────── */
let audioCtx = null;

function getAudioCtx() {
  if (!audioCtx) {
    try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) {}
  }
  return audioCtx;
}

function playTone(frequency, duration, type = 'sine', volume = 0.4, delay = 0) {
  const ctx = getAudioCtx();
  if (!ctx) return;
  const osc  = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, ctx.currentTime + delay);
  gain.gain.setValueAtTime(volume, ctx.currentTime + delay);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);
  osc.start(ctx.currentTime + delay);
  osc.stop(ctx.currentTime + delay + duration + 0.01);
}

function playSound(type) {
  switch(type) {
    case 'click':
      playTone(880, 0.08, 'sine', 0.2);
      break;
    case 'flip':
      playTone(660, 0.1, 'sine', 0.25);
      playTone(880, 0.1, 'sine', 0.2, 0.08);
      break;
    case 'pop':
      playTone(1200, 0.12, 'sine', 0.3);
      playTone(900,  0.08, 'sine', 0.2, 0.12);
      break;
    case 'correct':
      playTone(523, 0.12, 'sine', 0.35);
      playTone(659, 0.12, 'sine', 0.35, 0.12);
      playTone(784, 0.22, 'sine', 0.35, 0.24);
      break;
    case 'wrong':
      playTone(300, 0.15, 'sawtooth', 0.25);
      playTone(200, 0.2,  'sawtooth', 0.25, 0.15);
      break;
    case 'complete':
      [523,659,784,1047].forEach((f, idx) => {
        playTone(f, 0.18, 'sine', 0.4, idx * 0.13);
      });
      break;
  }
}

/* ──────────────────────────────────────────
   11. 초기화
────────────────────────────────────────── */
window.addEventListener('load', () => {
  // 버튼 및 셀렉트박스 생성
  initSelectors();

  // 써봐 탭 기본 세팅
  setupFill();

  // 2단 기본 표시
  showDan(2);
});

// 창 크기 변경 시 confetti 캔버스 재조정
window.addEventListener('resize', () => {
  const canvas = document.getElementById('confettiCanvas');
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
});
