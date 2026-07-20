/**
 * Handler Module — Entry point, event binding, orchestrates Store → Renderer flow.
 * Uses storage.js for persistence. Renderer for DOM updates.
 * TASK-5: Event delegation, keyboard shortcuts, full CRUD lifecycle.
 * @module app
 */

/* ─── Constants ─── */

/** @const {string} localStorage key (shared with store.js) */
var APP_STORAGE_KEY = 'todolist_tasks';

/** @const {number} Maximum allowed title length (HTML input maxlength=200) */
var TITLE_MAX_LENGTH = 200;

/* ─── State ─── */

/** @type {Todo[]} In-memory task list */
var tasks = [];

/** @type {'all'|'active'|'completed'} Active filter */
var currentFilter = 'all';

/** @type {string|null} ID of the task currently being edited */
var editingId = null;

/* ─── DOM refs ─── */

/** @type {HTMLFormElement} */
var $todoForm;
/** @type {HTMLInputElement} */
var $todoInput;
/** @type {HTMLUListElement} */
var $todoList;
/** @type {NodeListOf<HTMLButtonElement>} */
var $filterButtons;
/** @type {HTMLButtonElement} */
var $clearCompleted;
/** @type {HTMLSpanElement} */
var $todoCount;

/* ─── Data helpers ─── */

/**
 * Load tasks from persistent storage.
 * Creates `title` field if the data uses Store's `text` field name.
 * @returns {Todo[]}
 */
function loadTasks() {
  var raw = getTasks();
  tasks = [];
  for (var i = 0; i < raw.length; i++) {
    var t = raw[i];
    tasks.push({
      id: t.id,
      title: t.title || t.text || '',
      text: t.text || t.title || '',
      completed: !!t.completed,
      createdAt: t.createdAt || new Date().toISOString(),
      updatedAt: t.updatedAt || t.createdAt || new Date().toISOString()
    });
  }
  return tasks;
}

/**
 * Persist tasks to localStorage.
 * Writes with both `title` (for tests/renderer) and `text` (for Store compat).
 */
function persistTasks() {
  var out = [];
  for (var i = 0; i < tasks.length; i++) {
    var t = tasks[i];
    out.push({
      id: t.id,
      title: t.title,
      text: t.text || t.title,
      completed: t.completed,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt || new Date().toISOString()
    });
  }
  try {
    localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(out));
  } catch (_e) {
    // localStorage quota exceeded — silently ignored
  }
}

/**
 * Generate a unique task ID.
 * @returns {string}
 */
function generateTaskId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

/**
 * Full re-render via Renderer module.
 */
function renderAll() {
  Renderer.render(tasks, { activeFilter: currentFilter, editingId: editingId });
}

/* ─── Message Display ─── */

/** Show an in-page error/info message. Auto-dismisses after 3s. */
function showMessage(text) {
  clearMessage();
  var msg = document.createElement('div');
  msg.className = 'message error';
  msg.id = 'app-message';
  msg.textContent = text;

  var container = document.querySelector('.todo-container');
  var listEl = document.getElementById('todo-list');
  container.insertBefore(msg, listEl);

  setTimeout(function () {
    var el = document.getElementById('app-message');
    if (el) el.remove();
  }, 3000);
}

/** Remove any visible message element. */
function clearMessage() {
  var msg = document.getElementById('app-message');
  if (msg) msg.remove();
}

/* ─── CRUD ─── */

/**
 * Add a new task.
 * @param {string} title - Task title
 */
function handleAdd(title) {
  var trimmed = (typeof title === 'string' ? title : '').trim();
  if (!trimmed) return;

  if (trimmed.length > TITLE_MAX_LENGTH) {
    showMessage('Title cannot exceed ' + TITLE_MAX_LENGTH + ' characters.');
    return;
  }

  var now = new Date().toISOString();
  var todo = {
    id: generateTaskId(),
    title: trimmed,
    text: trimmed,
    completed: false,
    createdAt: now,
    updatedAt: now
  };

  tasks.unshift(todo);
  persistTasks();
  renderAll();
}

/**
 * Toggle a task's completed status.
 * @param {string} id - Task ID
 */
function handleToggle(id) {
  if (!id) return;
  for (var i = 0; i < tasks.length; i++) {
    if (tasks[i].id === id) {
      tasks[i].completed = !tasks[i].completed;
      tasks[i].updatedAt = new Date().toISOString();
      break;
    }
  }
  persistTasks();
  renderAll();
}

/**
 * Delete a task by ID.
 * @param {string} id - Task ID
 */
function handleDelete(id) {
  if (!id) return;
  if (editingId === id) {
    editingId = null;
  }
  var filtered = [];
  for (var i = 0; i < tasks.length; i++) {
    if (tasks[i].id !== id) {
      filtered.push(tasks[i]);
    }
  }
  tasks = filtered;
  persistTasks();
  renderAll();
}

/**
 * Update a task's title.
 * Empty/whitespace-only input deletes the task (TodoMVC convention).
 * @param {string} id - Task ID
 * @param {string} newTitle - New title text
 */
function handleEdit(id, newTitle) {
  if (!id) return;
  var trimmed = (typeof newTitle === 'string' ? newTitle : '').trim();

  // Empty input → delete task
  if (!trimmed) {
    editingId = null;
    handleDelete(id);
    return;
  }

  if (trimmed.length > TITLE_MAX_LENGTH) {
    showMessage('Title cannot exceed ' + TITLE_MAX_LENGTH + ' characters.');
    return;
  }

  for (var i = 0; i < tasks.length; i++) {
    if (tasks[i].id === id) {
      tasks[i].title = trimmed;
      tasks[i].text = trimmed;
      tasks[i].updatedAt = new Date().toISOString();
      break;
    }
  }
  editingId = null;
  persistTasks();
  renderAll();
}

/**
 * Clear all completed tasks.
 */
function handleClearCompleted() {
  var active = [];
  for (var i = 0; i < tasks.length; i++) {
    if (!tasks[i].completed) {
      active.push(tasks[i]);
    }
  }
  tasks = active;
  persistTasks();
  renderAll();
}

/**
 * Change the active filter and re-render.
 * @param {'all'|'active'|'completed'} filter
 */
function handleFilterChange(filter) {
  currentFilter = filter;
  renderAll();
}

/* ─── Event Handling ─── */

/**
 * Handle form submission — add task.
 * @param {Event} e - Submit event
 */
function onFormSubmit(e) {
  e.preventDefault();
  handleAdd($todoInput.value);
  $todoInput.value = '';
  $todoInput.focus();
}

/**
 * Handle click events on the todo list (delegation on #todo-list).
 * .toggle → toggle completion
 * .destroy → delete task
 * @param {Event} e - Click event
 */
function onListClick(e) {
  var li = e.target.closest('.todo-item');
  if (!li) return;
  var id = li.dataset.id;
  if (!id) return;

  if (e.target.classList.contains('toggle')) {
    handleToggle(id);
  } else if (e.target.classList.contains('destroy')) {
    handleDelete(id);
  }
}

/**
 * Handle double-click on a task — enter edit mode.
 * @param {Event} e - DblClick event
 */
function onListDblClick(e) {
  var li = e.target.closest('.todo-item');
  if (!li || li.classList.contains('editing')) return;
  var id = li.dataset.id;
  if (!id) return;

  var task = null;
  for (var i = 0; i < tasks.length; i++) {
    if (tasks[i].id === id) {
      task = tasks[i];
      break;
    }
  }
  if (!task) return;

  editingId = id;
  renderAll();

  // Focus and select edit input after DOM update
  var editInput = $todoList.querySelector('[data-id="' + id + '"] .edit-input');
  if (editInput) {
    editInput.focus();
    editInput.select();
  }
}

/**
 * Handle keyboard on the todo list (delegation).
 * Escape → cancel edit
 * Enter → confirm edit
 * @param {Event} e - Keydown event
 */
function onListKeydown(e) {
  if (e.key === 'Escape') {
    editingId = null;
    renderAll();
    return;
  }
  if (e.key !== 'Enter') return;

  var li = e.target.closest('.todo-item');
  if (!li) return;
  handleEdit(li.dataset.id, e.target.value);
}

/**
 * Handle blur (focusout) on edit input — confirm edit.
 * @param {Event} e - FocusEvent
 */
function onEditBlur(e) {
  var li = e.target.closest('.todo-item');
  if (!li) return;
  var id = li.dataset.id;
  if (editingId === id) {
    handleEdit(id, e.target.value);
  }
}

/* ─── Initialisation ─── */

/** Bootstrap the application. */
function init() {
  // Cache DOM references
  $todoForm = document.getElementById('todo-form');
  $todoInput = document.getElementById('todo-input');
  $todoList = document.getElementById('todo-list');
  $filterButtons = document.querySelectorAll('.filter-btn');
  $clearCompleted = document.getElementById('clear-completed');
  $todoCount = document.getElementById('todo-count');

  // Initialise Renderer with DOM references
  Renderer.init({
    todoList: $todoList,
    filterButtons: $filterButtons,
    clearCompleted: $clearCompleted,
    todoCount: $todoCount
  });

  // Load persisted data
  loadTasks();

  // Wire events — delegation on #todo-list
  $todoForm.addEventListener('submit', onFormSubmit);
  $todoList.addEventListener('click', onListClick);
  $todoList.addEventListener('dblclick', onListDblClick);
  $todoList.addEventListener('keydown', onListKeydown);
  $todoList.addEventListener('focusout', onEditBlur);

  Array.prototype.forEach.call($filterButtons, function (btn) {
    btn.addEventListener('click', function () {
      handleFilterChange(btn.dataset.filter);
    });
  });

  $clearCompleted.addEventListener('click', handleClearCompleted);

  // Initial render
  renderAll();
}

document.addEventListener('DOMContentLoaded', init);
