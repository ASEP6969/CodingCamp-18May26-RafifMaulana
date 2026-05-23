const qs = s => document.querySelector(s);
const qsa = s => Array.from(document.querySelectorAll(s));

// Elements
const timeEl = qs('#time');
const dateEl = qs('#date');
const greetingEl = qs('#greeting');
const nameBtn = qs('#nameBtn');
const themeToggle = qs('#themeToggle');

const taskForm = qs('#taskForm');
const taskInput = qs('#taskInput');
const taskList = qs('#taskList');
const sortSelect = qs('#sortSelect');

const linkForm = qs('#linkForm');
const linkTitle = qs('#linkTitle');
const linkUrl = qs('#linkUrl');
const linksWrap = qs('#linksWrap');

const timerDisplay = qs('#timerDisplay');
const startBtn = qs('#startBtn');
const stopBtn = qs('#stopBtn');
const resetBtn = qs('#resetBtn');
const timerLengthInput = qs('#timerLength');

// State
let tasks = [];
let links = [];
let name = '';
let theme = localStorage.getItem('theme') || 'light';

let timer = {interval: null, remaining: 25*60};

function saveState(){
  localStorage.setItem('tasks', JSON.stringify(tasks));
  localStorage.setItem('links', JSON.stringify(links));
  localStorage.setItem('name', name);
  localStorage.setItem('theme', theme);
}

function loadState(){
  try{ tasks = JSON.parse(localStorage.getItem('tasks')||'[]'); }catch(e){tasks=[]}
  try{ links = JSON.parse(localStorage.getItem('links')||'[]'); }catch(e){links=[]}
  name = localStorage.getItem('name') || '';
  theme = localStorage.getItem('theme') || theme;
}

function renderTime(){
  const now = new Date();
  timeEl.textContent = now.toLocaleTimeString();
  dateEl.textContent = now.toLocaleDateString(undefined,{weekday:'long',month:'short',day:'numeric'});
  const h = now.getHours();
  let g = 'Hello';
  if(h<12) g = 'Good morning'; else if(h<18) g = 'Good afternoon'; else g = 'Good evening';
  greetingEl.textContent = name ? `${g}, ${name}` : g;
}

function applyTheme(){
  document.body.classList.toggle('dark', theme==='dark');
  themeToggle.textContent = theme==='dark' ? '☀️' : '🌙';
}

function addTask(text){
  if(!text) return;
  const t = {id: Date.now(),text,done:false,created:Date.now()};
  tasks.unshift(t);
  saveState(); renderTasks();
}

function renderTasks(){
  let list = [...tasks];
  const sort = sortSelect.value;
  if(sort==='newest') list.sort((a,b)=>b.created-a.created);
  if(sort==='oldest') list.sort((a,b)=>a.created-b.created);
  if(sort==='incomplete') list.sort((a,b)=>a.done-b.done);

  taskList.innerHTML = '';
  list.forEach(t=>{
    const li = document.createElement('li'); li.className='task-item'+(t.done?' done':'');
    const cb = document.createElement('input'); cb.type='checkbox'; cb.checked = t.done;
    cb.addEventListener('change',()=>{ t.done=cb.checked; saveState(); renderTasks(); });
    const span = document.createElement('span'); span.className='task-text'; span.textContent = t.text;
    span.contentEditable = 'false';
    span.addEventListener('dblclick',()=>{ span.contentEditable='true'; span.focus(); });
    span.addEventListener('blur',()=>{ span.contentEditable='false'; t.text=span.textContent; saveState(); renderTasks(); });
    span.addEventListener('keydown',(e)=>{ if(e.key==='Enter'){ e.preventDefault(); span.blur(); } });
    const actions = document.createElement('div'); actions.className='task-actions';
    const editBtn = document.createElement('button'); editBtn.textContent='Edit'; editBtn.addEventListener('click',()=>{ span.contentEditable='true'; span.focus(); });
    const delBtn = document.createElement('button'); delBtn.textContent='Delete'; delBtn.addEventListener('click',()=>{ tasks = tasks.filter(x=>x.id!==t.id); saveState(); renderTasks(); });
    actions.append(editBtn,delBtn);
    li.append(cb,span,actions);
    taskList.appendChild(li);
  });
}

function addLink(title,url){
  if(!url) return;
  if(!/^https?:\/\//.test(url)) url='https://'+url;
  links.unshift({id:Date.now(),title: title||url, url});
  saveState(); renderLinks();
}

function renderLinks(){
  linksWrap.innerHTML='';
  links.forEach(l=>{
    const a = document.createElement('a'); a.href = l.url; a.textContent = l.title; a.target='_blank';
    const del = document.createElement('button'); del.textContent='✕'; del.title='Remove'; del.addEventListener('click',(e)=>{ e.preventDefault(); links=links.filter(x=>x.id!==l.id); saveState(); renderLinks(); });
    const wrap = document.createElement('div'); wrap.style.display='flex'; wrap.style.gap='8px'; wrap.append(a,del);
    linksWrap.appendChild(wrap);
  });
}

function formatTime(sec){ const m = Math.floor(sec/60); const s = sec%60; return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}` }

function startTimer(){ if(timer.interval) return; timer.interval = setInterval(()=>{ timer.remaining--; if(timer.remaining<=0){ clearInterval(timer.interval); timer.interval=null; timer.remaining=0; timerDisplay.classList.add('done'); alert('Focus time finished!'); } updateTimerDisplay(); },1000); }
function stopTimer(){ if(timer.interval){ clearInterval(timer.interval); timer.interval=null; } }
function resetTimer(){ stopTimer(); timer.remaining = parseInt(timerLengthInput.value||25,10)*60; updateTimerDisplay(); }
function updateTimerDisplay(){ timerDisplay.textContent = formatTime(timer.remaining); }

// Events
taskForm.addEventListener('submit',(e)=>{ e.preventDefault(); addTask(taskInput.value.trim()); taskInput.value=''; });
sortSelect.addEventListener('change',renderTasks);
linkForm.addEventListener('submit',(e)=>{ e.preventDefault(); addLink(linkTitle.value.trim(), linkUrl.value.trim()); linkTitle.value=''; linkUrl.value=''; });
nameBtn.addEventListener('click',()=>{ const n = prompt('Enter your name', name||''); if(n!==null){ name = n.trim(); saveState(); renderTime(); } });
themeToggle.addEventListener('click',()=>{ theme = theme==='dark'?'light':'dark'; applyTheme(); saveState(); });

startBtn.addEventListener('click',()=>{ startTimer(); });
stopBtn.addEventListener('click',()=>{ stopTimer(); });
resetBtn.addEventListener('click',()=>{ resetTimer(); });
timerLengthInput.addEventListener('change',()=>{ resetTimer(); });

// Init
function init(){ loadState(); applyTheme(); renderTime(); setInterval(renderTime,1000);
  if(localStorage.getItem('timerRemaining')){ timer.remaining = parseInt(localStorage.getItem('timerRemaining'),10)||25*60; }
  else timer.remaining = parseInt(timerLengthInput.value||25,10)*60;
  renderTasks(); renderLinks(); updateTimerDisplay();
}

window.addEventListener('beforeunload',()=>{ if(timer.interval) localStorage.setItem('timerRemaining', timer.remaining); else localStorage.removeItem('timerRemaining'); });

init();
