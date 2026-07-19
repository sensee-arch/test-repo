/**
 * app.js — Controller (Model ↔ View coordinator)
 *
 * Manages user interactions, filter/sort state, and orchestrates
 * data flow between LocalStorageRepository and TodoView.
 */

class TodoController {

  constructor() {
    this.repo   = new LocalStorageRepository();
    this.view   = new TodoView();

    /** @type {'all'|'active'|'completed'} */
    this.filter = 'all';

    this._init();
  }

  /* ════════════════════════════════════════
     Initialisation
     ════════════════════════════════════════ */

  _init() {
    this._restoreTheme();
    this._bindEvents();
    this._render();
  }

  _restoreTheme() {
    const stored = localStorage.getItem('todolist_theme');
    this.view.isDark = stored === 'dark';
  }

  _persistTheme() {
    localStorage.setItem('todolist_theme', this.view.isDark ? 'dark' : 'light');
  }

  /* ════════════════════════════════════════
     Event binding (delegation where possible)
     ════════════════════════════════════════ */

  _bindEvents() {
    /* ── Form submit — add todo ── */
    this.view.todoForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this._addTodo();
    });

    /* ── Delegated: checkbox toggle / delete ── */
    this.view.todoList.addEventListener('click', (e) => {
      const item = e.target.closest('.todo-item');
      if (!item) return;

      if (e.target.closest('.todo-checkbox-label') || e.target.classList.contains('todo-checkbox')) {
        console.log('Toggle:', item.dataset.id);
        this._toggleTodo(item.dataset.id);
        return;
      }

      if (e.target.classList.contains('todo-delete')) {
        this._deleteTodo(item.dataset.id);
        return;
      }
    });

    /* ── Filter buttons ── */
    this.view.filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.filter = btn.dataset.filter;
        this._render();
      });
    });

    /* ── Clear completed ── */
    this.view.clearBtn.addEventListener('click', () => {
      this.repo.removeCompleted();
      this._render();
    });

    /* ── Theme toggle ── */
    this.view.themeBtn.addEventListener('click', () => {
      this.view.isDark = !this.view.isDark;
      this._persistTheme();
    });
  }

  /* ════════════════════════════════════════
     Actions
     ════════════════════════════════════════ */

  _addTodo() {
    const raw = this.view.todoInput.value;
    const validation = TodoItem.validate({ title: raw });

    if (!validation.valid) {
      this.view.showError(validation.error);
      return;
    }

    const todo = new TodoItem({ title: raw });
    this.repo.add(todo);
    this.view.clearInput();
    this.filter = 'all';
    this._render();
  }

  _toggleTodo(id) {
    const todo = this.repo.getById(id);
    if (!todo) return;
    todo.toggle();
    this.repo.update(todo);
    this._render();
  }

  _deleteTodo(id) {
    this.repo.remove(id);
    this._render();
  }

  /* ════════════════════════════════════════
     Render pipeline
     ════════════════════════════════════════ */

  _render() {
    const all     = this.repo.getAll();
    const active  = all.filter(t => !t.completed);
    const hasCompleted = all.length - active.length > 0;

    /* Filter */
    let display = all;
    if (this.filter === 'active')    display = active;
    if (this.filter === 'completed') display = all.filter(t => t.completed);

    /* Sort — newest first */
    display.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    /* Push to view */
    this.view.renderTodos(display, this.filter);
    this.view.updateItemsLeft(active.length);
    this.view.updateActiveFilter(this.filter);
    this.view.toggleClearBtn(hasCompleted);
  }
}

/* ── Kick-off ── */
document.addEventListener('DOMContentLoaded', () => {
  new TodoController();
});
