
// ============================================================
// ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ
// ============================================================
let allBanks = {}; // Вопросы загружаются из questions.json

// ============================================================
// ЗАГРУЗКА ВОПРОСОВ (JSON)
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    fetch('js/questions.json')
        .then(response => response.json())
        .then(data => {
            allBanks = data;
            console.log("Вопросы успешно загружены");
            // Если есть функция 초기лизации, её можно вызвать здесь
            // init() или что-то подобное, но у вас всё завязано на клики
        })
        .catch(e => console.error("Ошибка загрузки вопросов:", e));
});


// ============================================================
// БАНК ВОПРОСОВ ИЗ ИСХОДНИКА
// ============================================================

// Данные загружаются из questions.json


// ============================================================
// КАРТИНКИ ПЕРСОНАЖЕЙ
// ============================================================
const BOT_IMGS = {
  Light: {
    avatar:     'https://static.tildacdn.com/tild6662-3534-4865-a161-613831333432/bot1-4.png',
    win:        'https://static.tildacdn.com/tild3363-3662-4934-b039-396331656263/bot1-2.png',
    lose:       'https://static.tildacdn.com/tild3265-3039-4430-b836-376662623434/bot1-1.png',
    tie_wrong:  'https://static.tildacdn.com/tild6662-3534-4865-a161-613831333432/bot1-4.png',
    tie_correct:'https://static.tildacdn.com/tild3834-6138-4562-a336-373335323665/bot1-3.png'
  },
  Medium: {
    avatar:     'https://static.tildacdn.com/tild6632-6264-4232-b038-636165313332/bot2-1.png',
    win:        'https://static.tildacdn.com/tild6537-3561-4362-a436-323438303936/bot2-4.png',
    lose:       'https://static.tildacdn.com/tild6632-6264-4232-b038-636165313332/bot2-1.png',
    tie_wrong:  'https://static.tildacdn.com/tild6537-3561-4362-a436-323438303936/bot2-4.png',
    tie_correct:'https://static.tildacdn.com/tild3063-6135-4730-b962-396561663032/bot2-3.png'
  },
  Super: {
    avatar:     'https://static.tildacdn.com/tild6263-3861-4530-a332-323162373864/bot3-2.png',
    win:        'https://static.tildacdn.com/tild6263-3861-4530-a332-323162373864/bot3-2.png',
    lose:       'https://static.tildacdn.com/tild3230-3737-4766-b332-663530383137/bot3-1.png',
    tie_wrong:  'https://static.tildacdn.com/tild3738-3962-4861-b531-333739376534/bot3-4.png',
    tie_correct:'https://static.tildacdn.com/tild6530-3066-4236-a133-366436326336/bot3-3.png'
  }
};

// ============================================================
// СОСТОЯНИЕ
// ============================================================
let difficulty = '';
let botAccuracy = 0;
let questions = [];
let qIndex = 0;
let scoreUser = 0;
let scoreBot = 0;
let answered = false;

// ============================================================
// СЛАЙД 1 — ВЫБОР СЛОЖНОСТИ
// ============================================================
function pickDifficulty(level, cardId) {
  difficulty = level;
  botAccuracy = level === 'Light' ? 0.35 : level === 'Medium' ? 0.65 : 0.85;

  document.querySelectorAll('.diff-card').forEach(c => c.classList.remove('selected'));
  document.getElementById(cardId).classList.add('selected');
  document.getElementById('btn-start').disabled = false;
}

function goTopics() {
  showSlide('slide-topics');
  const grid = document.getElementById('topics-grid');
  grid.innerHTML = '';
  Object.keys(allBanks).forEach(topic => {
    const btn = document.createElement('button');
    btn.className = 'topic-btn';
    btn.textContent = topic;
    btn.onclick = () => startQuiz(topic);
    grid.appendChild(btn);
  });
}

// ============================================================
// СЛАЙД 2 — ТЕМА → СЛАЙД 3
// ============================================================
function startQuiz(topic) {
  questions = JSON.parse(JSON.stringify(allBanks[topic]));
  shuffle(questions);
  questions.forEach(q => shuffle(q.options));
  qIndex = 0; scoreUser = 0; scoreBot = 0;
  showSlide('slide-quiz');
  loadQuestion();
}

// ============================================================
// СЛАЙД 3 — ВОПРОС
// ============================================================
function loadQuestion() {
  answered = false;
  document.getElementById('round-box').style.display = 'none';

  const btn = document.getElementById('btn-confirm');
  btn.style.display = 'block';
  btn.disabled = true;

  const q = questions[qIndex];
  document.getElementById('q-num').textContent   = qIndex + 1;
  document.getElementById('q-total').textContent = questions.length;
  document.getElementById('question-text').innerHTML = q.text;

  const correctCount = q.options.filter(o => o.correct).length;
  const inputType = correctCount > 1 ? 'checkbox' : 'radio';

  const list = document.getElementById('options-list');
  list.innerHTML = '';

  q.options.forEach((opt, idx) => {
    const lbl = document.createElement('label');
    lbl.className = 'opt-label';
    lbl.id = 'ol-' + idx;
    lbl.setAttribute('onclick', ''); // iOS Safari fix

    const inp = document.createElement('input');
    inp.type = inputType;
    inp.name = 'qopt';
    inp.value = idx;
    inp.onclick = e => {
      if (answered) return;
      e.stopPropagation();
      setTimeout(() => {
        document.querySelectorAll('.opt-label').forEach(l => {
          l.classList.toggle('selected', !!l.querySelector('input').checked);
        });
        btn.disabled = document.querySelectorAll('input[name="qopt"]:checked').length === 0;
      }, 10);
    };

    const txt  = document.createElement('span');
    txt.innerHTML = opt.text;

    const bu = document.createElement('span');
    bu.className = 'badge badge-user';
    bu.id = 'bu-' + idx;
    bu.textContent = 'ТЫ';

    const bb = document.createElement('span');
    bb.className = 'badge badge-bot';
    bb.id = 'bb-' + idx;
    bb.textContent = 'БОТ';

    lbl.append(inp, txt, bu, bb);
    list.appendChild(lbl);
  });
}

function submitAnswer() {
  if (answered) return;
  answered = true;

  const q = questions[qIndex];
  const correctIdx = q.options.map((o,i) => o.correct ? i : -1).filter(i => i >= 0);

  const inputs = document.querySelectorAll('input[name="qopt"]');
  const userIdx = [];
  inputs.forEach((inp,i) => { if(inp.checked) userIdx.push(i); inp.disabled = true; });

  document.getElementById('btn-confirm').style.display = 'none';

  const isUserOk = userIdx.length === correctIdx.length && userIdx.every(v => correctIdx.includes(v));

  // Bot decision
  let botIdx = [];
  if (Math.random() <= botAccuracy) {
    botIdx = [...correctIdx];
  } else {
    const wrong = q.options.map((_,i) => i).filter(i => !correctIdx.includes(i));
    botIdx = wrong.length ? [wrong[Math.floor(Math.random() * wrong.length)]] : [...correctIdx];
  }
  const isBotOk = botIdx.length === correctIdx.length && botIdx.every(v => correctIdx.includes(v));

  // Visual badges + colours
  q.options.forEach((_, idx) => {
    const lbl = document.getElementById('ol-' + idx);
    if (userIdx.includes(idx)) document.getElementById('bu-' + idx).style.display = 'block';
    if (botIdx.includes(idx))  document.getElementById('bb-' + idx).style.display = 'block';
    if (correctIdx.includes(idx)) lbl.classList.add('correct');
    else if (userIdx.includes(idx) || botIdx.includes(idx)) lbl.classList.add('wrong');
  });

  // Scores
  if (isUserOk) scoreUser++;
  if (isBotOk)  scoreBot++;
  document.getElementById('score-u').textContent = scoreUser;
  document.getElementById('score-b').textContent = scoreBot;

  // Analytics
  const imgs = BOT_IMGS[difficulty];
  let img, desc;
  if (isUserOk && !isBotOk) {
    img = imgs.win;
    desc = 'Ты прав, а бот ошибся. +1 балл тебе!';
  } else if (!isUserOk && isBotOk) {
    img = imgs.lose;
    desc = 'Бот оказался точнее. Твой ответ неверен.';
  } else if (isUserOk && isBotOk) {
    img = imgs.tie_correct;
    desc = 'Оба соперника ответили верно. +1 балл каждому.';
  } else {
    img = imgs.tie_wrong;
    desc = 'Оба соперника ошиблись. Никто не получает балл.';
  }

  document.getElementById('bot-reaction').src = img;
  document.getElementById('round-desc').textContent = desc;
  document.getElementById('round-box').style.display = 'block';
}

function nextQuestion() {
  qIndex++;
  if (qIndex < questions.length) loadQuestion();
  else showFinal();
}

// ============================================================
// СЛАЙД 4 — ФИНАЛ
// ============================================================
function showFinal() {
  showSlide('slide-final');
  document.getElementById('final-u').textContent = scoreUser;
  document.getElementById('final-b').textContent = scoreBot;

  const el = document.getElementById('final-title');
  if (scoreUser > scoreBot) {
    el.textContent = 'Ты победил ИИ!';
    el.style.color = 'var(--correct)';
  } else if (scoreUser < scoreBot) {
    el.textContent = 'Ты проиграл. Хочешь сыграть повторно?';
    el.style.color = 'var(--wrong)';
  } else {
    el.textContent = 'Ничья. Хочешь сыграть повторно?';
    el.style.color = '#ff9800';
  }
}

// ============================================================
// УТИЛИТЫ
// ============================================================
function showSlide(id) {
  document.querySelectorAll('.slide').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}
