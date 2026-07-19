// js/model.js — Data Model & Repository

class TodoItem {
  constructor({ id, title, completed = false, createdAt, updatedAt } = {}) {
    this.id = id ?? crypto.randomUUID();
    this.title = title;
    this.completed = completed;
    this.createdAt = createdAt ?? Date.now();
    this.updatedAt = updatedAt ?? Date.now();
    this.validate();
  }

  validate() {
    if (!this.title || typeof this.title !== 'string' || this.title.trim().length === 0) {
      throw new Error('Title is required and must be a non-empty string');
    }
    if (this.title.trim().length > 500) {
      throw new Error('Title must not exceed 500 characters');
    }
  }

  toggle() {
    this.completed = !this.completed;
    this.updatedAt = Date.now();
  }

  updateTitle(newTitle) {
    const trimmed = newTitle.trim();
    if (!trimmed) throw new Error('Title cannot be empty');
    this.title = trimmed;
    this.updatedAt = Date.now();
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      completed: this.completed,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  static fromJSON(data) {
    return new TodoItem(data);
  }
}

/**
 * ITodoRepository — interface documentation
 *
 * Methods:
 *   getAll()               : TodoItem[]
 *   getById(id)            : TodoItem | null
 *   create(todoData)       : TodoItem
 *   update(id, data)       : TodoItem
 *   patch(id, partial)     : TodoItem
 *   delete(id)             : boolean
 *   clear()                : void
 *   getStats()             : { total, active, completed }
 */

class LocalStorageRepository {
  #STORAGE_KEY = 'todolist_data';

  constructor() {
    this.#ensureStorage();
  }

  // ── private helpers ──────────────────────────────────────────

  #ensureStorage() {
    if (!localStorage.getItem(this.#STORAGE_KEY)) {
      localStorage.setItem(this.#STORAGE_KEY, JSON.stringify([]));
    }
  }

  #readAll() {
    try {
      const raw = localStorage.getItem(this.#STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(parsed)) throw new Error('Corrupt data');
      return parsed;
    } catch {
      localStorage.setItem(this.#STORAGE_KEY, JSON.stringify([]));
      return [];
    }
  }

  #writeAll(items) {
    localStorage.setItem(this.#STORAGE_KEY, JSON.stringify(items));
  }

  // ── CRUD ─────────────────────────────────────────────────────

  getAll() {
    return this.#readAll().map(d => TodoItem.fromJSON(d));
  }

  getById(id) {
    const items = this.#readAll();
    const found = items.find(i => i.id === id);
    return found ? TodoItem.fromJSON(found) : null;
  }

  create(todoData) {
    const item = new TodoItem(todoData);
    const items = this.#readAll();
    items.push(item.toJSON());
    this.#writeAll(items);
    return item;
  }

  update(id, data) {
    const items = this.#readAll();
    const idx = items.findIndex(i => i.id === id);
    if (idx === -1) throw new Error(`TodoItem with id ${id} not found`);
    const updated = TodoItem.fromJSON({ ...items[idx], ...data, id, updatedAt: Date.now() });
    items[idx] = updated.toJSON();
    this.#writeAll(items);
    return updated;
  }

  patch(id, partial) {
    const items = this.#readAll();
    const idx = items.findIndex(i => i.id === id);
    if (idx === -1) throw new Error(`TodoItem with id ${id} not found`);
    const existing = items[idx];
    const updated = TodoItem.fromJSON({ ...existing, ...partial, id, updatedAt: Date.now() });
    items[idx] = updated.toJSON();
    this.#writeAll(items);
    return updated;
  }

  delete(id) {
    const items = this.#readAll();
    const idx = items.findIndex(i => i.id === id);
    if (idx === -1) return false;
    items.splice(idx, 1);
    this.#writeAll(items);
    return true;
  }

  clear() {
    this.#writeAll([]);
  }

  getStats() {
    const all = this.getAll();
    return {
      total: all.length,
      active: all.filter(i => !i.completed).length,
      completed: all.filter(i => i.completed).length,
    };
  }
}
