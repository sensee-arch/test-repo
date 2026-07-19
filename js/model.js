/**
 * ToDo List — Model Layer
 *
 * Responsibilities:
 * - TodoItem data model with validation
 * - ITodoRepository interface (contract)
 * - LocalStorageRepository implementation
 * - Data persistence via localStorage
 */

const STORAGE_KEY = 'todolist_data';

/* ── Data Model ─────────────────────────────────────────── */

class TodoItem {
  /**
   * @param {string} title - Task description
   * @param {string} [id] - Unique ID (auto-generated if omitted)
   * @param {boolean} [completed=false]
   * @param {number} [createdAt] - Unix ms timestamp
   */
  constructor(title, id = null, completed = false, createdAt = null) {
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      throw new Error('title is required and must be a non-empty string');
    }
    if (title.trim().length > 500) {
      throw new Error('title must not exceed 500 characters');
    }
    this.id = id || crypto.randomUUID();
    this.title = title.trim();
    this.completed = Boolean(completed);
    this.createdAt = createdAt || Date.now();
  }

  /** Toggle completion state */
  toggle() {
    this.completed = !this.completed;
  }

  /**
   * Update title with validation
   * @param {string} newTitle
   */
  updateTitle(newTitle) {
    if (!newTitle || typeof newTitle !== 'string' || newTitle.trim().length === 0) {
      throw new Error('title is required and must be a non-empty string');
    }
    if (newTitle.trim().length > 500) {
      throw new Error('title must not exceed 500 characters');
    }
    this.title = newTitle.trim();
  }

  /** Serialize to plain object */
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      completed: this.completed,
      createdAt: this.createdAt,
    };
  }

  /** Deserialize from plain object */
  static fromJSON(data) {
    return new TodoItem(data.title, data.id, data.completed, data.createdAt);
  }
}

/* ── Repository Interface ────────────────────────────────── */

/**
 * @interface ITodoRepository
 *
 * Contract for data persistence. Implementations must provide:
 *   getAll()               → TodoItem[]
 *   getById(id)            → TodoItem | null
 *   add(item)              → void
 *   update(item)           → void
 *   remove(id)             → void
 *   clear()                → void
 *   count()                → number
 *   getUncompletedCount()  → number
 */

/* ── LocalStorage Implementation ─────────────────────────── */

class LocalStorageRepository {
  constructor() {
    this._items = [];
    this._load();
  }

  /** Load items from localStorage */
  _load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          this._items = parsed.map((data) => TodoItem.fromJSON(data));
        }
      }
    } catch {
      this._items = [];
    }
  }

  /** Persist items to localStorage */
  _save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this._items.map((item) => item.toJSON())));
  }

  /** @returns {TodoItem[]} */
  getAll() {
    return [...this._items];
  }

  /** @param {string} id @returns {TodoItem|null} */
  getById(id) {
    return this._items.find((item) => item.id === id) || null;
  }

  /** @param {TodoItem} item */
  add(item) {
    if (!(item instanceof TodoItem)) {
      throw new Error('item must be an instance of TodoItem');
    }
    this._items.push(item);
    this._save();
  }

  /** @param {TodoItem} item */
  update(item) {
    const idx = this._items.findIndex((i) => i.id === item.id);
    if (idx === -1) {
      throw new Error(`TodoItem with id "${item.id}" not found`);
    }
    this._items[idx] = item;
    this._save();
  }

  /** @param {string} id */
  remove(id) {
    const len = this._items.length;
    this._items = this._items.filter((item) => item.id !== id);
    if (this._items.length === len) return;
    this._save();
  }

  /** Remove all items */
  clear() {
    this._items = [];
    this._save();
  }

  /** @returns {number} */
  count() {
    return this._items.length;
  }

  /** @returns {number} */
  getUncompletedCount() {
    return this._items.filter((item) => !item.completed).length;
  }
}

/* ── Exports (for test / module use) ─────────────────────── */

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TodoItem, LocalStorageRepository, STORAGE_KEY };
}
