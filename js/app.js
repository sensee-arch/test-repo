/**
 * ToDo List — Controller Layer
 *
 * Responsibilities:
 *  - Coordinate Model (LocalStorageRepository) and View (TodoView)
 *  - Handle user interactions (add, toggle, delete, edit, filter)
 *  - Manage filter state
 *  - Cross-tab synchronisation via the storage event
 *  - Recover from edge cases (corrupted data, quota overflow)
 */

class TodoController {
  constructor() {
    this._repo    = new LocalStorageRepository();
    this._view    = new TodoView(document.getElementById('app'));
    this._filter  = 'all'; // 'all' | 'active' | 'completed'

    this._bindEvents();
    this._watchCrossTab();
    this._render();
    this._checkStorageHealth();
  }

  /* ── Initialisation ────────────────────────────────────── */

  _bindEvents() {
    this._view.bindEvents({
      onSubmit:    (title) => this._addTodo(title),
      onToggle:    (id)    => this._toggleTodo(id),
      onDelete:    (id)    => this._deleteTodo(id),
      onEdit:      (id)    => this._editTodo(id),
      onFilter:    (f)     => this._setFilter(f),
      onClearDone: ()      => this._clearCompleted(),
    });
  }

  /**
   * Listen for storage changes from other tabs
   * and re-render when data changes externally.
   */
  _watchCrossTab() {
    window.addEventListener('storage', (e) => {
      if (e.key === STORAGE_KEY) {
        // Reload from localStorage and re-render
        this._repo = new LocalStorageRepository();
        this._render();
      }
    });
  }

  /* ── Actions ───────────────────────────────────────────── */

  /**
   * @param {string} title
   */
  _addTodo(title) {
    try {
      const item = new TodoItem(title);
      this._repo.add(item);
      this._view.clearInput();
      this._render();
    } catch (err) {
      this._view.showHint(err.message, true);
      this._view.showToast(`❌ ${err.message}`);
    }
    this._checkStorageHealth();
  }

  /**
   * @param {string} id
   */
  _toggleTodo(id) {
    const item = this._repo.getById(id);
    if (!item) return;
    item.toggle();
    try {
      this._repo.update(item);
      this._render();
    } catch (err) {
      this._view.showToast(`⚠️ ${err.message}`);
    }
  }

  /**
   * @param {string} id
   */
  _deleteTodo(id) {
    if (!this._view.confirmDelete()) return;

    // Remove from DOM with animation first
    this._view.removeItemElement(id, () => {
      // After animation completes, remove from storage
      this._repo.remove(id);
      this._render();
      this._checkStorageHealth();
    });
  }

  /**
   * @param {string} id
   */
  _editTodo(id) {
    const item = this._repo.getById(id);
    if (!item) return;

    const newTitle = this._view.promptEdit(item.title);
    if (newTitle === null) return; // cancelled

    try {
      item.setTitle(newTitle);
      this._repo.update(item);
      this._render();
    } catch (err) {
      this._view.showHint(err.message, true);
      this._view.showToast(`❌ ${err.message}`);
    }
  }

  /**
   * @param {string} filter
   */
  _setFilter(filter) {
    this._filter = filter;
    this._render();
  }

  _clearCompleted() {
    if (!this._view.confirmClearCompleted()) return;

    const items = this._repo.getAll();
    const completedIds = items.filter((i) => i.completed).map((i) => i.id);

    if (completedIds.length === 0) return;

    completedIds.forEach((id) => this._repo.remove(id));
    this._render();
    this._checkStorageHealth();
    this._view.showToast(`✅ Cleared ${completedIds.length} completed item${completedIds.length !== 1 ? 's' : ''}`, 2500);
  }

  /* ── Query & Render ────────────────────────────────────── */

  _getFilteredItems() {
    let items = this._repo.getAll();

    if (this._filter === 'active') {
      items = items.filter((i) => !i.completed);
    } else if (this._filter === 'completed') {
      items = items.filter((i) => i.completed);
    }

    // Sort newest first
    items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return items;
  }

  _render() {
    const filtered = this._getFilteredItems();
    const total    = this._repo.count();
    this._view.render(filtered, total, this._filter);

    // Update the counter text to show active count
    const active = this._repo.getActiveCount();
    const counterEl = this._view._itemsLeftEl;
    if (counterEl) {
      counterEl.textContent = `${active} item${active !== 1 ? 's' : ''} left`;
    }
  }

  /* ── Health checks ─────────────────────────────────────── */

  _checkStorageHealth() {
    if (this._repo.lastError) {
      this._view.showStorageWarning(true);
      this._view.showToast(`⚠️ ${this._repo.lastError}`);
    } else {
      this._view.showStorageWarning(false);
    }
  }

  /* ── Error recovery ────────────────────────────────────── */

  /**
   * Attempt to recover from corrupted storage.
   * Called externally if boot-time corruption is detected.
   */
  static recoverFromCorruption() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return; // all good

      // Corrupted: back up and reset
      localStorage.setItem(`${STORAGE_KEY}_backup`, raw);
      localStorage.removeItem(STORAGE_KEY);
      console.warn('ToDo: corrupted data backed up and reset');
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }
}

/* ── Boot ─────────────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {
  // Pre-flight: check localStorage availability
  if (!LocalStorageRepository.isStorageAvailable()) {
    const app = document.getElementById('app');
    if (app) {
      app.innerHTML = '<p role="alert" style="color:#dc2626;padding:2rem;text-align:center;">⚠️ localStorage is not available. Data cannot be saved.</p>';
    }
    console.error('ToDo: localStorage is not available');
    return;
  }

  // Pre-flight: recover from corrupted data
  TodoController.recoverFromCorruption();

  // Boot the app
  new TodoController();
});
