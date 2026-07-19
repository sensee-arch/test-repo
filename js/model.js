/* =============================================
   ToDo List App — Model Layer
   ============================================= */

/**
 * Generate a short 8-character alphanumeric ID.
 * @returns {string}
 */
function generateId() {
  return Math.random().toString(36).substring(2, 10);
}

/**
 * Validate a todo item creation payload.
 * @param {{ title: string }} data
 * @returns {{ valid: boolean, error?: string }}
 */
function validateTodoInput(data) {
  if (!data || typeof data.title !== 'string') {
    return { valid: false, error: 'Title must be a string.' };
  }
  const title = data.title.trim();
  if (title.length === 0) {
    return { valid: false, error: 'Title cannot be empty.' };
  }
  if (title.length > 500) {
    return { valid: false, error: 'Title must be 500 characters or fewer.' };
  }
  return { valid: true };
}

/**
 * Create a new TodoItem object.
 * @param {string} title
 * @returns {object} { id, title, completed, createdAt }
 */
function createTodoItem(title) {
  return {
    id: generateId(),
    title: title.trim(),
    completed: false,
    createdAt: Date.now(),
  };
}

/**
 * Interface: ITodoRepository
 *
 * Implementations must provide:
 *   getAll()          → TodoItem[]
 *   getById(id)       → TodoItem | undefined
 *   add(item)         → void
 *   update(item)      → void
 *   remove(id)        → void
 *   clearCompleted()  → number (count removed)
 */

/**
 * LocalStorage-backed implementation of ITodoRepository.
 */
class LocalStorageRepository {
  /**
   * @param {string} [storageKey='todo_items']
   */
  constructor(storageKey = 'todo_items') {
    this.storageKey = storageKey;
  }

  /**
   * Read all items from localStorage.
   * @returns {Array}
   */
  getAll() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        console.warn('LocalStorageRepository: stored data is not an array — resetting.');
        this._save([]);
        return [];
      }
      return parsed;
    } catch (err) {
      console.warn('LocalStorageRepository: failed to read —', err.message);
      return [];
    }
  }

  /**
   * Find an item by id.
   * @param {string} id
   * @returns {object|undefined}
   */
  getById(id) {
    return this.getAll().find((item) => item.id === id);
  }

  /**
   * Add a new item.
   * @param {object} item
   */
  add(item) {
    if (!item || !item.id) {
      console.warn('LocalStorageRepository: invalid item — ignored.');
      return;
    }
    const items = this.getAll();
    items.push(item);
    this._save(items);
  }

  /**
   * Update an existing item (merge by id).
   * @param {object} updatedItem
   */
  update(updatedItem) {
    if (!updatedItem || !updatedItem.id) return;
    const items = this.getAll();
    const index = items.findIndex((item) => item.id === updatedItem.id);
    if (index === -1) {
      console.warn('LocalStorageRepository: item not found for update —', updatedItem.id);
      return;
    }
    items[index] = { ...items[index], ...updatedItem };
    this._save(items);
  }

  /**
   * Remove an item by id.
   * @param {string} id
   */
  remove(id) {
    const items = this.getAll();
    const filtered = items.filter((item) => item.id !== id);
    if (filtered.length === items.length) {
      console.warn('LocalStorageRepository: item not found for removal —', id);
      return;
    }
    this._save(filtered);
  }

  /**
   * Remove all completed items.
   * @returns {number} number of removed items
   */
  clearCompleted() {
    const items = this.getAll();
    const active = items.filter((item) => !item.completed);
    const removed = items.length - active.length;
    if (removed > 0) {
      this._save(active);
    }
    return removed;
  }

  /**
   * Persist the full array to localStorage.
   * @param {Array} items
   * @private
   */
  _save(items) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(items));
    } catch (err) {
      console.warn('LocalStorageRepository: failed to save —', err.message);
    }
  }
}
