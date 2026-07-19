/**
 * view.js — Rendering engine & DOM management
 *
 * Encapsulates all DOM queries, markup building, event delegation setup,
 * empty-state hints, error messages, and animation classes.
 */

class TodoView {

  constructor() {
    /* ── Cache root references ── */
    this.app       = document.getElementById('app');
    this.todoForm  = document.getElementById('todo-form');
    this.todoInput = document.getElementById('todo-input');
    this.todoList  = document.getElementById('todo-list');
    this.emptyEl   = document.getElementById('empty-state');
    this.errorEl   = document.getElementById('error-msg');
    this.itemsLeft = document.getElementById('items-left');
    this.clearBtn  = document.getElementById('clear-completed');
    this.filterBtns= document.querySelectorAll('[data-filter]');
    this.themeBtn  = document.getElementById('theme-btn');
    this.htmlEl    = document.documentElement;
  }

  /* ════════════════════════════
     Render  methods
     ════════════════════════════ */

  /**
   * Build the <li> elements for the current todo list.
   * @param {TodoItem[]} todos  — already filtered & sorted
   * @param {string} activeFilter — 'all' | 'active' | 'completed'
   */
  renderTodos(todos, activeFilter) {
    this.todoList.innerHTML = '';

    if (todos.length === 0) {
      this._showEmpty(activeFilter);
      return;
    }

    this._hideEmpty();

    const frag = document.createDocumentFragment();
    todos.forEach((todo, i) => {
      const li = this._createTodoElement(todo, i);
      frag.appendChild(li);
    });
    this.todoList.appendChild(frag);
  }

  /**
   * Update the "N items left" counter.
   * @param {number} n
   */
  updateItemsLeft(n) {
    this.itemsLeft.textContent = `${n} ${n === 1 ? 'item' : 'items'} left`;
  }

  /**
   * Highlight the active filter button.
   * @param {string} filter
   */
  updateActiveFilter(filter) {
    this.filterBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.filter === filter);
    });
  }

  /**
   * Show/hide "Clear completed" button.
   * @param {boolean} visible
   */
  toggleClearBtn(visible) {
    this.clearBtn.style.display = visible ? '' : 'none';
  }

  /**
   * Flash an error message for a few seconds.
   * @param {string} msg
   */
  showError(msg) {
    this.errorEl.textContent = msg;
    this.errorEl.classList.add('visible');
    setTimeout(() => this.errorEl.classList.remove('visible'), 3000);
  }

  clearInput() {
    this.todoInput.value = '';
    this.todoInput.focus();
  }

  /* ════════════════════════════
     Theme helpers
     ════════════════════════════ */

  /** @returns {boolean} current dark-mode state */
  get isDark() {
    return this.htmlEl.getAttribute('data-theme') === 'dark';
  }

  set isDark(v) {
    this.htmlEl.setAttribute('data-theme', v ? 'dark' : 'light');
    this.themeBtn.textContent = v ? '☀️' : '🌙';
    this.themeBtn.setAttribute('aria-label', v ? 'Switch to light mode' : 'Switch to dark mode');
  }

  /* ════════════════════════════
     Internal helpers
     ════════════════════════════ */

  _showEmpty(filter) {
    const msgs = {
      all: '✨ No tasks yet. Add one above!',
      active: '🎉 No active tasks — you\'re all caught up!',
      completed: 'No completed tasks yet.',
    };
    this.emptyEl.innerHTML = `<p>${msgs[filter] || msgs.all}</p>`;
    this.emptyEl.style.display = '';
  }

  _hideEmpty() {
    this.emptyEl.style.display = 'none';
  }

  /**
   * @param {TodoItem} todo
   * @param {number} index — used for stagger animation delay
   * @returns {HTMLLIElement}
   */
  _createTodoElement(todo, index) {
    const escaped = this._escapeHtml(todo.title);

    const li = document.createElement('li');
    li.className = `todo-item${todo.completed ? ' completed' : ''}`;
    li.dataset.id = todo.id;
    li.style.setProperty('--anim-delay', `${index * 0.04}s`);

    li.innerHTML = `
      <label class="todo-checkbox-label">
        <input type="checkbox" class="todo-checkbox"
               ${todo.completed ? 'checked' : ''}
               aria-label="Mark "${escaped}" as ${todo.completed ? 'incomplete' : 'complete'}">
        <span class="checkmark"></span>
      </label>
      <span class="todo-title">${escaped}</span>
      <button class="todo-delete" aria-label="Delete "${escaped}"">✕</button>
    `;

    return li;
  }

  _escapeHtml(text) {
    const d = document.createElement('div');
    d.textContent = text;
    return d.innerHTML;
  }
}
