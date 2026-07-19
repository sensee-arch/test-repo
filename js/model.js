/**
 * model.js — TodoItem data model & LocalStorageRepository
 *
 * Domain model, repository interface, and persistence layer
 * for the ToDo List web application.
 */

/* ───────── TodoItem ───────── */

class TodoItem {
  /**
   * @param {Object} data
   * @param {string} [data.id]          — auto-generated when omitted
   * @param {string} data.title
   * @param {boolean} [data.completed=false]
   * @param {string} [data.createdAt]   — ISO string, auto-generated
   * @param {string} [data.updatedAt]   — ISO string, auto-generated
   */
  constructor({ id, title, completed = false, createdAt, updatedAt }) {
    this.id       = id || self.crypto.randomUUID();
    this.title    = typeof title === 'string' ? title.trim() : '';
    this.completed= completed;
    this.createdAt= createdAt || new Date().toISOString();
    this.updatedAt= updatedAt || new Date().toISOString();
  }

  /* ── Validation ── */

  /**
   * Validate raw input before creating/updating a TodoItem.
   * @param {Object} data
   * @param {string} data.title
   * @returns {{ valid: boolean, error?: string }}
   */
  static validate(data) {
    if (!data || typeof data.title !== 'string') {
      return { valid: false, error: 'Title is required.' };
    }
    const trimmed = data.title.trim();
    if (trimmed.length === 0) {
      return { valid: false, error: 'Title cannot be empty.' };
    }
    if (trimmed.length > 200) {
      return { valid: false, error: 'Title must not exceed 200 characters.' };
    }
    return { valid: true };
  }

  /* ── Behaviour ── */

  toggle() {
    this.completed = !this.completed;
    this.updatedAt = new Date().toISOString();
  }

  updateTitle(title) {
    const trimmed = title.trim();
    if (trimmed.length > 0 && trimmed.length <= 200) {
      this.title = trimmed;
      this.updatedAt = new Date().toISOString();
    }
  }

  /* ── Serialisation ── */

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      completed: this.completed,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

/* ───────── ITodoRepository ───────── */
/* (Conceptual interface – JavaScript doesn't enforce it at runtime.
 *  Concrete implementations should expose these methods.)                     */

/* ───────── LocalStorageRepository ───────── */

const STORAGE_KEY = 'todolist_data';

class LocalStorageRepository {

  constructor(key = STORAGE_KEY) {
    this._key = key;
  }

  /* ── Read ── */

  /** @returns {TodoItem[]} */
  getAll() {
    try {
      const raw = localStorage.getItem(this._key);
      if (!raw) return [];
      const arr = JSON.parse(raw);
      if (!Array.isArray(arr)) return [];
      return arr.map(item => new TodoItem(item));
    } catch (e) {
      console.warn('[LocalStorageRepository] Failed to read data:', e.message);
      return [];
    }
  }

  /** @param {string} id @returns {TodoItem|null} */
  getById(id) {
    return this.getAll().find(t => t.id === id) || null;
  }

  /* ── Write ── */

  /**
   * Persist the full array.
   * @param {TodoItem[]} todos
   * @returns {boolean} success
   */
  saveAll(todos) {
    try {
      localStorage.setItem(this._key, JSON.stringify(todos.map(t => t.toJSON())));
      return true;
    } catch (e) {
      console.error('[LocalStorageRepository] Failed to save data:', e.message);
      return false;
    }
  }

  /** @param {TodoItem} todo */
  add(todo) {
    const list = this.getAll();
    list.push(todo);
    this.saveAll(list);
    return todo;
  }

  /** @param {TodoItem} todo @returns {boolean} */
  update(todo) {
    const list = this.getAll();
    const idx = list.findIndex(t => t.id === todo.id);
    if (idx === -1) return false;
    list[idx] = todo;
    return this.saveAll(list);
  }

  /** @param {string} id @returns {boolean} */
  remove(id) {
    const list = this.getAll();
    const filtered = list.filter(t => t.id !== id);
    return filtered.length < list.length && this.saveAll(filtered);
  }

  /** Remove all completed items. @returns {number} number removed */
  removeCompleted() {
    const list = this.getAll();
    const active = list.filter(t => !t.completed);
    const removed = list.length - active.length;
    if (removed > 0) this.saveAll(active);
    return removed;
  }

  /** Wipe everything. */
  clear() {
    localStorage.removeItem(this._key);
  }
}
