/**
 * TodoList Web Application
 * Zero-dependency vanilla JS SPA with localStorage persistence
 *
 * Architecture:
 *   Model Layer  — todoStore (CRUD + localStorage I/O)
 *   View Layer   — todoApp (DOM rendering + event binding)
 *
 * Contract: .ai/about.md
 *   - Data: { id: string, title: string, completed: boolean, createdAt: number }
 *   - Storage key: "todo_items"
 *   - No innerHTML for user content
 */

/* =============================================
   Model Layer — Data Store
   ============================================= */

const todoStore = {
  /** @type {string} localStorage key (per contract) */
  STORAGE_KEY: 'todo_items',

  /**
   * Generate a short random string id (e.g. "m3xq8f2k1a").
   * @returns {string}
   */
  _generateId() {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let id = '';
    for (let i = 0; i < 9; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
  },

  /**
   * Load todos from localStorage.
   * @returns {Array<{id:string, title:string, completed:boolean, createdAt:number}>}
   */
  load() {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(
        (item) =>
          item &&
          typeof item.id === 'string' &&
          typeof item.title === 'string' &&
          typeof item.completed === 'boolean' &&
          typeof item.createdAt === 'number'
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
   * @param {string} title
   * @returns {Array} updated todos array
   */
  add(title) {
    const todos = this.load();
    const todo = {
      id: this._generateId(),
      title: title.trim(),
      completed: false,
      createdAt: Date.now(),
    };
    todos.push(todo);
    this.save(todos);
    return todos;
  },

  /**
   * Toggle completed state.
   * @param {string} id
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
   * Update todo title.
   * @param {string} id
   * @param {string} title
   * @returns {Array} updated todos array
   */
  update(id, title) {
    const trimmed = title.trim();
    if (!trimmed) return this.load();
    const todos = this.load();
    const todo = todos.find((t) => t.id === id);
    if (todo) {
      todo.title = trimmed;
      this.save(todos);
    }
    return todos;
  },

  /**
   * Delete a todo by id.
   * @param {string} id
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
  /** @type {string|null} Currently editing todo id */
  editingId: null,

  /** DOM element references */
  els: {},

  /** Initialize the app */
  init() {
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

    this.els.form.addEventListener('submit', (e) => this.handleAdd(e));
    this.els.clearCompletedBtn.addEventListener('click', () => this.handleClearCompleted());
    this.els.filterBtns.forEach((btn) =>
      btn.addEventListener('click', () => this.setFilter(btn.dataset.filter))
    );

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

    this.els.itemCount.textContent = `${activeCount} item${activeCount !== 1 ? 's' : ''} left`;

    this.els.clearCompletedWrapper.classList.toggle('hidden', !hasCompleted);

    this.renderList(filtered);

    const isEmpty = filtered.length === 0;
    this.els.emptyState.classList.toggle('hidden', !isEmpty);
    this.els.list.classList.toggle('hidden', isEmpty);

    this.els.filterBtns.forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.filter === this.currentFilter);
    });
  },

  /**
   * Render the todo list items using DOM APIs (no innerHTML for user content).
   * @param {Array} todos
   */
  renderList(todos) {
    const list = this.els.list;
    // Clear list efficiently
    while (list.firstChild) {
      list.removeChild(list.firstChild);
    }

    todos.forEach((todo) => {
      const li = this._createTodoItem(todo);
      list.appendChild(li);
    });
  },

  /**
   * Create a single todo list item element.
   * @param {{id:string, title:string, completed:boolean}} todo
   * @returns {HTMLLIElement}
   */
  _createTodoItem(todo) {
    const li = document.createElement('li');
    li.className = 'todo-item';
    li.dataset.id = todo.id;

    // Checkbox
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'todo-checkbox';
    checkbox.checked = todo.completed;
    checkbox.setAttribute(
      'aria-label',
      `Mark '${todo.title}' as ${todo.completed ? 'incomplete' : 'complete'}`
    );
    checkbox.addEventListener('change', () => this.handleToggle(todo.id));

    // Title or edit input
    if (this.editingId === todo.id) {
      const editInput = document.createElement('input');
      editInput.type = 'text';
      editInput.className = 'todo-edit-input';
      editInput.value = todo.title;
      editInput.setAttribute('autofocus', '');

      editInput.addEventListener('keydown', (e) => this.handleEditKeydown(e, todo.id));
      editInput.addEventListener('blur', () => this.finishEdit(todo.id));

      // Focus and select after mount
      requestAnimationFrame(() => {
        editInput.focus();
        editInput.select();
      });

      li.appendChild(checkbox);
      li.appendChild(editInput);
    } else {
      const titleSpan = document.createElement('span');
      titleSpan.className = 'todo-text' + (todo.completed ? ' completed' : '');
      titleSpan.textContent = todo.title; // safe — no innerHTML
      titleSpan.addEventListener('dblclick', () => this.startEdit(todo.id));

      li.appendChild(checkbox);
      li.appendChild(titleSpan);
    }

    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn-icon delete-btn';
    deleteBtn.textContent = '🗑️';
    deleteBtn.setAttribute('aria-label', `Delete '${todo.title}'`);
    deleteBtn.addEventListener('click', () => this.handleDelete(todo.id));

    li.appendChild(deleteBtn);

    return li;
  },

  /* ---- Event Handlers ---- */

  /**
   * Handle form submit — add new todo.
   * @param {Event} e
   */
  handleAdd(e) {
    e.preventDefault();
    const title = this.els.input.value.trim();
    if (!title) return;
    this.editingId = null;
    todoStore.add(title);
    this.els.input.value = '';
    this.els.input.focus();
    this.render();
  },

  /**
   * Handle checkbox toggle.
   * @param {string} id
   */
  handleToggle(id) {
    todoStore.toggle(id);
    this.render();
  },

  /**
   * Handle delete.
   * @param {string} id
   */
  handleDelete(id) {
    if (this.editingId === id) this.editingId = null;
    todoStore.delete(id);
    this.render();
  },

  /**
   * Start editing a todo.
   * @param {string} id
   */
  startEdit(id) {
    this.editingId = id;
    this.render();
  },

  /**
   * Handle keydown during editing.
   * @param {KeyboardEvent} e
   * @param {string} id
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
   * Finish editing — save title.
   * @param {string} id
   */
  finishEdit(id) {
    const item = this.els.list.querySelector(`.todo-item[data-id="${CSS.escape(id)}"]`);
    const input = item?.querySelector('.todo-edit-input');
    if (input) {
      const title = input.value.trim();
      if (title) {
        todoStore.update(id, title);
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
};

/* =============================================
   Boot
   ============================================= */
document.addEventListener('DOMContentLoaded', () => todoApp.init());
