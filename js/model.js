/**
 * Model — TodoStore
 * Encapsulates localStorage CRUD for todo items.
 * Pure data layer — no DOM references.
 */

const STORAGE_KEY = 'todolist_items';

function generateId() {
  return crypto.randomUUID?.() ??
    'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function isValidTitle(title) {
  return typeof title === 'string' && title.trim().length > 0;
}

function loadItems() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveItems(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    return true;
  } catch (e) {
    if (e.name === 'QuotaExceededError' || e.code === 22) {
      throw new Error('Storage quota exceeded. Please delete some items.');
    }
    throw new Error('Unable to save data. localStorage may be disabled.');
  }
}

export class TodoStore {
  static get STORAGE_KEY() {
    return STORAGE_KEY;
  }

  /**
   * Get all items, sorted by createdAt descending.
   * @returns {Array<Object>}
   */
  getAll() {
    return loadItems().sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  }

  /**
   * Get a single item by ID.
   * @param {string} id
   * @returns {Object|null}
   */
  getById(id) {
    return loadItems().find((item) => item.id === id) ?? null;
  }

  /**
   * Create a new todo item.
   * @param {string} title
   * @returns {Object} The created item
   * @throws {Error} If title is invalid
   */
  create(title) {
    if (!isValidTitle(title)) {
      throw new Error('Title must be a non-empty string.');
    }

    const now = new Date().toISOString();
    const item = {
      id: generateId(),
      title: title.trim(),
      completed: false,
      createdAt: now,
      updatedAt: now,
    };

    const items = loadItems();
    items.push(item);
    saveItems(items);
    return item;
  }

  /**
   * Partial update of a todo item.
   * @param {string} id
   * @param {Object} data - Fields to update
   * @returns {Object|null} Updated item or null if not found
   */
  update(id, data) {
    const items = loadItems();
    const idx = items.findIndex((item) => item.id === id);
    if (idx === -1) return null;

    const updated = {
      ...items[idx],
      ...data,
      id: items[idx].id, // id is immutable
      updatedAt: new Date().toISOString(),
    };

    items[idx] = updated;
    saveItems(items);
    return updated;
  }

  /**
   * Delete a todo item by ID.
   * @param {string} id
   * @returns {boolean} True if deleted
   */
  delete(id) {
    const items = loadItems();
    const filtered = items.filter((item) => item.id !== id);
    if (filtered.length === items.length) return false;
    saveItems(filtered);
    return true;
  }

  /**
   * Toggle the completed status of an item.
   * @param {string} id
   * @returns {Object|null}
   */
  toggle(id) {
    const item = this.getById(id);
    if (!item) return null;
    return this.update(id, { completed: !item.completed });
  }

  /**
   * Check localStorage availability.
   * @returns {boolean}
   */
  static isAvailable() {
    try {
      const key = '__storage_test__';
      localStorage.setItem(key, '1');
      localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  }
}

export { escapeHtml };
