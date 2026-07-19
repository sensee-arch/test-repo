/* ========================================================================
 * Todo App — Vanilla JavaScript (ES6+)
 * Architecture: Model (TodoModel) → View (TodoView) → Controller (TodoController)
 * ======================================================================== */

/** STORAGE_KEY for localStorage */
const STORAGE_KEY = 'todolist_items';

/** MAX_TEXT_LENGTH for task text validation */
const MAX_TEXT_LENGTH = 500;

/* ======================================================================
 * TodoModel — Data persistence layer
 * ====================================================================== */
class TodoModel {
  constructor(storageKey) {
    this._storageKey = storageKey || STORAGE_KEY;
    this._items = this._load();
  }

  /**
   * Load items from localStorage
   * @returns {Array} Array of TodoItem
   */
  _load() {
    try {
      const data = localStorage.getItem(this._storageKey);
      if (data) {
        const parsed = JSON.parse(data);
        return Array.isArray(parsed) ? parsed : [];
      }
      return [];
    } catch (e) {
      console.warn('localStorage read failed, using in-memory fallback:', e.message);
      return [];
    }
  }

  /**
   * Save items to localStorage
   * @returns {boolean} true if save succeeded
   */
  _save() {
    try {
      localStorage.setItem(this._storageKey, JSON.stringify(this._items));
      return true;
    } catch (e) {
      if (e.name === 'QuotaExceededError' || e.code === 22) {
        console.warn('localStorage quota exceeded');
        throw new Error('存储空间不足，请清理部分待办事项后重试');
      }
      console.warn('localStorage write failed:', e.message);
      return false;
    }
  }

  /**
   * Generate UUID v4
   * @returns {string}
   */
  _generateId() {
    return crypto.randomUUID();
  }

  /**
   * Get current timestamp in ISO 8601
   * @returns {string}
   */
  _now() {
    return new Date().toISOString();
  }

  /**
   * Get all tasks (sorted by createdAt ascending)
   * @returns {Array} TodoItem[]
   */
  getAll() {
    return [...this._items].sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );
  }

  /**
   * Get task by id
   * @param {string} id
   * @returns {object|null} TodoItem or null
   */
  getById(id) {
    return this._items.find(item => item.id === id) || null;
  }

  /**
   * Add a new task
   * @param {string} text - Task content
   * @returns {object} Created TodoItem
   * @throws {Error} if text is empty after trim
   */
  add(text) {
    const trimmed = (text || '').trim();
    if (!trimmed) {
      throw new Error('待办内容不能为空');
    }
    if (trimmed.length > MAX_TEXT_LENGTH) {
      throw new Error(`待办内容不能超过 ${MAX_TEXT_LENGTH} 个字符`);
    }

    const now = this._now();
    const item = {
      id: this._generateId(),
      text: trimmed,
      completed: false,
      createdAt: now,
      updatedAt: now
    };

    this._items.push(item);
    this._save();
    return { ...item };
  }

  /**
   * Update task fields
   * @param {string} id
   * @param {object} data - Partial fields to update
   * @returns {object} Updated TodoItem
   * @throws {Error} if not found or text is invalid
   */
  update(id, data) {
    const index = this._items.findIndex(item => item.id === id);
    if (index === -1) {
      throw new Error(`待办事项不存在: ${id}`);
    }

    if (data.text !== undefined) {
      const trimmed = (data.text || '').trim();
      if (!trimmed) {
        throw new Error('待办内容不能为空');
      }
      if (trimmed.length > MAX_TEXT_LENGTH) {
        throw new Error(`待办内容不能超过 ${MAX_TEXT_LENGTH} 个字符`);
      }
      data.text = trimmed;
    }

    this._items[index] = {
      ...this._items[index],
      ...data,
      updatedAt: this._now()
    };

    this._save();
    return { ...this._items[index] };
  }

  /**
   * Delete a task
   * @param {string} id
   * @throws {Error} if not found
   */
  remove(id) {
    const index = this._items.findIndex(item => item.id === id);
    if (index === -1) {
      throw new Error(`待办事项不存在: ${id}`);
    }
    this._items.splice(index, 1);
    this._save();
  }

  /**
   * Toggle completion status
   * @param {string} id
   * @returns {object} Updated TodoItem
   * @throws {Error} if not found
   */
  toggle(id) {
    const item = this._items.find(item => item.id === id);
    if (!item) {
      throw new Error(`待办事项不存在: ${id}`);
    }
    item.completed = !item.completed;
    item.updatedAt = this._now();
    this._save();
    return { ...item };
  }

  /**
   * Remove all completed tasks
   * @returns {number} Number of removed items
   */
  clearCompleted() {
    const before = this._items.length;
    this._items = this._items.filter(item => !item.completed);
    const removed = before - this._items.length;
    if (removed > 0) {
      this._save();
    }
    return removed;
  }

  /**
   * Get total number of items
   * @returns {number}
   */
  getTotalCount() {
    return this._items.length;
  }

  /**
   * Get pending fallback message — indicates in-memory mode
   * @returns {boolean}
   */
  isPersistent() {
    try {
      localStorage.setItem('__test__', '1');
      localStorage.removeItem('__test__');
      return true;
    } catch (e) {
      return false;
    }
  }
}


/* ======================================================================
 * TodoView — DOM rendering and event delegation
 * ====================================================================== */
class TodoView {
  constructor() {
    this.todoList = document.getElementById('todo-list');
    this.emptyState = document.getElementById('empty-state');
    this.todoInput = document.getElementById('todo-input');
    this.addBtn = document.getElementById('add-btn');
    this.statsTotal = document.getElementById('stats-total');
    this.statsCompleted = document.getElementById('stats-completed');
    this.statsPending = document.getElementById('stats-pending');
    this.filterButtons = document.querySelectorAll('.filter-btn');
    this.clearCompletedBtn = document.getElementById('clear-completed-btn');
    this.themeToggle = document.getElementById('theme-toggle');

    this._currentFilter = 'all';
  }

  /**
   * Escape HTML entities to prevent XSS
   * @param {string} text
   * @returns {string}
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(text));
    return div.innerHTML;
  }

  /**
   * Render the full todo list
   * @param {Array} items - All TodoItem objects
   */
  renderList(items) {
    const filtered = this._filterItems(items);
    const fragment = document.createDocumentFragment();

    filtered.forEach(item => {
      const li = document.createElement('li');
      li.className = 'todo-item' + (item.completed ? ' completed' : '');
      li.dataset.id = item.id;

      // Custom checkbox
      const checkboxCustom = document.createElement('span');
      checkboxCustom.className = 'todo-checkbox-custom';

      // Hidden native checkbox for accessibility
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'todo-checkbox';
      checkbox.checked = item.completed;
      checkbox.setAttribute('aria-label', `标记 "${item.text}" 为${item.completed ? '未' : ''}完成`);

      // Text
      const textSpan = document.createElement('span');
      textSpan.className = 'todo-text';
      textSpan.textContent = item.text;
      textSpan.setAttribute('aria-label', item.text);

      // Delete button
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'delete-btn';
      deleteBtn.setAttribute('aria-label', `删除 "${item.text}"`);
      deleteBtn.textContent = '✕';

      li.appendChild(checkbox);
      li.appendChild(checkboxCustom);
      li.appendChild(textSpan);
      li.appendChild(deleteBtn);
      fragment.appendChild(li);
    });

    // Clear and batch append
    this.todoList.innerHTML = '';
    this.todoList.appendChild(fragment);

    // Empty state
    if (filtered.length === 0) {
      this.renderEmpty();
    } else {
      this.emptyState.classList.add('hidden');
    }
  }

  /**
   * Show empty state
   */
  renderEmpty() {
    this.todoList.innerHTML = '';
    this.emptyState.classList.remove('hidden');

    if (this._currentFilter === 'all') {
      this.emptyState.textContent = '🎉 暂无待办事项，添加一条吧！';
    } else if (this._currentFilter === 'active') {
      this.emptyState.textContent = '✅ 所有待办都已完成！';
    } else if (this._currentFilter === 'completed') {
      this.emptyState.textContent = '📝 还没有已完成的待办';
    }
  }

  /**
   * Update stats bar
   * @param {Array} items
   */
  renderStats(items) {
    const total = items.length;
    const completed = items.filter(i => i.completed).length;
    const pending = total - completed;
    this.statsTotal.innerHTML = `总计: <strong>${total}</strong>`;
    this.statsCompleted.innerHTML = `已完成: <strong>${completed}</strong>`;
    this.statsPending.innerHTML = `待完成: <strong>${pending}</strong>`;
  }

  /**
   * Filter items based on current filter
   * @param {Array} items
   * @returns {Array}
   */
  _filterItems(items) {
    if (this._currentFilter === 'active') {
      return items.filter(i => !i.completed);
    }
    if (this._currentFilter === 'completed') {
      return items.filter(i => i.completed);
    }
    return items;
  }

  /**
   * Set current filter
   * @param {string} filter - 'all' | 'active' | 'completed'
   */
  setFilter(filter) {
    this._currentFilter = filter;
    this.filterButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.filter === filter);
    });
  }

  /**
   * Get current filter value
   * @returns {string}
   */
  getCurrentFilter() {
    return this._currentFilter;
  }

  /**
   * Enter edit mode on a todo item
   * @param {HTMLElement} textSpan - The .todo-text element
   * @param {string} currentText
   */
  enterEditMode(textSpan, currentText) {
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'todo-edit-input';
    input.value = currentText;
    input.setAttribute('aria-label', '编辑待办内容');
    input.maxLength = MAX_TEXT_LENGTH;

    // Replace text span with input
    textSpan.replaceWith(input);
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);

    return input;
  }

  /**
   * Exit edit mode and return to text display
   * @param {HTMLElement} input - The edit input element
   * @param {string} newText
   * @returns {HTMLElement} New text span
   */
  exitEditMode(input, newText) {
    const textSpan = document.createElement('span');
    textSpan.className = 'todo-text';
    textSpan.textContent = newText;
    textSpan.setAttribute('aria-label', newText);
    input.replaceWith(textSpan);
    return textSpan;
  }
}


/* ======================================================================
 * TodoController — Coordinates Model and View
 * ====================================================================== */
class TodoController {
  constructor(model, view) {
    this._model = model;
    this._view = view;
    this._editingItemId = null;
    this._init();
  }

  /**
   * Initialize: load data, render, bind events
   */
  _init() {
    this._render();
    this._bindEvents();
    this._initTheme();
  }

  /**
   * Full render cycle
   */
  _render() {
    const items = this._model.getAll();
    this._view.renderList(items);
    this._view.renderStats(items);
  }

  /**
   * Bind all events
   */
  _bindEvents() {
    // Add: Enter key
    this._view.todoInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.handleAdd();
      }
    });

    // Add: Button click
    this._view.addBtn.addEventListener('click', () => {
      this.handleAdd();
    });

    // List: Event delegation for toggle, edit, delete
    this._view.todoList.addEventListener('click', (e) => {
      // Toggle checkbox
      if (e.target.classList.contains('todo-checkbox') ||
          e.target.classList.contains('todo-checkbox-custom')) {
        const li = e.target.closest('.todo-item');
        if (li) {
          this.handleToggle(li.dataset.id);
        }
        return;
      }

      // Delete button
      if (e.target.classList.contains('delete-btn')) {
        const li = e.target.closest('.todo-item');
        if (li) {
          this.handleDelete(li.dataset.id);
        }
        return;
      }
    });

    // Edit: Click on text
    this._view.todoList.addEventListener('dblclick', (e) => {
      const textSpan = e.target.closest('.todo-text');
      if (textSpan && !textSpan.classList.contains('todo-edit-input')) {
        const li = textSpan.closest('.todo-item');
        if (li) {
          this.handleEditStart(li.dataset.id, textSpan);
        }
      }
    });

    // Filter buttons
    this._view.filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const filter = btn.dataset.filter;
        this._view.setFilter(filter);
        this._render();
      });
    });

    // Clear completed
    this._view.clearCompletedBtn.addEventListener('click', () => {
      this.handleClearCompleted();
    });

    // Theme toggle
    this._view.themeToggle.addEventListener('click', () => {
      this._toggleTheme();
    });
  }

  /**
   * Handle add task
   */
  handleAdd() {
    const text = this._view.todoInput.value;
    try {
      this._model.add(text);
      this._view.todoInput.value = '';
      this._view.todoInput.focus();
      this._render();
    } catch (e) {
      alert(e.message);
    }
  }

  /**
   * Handle toggle completion
   * @param {string} id
   */
  handleToggle(id) {
    try {
      this._model.toggle(id);
      this._render();
    } catch (e) {
      alert(e.message);
    }
  }

  /**
   * Handle starting edit mode
   * @param {string} id
   * @param {HTMLElement} textSpan
   */
  handleEditStart(id, textSpan) {
    // Cancel any existing edit
    if (this._editingItemId) {
      this._cancelEdit();
    }

    this._editingItemId = id;
    const currentText = textSpan.textContent;
    const input = this._view.enterEditMode(textSpan, currentText);

    // Enter saves
    input.addEventListener('keydown', (e) => {
      e.stopPropagation();
      if (e.key === 'Enter') {
        e.preventDefault();
        this._saveEdit(id, input);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        this._cancelEdit();
      }
    });

    // Blur saves
    input.addEventListener('blur', () => {
      this._saveEdit(id, input);
    });
  }

  /**
   * Save edit
   * @param {string} id
   * @param {HTMLElement} input
   */
  _saveEdit(id, input) {
    if (this._editingItemId !== id) return;
    const newText = input.value;
    const li = input.closest('.todo-item');
    if (!li) return;

    try {
      this._model.update(id, { text: newText });
      this._editingItemId = null;
      this._render();
    } catch (e) {
      // Revert with original text
      const item = this._model.getById(id);
      if (item) {
        this._view.exitEditMode(input, item.text);
      } else {
        this._view.exitEditMode(input, newText);
      }
      this._editingItemId = null;
      alert(e.message);
    }
  }

  /**
   * Cancel current edit, revert to original text
   */
  _cancelEdit() {
    if (!this._editingItemId) return;
    const id = this._editingItemId;
    this._editingItemId = null;
    this._render();
  }

  /**
   * Handle delete task
   * @param {string} id
   */
  handleDelete(id) {
    try {
      this._model.remove(id);
      this._render();
    } catch (e) {
      alert(e.message);
    }
  }

  /**
   * Handle clear completed
   */
  handleClearCompleted() {
    try {
      const removed = this._model.clearCompleted();
      if (removed > 0) {
        this._render();
      }
    } catch (e) {
      alert(e.message);
    }
  }

  /**
   * Initialize theme based on system preference or stored preference
   */
  _initTheme() {
    const stored = localStorage.getItem('todo_theme');
    if (stored) {
      document.documentElement.setAttribute('data-theme', stored);
      this._view.themeToggle.textContent = stored === 'dark' ? '☀️' : '🌙';
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.setAttribute('data-theme', 'dark');
      this._view.themeToggle.textContent = '☀️';
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      this._view.themeToggle.textContent = '🌙';
    }
  }

  /**
   * Toggle between light and dark themes
   */
  _toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    this._view.themeToggle.textContent = next === 'dark' ? '☀️' : '🌙';
    try {
      localStorage.setItem('todo_theme', next);
    } catch (e) {
      // Theme preference persistence is best-effort
    }
  }
}


/* ======================================================================
 * Application Entry Point
 * ====================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  const model = new TodoModel();
  const view = new TodoView();
  const controller = new TodoController(model, view);

  // Expose for debugging and testability
  window.__todoApp = { model, view, controller };
});
