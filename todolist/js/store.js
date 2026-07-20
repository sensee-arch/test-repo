/**
 * Store Module — Pure-data localStorage encapsulation for Todo CRUD.
 * Zero DOM dependency. Testable in Node.js.
 *
 * @module Store
 * @see TASK-3
 */

/* ─── Constants ─── */

/** @const {string} localStorage key for storing todos */
var STORAGE_KEY = 'todolist_tasks';

/** @const {number} Maximum allowed text length per acceptance criteria */
var TEXT_MAX_LENGTH = 500;

/* ─── Internal Helpers ─── */

/**
 * Read and parse todos from localStorage.
 * Returns empty array on miss, parse failure, or any error.
 * @returns {Array} Array of todo objects (default [])
 */
function loadTodos() {
  try {
    var raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    var parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_e) {
    return [];
  }
}

/**
 * Validate, serialize, and write todos to localStorage.
 * Silently handles storage errors (quota exceeded, etc.).
 * @param {Array} todos - Array of todo objects
 */
function saveTodos(todos) {
  if (!Array.isArray(todos)) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  } catch (_e) {
    // localStorage quota exceeded or unavailable
  }
}

/**
 * Generate a unique ID using timestamp + random.
 * @returns {string} Unique identifier
 */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

/* ─── CRUD Functions ─── */

/**
 * Get all todos sorted by createdAt descending (newest first).
 * @returns {Array} Sorted array of todo objects
 */
function getTodos() {
  var todos = loadTodos();
  return todos.sort(function (a, b) {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

/**
 * Find a todo by its ID.
 * @param {string} id - Todo ID
 * @returns {Object|null} The todo object, or null if not found
 */
function getTodoById(id) {
  if (!id) return null;
  var todos = loadTodos();
  var found = null;
  for (var i = 0; i < todos.length; i++) {
    if (todos[i].id === id) {
      found = todos[i];
      break;
    }
  }
  return found;
}

/**
 * Create and add a new todo.
 * Trims text, rejects empty/whitespace, enforces max 500 chars.
 * Creates todo with id/text/completed=false/ISO timestamps.
 * Prepends to list as newest first. Persists and returns the created todo.
 * @param {string} text - Todo text
 * @returns {Object|null} Created todo object, or null if invalid
 */
function addTodo(text) {
  var trimmed = (typeof text === 'string' ? text : '').trim();
  if (!trimmed || trimmed.length > TEXT_MAX_LENGTH) return null;

  var now = new Date().toISOString();
  var todo = {
    id: generateId(),
    text: trimmed,
    completed: false,
    createdAt: now,
    updatedAt: now,
  };

  var todos = loadTodos();
  todos.unshift(todo);
  saveTodos(todos);
  return todo;
}

/**
 * Toggle a todo's completed status and update its updatedAt timestamp.
 * Persists and returns the updated todo, or null if not found.
 * @param {string} id - Todo ID
 * @returns {Object|null} Updated todo, or null if not found
 */
function toggleTodo(id) {
  if (!id) return null;
  var todos = loadTodos();
  var todo = null;
  for (var i = 0; i < todos.length; i++) {
    if (todos[i].id === id) {
      todo = todos[i];
      break;
    }
  }
  if (!todo) return null;

  todo.completed = !todo.completed;
  todo.updatedAt = new Date().toISOString();
  saveTodos(todos);
  return todo;
}

/**
 * Update a todo's text and updatedAt timestamp.
 * Validates new text (non-empty, max 500 chars).
 * Persists and returns the updated todo, or null if not found/invalid.
 * @param {string} id - Todo ID
 * @param {string} newText - New text
 * @returns {Object|null} Updated todo, or null if not found or invalid
 */
function updateTodoText(id, newText) {
  if (!id) return null;
  var trimmed = (typeof newText === 'string' ? newText : '').trim();
  if (!trimmed || trimmed.length > TEXT_MAX_LENGTH) return null;

  var todos = loadTodos();
  var todo = null;
  for (var i = 0; i < todos.length; i++) {
    if (todos[i].id === id) {
      todo = todos[i];
      break;
    }
  }
  if (!todo) return null;

  todo.text = trimmed;
  todo.updatedAt = new Date().toISOString();
  saveTodos(todos);
  return todo;
}

/**
 * Delete a todo by its ID. No-op if ID not found.
 * @param {string} id - Todo ID
 */
function deleteTodo(id) {
  if (!id) return;
  var todos = loadTodos();
  var filtered = [];
  var changed = false;
  for (var i = 0; i < todos.length; i++) {
    if (todos[i].id !== id) {
      filtered.push(todos[i]);
    } else {
      changed = true;
    }
  }
  if (changed) saveTodos(filtered);
}

/**
 * Remove all completed todos.
 */
function clearCompleted() {
  var todos = loadTodos();
  var active = [];
  for (var i = 0; i < todos.length; i++) {
    if (!todos[i].completed) {
      active.push(todos[i]);
    }
  }
  saveTodos(active);
}

/**
 * Get counts of total, active, and completed todos.
 * @returns {{ total: number, active: number, completed: number }}
 */
function getCounts() {
  var todos = loadTodos();
  var completed = 0;
  for (var i = 0; i < todos.length; i++) {
    if (todos[i].completed) completed++;
  }
  return {
    total: todos.length,
    active: todos.length - completed,
    completed: completed,
  };
}
