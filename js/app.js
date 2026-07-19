/**
 * ToDo List — Controller Layer
 *
 * Responsibilities:
 * - Coordinate Model (LocalStorageRepository) and View (TodoView)
 * - Handle user interactions (add, toggle, delete, filter, clear)
 * - Manage filter/sort state
 * - Wire up form submission and keyboard shortcuts
 */

class TodoController {
  constructor() {
    /* ── Dependencies (injected / instantiated) ────────── */
    this._repo = new LocalStorageRepository();
    this._view = new TodoView(document.getElementById('todo-app'));
    this._filter = 'all'; // 'all' | 'active' | 'completed'
    this._sort = 'created'; // 'created' | 'title'
    this._sortAsc = true;

    /* ── Cache DOM refs ───────────────────────────────── */
    this._formEl = document.getElementById('new-todo-form');
    this._inputEl = document.getElementById('new-todo-input');
    this._filterBtns = document.querySelectorAll('.filter-btn');
    this._sortSelect = document.getElementById('sort-select');
    this._clearBtn = document.getElementById('clear-completed-btn');

    /* ── Bootstrap ────────────────────────────────────── */
    this._initEvents();
    this._render();
  }

  /* ── Initialization ────────────────────────────────────── */

  _initEvents() {
    // Add new todo
    this._formEl.addEventListener('submit', (e) => {
      e.preventDefault();
      this._addTodo();
    });

    // View events (toggle, delete)
    this._view.bindEvents({
      onToggle: (id, checked) => this._toggleTodo(id, checked),
      onDelete: (id) => this._deleteTodo(id),
    });

    // Filter buttons
    this._filterBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        this._setFilter(btn.dataset.filter);
      });
    });

    // Sort select
    this._sortSelect.addEventListener('change', (e) => {
      this._sort = e.target.value;
      this._sortAsc = true;
      this._render();
    });

    // Clear completed
    this._clearBtn.addEventListener('click', () => {
      this._clearCompleted();
    });
  }

  /* ── Actions ───────────────────────────────────────────── */

  _addTodo() {
    const raw = this._inputEl.value.trim();
    if (!raw) return;

    try {
      const item = new TodoItem(raw);
      this._repo.add(item);
      this._inputEl.value = '';
      this._render();
      this._view.focusInput();
    } catch (err) {
      // Validation error — could surface to user
      console.error('Failed to add todo:', err.message);
    }
  }

  /**
   * @param {string} id
   * @param {boolean} checked
   */
  _toggleTodo(id, checked) {
    const item = this._repo.getById(id);
    if (!item) return;
    if (item.completed !== checked) {
      item.toggle();
      this._repo.update(item);
    }
    this._render();
  }

  /**
   * @param {string} id
   */
  _deleteTodo(id) {
    const item = this._repo.getById(id);
    if (!item) return;
    this._repo.remove(id);
    this._render();
  }

  /**
   * @param {string} filter - 'all' | 'active' | 'completed'
   */
  _setFilter(filter) {
    this._filter = filter;
    this._filterBtns.forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.filter === filter);
      btn.setAttribute('aria-pressed', btn.dataset.filter === filter ? 'true' : 'false');
    });
    this._render();
  }

  _clearCompleted() {
    const items = this._repo.getAll();
    items.forEach((item) => {
      if (item.completed) {
        this._repo.remove(item.id);
      }
    });
    this._render();
  }

  /* ── Query & Render ────────────────────────────────────── */

  _getFilteredAndSorted() {
    let items = this._repo.getAll();

    // Filter
    if (this._filter === 'active') {
      items = items.filter((item) => !item.completed);
    } else if (this._filter === 'completed') {
      items = items.filter((item) => item.completed);
    }

    // Sort
    items.sort((a, b) => {
      let cmp;
      if (this._sort === 'title') {
        cmp = a.title.localeCompare(b.title);
      } else {
        cmp = a.createdAt - b.createdAt;
      }
      return this._sortAsc ? cmp : -cmp;
    });

    return items;
  }

  _render() {
    const items = this._getFilteredAndSorted();
    this._view.render(items);
  }
}

/* ── Boot ─────────────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {
  new TodoController();
});
