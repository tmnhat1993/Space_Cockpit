/**
 * Todo - Nhiệm vụ chuyến bay
 */

export let todos = JSON.parse(localStorage.getItem('sc_todos') || '[]');

function saveTodos() {
  localStorage.setItem('sc_todos', JSON.stringify(todos));
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

export function renderTodos() {
  const list = document.getElementById('todoList');
  if (!list) return;
  list.innerHTML = '';
  todos.forEach((t) => {
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
}

export function addTodo() {
  const input = document.getElementById('todoInput');
  const text = input?.value.trim();
  if (!text) return;
  todos.push({ id: Date.now(), text, done: false });
  saveTodos();
  renderTodos();
  input.value = '';
}

export function toggleTodo(id) {
  const t = todos.find((x) => x.id === id);
  if (t) {
    t.done = !t.done;
    saveTodos();
    renderTodos();
  }
}

export function deleteTodo(id) {
  todos = todos.filter((t) => t.id !== id);
  saveTodos();
  renderTodos();
}
