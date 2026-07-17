/* ============================================================
   Todo List App — app.js
   Version: v1.0
   ============================================================ */

/* ============================================================
   Module 1: Storage Layer
   IIFE wrapping localStorage with error handling.
   ============================================================ */
const Storage = (function () {
  'use strict';

  /** Key used for localStorage persistence. */
  const STORAGE_KEY = 'todo_items';

  /**
   * Read all todos from localStorage.
   * @returns {Array<{id: string, title: string, completed: boolean, createdAt: number}>}
   */
  function getTodos() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data === null) {
        return [];
      }
      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed)) {
        console.warn('Storage.getTodos: stored data is not an array, returning empty.');
        return [];
      }
      return parsed;
    } catch (err) {
      console.warn('Storage.getTodos: failed to read from localStorage.', err);
      return [];
    }
  }

  /**
   * Save todos to localStorage.
   * @param {Array} todos - Array of TodoItem objects.
   */
  function saveTodos(todos) {
    try {
      const serialized = JSON.stringify(todos);
      localStorage.setItem(STORAGE_KEY, serialized);
    } catch (err) {
      console.warn('Storage.saveTodos: failed to write to localStorage.', err);
    }
  }

  return {
    getTodos: getTodos,
    saveTodos: saveTodos,
  };
})();
