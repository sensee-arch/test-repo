/**
 * ToDo List — Model Layer
 *
 * Responsibilities:
 *  - TodoItem data model with full input validation
 *  - ITodoRepository interface contract
 *  - LocalStorageRepository implementation with edge case handling:
 *    corrupted data recovery, quota overflow, duplicate ID prevention
 */

const STORAGE_KEY = 'todolist_data';
const TITLE_MAX_LENGTH = 200;

/* ── Data Model ──────────────────────────────────────────── */

class TodoItem {
  /**
   * @param {string} title
   * @param {object} [options]
   * @param {string}  [options.id]          — auto-generated if omitted
   * @param {boolean} [options.completed=false]
   * @param {string}  [options.createdAt]   — ISO string, auto if omitted
   * @param {string}  [options.updatedAt]   — ISO string, auto if omitted
   */
  constructor(title, options = {}) {
    if (!title || typeof title !== 'string') {
      throw new ValidationError('Title is required and must be a string');
    }
    this.title = title.trim();
    if (this.title.length === 0) {
      throw new ValidationError('Title cannot be empty');
    }
    if (this.title.length > TITLE_MAX_LENGTH) {
      throw new ValidationError(`Title must be at most ${TITLE_MAX_LENGTH} characters`);
    }

    this.id = options.id || crypto.randomUUID();
    this.completed = Boolean(options.completed);
    this.createdAt = options.createdAt || new Date().toISOString();
    this.updatedAt = options.updatedAt || this.createdAt;
  }

  /** Toggle completion state in place */
  toggle() {
    this.completed = !this.completed;
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Update title with validation
   * @param {string} newTitle
   */
  setTitle(newTitle) {
    if (!newTitle || typeof newTitle !== 'string') {
      throw new ValidationError('Title is required and must be a string');
    }
    const trimmed = newTitle.trim();
    if (trimmed.length === 0) {
      throw new ValidationError('Title cannot be empty');
    }
    if (trimmed.length > TITLE_MAX_LENGTH) {
      throw new ValidationError(`Title must be at most ${TITLE_MAX_LENGTH} characters`);
    }
    this.title = trimmed;
    this.updatedAt = new Date().toISOString();
  }

  /** Serialize to plain JSON-safe object */
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      completed: this.completed,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  /** Deserialize from plain object */
  static fromJSON(data) {
    return new TodoItem(data.title, {
      id: data.id,
      completed: data.completed,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }
}

/* ── Custom Error ────────────────────────────────────────── */

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

/* ── Repository Interface (contract documentation) ───────── */

/**
 * @interface ITodoRepository
 *
 * getAll()           → TodoItem[]
 * getById(id)        → TodoItem | null
 * add(item)          → void
 * update(item)       → void
 * remove(id)         → boolean
 * clear()            → void
 * count()            → number
 * getActiveCount()   → number
 */

/* ── LocalStorage Implementation ─────────────────────────── */

class LocalStorageRepository {
  /**
   * @param {string} [storageKey=STORAGE_KEY]
   */
  constructor(storageKey = STORAGE_KEY) {
    this._storageKey = storageKey;
    this._items = [];
    this._lastError = null;
    this._load();
  }

  /** @returns {string|null} Last error message, if any */
  get lastError() {
    return this._lastError;
  }

  /* ── Read ──────────────────────────────────────────────── */

  /** @returns {TodoItem[]} */
  getAll() {
    return [...this._items];
  }

  /** @param {string} id @returns {TodoItem|null} */
  getById(id) {
    return this._items.find((item) => item.id === id) || null;
  }

  /** @returns {number} */
  count() {
    return this._items.length;
  }

  /** @returns {number} */
  getActiveCount() {
    return this._items.filter((item) => !item.completed).length;
  }

  /* ── Write ─────────────────────────────────────────────── */

  /**
   * @param {TodoItem} item
   * @throws {ValidationError} on invalid item
   * @throws {Error} on duplicate ID or storage failure
   */
  add(item) {
    if (!(item instanceof TodoItem)) {
      throw new ValidationError('Item must be a TodoItem instance');
    }
    // Validate eagerly
    new TodoItem(item.title, item); // throws on invalid

    // Duplicate ID check
    if (this._items.some((i) => i.id === item.id)) {
      throw new Error(`Conflict: item with id "${item.id}" already exists`);
    }

    this._items.push(item);
    this._persist();
  }

  /**
   * @param {TodoItem} item
   * @throws {ValidationError} on invalid item
   * @throws {Error} if item not found or storage fails
   */
  update(item) {
    if (!(item instanceof TodoItem)) {
      throw new ValidationError('Item must be a TodoItem instance');
    }
    const idx = this._items.findIndex((i) => i.id === item.id);
    if (idx === -1) {
      throw new Error(`Item with id "${item.id}" not found`);
    }
    item.updatedAt = new Date().toISOString();
    this._items[idx] = item;
    this._persist();
  }

  /**
   * @param {string} id
   * @returns {boolean} true if an item was removed
   */
  remove(id) {
    const len = this._items.length;
    this._items = this._items.filter((item) => item.id !== id);
    const removed = this._items.length < len;
    if (removed) this._persist();
    return removed;
  }

  /** Remove all items */
  clear() {
    this._items = [];
    this._lastError = null;
    this._persist();
  }

  /* ── Storage Helpers ───────────────────────────────────── */

  _load() {
    try {
      const raw = localStorage.getItem(this._storageKey);
      if (!raw) {
        this._items = [];
        return;
      }
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        console.warn('ToDo: stored data is not an array — resetting');
        this._items = [];
        this._persist();
        return;
      }
      this._items = parsed
        .filter((data) => data && typeof data.title === 'string')
        .map((data) => {
          try {
            return TodoItem.fromJSON(data);
          } catch {
            return null;
          }
        })
        .filter(Boolean);
    } catch (e) {
      console.error('ToDo: failed to load from localStorage — resetting:', e.message);
      this._items = [];
    }
    this._lastError = null;
  }

  _persist() {
    try {
      localStorage.setItem(this._storageKey, JSON.stringify(this._items.map((i) => i.toJSON())));
      this._lastError = null;
    } catch (e) {
      // QuotaExceededError or other storage failure
      this._lastError = e.name === 'QuotaExceededError'
        ? 'Storage is full. Delete some items to free up space.'
        : `Failed to save: ${e.message}`;
      console.error('ToDo: persist failed:', e.message);
      throw new Error(this._lastError);
    }
  }

  /** Check if storage is available */
  static isStorageAvailable() {
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

/* ── Exports (for module environments) ───────────────────── */

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TodoItem, LocalStorageRepository, ValidationError, STORAGE_KEY, TITLE_MAX_LENGTH };
}
