/* =============================================================
   ToDo List — Controller
   Coordinates Model ↔ View, manages filter/sort state
   ============================================================= */

class TodoController {
  /**
   * @param {LocalStorageRepository} repository
   * @param {TodoListView} view
   */
  constructor(repository, view) {
    this._repo = repository;
    this._view = view;

    /* State */
    this._filter = 'all'; // 'all' | 'active' | 'completed'
    this._sortBy = 'created'; // 'created' | 'title'

    /* Wire up View callbacks */
    this._view.onAdd = (title) => this._handleAdd(title);
    this._view.onToggle = (id) => this._handleToggle(id);
    this._view.onDelete = (id) => this._handleDelete(id);
    this._view.onEditStart = (id) => this._handleEditStart(id);
    this._view.onEditSave = (id, title) => this._handleEditSave(id, title);
    this._view.onEditCancel = () => this._handleEditCancel();
    this._view.onClearCompleted = () => this._handleClearCompleted();
    this._view.onFilterChange = (filter) => this._handleFilterChange(filter);
    this._view.onSortChange = (sortBy) => this._handleSortChange(sortBy);

    /* Check storage availability */
    if (!this._repo.isAvailable()) {
      this._view.showStorageWarning();
    }

    /* Initial render */
    this._refresh();
  }

  /* =============================================================
     Handlers
     ============================================================= */

  /**
   * Add a new task.
   * @param {string} title
   */
  _handleAdd(title) {
    if (!TodoItem.validateTitle(title)) return;
    this._repo.add(new TodoItem(title));
    this._view.clearInput();
    this._refresh();
  }

  /**
   * Toggle task completion.
   * @param {string} id
   */
  _handleToggle(id) {
    this._repo.toggle(id);
    this._cancelEditIfNeeded(id);
    this._refresh();
  }

  /**
   * Delete a task.
   * @param {string} id
   */
  _handleDelete(id) {
    this._repo.delete(id);
    this._cancelEditIfNeeded(id);
    this._refresh();
  }

  /**
   * Start inline editing.
   * @param {string} id
   */
  _handleEditStart(id) {
    this._view.editingId = id;
    this._refresh();
  }

  /**
   * Save inline edit.
   * @param {string} id
   * @param {string} title
   */
  _handleEditSave(id, title) {
    if (!TodoItem.validateTitle(title)) return;
    this._repo.update(id, { title });
    this._view.editingId = null;
    this._refresh();
  }

  /**
   * Cancel inline edit.
   */
  _handleEditCancel() {
    this._view.editingId = null;
    this._refresh();
  }

  /**
   * Clear completed tasks.
   */
  _handleClearCompleted() {
    this._repo.clearCompleted();
    this._refresh();
  }

  /**
   * Change active filter.
   * @param {string} filter
   */
  _handleFilterChange(filter) {
    this._filter = filter;
    this._refresh();
  }

  /**
   * Change sort order.
   * @param {string} sortBy
   */
  _handleSortChange(sortBy) {
    this._sortBy = sortBy;
    this._refresh();
  }

  /**
   * If currently editing the given id, cancel the edit.
   * @param {string} id
   */
  _cancelEditIfNeeded(id) {
    if (this._view.editingId === id) {
      this._view.editingId = null;
    }
  }

  /* =============================================================
     Refresh
     ============================================================= */

  /**
   * Reload data, apply filter + sort, and re-render.
   */
  _refresh() {
    const allItems = this._repo.getAll();
    const filtered = this._applyFilter(allItems);
    const sorted = this._applySort(filtered);
    const stats = this._computeStats(allItems);
    const hasCompleted = allItems.some((item) => item.completed);

    this._view.render(sorted, stats, this._filter, hasCompleted);
  }

  /**
   * Filter items by current filter state.
   * @param {TodoItem[]} items
   * @returns {TodoItem[]}
   */
  _applyFilter(items) {
    switch (this._filter) {
      case 'active':
        return items.filter((item) => !item.completed);
      case 'completed':
        return items.filter((item) => item.completed);
      default:
        return items;
    }
  }

  /**
   * Sort items by current sort state.
   * @param {TodoItem[]} items
   * @returns {TodoItem[]}
   */
  _applySort(items) {
    const sorted = [...items];
    switch (this._sortBy) {
      case 'title':
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'created':
      default:
        sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
    }
    return sorted;
  }

  /**
   * Compute aggregate statistics.
   * @param {TodoItem[]} items
   * @returns {{ total: number, completed: number, active: number }}
   */
  _computeStats(items) {
    const total = items.length;
    const completed = items.filter((item) => item.completed).length;
    return { total, completed, active: total - completed };
  }
}

/* =============================================================
   Bootstrap
   ============================================================= */
document.addEventListener('DOMContentLoaded', () => {
  const repo = new LocalStorageRepository();
  const view = new TodoListView();
  /* Expose for debugging */
  window.__todoApp = new TodoController(repo, view);
});
