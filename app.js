/* ============================================
   Todo List — Application Logic
   Model: localStorage CRUD + Task data model
   Controller: Event binding, DOM ops, rendering
   ============================================ */

'use strict';

/* ══════════════════════════════════════════
   Model Layer
   ══════════════════════════════════════════ */

const STORAGE_KEY = 'todos';

/** Generate a unique id */
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

/** Create a new Task object */
function createTask(text) {
  return {
    id: uid(),
    text: text.trim(),
    completed: false,
    createdAt: new Date().toISOString(),
  };
}

/** Load tasks from localStorage */
function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** Save tasks to localStorage */
function saveTasks(tasks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

/** Add a new task */
function addTask(text) {
  const tasks = loadTasks();
  const task = createTask(text);
  tasks.push(task);
  saveTasks(tasks);
  return task;
}

/** Toggle task completion by id */
function toggleTask(id) {
  const tasks = loadTasks();
  const idx = tasks.findIndex((t) => t.id === id);
  if (idx === -1) return null;
  tasks[idx].completed = !tasks[idx].completed;
  saveTasks(tasks);
  return tasks[idx];
}

/** Delete a task by id */
function deleteTask(id) {
  let tasks = loadTasks();
  const filtered = tasks.filter((t) => t.id !== id);
  if (filtered.length === tasks.length) return false;
  saveTasks(filtered);
  return true;
}

/** Clear all completed tasks, return count removed */
function clearCompleted() {
  const tasks = loadTasks();
  const active = tasks.filter((t) => !t.completed);
  const removed = tasks.length - active.length;
  saveTasks(active);
  return removed;
}

/** Export tasks as JSON string */
function exportTasks() {
  return JSON.stringify(loadTasks(), null, 2);
}

/** Import tasks from parsed JSON, returns true on success */
function importTasks(parsed) {
  if (!Array.isArray(parsed)) return false;
  for (const item of parsed) {
    if (typeof item.id !== 'string' || typeof item.text !== 'string' ||
        typeof item.completed !== 'boolean') {
      return false;
    }
  }
  saveTasks(parsed);
  return true;
}

/* ══════════════════════════════════════════
   Controller / View Layer
   ══════════════════════════════════════════ */

/** Current filter: 'all' | 'active' | 'completed' */
let currentFilter = 'all';

/** DOM refs */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const todoForm = $('#todoForm');
const todoInput = $('#todoInput');
const todoList = $('#todoList');
const itemCount = $('#itemCount');
const clearCompletedBtn = $('#clearCompleted');
const filterBtns = $$('.todo__filter');
const exportBtn = $('#exportBtn');
const importBtn = $('#importBtn');
const importFile = $('#importFile');

/** Render the list based on current filter */
function render() {
  const tasks = loadTasks();
  const filtered = filterTasks(tasks, currentFilter);

  const activeCount = tasks.filter((t) => !t.completed).length;
  const completedCount = tasks.length - activeCount;

  // Update item count
  itemCount.textContent = `${activeCount} item${activeCount !== 1 ? 's' : ''} left`;

  // Update clear button state
  clearCompletedBtn.disabled = completedCount === 0;

  // Update filter buttons
  filterBtns.forEach((btn) => {
    const filter = btn.dataset.filter;
    btn.classList.toggle('todo__filter--active', filter === currentFilter);
  });

  // Render list
  if (filtered.length === 0) {
    todoList.innerHTML =
      `<li class="todo__empty">
        <div class="todo__empty-icon">📭</div>
        <p class="todo__empty-text">
          ${currentFilter === 'all' ? 'No tasks yet. Add one above!' :
            currentFilter === 'active' ? 'No active tasks. 🎉' : 'No completed tasks.'}
        </p>
      </li>`;
    return;
  }

  todoList.innerHTML = filtered.map(renderTaskItem).join('');
}

/** Filter tasks based on filter mode */
function filterTasks(tasks, filter) {
  switch (filter) {
    case 'active':
      return tasks.filter((t) => !t.completed);
    case 'completed':
      return tasks.filter((t) => t.completed);
    default:
      return tasks;
  }
}

/** Render a single task item HTML */
function renderTaskItem(task) {
  const doneClass = task.completed ? 'todo__text--done' : '';
  const checkedAttr = task.completed ? 'checked' : '';
  return `
    <li class="todo__item" data-id="${task.id}">
      <input type="checkbox" class="todo__checkbox" ${checkedAttr} aria-label="Toggle task">
      <span class="todo__text ${doneClass}">${escapeHtml(task.text)}</span>
      <button class="todo__delete-btn" aria-label="Delete task">✕</button>
    </li>`;
}

/** Simple HTML escaping */
function escapeHtml(str) {
  const el = document.createElement('span');
  el.textContent = str;
  return el.innerHTML;
}

/* ─── Event Handlers ─── */

/** Handle form submit (add task) */
function handleSubmit(e) {
  e.preventDefault();
  const text = todoInput.value.trim();
  if (!text) return;

  addTask(text);
  todoInput.value = '';
  todoInput.focus();
  render();
}

/** Handle checkbox toggle */
function handleToggle(e) {
  const checkbox = e.target.closest('.todo__checkbox');
  if (!checkbox) return;

  const li = checkbox.closest('.todo__item');
  if (!li) return;

  const id = li.dataset.id;
  toggleTask(id);
  render();
}

/** Handle delete button click */
function handleDelete(e) {
  const btn = e.target.closest('.todo__delete-btn');
  if (!btn) return;

  const li = btn.closest('.todo__item');
  if (!li) return;

  const id = li.dataset.id;
  deleteTask(id);
  render();
}

/** Handle filter button click */
function handleFilter(e) {
  const btn = e.target.closest('.todo__filter');
  if (!btn) return;

  currentFilter = btn.dataset.filter;
  render();
}

/** Handle clear completed */
function handleClearCompleted() {
  const removed = clearCompleted();
  if (removed > 0) render();
}

/** Handle export */
function handleExport() {
  const data = exportTasks();
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `todos-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/** Handle import file selection */
function handleImportFile(e) {
  const file = importFile.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (evt) => {
    try {
      const parsed = JSON.parse(evt.target.result);
      if (importTasks(parsed)) {
        render();
        alert('Tasks imported successfully!');
      } else {
        alert('Invalid file format. Please use a valid JSON file exported from this app.');
      }
    } catch {
      alert('Could not parse file. Please ensure it is valid JSON.');
    }
  };
  reader.readAsText(file);
  importFile.value = '';
}

/** Handle import button click */
function handleImportClick() {
  importFile.click();
}

/* ─── Keyboard Shortcut ─── */

document.addEventListener('keydown', (e) => {
  // Ctrl+E or Cmd+E → focus input
  if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
    e.preventDefault();
    todoInput.focus();
  }
  // Escape → blur input
  if (e.key === 'Escape') {
    todoInput.blur();
  }
});

/* ─── Initialize ─── */

function init() {
  // Bind events
  todoForm.addEventListener('submit', handleSubmit);

  // Delegation for dynamic list items
  todoList.addEventListener('click', (e) => {
    handleToggle(e);
    handleDelete(e);
  });

  // Filter clicks (delegated from toolbar)
  document.querySelector('#toolbar').addEventListener('click', (e) => {
    handleFilter(e);
  });

  clearCompletedBtn.addEventListener('click', handleClearCompleted);
  exportBtn.addEventListener('click', handleExport);
  importBtn.addEventListener('click', handleImportClick);
  importFile.addEventListener('change', handleImportFile);

  // Initial render
  render();
}

document.addEventListener('DOMContentLoaded', init);
