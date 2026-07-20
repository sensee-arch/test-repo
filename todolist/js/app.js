/**
 * Application Module — Todo List orchestration layer
 * Binds DOM events, validates input, orchestrates Store → Renderer flow.
 * @module app
 */

/* ─── Constants ─── */

/** Maximum allowed title length */
var TITLE_MAX_LENGTH = 200;

/* ─── State ─── */

/** @type {Todo[]} */
var tasks = [];

/** @type {'all'|'active'|'completed'} */
var currentFilter = 'all';

/** @type {string|null} */
var editingId = null;

/* ─── DOM refs (populated on init) ─── */

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

/* ─── Task model ─── */

/**
 * Create a new task object.
 * @param {string} title - Task title (will be trimmed)
 * @returns {Todo} New task object
 */
function createTask(title) {
  return {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    title: title.trim(),
    completed: false,
    createdAt: new Date().toISOString()
  };
}

/* ─── Storage ─── */

/** Load tasks from persistent storage into state. */
function loadTasks() {
  tasks = getTasks();
}

/** Persist current tasks state to storage. */
function persistTasks() {
  saveTasks(tasks);
}

/**
 * Sort tasks: incomplete first, then completed; within each group,
 * newer (later createdAt) tasks come first.
 * @param {Todo[]} taskList
 * @returns {Todo[]} Sorted copy
 */
function sortTasks(taskList) {
  return taskList.slice().sort(function (a, b) {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
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
function addTask(title) {
  var trimmed = title.trim();
  if (!trimmed) return;
  if (trimmed.length > TITLE_MAX_LENGTH) {
    showMessage('Title cannot exceed ' + TITLE_MAX_LENGTH + ' characters.');
    return;
  }
  tasks.push(createTask(trimmed));
  tasks = sortTasks(tasks);
  persistTasks();
  Renderer.render(tasks, { activeFilter: currentFilter, editingId: editingId });
}

/**
 * Delete a task by ID.
 * @param {string} id - Task ID
 */
function deleteTask(id) {
  if (editingId === id) {
    editingId = null;
  }
  tasks = tasks.filter(function (t) { return t.id !== id; });
  persistTasks();
  Renderer.render(tasks, { activeFilter: currentFilter, editingId: editingId });
}

/**
 * Toggle a task's completion status.
 * @param {string} id - Task ID
 */
function toggleTask(id) {
  var task = null;
  for (var i = 0; i < tasks.length; i++) {
    if (tasks[i].id === id) { task = tasks[i]; break; }
  }
  if (!task) return;
  task.completed = !task.completed;
  tasks = sortTasks(tasks);
  persistTasks();
  Renderer.render(tasks, { activeFilter: currentFilter, editingId: editingId });
}

/**
 * Update a task's title.
 * @param {string} id - Task ID
 * @param {string} newTitle - New title
 */
function updateTaskTitle(id, newTitle) {
  var trimmed = newTitle.trim();
  var task = null;
  for (var i = 0; i < tasks.length; i++) {
    if (tasks[i].id === id) { task = tasks[i]; break; }
  }
  if (!task) {
    editingId = null;
    return;
  }
  if (!trimmed) {
    editingId = null;
    deleteTask(id);
    return;
  }
  if (trimmed.length > TITLE_MAX_LENGTH) {
    showMessage('Title cannot exceed ' + TITLE_MAX_LENGTH + ' characters.');
    return;
  }
  task.title = trimmed;
  editingId = null;
  persistTasks();
  Renderer.render(tasks, { activeFilter: currentFilter, editingId: editingId });
}

/** Clear all completed tasks. */
function clearCompleted() {
  tasks = tasks.filter(function (t) { return !t.completed; });
  persistTasks();
  Renderer.render(tasks, { activeFilter: currentFilter, editingId: editingId });
}

/**
 * Set the active filter.
 * @param {'all'|'active'|'completed'} filter
 */
function setFilter(filter) {
  currentFilter = filter;
  Renderer.render(tasks, { activeFilter: currentFilter, editingId: editingId });
}

/* ─── Event handling ─── */

/**
 * Handle form submission (add task).
 * @param {Event} e - Submit event
 */
function handleFormSubmit(e) {
  e.preventDefault();
  addTask($todoInput.value);
  $todoInput.value = '';
  $todoInput.focus();
}

/**
 * Handle click events on task list (toggle/delete).
 * @param {Event} e - Click event
 */
function handleListClick(e) {
  var li = e.target.closest('.todo-item');
  if (!li) return;
  var id = li.dataset.id;

  if (e.target.classList.contains('toggle')) {
    toggleTask(id);
  } else if (e.target.classList.contains('destroy')) {
    deleteTask(id);
  }
}

/**
 * Handle double-click on a task to start editing.
 * @param {Event} e - DblClick event
 */
function handleListDblClick(e) {
  var li = e.target.closest('.todo-item');
  if (!li || li.classList.contains('editing')) return;
  var id = li.dataset.id;
  editingId = id;

  // Find the task for its current title
  var task = null;
  for (var i = 0; i < tasks.length; i++) {
    if (tasks[i].id === id) { task = tasks[i]; break; }
  }
  if (!task) { editingId = null; return; }

  Renderer.render(tasks, { activeFilter: currentFilter, editingId: editingId });

  // Focus and select the edit input after render
  var input = $todoList.querySelector('[data-id="' + id + '"] .edit-input');
  if (input) {
    input.focus();
    input.select();
  }
}

/**
 * Handle keyboard events in edit input (Enter/Escape).
 * @param {Event} e - Keydown event
 */
function handleListKeydown(e) {
  if (e.key === 'Escape') {
    editingId = null;
    Renderer.render(tasks, { activeFilter: currentFilter, editingId: editingId });
    return;
  }
  if (e.key !== 'Enter') return;
  var li = e.target.closest('.todo-item');
  if (!li) return;
  updateTaskTitle(li.dataset.id, e.target.value);
}

/**
 * Handle blur/focusout on edit input.
 * @param {Event} e - FocusEvent
 */
function handleEditBlur(e) {
  var li = e.target.closest('.todo-item');
  if (!li) return;
  if (editingId === li.dataset.id && tasks.some(function (t) { return t.id === li.dataset.id; })) {
    updateTaskTitle(li.dataset.id, e.target.value);
  }
}

/* ─── Initialisation ─── */

/** Bootstrap the application. */
function init() {
  $todoForm = document.getElementById('todo-form');
  $todoInput = document.getElementById('todo-input');
  $todoList = document.getElementById('todo-list');
  $filterButtons = document.querySelectorAll('.filter-btn');
  $clearCompleted = document.getElementById('clear-completed');
  $todoCount = document.getElementById('todo-count');

  Renderer.init({
    todoList: $todoList,
    filterButtons: $filterButtons,
    clearCompleted: $clearCompleted,
    todoCount: $todoCount
  });

  loadTasks();

  $todoForm.addEventListener('submit', handleFormSubmit);
  $todoList.addEventListener('click', handleListClick);
  $todoList.addEventListener('dblclick', handleListDblClick);
  $todoList.addEventListener('keydown', handleListKeydown);
  $todoList.addEventListener('focusout', handleEditBlur);

  $filterButtons.forEach(function (btn) {
    btn.addEventListener('click', function () { setFilter(btn.dataset.filter); });
  });

  $clearCompleted.addEventListener('click', clearCompleted);

  Renderer.render(tasks, { activeFilter: currentFilter, editingId: editingId });
}

document.addEventListener('DOMContentLoaded', init);
