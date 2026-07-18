/**
 * TodoList Web Application
 * Zero-dependency vanilla JS SPA with localStorage persistence
 *
 * Architecture:
 *   Model Layer  — todoStore (CRUD + localStorage I/O)
 *   View Layer   — todoApp (DOM rendering + event binding)
 */

/* =============================================
   Model Layer — Data Store
   ============================================= */

const todoStore = {
  /** @type {string} localStorage key */
  STORAGE_KEY: 'todolist_todos',

  /**
   * Load todos from localStorage.
   * @returns {Array<{id:number, text:string, completed:boolean}>}
   */
  load() {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      // Validate structure
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(
        (item) =>
          item &&
          typeof item.id === 'number' &&
          typeof item.text === 'string' &&
          typeof item.completed === 'boolean'
      );
    } catch {
      return [];
    }
  },

  /**
   * Save todos to localStorage.
   * @param {Array} todos
   */
  save(todos) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(todos));
    } catch (e) {
      console.error('Failed to save todos:', e);
    }
  },

  /**
   * Add a new todo.
   * @param {string} text
   * @returns {Array} updated todos array
   */
  add(text) {
    const todos = this.load();
    const id = todos.length > 0 ? Math.max(...todos.map((t) => t.id)) + 1 : 1;
    const todo = { id, text: text.trim(), completed: false };
    todos.push(todo);
    this.save(todos);
    return todos;
  },

  /**
   * Toggle completed state.
   * @param {number} id
   * @returns {Array} updated todos array
   */
  toggle(id) {
    const todos = this.load();
    const todo = todos.find((t) => t.id === id);
    if (todo) {
      todo.completed = !todo.completed;
      this.save(todos);
    }
    return todos;
  },

  /**
   * Update todo text.
   * @param {number} id
   * @param {string} text
   * @returns {Array} updated todos array
   */
  update(id, text) {
    const trimmed = text.trim();
    if (!trimmed) return this.load();
    const todos = this.load();
    const todo = todos.find((t) => t.id === id);
    if (todo) {
      todo.text = trimmed;
      this.save(todos);
    }
    return todos;
  },

  /**
   * Delete a todo by id.
   * @param {number} id
   * @returns {Array} updated todos array
   */
  delete(id) {
    const todos = this.load().filter((t) => t.id !== id);
    this.save(todos);
    return todos;
  },

  /**
   * Clear all completed todos.
   * @returns {Array} updated todos array
   */
  clearCompleted() {
    const todos = this.load().filter((t) => !t.completed);
    this.save(todos);
    return todos;
  },
};

/* =============================================
   View Layer — App Controller
   ============================================= */

const todoApp = {
  /** @type {'all'|'active'|'completed'} */
  currentFilter: 'all',
  /** @type {number|null} Currently editing todo id */
  editingId: null,

  /** DOM element references */
  els: {},

  /** Initialize the app */
  init() {
    // Cache DOM references
    this.els = {
      form: document.getElementById('todo-form'),
      input: document.getElementById('todo-input'),
      list: document.getElementById('todo-list'),
      emptyState: document.getElementById('empty-state'),
      clearCompletedWrapper: document.getElementById('clear-completed-wrapper'),
      clearCompletedBtn: document.getElementById('clear-completed'),
      itemCount: document.getElementById('item-count'),
      filterBtns: document.querySelectorAll('.filter-btn'),
    };

    // Bind events
    this.els.form.addEventListener('submit', (e) => this.handleAdd(e));
    this.els.clearCompletedBtn.addEventListener('click', () => this.handleClearCompleted());
    this.els.filterBtns.forEach((btn) =>
      btn.addEventListener('click', () => this.setFilter(btn.dataset.filter))
    );

    // Initial render
    this.render();
  },

  /** Get todos, applying current filter */
  getFilteredTodos() {
    const todos = todoStore.load();
    if (this.currentFilter === 'active') return todos.filter((t) => !t.completed);
    if (this.currentFilter === 'completed') return todos.filter((t) => t.completed);
    return todos;
  },

  /** Render the full UI */
  render() {
    const allTodos = todoStore.load();
    const filtered = this.getFilteredTodos();
    const activeCount = allTodos.filter((t) => !t.completed).length;
    const hasCompleted = allTodos.some((t) => t.completed);

    // Update item count
    this.els.itemCount.textContent = `${activeCount} item${activeCount !== 1 ? 's' : ''} left`;

    // Toggle clear-completed button
    this.els.clearCompletedWrapper.classList.toggle('hidden', !hasCompleted);

    // Render list
    this.renderList(filtered);

    // Toggle empty state
    const isEmpty = filtered.length === 0;
    this.els.emptyState.classList.toggle('hidden', !isEmpty);
    this.els.list.classList.toggle('hidden', isEmpty);

    // Update filter button active state
    this.els.filterBtns.forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.filter === this.currentFilter);
    });
  },

  /**
   * Render the todo list items.
   * @param {Array} todos
   */
  renderList(todos) {
    this.els.list.innerHTML = todos
      .map(
        (todo) => `
      <li class="todo-item" data-id="${todo.id}">
        <input
          type="checkbox"
          class="todo-checkbox"
          ${todo.completed ? 'checked' : ''}
          aria-label="Mark '${this.escapeHtml(todo.text)}' as ${todo.completed ? 'incomplete' : 'complete'}"
        >
        ${
          this.editingId === todo.id
            ? `<input type="text" class="todo-edit-input" value="${this.escapeHtml(todo.text)}" autofocus>`
            : `<span class="todo-text ${todo.completed ? 'completed' : ''}">${this.escapeHtml(todo.text)}</span>`
        }
        <button class="btn-icon delete-btn" aria-label="Delete '${this.escapeHtml(todo.text)}'">🗑️</button>
      </li>`
      )
      .join('');

    // Bind dynamic events
    this.bindItemEvents();
  },

  /** Bind events for list item elements */
  bindItemEvents() {
    const items = this.els.list.querySelectorAll('.todo-item');

    items.forEach((item) => {
      const id = parseInt(item.dataset.id, 10);

      // Checkbox toggle
      const checkbox = item.querySelector('.todo-checkbox');
      if (checkbox) {
        checkbox.addEventListener('change', () => this.handleToggle(id));
      }

      // Delete button
      const deleteBtn = item.querySelector('.delete-btn');
      if (deleteBtn) {
        deleteBtn.addEventListener('click', () => this.handleDelete(id));
      }

      // Double-click to edit (only on text span, not on edit input)
      const textSpan = item.querySelector('.todo-text');
      if (textSpan) {
        textSpan.addEventListener('dblclick', () => this.startEdit(id));
      }

      // Edit input keydown/blur
      const editInput = item.querySelector('.todo-edit-input');
      if (editInput) {
        editInput.addEventListener('keydown', (e) => this.handleEditKeydown(e, id));
        editInput.addEventListener('blur', () => this.finishEdit(id));
        // Focus and select text
        setTimeout(() => {
          editInput.focus();
          editInput.select();
        }, 0);
      }
    });
  },

  /* ---- Event Handlers ---- */

  /**
   * Handle form submit — add new todo.
   * @param {Event} e
   */
  handleAdd(e) {
    e.preventDefault();
    const text = this.els.input.value.trim();
    if (!text) return;
    this.editingId = null;
    todoStore.add(text);
    this.els.input.value = '';
    this.els.input.focus();
    this.render();
  },

  /**
   * Handle checkbox toggle.
   * @param {number} id
   */
  handleToggle(id) {
    todoStore.toggle(id);
    this.render();
  },

  /**
   * Handle delete.
   * @param {number} id
   */
  handleDelete(id) {
    if (this.editingId === id) this.editingId = null;
    todoStore.delete(id);
    this.render();
  },

  /**
   * Start editing a todo.
   * @param {number} id
   */
  startEdit(id) {
    this.editingId = id;
    this.render();
  },

  /**
   * Handle keydown during editing.
   * @param {KeyboardEvent} e
   * @param {number} id
   */
  handleEditKeydown(e, id) {
    if (e.key === 'Enter') {
      e.preventDefault();
      this.finishEdit(id);
    } else if (e.key === 'Escape') {
      this.editingId = null;
      this.render();
    }
  },

  /**
   * Finish editing — save text.
   * @param {number} id
   */
  finishEdit(id) {
    const item = this.els.list.querySelector(`.todo-item[data-id="${id}"]`);
    const input = item?.querySelector('.todo-edit-input');
    if (input) {
      const text = input.value.trim();
      if (text) {
        todoStore.update(id, text);
      }
    }
    this.editingId = null;
    this.render();
  },

  /** Clear all completed todos */
  handleClearCompleted() {
    todoStore.clearCompleted();
    this.render();
  },

  /**
   * Set active filter.
   * @param {'all'|'active'|'completed'} filter
   */
  setFilter(filter) {
    if (this.currentFilter === filter) return;
    this.currentFilter = filter;
    this.editingId = null;
    this.render();
  },

  /**
   * Escape HTML special characters (XSS prevention).
   * @param {string} str
   * @returns {string}
   */
  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },
};

/* =============================================
   Boot
   ============================================= */
document.addEventListener('DOMContentLoaded', () => todoApp.init());
