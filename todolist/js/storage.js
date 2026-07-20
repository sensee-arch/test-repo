/**
 * Storage Module — localStorage abstraction layer with in-memory fallback
 * @module storage
 */

/**
 * @typedef {Object} Task
 * @property {string} id - Unique task identifier
 * @property {string} title - Task title text
 * @property {boolean} completed - Completion status
 * @property {string} createdAt - ISO 8601 creation timestamp
 * @property {string} [updatedAt] - ISO 8601 last-updated timestamp
 */

const STORAGE_KEY = 'todolist_tasks';

/** @type {boolean} Whether localStorage is available */
let storageAvailable = true;

/**
 * Detect whether localStorage is available and usable.
 * Sets a test key, reads it back, then cleans up.
 * @returns {boolean} true if localStorage is functional
 */
function checkStorageAvailability() {
  try {
    const key = '__storage_test__';
    localStorage.setItem(key, '1');
    const value = localStorage.getItem(key);
    localStorage.removeItem(key);
    return value === '1';
  } catch {
    return false;
  }
}

/**
 * In-memory fallback store when localStorage is unavailable.
 * @type {import('./app').Task[]}
 */
let memoryStore = [];

// Initialize storage check
storageAvailable = checkStorageAvailability();

if (!storageAvailable) {
  // localStorage unavailable, using in-memory fallback
}

/**
 * Read and parse tasks from storage (localStorage or in-memory fallback).
 * @returns {Task[]} Array of task objects
 */
function getTasks() {
  if (storageAvailable) {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const tasks = JSON.parse(raw);
      return Array.isArray(tasks) ? tasks : [];
    } catch (_e) {
      return [];
    }
  }
  return memoryStore;
}

/**
 * Serialize and write tasks to storage (localStorage or in-memory fallback).
 * @param {Task[]} tasks - Array of task objects
 */
function saveTasks(tasks) {
  if (storageAvailable) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (_e) {
      // localStorage write failed (quota exceeded, etc.)
    }
  } else {
    memoryStore = tasks;
  }
}
