/* ============================================
   Todo List SPA — JavaScript Controller
   ============================================ */

// ─── Store Module ─────────────────────────────
const STORAGE_KEY = 'todo_items';

const Store = {
  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.warn('Failed to load todos from localStorage:', e);
      return [];
    }
  },

  save(tasks) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {
      console.warn('Failed to save todos to localStorage:', e);
    }
  },

  clear() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('Failed to clear localStorage:', e);
    }
  }
};

// ─── Helpers ──────────────────────────────────
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

function createElement(tag, classes, attrs) {
  const el = document.createElement(tag);
  if (classes) {
    el.className = Array.isArray(classes) ? classes.join(' ') : classes;
  }
  if (attrs) {
    for (const [key, val] of Object.entries(attrs)) {
      el.setAttribute(key, val);
    }
  }
  return el;
}

// ─── App State ────────────────────────────────
const State = {
  tasks: [],
  filter: 'all',

  getFiltered() {
    if (this.filter === 'active') {
      return this.tasks.filter(t => !t.completed);
    }
    if (this.filter === 'completed') {
      return this.tasks.filter(t => t.completed);
    }
    return this.tasks;
  },

  getStats() {
    const total = this.tasks.length;
    const active = this.tasks.filter(t => !t.completed).length;
    const completed = total - active;
    return { total, active, completed };
  }
};

// ─── DOM References ───────────────────────────
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const els = {
  taskForm: $('#taskForm'),
  taskInput: $('#taskInput'),
  taskItems: $('#taskItems'),
  emptyState: $('#emptyState'),
  filterBtns: $$('.filter-btn'),
  statsCount: $('#statsCount'),
  clearCompletedBtn: $('#clearCompletedBtn')
};

// ─── Renderer ─────────────────────────────────
function render() {
  const filtered = State.getFiltered();
  const stats = State.getStats();

  // Render task items
  els.taskItems.innerHTML = '';
  if (filtered.length === 0) {
    els.emptyState.style.display = 'block';
    els.emptyState.textContent =
      State.filter === 'all' ? 'No tasks yet. Add one above!' :
      State.filter === 'active' ? 'No active tasks. 🎉' :
      'No completed tasks.';
  } else {
    els.emptyState.style.display = 'none';
    filtered.forEach(task => {
      const li = createTaskElement(task);
      els.taskItems.appendChild(li);
    });
  }

  // Update stats
  els.statsCount.textContent = `${stats.active} item${stats.active !== 1 ? 's' : ''} left`;

  // Update filter buttons
  els.filterBtns.forEach(btn => {
    const f = btn.dataset.filter;
    btn.classList.toggle('active', f === State.filter);
  });

  // Show/hide clear completed
  els.clearCompletedBtn.style.display = stats.completed > 0 ? 'inline-flex' : 'none';
}

function createTaskElement(task) {
  const li = createElement('li', 'task-item');
  if (task.completed) {
    li.classList.add('completed');
  }
  li.dataset.id = task.id;

  // Checkbox
  const checkbox = createElement('input', 'task-checkbox', {
    type: 'checkbox',
    'aria-label': `Mark "${escapeHtml(task.title)}" as ${task.completed ? 'incomplete' : 'complete'}`
  });
  checkbox.checked = task.completed;
  checkbox.dataset.id = task.id;
  checkbox.addEventListener('change', () => toggleTask(task.id));

  // Title span
  const titleSpan = createElement('span', 'task-title');
  titleSpan.textContent = task.title;
  titleSpan.dataset.id = task.id;

  // Double-click to edit
  titleSpan.addEventListener('dblclick', () => startEdit(task.id));

  // Delete button
  const delBtn = createElement('button', 'btn-delete', {
    'aria-label': `Delete "${escapeHtml(task.title)}"`
  });
  delBtn.textContent = '✕';
  delBtn.dataset.id = task.id;
  delBtn.addEventListener('click', () => deleteTask(task.id));

  li.appendChild(checkbox);
  li.appendChild(titleSpan);
  li.appendChild(delBtn);

  return li;
}

// ─── Inline Edit ──────────────────────────────
let editingId = null;

function startEdit(id) {
  if (editingId) return;

  const task = State.tasks.find(t => t.id === id);
  if (!task) return;

  editingId = id;
  const li = els.taskItems.querySelector(`li[data-id="${id}"]`);
  if (!li) return;

  const titleSpan = li.querySelector('.task-title');
  const oldValue = task.title;

  const input = createElement('input', 'task-edit-input', {
    type: 'text',
    maxlength: '200',
    'aria-label': 'Edit task'
  });
  input.value = oldValue;

  titleSpan.replaceWith(input);
  input.focus();
  input.select();

  function finishEdit(save) {
    if (editingId !== id) return;
    editingId = null;

    const newTitle = save ? input.value.trim() : '';
    if (save && newTitle && newTitle !== oldValue) {
      task.title = newTitle;
      Store.save(State.tasks);
    }

    render();
  }

  input.addEventListener('blur', () => finishEdit(true));
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      input.blur();
    } else if (e.key === 'Escape') {
      finishEdit(false);
    }
  });
}

// ─── Actions ─────────────────────────────────
function addTask(title) {
  const task = {
    id: generateId(),
    title: title.trim(),
    completed: false,
    createdAt: Date.now()
  };

  State.tasks.unshift(task);
  Store.save(State.tasks);
  render();
}

function toggleTask(id) {
  const task = State.tasks.find(t => t.id === id);
  if (!task) return;

  task.completed = !task.completed;
  Store.save(State.tasks);
  render();
}

function deleteTask(id) {
  State.tasks = State.tasks.filter(t => t.id !== id);
  Store.save(State.tasks);
  render();
}

function setFilter(filter) {
  State.filter = filter;
  render();
}

function clearCompleted() {
  State.tasks = State.tasks.filter(t => !t.completed);
  Store.save(State.tasks);
  render();
}

// ─── Event Handlers ───────────────────────────
function initEventHandlers() {
  // Add task form
  els.taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = els.taskInput.value.trim();
    if (!title) return;

    addTask(title);
    els.taskInput.value = '';
    els.taskInput.focus();
  });

  // Filter buttons
  els.filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      setFilter(btn.dataset.filter);
    });
  });

  // Clear completed
  els.clearCompletedBtn.addEventListener('click', clearCompleted);

  // Enter key in task input
  els.taskInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      els.taskForm.dispatchEvent(new Event('submit'));
    }
  });
}

// ─── Init ─────────────────────────────────────
function init() {
  State.tasks = Store.load();
  initEventHandlers();
  render();
}

document.addEventListener('DOMContentLoaded', init);
