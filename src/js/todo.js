/**
 * Todo - Nhiệm vụ chuyến bay
 * Lưu ngày tạo (createdAt), ngày hoàn thành (completedAt).
 * Main panel: chỉ task của hôm nay. Drawer: hôm nay chưa xong + đã làm (filter 7 ngày / tháng / năm).
 */

const STORAGE_KEY = 'sc_todos';
const DRAWER_FILTER_KEY = 'sc_todo_drawer_filter';

export let todos = loadAndMigrateTodos();

function loadAndMigrateTodos() {
  const raw = localStorage.getItem(STORAGE_KEY);
  const list = raw ? JSON.parse(raw) : [];
  const now = new Date();
  const todayKey = getDateKey(now);
  list.forEach((t) => {
    if (t.createdAt == null) t.createdAt = new Date(t.id || now.getTime()).toISOString();
    if (t.done && t.completedAt == null) t.completedAt = t.createdAt;
  });
  return list;
}

function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

/** YYYY-MM-DD theo giờ local */
function getDateKey(d) {
  const x = typeof d === 'string' ? new Date(d) : d;
  const y = x.getFullYear();
  const m = String(x.getMonth() + 1).padStart(2, '0');
  const day = String(x.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** 00:00:00 hôm nay (local) */
function getStartOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/** 00:00:00 ngày đầu của 7 ngày trước */
function getStartOf7DaysAgo() {
  const d = new Date();
  d.setDate(d.getDate() - 6);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function getStartOfThisMonth() {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function getStartOfThisYear() {
  const d = new Date();
  d.setMonth(0, 1);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/** Task thuộc hôm nay (theo createdAt) */
function isCreatedToday(t) {
  const key = getDateKey(t.createdAt);
  return key === getDateKey(new Date());
}

export function getTasksForMainPanel() {
  const startToday = getStartOfToday();
  return todos.filter((t) => new Date(t.createdAt).getTime() >= startToday);
}

export function getTasksForDrawer(filter) {
  const todayStart = getStartOfToday();
  const todayIncomplete = todos.filter((t) => isCreatedToday(t) && !t.done);
  let fromTime;
  if (filter === 'month') fromTime = getStartOfThisMonth();
  else if (filter === 'year') fromTime = getStartOfThisYear();
  else fromTime = getStartOf7DaysAgo();
  const pastCompleted = todos
    .filter((t) => {
      if (!t.done) return false;
      const doneTs = new Date(t.completedAt || t.createdAt).getTime();
      return doneTs >= fromTime && doneTs < todayStart;
    })
    .sort((a, b) => new Date(b.completedAt || b.createdAt) - new Date(a.completedAt || a.createdAt));
  const todayCompleted = todos.filter((t) => isCreatedToday(t) && t.done);
  return { todayIncomplete, pastCompleted, todayCompleted, filter };
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

export function renderTodos() {
  const list = document.getElementById('todoList');
  if (!list) return;
  const forMain = getTasksForMainPanel();
  list.innerHTML = '';
  forMain.forEach((t) => {
    const div = document.createElement('div');
    div.className = 'todo-item' + (t.done ? ' done' : '');
    div.innerHTML = `
      <div class="todo-check" data-todo-toggle="${t.id}">${t.done ? '✓' : ''}</div>
      <span class="todo-text">${escapeHtml(t.text)}</span>
      <span class="todo-del" data-todo-delete="${t.id}">✕</span>`;
    list.appendChild(div);
  });
  list.querySelectorAll('[data-todo-toggle]').forEach((el) => {
    el.addEventListener('click', () => toggleTodo(Number(el.dataset.todoToggle)));
  });
  list.querySelectorAll('[data-todo-delete]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteTodo(Number(el.dataset.todoDelete));
    });
  });
  const drawer = document.getElementById('todoDrawerContent');
  if (drawer) renderTodoDrawerContent();
}

let todoDrawerFilter = localStorage.getItem(DRAWER_FILTER_KEY) || '7days';

export function setTodoDrawerFilter(value) {
  todoDrawerFilter = value;
  localStorage.setItem(DRAWER_FILTER_KEY, value);
  renderTodoDrawerContent();
}

export function renderTodoDrawerContent() {
  const container = document.getElementById('todoDrawerContent');
  if (!container) return;
  const { todayIncomplete, pastCompleted, todayCompleted, filter } = getTasksForDrawer(todoDrawerFilter);
  const filterLabels = { '7days': '7 ngày', 'month': 'Tháng này', 'year': 'Năm nay' };
  container.innerHTML = `
    <div class="todo-drawer-filters">
      <button type="button" class="todo-filter-btn ${filter === '7days' ? 'active' : ''}" data-filter="7days">7 ngày</button>
      <button type="button" class="todo-filter-btn ${filter === 'month' ? 'active' : ''}" data-filter="month">Tháng này</button>
      <button type="button" class="todo-filter-btn ${filter === 'year' ? 'active' : ''}" data-filter="year">Năm nay</button>
    </div>
    <div class="todo-drawer-section">
      <div class="todo-drawer-section__title">Hôm nay chưa xong</div>
      <div class="todo-drawer-list" id="todoDrawerTodayList"></div>
    </div>
    <div class="todo-drawer-section">
      <div class="todo-drawer-section__title">Đã làm (${filterLabels[filter]})</div>
      <div class="todo-drawer-list" id="todoDrawerPastList"></div>
    </div>`;

  const todayList = document.getElementById('todoDrawerTodayList');
  const pastList = document.getElementById('todoDrawerPastList');
  if (todayList) {
    [...todayIncomplete, ...todayCompleted].forEach((t) => {
      const div = document.createElement('div');
      div.className = 'todo-item' + (t.done ? ' done' : '');
      div.innerHTML = `
        <div class="todo-check" data-todo-toggle="${t.id}">${t.done ? '✓' : ''}</div>
        <span class="todo-text">${escapeHtml(t.text)}</span>
        <span class="todo-del" data-todo-delete="${t.id}">✕</span>`;
      todayList.appendChild(div);
    });
    todayList.querySelectorAll('[data-todo-toggle]').forEach((el) => {
      el.addEventListener('click', () => { toggleTodo(Number(el.dataset.todoToggle)); renderTodos(); });
    });
    todayList.querySelectorAll('[data-todo-delete]').forEach((el) => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteTodo(Number(el.dataset.todoDelete));
      });
    });
  }
  if (pastList) {
    pastCompleted.forEach((t) => {
      const div = document.createElement('div');
      div.className = 'todo-item done';
      const doneDate = getDateKey(t.completedAt || t.createdAt);
      div.innerHTML = `
        <div class="todo-check" style="pointer-events:none">✓</div>
        <span class="todo-text">${escapeHtml(t.text)}</span>
        <span class="todo-date">${doneDate}</span>`;
      pastList.appendChild(div);
    });
  }
  container.querySelectorAll('.todo-filter-btn').forEach((btn) => {
    btn.addEventListener('click', () => setTodoDrawerFilter(btn.dataset.filter));
  });
}

let todoDrawerOpen = false;

export function toggleTodoDrawer() {
  todoDrawerOpen = !todoDrawerOpen;
  const drawer = document.getElementById('todoDrawer');
  const overlay = document.getElementById('todoDrawerOverlay');
  if (drawer) drawer.classList.toggle('is-open', todoDrawerOpen);
  if (overlay) {
    overlay.classList.toggle('is-visible', todoDrawerOpen);
    overlay.setAttribute('aria-hidden', !todoDrawerOpen);
  }
  if (todoDrawerOpen) renderTodoDrawerContent();
}

export function closeTodoDrawer() {
  if (!todoDrawerOpen) return;
  todoDrawerOpen = false;
  const drawer = document.getElementById('todoDrawer');
  const overlay = document.getElementById('todoDrawerOverlay');
  if (drawer) drawer.classList.remove('is-open');
  if (overlay) {
    overlay.classList.remove('is-visible');
    overlay.setAttribute('aria-hidden', 'true');
  }
}

let addTodoInProgress = false;

export function addTodo() {
  if (addTodoInProgress) return;
  const input = document.getElementById('todoInput');
  const text = input?.value.trim();
  if (!text) return;
  addTodoInProgress = true;
  input.value = ''; // clear ngay để tránh event thứ hai đọc lại value
  const id = Date.now();
  todos.push({ id, text, done: false, createdAt: new Date().toISOString() });
  saveTodos();
  renderTodos();
  addTodoInProgress = false;
}

export function toggleTodo(id) {
  const t = todos.find((x) => x.id === id);
  if (t) {
    t.done = !t.done;
    if (t.done) t.completedAt = new Date().toISOString();
    else t.completedAt = undefined;
    saveTodos();
    renderTodos();
  }
}

export function deleteTodo(id) {
  todos = todos.filter((t) => t.id !== id);
  saveTodos();
  renderTodos();
  const drawer = document.getElementById('todoDrawerContent');
  if (drawer) renderTodoDrawerContent();
}
