/**
 * store.js — Data persistence layer
 * All localStorage CRUD operations. Pure functions — no DOM access.
 */

const STORAGE_KEY = 'todolist_tasks';

/**
 * Escape HTML entities to prevent XSS.
 * @param {string} str
 * @returns {string}
 */
function _escapeHtml(str) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return String(str).replace(/[&<>"']/g, (ch) => map[ch]);
}

/**
 * Write tasks array to localStorage.
 * @param {Task[]} tasks
 */
function _save(tasks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

/**
 * Get all tasks from localStorage.
 * @returns {Task[]}
 */
function getTasks() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    const tasks = JSON.parse(data);
    if (!Array.isArray(tasks)) return [];
    return tasks;
  } catch {
    return [];
  }
}

/**
 * Add a new task.
 * @param {string} text — raw user input (will be escaped)
 * @returns {Task}
 */
function addTask(text) {
  const tasks = getTasks();
  const now = new Date().toISOString();
  const task = {
    id: String(Date.now()),
    text: _escapeHtml(text.trim()),
    completed: false,
    createdAt: now,
    updatedAt: now,
  };
  tasks.push(task);
  _save(tasks);
  return task;
}

/**
 * Update a task by id.
 * @param {string} id
 * @param {object} updates — partial fields to update
 * @returns {Task | null}
 */
function updateTask(id, updates) {
  const tasks = getTasks();
  const idx = tasks.findIndex((t) => t.id === id);
  if (idx === -1) return null;

  const sanitized = { ...updates };
  if (sanitized.text !== undefined) {
    sanitized.text = _escapeHtml(String(sanitized.text).trim());
  }
  sanitized.updatedAt = new Date().toISOString();

  tasks[idx] = { ...tasks[idx], ...sanitized };
  _save(tasks);
  return tasks[idx];
}

/**
 * Delete a task by id.
 * @param {string} id
 * @returns {boolean} — true if deleted
 */
function deleteTask(id) {
  const tasks = getTasks();
  const filtered = tasks.filter((t) => t.id !== id);
  if (filtered.length === tasks.length) return false;
  _save(filtered);
  return true;
}

/**
 * Toggle a task's completed status.
 * @param {string} id
 * @returns {Task | null}
 */
function toggleTask(id) {
  const tasks = getTasks();
  const task = tasks.find((t) => t.id === id);
  if (!task) return null;
  task.completed = !task.completed;
  task.updatedAt = new Date().toISOString();
  _save(tasks);
  return task;
}

/**
 * Remove all completed tasks.
 * @returns {number} — number of tasks removed
 */
function clearCompleted() {
  const tasks = getTasks();
  const remaining = tasks.filter((t) => !t.completed);
  const removed = tasks.length - remaining.length;
  if (removed > 0) _save(remaining);
  return removed;
}

/**
 * Get task statistics.
 * @returns {{ total: number, active: number, completed: number }}
 */
function getStats() {
  const tasks = getTasks();
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const active = total - completed;
  return { total, active, completed };
}
