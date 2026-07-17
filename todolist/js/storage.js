/**
 * Storage Module — localStorage abstraction layer
 * Key: todolist_tasks
 */

const STORAGE_KEY = 'todolist_tasks';

/**
 * Read and parse tasks from localStorage.
 * @returns {Task[]} Array of task objects
 */
function getTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const tasks = JSON.parse(raw);
    if (!Array.isArray(tasks)) return [];
    return tasks;
  } catch (e) {
    console.warn('Failed to parse tasks from localStorage:', e);
    return [];
  }
}

/**
 * Serialize and write tasks to localStorage.
 * @param {Task[]} tasks - Array of task objects
 */
function saveTasks(tasks) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (e) {
    console.error('Failed to save tasks to localStorage:', e);
  }
}
