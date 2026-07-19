/* ── Storage Layer ──
 * localStorage read/write with JSON serialization and error handling.
 * Data format: { id: string, title: string, completed: boolean, createdAt: number }
 */

const STORAGE_KEY = 'todo_items';

const Storage = {
  /**
   * Load todo items from localStorage.
   * @returns {Array} Array of todo items; empty array on failure.
   */
  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw === null) return [];
      const items = JSON.parse(raw);
      if (!Array.isArray(items)) {
        console.warn('Storage.load: stored data is not an array, resetting');
        return [];
      }
      return items;
    } catch (err) {
      console.warn('Storage.load: failed to read from localStorage:', err.message);
      return [];
    }
  },

  /**
   * Save todo items to localStorage.
   * @param {Array} items - Array of todo items.
   * @returns {boolean} true on success, false on failure.
   */
  save(items) {
    try {
      const sanitized = Array.isArray(items) ? items : [];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
      return true;
    } catch (err) {
      console.warn('Storage.save: failed to write to localStorage:', err.message);
      return false;
    }
  },

  /**
   * Check if localStorage is available.
   * @returns {boolean}
   */
  isAvailable() {
    try {
      const key = '__storage_test__';
      localStorage.setItem(key, '1');
      localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  }
};
