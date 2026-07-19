/* =============================================
   ToDo List App — Controller (App)
   ============================================= */

/**
 * App — Coordinates Model and View.
 */
class TodoApp {
  /**
   * @param {ITodoRepository} repository
   * @param {TodoView} view
   */
  constructor(repository, view) {
    this.repo = repository;
    this.view = view;

    /** @type {'all'|'active'|'completed'} */
    this.filter = 'all';

    // Wire view callbacks
    this.view.onAdd = (title) => this._handleAdd(title);
    this.view.onToggle = (id) => this._handleToggle(id);
    this.view.onDelete = (id) => this._handleDelete(id);
    this.view.onEditStart = (id, currentTitle) => this._handleEditStart(id, currentTitle);
    this.view.onEditSubmit = (newTitle) => this._handleEditSubmit(newTitle);
    this.view.onEditCancel = () => this._handleEditCancel();
    this.view.onFilterChange = (filter) => this._handleFilterChange(filter);
    this.view.onClearCompleted = () => this._handleClearCompleted();

    // Initial render
    this._render();
  }

  /* ---- Event Handlers ---- */

  /**
   * Add a new todo item.
   * @param {string} title
   */
  _handleAdd(title) {
    const { valid, error } = validateTodoInput({ title });
    if (!valid) {
      console.warn('TodoApp: invalid input —', error);
      return;
    }
    const item = createTodoItem(title);
    this.repo.add(item);
    this._render();
  }

  /**
   * Toggle a todo item's completed status.
   * @param {string} id
   */
  _handleToggle(id) {
    const item = this.repo.getById(id);
    if (!item) return;
    item.completed = !item.completed;
    this.repo.update(item);
    this._render();
  }

  /**
   * Delete a todo item.
   * @param {string} id
   */
  _handleDelete(id) {
    this.repo.remove(id);
    this._render();
  }

  /**
   * Start inline editing for a todo item.
   * @param {string} id
   * @param {string} currentTitle
   */
  _handleEditStart(id, currentTitle) {
    this.view.enterEditMode(id);
    this._render();
  }

  /**
   * Submit inline edit.
   * @param {string} newTitle
   */
  _handleEditSubmit(newTitle) {
    const id = this.view.editingId;
    if (!id) return;

    if (newTitle && newTitle.length > 0) {
      const { valid } = validateTodoInput({ title: newTitle });
      if (valid) {
        const item = this.repo.getById(id);
        if (item) {
          item.title = newTitle.trim();
          this.repo.update(item);
        }
      }
    } else {
      // Empty title → remove the item
      this.repo.remove(id);
    }

    this.view.exitEditMode();
    this._render();
  }

  /**
   * Cancel inline editing.
   */
  _handleEditCancel() {
    this.view.exitEditMode();
    this._render();
  }

  /**
   * Change the active filter.
   * @param {string} filter
   */
  _handleFilterChange(filter) {
    this.filter = filter;
    this._render();
  }

  /**
   * Clear all completed items.
   */
  _handleClearCompleted() {
    const removed = this.repo.clearCompleted();
    if (removed > 0) {
      this.view.exitEditMode();
      this._render();
    }
  }

  /* ---- Render ---- */

  _render() {
    const items = this.repo.getAll();
    this.view.render(items, this.filter);
  }
}

/* ---- Bootstrap ---- */
document.addEventListener('DOMContentLoaded', () => {
  const repo = new LocalStorageRepository();
  const view = new TodoView();
  // eslint-disable-next-line no-unused-vars
  const app = new TodoApp(repo, view);
});
