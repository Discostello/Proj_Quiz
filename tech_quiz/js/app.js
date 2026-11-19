// ===== Утилиты =====
const app = document.getElementById('app');
const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const shuf = a => a.map(x => [Math.random(), x]).sort((p, q) => p[0] - q[0]).map(x => x[1]);
const KW = /(".*?")|\b(int|char|class|struct|public|private|virtual|new|delete|const|auto|return|std|vector|SELECT|FROM|WHERE)\b|\b(\d+)\b/g;
const hl = c => esc(c).replace(KW, (m, s, k) => `<span class="${s ? 's' : k ? 'k' : 'n'}">${m}</span>`);
let G = null, TM = 0, TO = 0, NICK = '', HL = null, BT = 'all';

// ===== Страницы =====
function home() {
  app.innerHTML = `<section class="hero"><div>
    <h1>Tech<br><em>Quiz</em></h1>
    <div class="plaque">Выберите направление и проверьте свои знания прямо сейчас</div><br>
    <a class="btn" href="#topics">Начать квиз</a></div>
    <svg viewBox="0 0 400 320" aria-hidden="true">
      <circle cx="200" cy="160" r="140" fill="#1B6B7A" opacity=".55"/>
      <rect x="80" y="64" width="240" height="154" rx="12" fill="#1E2229"/>
      <rect x="92" y="76" width="216" height="130" rx="6" fill="#0F4C5C"/>
      <rect x="106" y="92" width="90" height="9" rx="4" fill="#F26A4B"/><rect x="120" y="112" width="130" height="9" rx="4" fill="#52B788"/>
      <rect x="120" y="132" width="70" height="9" rx="4" fill="#E0E1DD"/><rect x="106" y="152" width="110" height="9" rx="4" fill="#FFD166"/>
      <rect x="106" y="172" width="60" height="9" rx="4" fill="#F26A4B"/>
      <rect x="186" y="218" width="28" height="34" fill="#1E2229"/><rect x="146" y="250" width="108" height="10" rx="5" fill="#1E2229"/>
      <circle cx="338" cy="196" r="18" fill="#FFD166"/><rect x="314" y="218" width="48" height="66" rx="18" fill="#F26A4B"/>
      <polygon points="60,60 84,100 36,100" fill="#52B788"/><circle cx="350" cy="80" r="14" fill="#F26A4B"/><rect x="48" y="230" width="34" height="34" rx="8" fill="#FFD166" transform="rotate(18 65 247)"/>
    </svg></section>
    <h2 class="t" id="topics">Выберите тему</h2>
    <div class="grid">${Object.keys(T).map(k => `<button class="tc" data-t="${k}"><div class="i">${T[k].i}</div><b>${T[k].n}</b><span>${T[k].d}</span></button>`).join('')}</div>`;
  document.querySelectorAll('.tc').forEach(b => b.onclick = () => start(b.dataset.t));
}

function rules() {
  app.innerHTML = `<div class="card"><h2>Правила</h2>
    <p>• В каждом квизе 10 вопросов, у каждого 4 варианта ответа и один верный.</p>
    <p>• На вопрос даётся 30 секунд. Если время вышло, ответ не засчитывается.</p>
    <p>• За верный ответ: 100 баллов и до 50 бонусных за скорость. Максимум за квиз: 1500.</p>
    <p>• Уровень: до 4 верных — «Новичок», 5–8 — «Специалист», 9–10 — «Эксперт».</p>
    <p>• Результат можно сохранить в лидерборд под никнеймом. Для каждого ника и темы хранится лучший результат.</p>
    <p>• В «Общем зачёте» суммируются лучшие баллы по всем темам.</p></div>`;
}

function start(t) {
  const qs = shuf(Q[t]).map(a => { const o = shuf(a.slice(1, 5)); return {q:a[0], code:a[5], o, ci:o.indexOf(a[1])}; });
  G = {t, qs, i:0, score:0, ok:0, log:[], t0:Date.now(), sec:null};
  ask();
}

function ask() {
  const g = G, q = g.qs[g.i];
  app.innerHTML = `<div class="card">
    <div class="top"><span>${T[g.t].n}</span><b>Вопрос ${g.i + 1} из 10</b><span>Очки: ${g.score}</span></div>
    <div class="bar"><i style="width:${g.i * 10}%"></i></div>
    <div class="bar tm"><i id="tf"></i></div>
    <h2>${esc(q.q)}</h2>${q.code ? `<pre>${hl(q.code)}</pre>` : ''}
    ${q.o.map((o, k) => `<button class="opt" data-k="${k}">${esc(o)}</button>`).join('')}</div>`;
  g.ts = Date.now();
  let done = false;
  const fin = k => {
    if (done) return;
    done = true; clearInterval(TM);
    const el = (Date.now() - g.ts) / 1000, right = k === q.ci;
    if (right) { g.ok++; g.score += 100 + Math.round(50 * Math.max(0, 1 - el / 30)); }
    g.log.push({q, k});
    document.querySelectorAll('.opt').forEach((b, j) => {
      b.disabled = true;
      b.classList.toggle('ok', j === q.ci);
      if (j === k && !right) b.classList.add('bad');
    });
    TO = setTimeout(() => { g.i++; g.i < 10 ? ask() : result(); }, k < 0 ? 1300 : 900);
  };
  document.querySelectorAll('.opt').forEach(b => b.onclick = () => fin(+b.dataset.k));
  TM = setInterval(() => {
    const el = (Date.now() - g.ts) / 1000;
    $('tf').style.width = Math.max(0, 100 - el / 30 * 100) + '%';
    if (el >= 30) fin(-1);
  }, 100);
}

function result() {
  const g = G;
  if (g.sec == null) g.sec = Math.max(10, Math.round((Date.now() - g.t0) / 1000));
  const lv = g.ok >= 9 ? 'Эксперт' : g.ok >= 5 ? 'Специалист' : 'Новичок';
  app.innerHTML = `<div class="card res">
    <div class="top" style="justify-content:center">${T[g.t].n}</div>
    <div class="big">${g.score}</div>
    <div>Верных ответов: <b>${g.ok}</b> из 10 · Время: ${g.sec} с</div>
    <div class="lv">${lv}</div><br>
    <input id="nick" maxlength="32" placeholder="Ваш никнейм" value="${esc(NICK)}"><br>
    <button id="sv">Сохранить результат в лидерборд</button>
    <div id="msg" class="err" style="margin-top:10px"></div>
    <div class="row"><button class="gh" id="rv">Разбор ошибок</button><button class="gh" id="ag">Пройти заново</button><button class="gh" id="ot">Выбрать другую тему</button></div></div>`;
  $('rv').onclick = review;
  $('ag').onclick = () => start(g.t);
  $('ot').onclick = () => { location.hash = 'topics'; if (location.hash === '#topics') route(); };
  $('sv').onclick = async () => {
    const n = $('nick').value.trim();
    if (!n) { $('msg').textContent = 'Введите никнейм'; return; }
    $('sv').disabled = true; $('msg').textContent = '';
    try {
      await DB.save({nickname:n, topic:g.t, score:g.score, correct_answers:g.ok, time_seconds:g.sec});
      NICK = n; HL = n; BT = g.t; location.hash = 'board';
    } catch (e) {
      $('msg').textContent = 'Не удалось сохранить результат, попробуйте ещё раз';
      $('sv').disabled = false;
    }
  };
}

function review() {
  const w = G.log.filter(e => e.k !== e.q.ci);
  app.innerHTML = `<div class="card"><h2>Разбор ошибок</h2>` + (w.length ? w.map(e => `<div class="rv"><b>${esc(e.q.q)}</b>
    ${e.q.code ? `<pre>${hl(e.q.code)}</pre>` : ''}
    <p class="bd">Ваш ответ: ${e.k < 0 ? 'нет ответа (время вышло)' : esc(e.q.o[e.k])}</p>
    <p class="good">Верный ответ: ${esc(e.q.o[e.q.ci])}</p></div>`).join('') : '<p>Ошибок нет, отличный результат!</p>') +
    `<div class="row"><button id="bk">Назад к результату</button></div></div>`;
  $('bk').onclick = result;
}

async function board(tab) {
  BT = tab || BT;
  app.innerHTML = `<div class="card" style="max-width:900px"><h2>Лидерборд · Топ-20</h2>
    <div class="tabs"><button data-b="all" class="${BT === 'all' ? 'on' : ''}">Общий зачёт</button>
    ${Object.keys(T).map(k => `<button data-b="${k}" class="${BT === k ? 'on' : ''}">${T[k].n}</button>`).join('')}</div>
    <div id="tb" class="tw">Загрузка…</div></div>`;
  document.querySelectorAll('.tabs button').forEach(b => b.onclick = () => board(b.dataset.b));
  let rows;
  try { rows = await DB.all(); }
  catch (e) { $('tb').innerHTML = '<p class="err">Не удалось загрузить таблицу лидеров, попробуйте обновить страницу</p>'; return; }
  if (BT === 'all') {
    const m = {};
    rows.forEach(r => { const o = m[r.nickname] || (m[r.nickname] = {nickname:r.nickname, score:0, correct_answers:0, time_seconds:0}); o.score += r.score; o.correct_answers += r.correct_answers; o.time_seconds += r.time_seconds; });
    rows = Object.values(m);
  } else rows = rows.filter(r => r.topic === BT);
  rows.sort((a, b) => b.score - a.score || a.time_seconds - b.time_seconds);
  rows = rows.slice(0, 20);
  $('tb').innerHTML = rows.length ? `<table><tr><th>#</th><th>Игрок</th><th>Баллы</th><th>Верных</th><th>Время</th></tr>
    ${rows.map((r, i) => `<tr class="${i < 3 ? 'r' + (i + 1) : ''} ${r.nickname === HL ? 'me' : ''}"><td>${i + 1}</td><td>${esc(r.nickname)}</td><td>${r.score}</td><td>${r.correct_answers}</td><td>${r.time_seconds} с</td></tr>`).join('')}</table>`
    : '<p>Пока нет результатов. Станьте первым!</p>';
}

// ===== Роутер =====
const V = {home, topics:() => { home(); $('topics').scrollIntoView(); }, board:() => board(), rules};
function route() {
  clearInterval(TM); clearTimeout(TO);
  const h = location.hash.slice(1) || 'home';
  document.querySelectorAll('nav a').forEach(a => a.classList.toggle('on', a.dataset.p === h));
  (V[h] || home)();
  if (h !== 'topics') window.scrollTo(0, 0);
}
window.addEventListener('hashchange', route);
route();
