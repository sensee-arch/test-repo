/* =============================================================
   ToDo List — Model Layer
   Tech: Vanilla JavaScript ES6+, localStorage persistence
   ============================================================= */

const STORAGE_KEY = 'todolist_data';

/* ---------- UUID v4 Generator ---------- */
function _generateId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

/* ---------- Storage Availability Check ---------- */
function _isStorageAvailable() {
  try {
    const key = '__storage_test__';
    localStorage.setItem(key, '1');
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

const STORAGE_AVAILABLE = _isStorageAvailable();

/* =============================================================
   TodoItem — Data Model Class
   ============================================================= */
class TodoItem {
  /**
   * @param {string} title
   * @param {object} [options]
   * @param {string} [options.id]
   * @param {boolean} [options.completed]
   * @param {string} [options.createdAt]
   * @param {string} [options.updatedAt]
   */
  constructor(title, options = {}) {
    this.id = options.id || _generateId();
    this.title = TodoItem.sanitizeTitle(title);
    this.completed = options.completed || false;
    this.createdAt = options.createdAt || new Date().toISOString();
    this.updatedAt = options.updatedAt || this.createdAt;
  }

  /**
   * @returns {{ id: string, title: string, completed: boolean, createdAt: string, updatedAt: string }}
   */
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      completed: this.completed,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  /**
   * Create a TodoItem from a plain object.
   * @param {object} data
   * @returns {TodoItem}
   */
  static fromJSON(data) {
    const item = new TodoItem(data.title || '', {
      id: data.id,
      completed: data.completed,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
    return item;
  }

  /**
   * Validate a title string.
   * @param {*} title
   * @returns {boolean}
   */
  static validateTitle(title) {
    if (typeof title !== 'string') return false;
    const trimmed = title.trim();
    return trimmed.length > 0 && trimmed.length <= 500;
  }

  /**
   * Sanitize a title (trim whitespace).
   * @param {string} title
   * @returns {string}
   */
  static sanitizeTitle(title) {
    return String(title).trim();
  }
}

/* =============================================================
   ITodoRepository — Interface (documentation only in JS)
   Methods: getAll(), getById(id), add(todoItem), update(id, fields),
            delete(id), clearCompleted()
   ============================================================= */

/* =============================================================
   LocalStorageRepository — Concrete Implementation
   ============================================================= */
class LocalStorageRepository {
  /**
   * @param {string} [storageKey]
   */
  constructor(storageKey = STORAGE_KEY) {
    this._storageKey = storageKey;
    this._available = STORAGE_AVAILABLE;
  }

  /** @returns {boolean} */
  isAvailable() {
    return this._available;
  }

  /**
   * Load all items from localStorage.
   * @returns {TodoItem[]}
   */
  getAll() {
    if (!this._available) return [];
    try {
      const raw = localStorage.getItem(this._storageKey);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.map((d) => TodoItem.fromJSON(d));
    } catch {
      console.warn('LocalStorageRepository: failed to parse stored data, returning empty.');
      return [];
    }
  }

  /**
   * Find a single item by id.
   * @param {string} id
   * @returns {TodoItem|null}
   */
  getById(id) {
    const items = this.getAll();
    return items.find((item) => item.id === id) || null;
  }

  /**
   * Add a new item.
   * @param {TodoItem} todoItem
   * @returns {TodoItem} The added item
   */
  add(todoItem) {
    const items = this.getAll();
    items.push(todoItem);
    this._persist(items);
    return todoItem;
  }

  /**
   * Partially update an existing item.
   * @param {string} id
   * @param {object} fields - Allowed: { title?, completed? }
   * @returns {TodoItem|null} Updated item, or null if not found
   */
  update(id, fields) {
    const items = this.getAll();
    const idx = items.findIndex((item) => item.id === id);
    if (idx === -1) return null;

    if (fields.title !== undefined) {
      if (!TodoItem.validateTitle(fields.title)) return null;
      items[idx].title = TodoItem.sanitizeTitle(fields.title);
    }

    if (fields.completed !== undefined) {
      items[idx].completed = Boolean(fields.completed);
    }

    items[idx].updatedAt = new Date().toISOString();
    this._persist(items);
    return items[idx];
  }

  /**
   * Toggle completed status.
   * @param {string} id
   * @returns {TodoItem|null}
   */
  toggle(id) {
    const items = this.getAll();
    const item = items.find((t) => t.id === id);
    if (!item) return null;
    item.completed = !item.completed;
    item.updatedAt = new Date().toISOString();
    this._persist(items);
    return item;
  }

  /**
   * Delete an item by id.
   * @param {string} id
   * @returns {boolean} Whether an item was actually removed
   */
  delete(id) {
    const items = this.getAll();
    const filtered = items.filter((item) => item.id !== id);
    if (filtered.length === items.length) return false;
    this._persist(filtered);
    return true;
  }

  /**
   * Remove all completed items.
   * @returns {number} Count of removed items
   */
  clearCompleted() {
    const items = this.getAll();
    const remaining = items.filter((item) => !item.completed);
    const removed = items.length - remaining.length;
    if (removed > 0) {
      this._persist(remaining);
    }
    return removed;
  }

  /* ---------- Private ---------- */

  /**
   * @param {TodoItem[]} items
   */
  _persist(items) {
    if (!this._available) return;
    try {
      const serialized = JSON.stringify(items.map((item) => item.toJSON()));
      localStorage.setItem(this._storageKey, serialized);
    } catch (e) {
      console.warn('LocalStorageRepository: failed to persist data.', e.message);
    }
  }
}
