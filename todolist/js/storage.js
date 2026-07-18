/**
 * Storage Module — localStorage abstraction layer
 *
 * Exposes a minimal CRUD interface for todo tasks via an IIFE.
 * Data is stored under a single key as a JSON array.
 *
 * @module Store
 */

const Store = (function () {
  'use strict';

  /* ─── Constants ─── */

  const STORAGE_KEY = 'todolist_tasks';

  /* ─── Validation ─── */

  /**
   * Validate a task object structure.
   * @param {*} task
   * @returns {boolean}
   */
  function isValidTask(task) {
    return (
      task &&
      typeof task.id === 'string' &&
      typeof task.title === 'string' &&
      task.title.trim().length > 0 &&
      typeof task.completed === 'boolean'
    );
  }

  /**
   * Sanitize an array of tasks — filter out invalid entries.
   * @param {Array} arr
   * @returns {Task[]}
   */
  function sanitize(arr) {
    if (!Array.isArray(arr)) return [];
    return arr.filter(isValidTask);
  }

  /* ─── Storage I/O ─── */

  /**
   * Read and parse tasks from localStorage.
   * @returns {Task[]}
   */
  function getTasks() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return sanitize(parsed);
    } catch (e) {
      console.warn('[Store] Failed to read from localStorage:', e);
      return [];
    }
  }

  /**
   * Serialize and write tasks to localStorage.
   * @param {Task[]} tasks
   */
  function saveTasks(tasks) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {
      console.error('[Store] Failed to save to localStorage:', e);
    }
  }

  /* ─── Public API ─── */

  return {
    /**
     * Retrieve all tasks.
     * @returns {Task[]}
     */
    getAll: function () {
      return getTasks();
    },

    /**
     * Add a new task.
     * @param {string} title
     * @returns {Task|null} The created task, or null if invalid.
     */
    add: function (title) {
      const trimmed = (title || '').trim();
      if (!trimmed) return null;

      const task = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        title: trimmed,
        completed: false,
        createdAt: new Date().toISOString(),
      };

      const tasks = getTasks();
      tasks.push(task);
      saveTasks(tasks);
      return task;
    },

    /**
     * Update a task's title.
     * @param {string} id
     * @param {string} newTitle
     * @returns {boolean} Whether the update succeeded.
     */
    update: function (id, newTitle) {
      const trimmed = (newTitle || '').trim();
      if (!id || !trimmed) return false;

      const tasks = getTasks();
      const idx = tasks.findIndex((t) => t.id === id);
      if (idx === -1) return false;

      tasks[idx].title = trimmed;
      saveTasks(tasks);
      return true;
    },

    /**
     * Delete a task by id.
     * @param {string} id
     * @returns {boolean} Whether the deletion succeeded.
     */
    delete: function (id) {
      if (!id) return false;

      const tasks = getTasks();
      const len = tasks.length;
      const filtered = tasks.filter((t) => t.id !== id);
      if (filtered.length === len) return false;

      saveTasks(filtered);
      return true;
    },

    /**
     * Toggle a task's completed state.
     * @param {string} id
     * @returns {boolean} The new completed state, or null if not found.
     */
    toggle: function (id) {
      if (!id) return null;

      const tasks = getTasks();
      const task = tasks.find((t) => t.id === id);
      if (!task) return null;

      task.completed = !task.completed;
      saveTasks(tasks);
      return task.completed;
    },

    /**
     * Remove all completed tasks.
     * @returns {number} Number of removed tasks.
     */
    clearCompleted: function () {
      const tasks = getTasks();
      const remaining = tasks.filter((t) => !t.completed);
      const removed = tasks.length - remaining.length;
      if (removed > 0) saveTasks(remaining);
      return removed;
    },

    /**
     * Get count of tasks matching a filter.
     * @param {'all'|'active'|'completed'} filter
     * @returns {number}
     */
    count: function (filter) {
      const tasks = getTasks();
      if (filter === 'active') return tasks.filter((t) => !t.completed).length;
      if (filter === 'completed') return tasks.filter((t) => t.completed).length;
      return tasks.length;
    },
  };
})();
