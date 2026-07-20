/**
 * storage.js — localStorage CRUD data access layer
 *
 * Key: "todolist_tasks"
 * Value: JSON.stringify(Task[])
 *
 * Task shape:
 *   { id: string, title: string, completed: boolean, createdAt: string, updatedAt: string }
 */

const STORAGE_KEY = 'todolist_tasks';

/**
 * Generate a UUID v4 string.
 * Uses crypto.randomUUID() with manual fallback for older environments.
 * @returns {string}
 */
function generateId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Manual UUID v4 fallback
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Read all tasks from localStorage.
 * @returns {Array} Array of task objects (empty array if none or on error).
 */
function getTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const tasks = JSON.parse(raw);
    return Array.isArray(tasks) ? tasks : [];
  } catch (e) {
    console.warn('storage.js: Failed to read tasks', e);
    return [];
  }
}

/**
 * Create a new task and persist.
 * @param {string} title - Task description (plain text).
 * @returns {object} The newly created task object.
 */
function addTask(title) {
  const now = new Date().toISOString();
  const task = {
    id: generateId(),
    title: String(title),
    completed: false,
    createdAt: now,
    updatedAt: now,
  };
  const tasks = getTasks();
  tasks.push(task);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (e) {
    console.warn('storage.js: Failed to write tasks (quota exceeded?)', e);
  }
  return task;
}

/**
 * Update specific fields of a task by id.
 * @param {string} id
 * @param {object} data - Partial fields to merge (e.g. { title: 'new title' }).
 * @returns {object|null} The updated task object, or null if not found.
 */
function updateTask(id, data) {
  const tasks = getTasks();
  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) return null;
  const updated = {
    ...tasks[index],
    ...data,
    id: tasks[index].id, // id is immutable
    updatedAt: new Date().toISOString(),
  };
  tasks[index] = updated;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (e) {
    console.warn('storage.js: Failed to write tasks', e);
  }
  return updated;
}

/**
 * Delete a task by id.
 * @param {string} id
 * @returns {void}
 */
function deleteTask(id) {
  const tasks = getTasks();
  const filtered = tasks.filter((t) => t.id !== id);
  if (filtered.length === tasks.length) return; // nothing changed
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.warn('storage.js: Failed to write tasks', e);
  }
}

/**
 * Toggle the completed status of a task by id.
 * @param {string} id
 * @returns {object|null} The updated task object, or null if not found.
 */
function toggleTask(id) {
  const tasks = getTasks();
  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) return null;
  tasks[index] = {
    ...tasks[index],
    completed: !tasks[index].completed,
    updatedAt: new Date().toISOString(),
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (e) {
    console.warn('storage.js: Failed to write tasks', e);
  }
  return tasks[index];
}
