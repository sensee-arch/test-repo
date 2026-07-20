/**
 * Application Module — Todo List main logic
 * Handles rendering, events, CRUD, filtering, inline editing
 * @module app
 */

/* ─── Constants ─── */

/** Maximum allowed title length */
const TITLE_MAX_LENGTH = 200;

/* ─── State ─── */

/** @type {Task[]} */
let tasks = [];

/** @type {'all'|'active'|'completed'} */
let currentFilter = 'all';

/** @type {string|null} */
let editingId = null;

/* ─── DOM refs (populated on init) ─── */

/** @type {HTMLFormElement} */
let $todoForm;
/** @type {HTMLInputElement} */
let $todoInput;
/** @type {HTMLUListElement} */
let $todoList;
/** @type {NodeListOf<HTMLButtonElement>} */
let $filterButtons;
/** @type {HTMLButtonElement} */
let $clearCompleted;
/** @type {HTMLSpanElement} */
let $todoCount;

/* ─── Task model ─── */

/**
 * Create a new task object.
 * @param {string} title - Task title (will be trimmed)
 * @returns {Task} New task object
 */
function createTask(title) {
  return {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    title: title.trim(),
    completed: false,
    createdAt: new Date().toISOString(),
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

/* ─── Filtering ─── */

/**
 * Get tasks filtered by current filter state.
 * @returns {Task[]} Filtered task array
 */
function getFilteredTasks() {
  if (currentFilter === 'active') return tasks.filter(function (t) { return !t.completed; });
  if (currentFilter === 'completed') return tasks.filter(function (t) { return t.completed; });
  return tasks;
}

/**
 * Sort tasks: incomplete first, then completed; within each group,
 * newer (later createdAt) tasks come first.
 * @param {Task[]} taskList
 * @returns {Task[]} Sorted copy
 */
function sortTasks(taskList) {
  return taskList.slice().sort(function (a, b) {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

/* ─── Rendering ─── */

/** Re-render the task list UI. */
function render() {
  const filtered = getFilteredTasks();
  const fragment = document.createDocumentFragment();

  if (filtered.length === 0) {
    const li = document.createElement('li');
    li.className = 'empty-state';
    const msg = currentFilter === 'all'
      ? 'No tasks yet. Add one above!'
      : currentFilter === 'active'
        ? 'No active tasks. \uD83C\uDF89'
        : 'No completed tasks.';
    li.textContent = msg;
    fragment.appendChild(li);
  } else {
    filtered.forEach(function (task) {
      const li = document.createElement('li');
      li.className = 'todo-item' + (task.completed ? ' completed' : '');
      li.dataset.id = task.id;

      if (editingId === task.id) {
        li.classList.add('editing');
        const input = document.createElement('input');
        input.className = 'edit-input';
        input.type = 'text';
        input.value = task.title;
        li.appendChild(input);
      } else {
        const cb = document.createElement('input');
        cb.className = 'toggle';
        cb.type = 'checkbox';
        cb.checked = task.completed;

        const label = document.createElement('label');
        label.className = 'todo-title';
        label.textContent = task.title;

        const delBtn = document.createElement('button');
        delBtn.className = 'destroy';
        delBtn.setAttribute('aria-label', 'Delete task');
        delBtn.textContent = '\u00D7';

        li.appendChild(cb);
        li.appendChild(label);
        li.appendChild(delBtn);
      }

      fragment.appendChild(li);
    });
  }

  $todoList.innerHTML = '';
  $todoList.appendChild(fragment);
  updateFooter();
}

/** Update the stats footer. */
function updateFooter() {
  const remaining = tasks.filter(function (t) { return !t.completed; }).length;
  $todoCount.textContent = remaining + ' item' + (remaining !== 1 ? 's' : '') + ' left';

  $filterButtons.forEach(function (btn) {
    btn.classList.toggle('selected', btn.dataset.filter === currentFilter);
  });

  $clearCompleted.style.display = tasks.some(function (t) { return t.completed; }) ? '' : 'none';
}

/* ─── CRUD ─── */

/**
 * Add a new task.
 * @param {string} title - Task title
 */
function addTask(title) {
  const trimmed = title.trim();
  if (!trimmed) return;
  if (trimmed.length > TITLE_MAX_LENGTH) {
    alert('Title cannot exceed ' + TITLE_MAX_LENGTH + ' characters.');
    return;
  }
  tasks.push(createTask(trimmed));
  tasks = sortTasks(tasks);
  persistTasks();
  render();
}

/**
 * Delete a task by ID.
 * @param {string} id - Task ID
 */
function deleteTask(id) {
  // If editing this task, clear editing first
  if (editingId === id) {
    editingId = null;
  }
  tasks = tasks.filter(function (t) { return t.id !== id; });
  persistTasks();
  render();
}

/**
 * Toggle a task's completion status.
 * @param {string} id - Task ID
 */
function toggleTask(id) {
  const task = tasks.find(function (t) { return t.id === id; });
  if (!task) return;
  task.completed = !task.completed;
  tasks = sortTasks(tasks);
  persistTasks();
  render();
}

/**
 * Update a task's title.
 * @param {string} id - Task ID
 * @param {string} newTitle - New title
 */
function updateTaskTitle(id, newTitle) {
  const trimmed = newTitle.trim();
  const task = tasks.find(function (t) { return t.id === id; });
  if (!task) {
    editingId = null;
    return;
  }
  if (!trimmed) {
    // Empty title after trim → delete the task
    editingId = null;
    deleteTask(id);
    return;
  }
  if (trimmed.length > TITLE_MAX_LENGTH) {
    alert('Title cannot exceed ' + TITLE_MAX_LENGTH + ' characters.');
    return;
  }
  task.title = trimmed;
  editingId = null;
  persistTasks();
  render();
}

/** Clear all completed tasks. */
function clearCompleted() {
  tasks = tasks.filter(function (t) { return !t.completed; });
  persistTasks();
  render();
}

/**
 * Set the active filter.
 * @param {'all'|'active'|'completed'} filter
 */
function setFilter(filter) {
  currentFilter = filter;
  render();
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
  const li = e.target.closest('.todo-item');
  if (!li) return;
  const id = li.dataset.id;

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
  const li = e.target.closest('.todo-item');
  if (!li || li.classList.contains('editing')) return;
  const id = li.dataset.id;
  editingId = id;
  render();

  // Focus and select the edit input after render
  const input = $todoList.querySelector('[data-id="' + id + '"] .edit-input');
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
    render();
    return;
  }
  if (e.key !== 'Enter') return;
  const li = e.target.closest('.todo-item');
  if (!li) return;
  updateTaskTitle(li.dataset.id, e.target.value);
}

/**
 * Handle blur/focusout on edit input.
 * @param {Event} e - FocusEvent
 */
function handleEditBlur(e) {
  const li = e.target.closest('.todo-item');
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

  render();
}

document.addEventListener('DOMContentLoaded', init);
