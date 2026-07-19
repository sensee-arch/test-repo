/* ============================================
   TodoList — DataModule + UI Controller
   Vanilla JS ES6+, zero dependencies
   ============================================ */

(function () {
  'use strict';

  // ==========================================
  // DataModule — Data Layer (localStorage CRUD)
  // ==========================================

  class DataModule {
    constructor() {
      this.STORAGE_KEY = 'todolist_tasks';
      this._checkSupport();
    }

    /** Detect localStorage availability */
    _checkSupport() {
      try {
        const testKey = '__todolist_test__';
        localStorage.setItem(testKey, '1');
        localStorage.removeItem(testKey);
      } catch (e) {
        throw new Error(
          'localStorage is not available. Data will not persist across sessions.'
        );
      }
    }

    /** Load all tasks from localStorage */
    _load() {
      try {
        const raw = localStorage.getItem(this.STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
      } catch (e) {
        console.error('[DataModule] Failed to load:', e);
        return [];
      }
    }

    /** Save tasks array to localStorage */
    _save(tasks) {
      try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(tasks));
      } catch (e) {
        console.error('[DataModule] Failed to save:', e);
      }
    }

    /** Generate UUID v4 */
    _generateId() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
      });
    }

    /**
     * Validate task title
     * @param {string} title
     * @returns {string} trimmed title
     * @throws {Error} on invalid input
     */
    _validateTitle(title) {
      if (typeof title !== 'string' || title.trim().length === 0) {
        throw new Error('Title must be a non-empty string.');
      }
      if (title.trim().length > 100) {
        throw new Error('Title must be 100 characters or fewer.');
      }
      return title.trim();
    }

    // ----- Public API -----

    /** @returns {Array} all tasks */
    getTasks() {
      return this._load();
    }

    /**
     * Add a new task
     * @param {string} title
     * @returns {Object} the newly created task
     */
    addTask(title) {
      title = this._validateTitle(title);
      const tasks = this._load();
      const task = {
        id: this._generateId(),
        title,
        completed: false,
        createdAt: new Date().toISOString(),
      };
      tasks.push(task);
      this._save(tasks);
      return task;
    }

    /**
     * Partially update a task
     * @param {string} id
     * @param {Object} fields — keys to merge into the task
     * @returns {Object} updated task
     */
    updateTask(id, fields) {
      const tasks = this._load();
      const idx = tasks.findIndex((t) => t.id === id);
      if (idx === -1) throw new Error(`Task "${id}" not found.`);

      if (fields.title !== undefined) {
        fields.title = this._validateTitle(fields.title);
      }

      tasks[idx] = { ...tasks[idx], ...fields };
      this._save(tasks);
      return tasks[idx];
    }

    /**
     * Delete a task by id
     * @param {string} id
     */
    deleteTask(id) {
      let tasks = this._load();
      const idx = tasks.findIndex((t) => t.id === id);
      if (idx === -1) throw new Error(`Task "${id}" not found.`);
      tasks.splice(idx, 1);
      this._save(tasks);
    }

    /**
     * Toggle task completed status
     * @param {string} id
     * @returns {Object} updated task
     */
    toggleTask(id) {
      const tasks = this._load();
      const task = tasks.find((t) => t.id === id);
      if (!task) throw new Error(`Task "${id}" not found.`);
      task.completed = !task.completed;
      this._save(tasks);
      return task;
    }
  }

  // ==========================================
  // UIController — DOM rendering & events
  // ==========================================

  class UIController {
    constructor(dataModule) {
      this.data = dataModule;
      this.currentFilter = 'all'; // 'all' | 'active' | 'completed'

      // DOM refs
      this.$ = (sel) => document.querySelector(sel);
      this.$$ = (sel) => document.querySelectorAll(sel);

      this.form = this.$('#task-form');
      this.input = this.$('#task-input');
      this.addBtn = this.$('#add-btn');
      this.charCounter = this.$('#char-counter');
      this.taskList = this.$('#task-list');
      this.emptyState = this.$('#empty-state');
      this.taskCount = this.$('#task-count');
      this.clearCompletedBtn = this.$('#clear-completed-btn');
      this.filterBtns = this.$$('.filter-btn');
      this.editingId = null; // id of task being edited inline
    }

    /** Bootstrap the app */
    init() {
      this._bindEvents();
      this.render();
    }

    /** Attach event listeners */
    _bindEvents() {
      // Form submit
      this.form.addEventListener('submit', (e) => {
        e.preventDefault();
        this._handleAdd();
      });

      // Real-time char counter
      this.input.addEventListener('input', () => {
        const len = this.input.value.length;
        this.charCounter.textContent = `${len}/100`;
      });

      // Filter buttons
      this.filterBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
          this._setFilter(btn.dataset.filter);
        });
      });

      // Clear completed
      this.clearCompletedBtn.addEventListener('click', () => {
        this._handleClearCompleted();
      });

      // Delegate task-list events (edit, toggle, delete)
      this.taskList.addEventListener('click', (e) => {
        const item = e.target.closest('.task-item');
        if (!item) return;
        const id = item.dataset.id;

        // Delete
        if (e.target.closest('.delete-btn')) {
          this._handleDelete(id);
          return;
        }

        // Toggle checkbox
        if (e.target.closest('.task-checkbox')) {
          this._handleToggle(id);
          return;
        }

        // Double-click to edit
        if (e.target.closest('.task-title') || e.target.closest('.task-item')) {
          // Start edit on double-click of title
        }
      });

      // Double-click to start inline editing
      this.taskList.addEventListener('dblclick', (e) => {
        const titleEl = e.target.closest('.task-title');
        if (!titleEl) return;
        const item = titleEl.closest('.task-item');
        if (!item || item.classList.contains('completed')) return;
        this._startEdit(item.dataset.id);
      });

      // Handle enter / blur during inline edit (delegated)
      this.taskList.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const input = e.target.closest('.task-edit-input');
          if (input) this._commitEdit(input.dataset.editId, input.value);
        }
        if (e.key === 'Escape') {
          const input = e.target.closest('.task-edit-input');
          if (input) this._cancelEdit();
        }
      });

      this.taskList.addEventListener('blur', (e) => {
        const input = e.target.closest('.task-edit-input');
        if (input) this._commitEdit(input.dataset.editId, input.value);
      }, true);
    }

    // ----- Filtering -----

    _setFilter(filter) {
      this.currentFilter = filter;
      this.filterBtns.forEach((btn) => {
        const isActive = btn.dataset.filter === filter;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-selected', isActive);
      });
      this.render();
    }

    _getFilteredTasks(tasks) {
      if (this.currentFilter === 'active') {
        return tasks.filter((t) => !t.completed);
      }
      if (this.currentFilter === 'completed') {
        return tasks.filter((t) => t.completed);
      }
      return tasks;
    }

    // ----- Handlers -----

    _handleAdd() {
      const raw = this.input.value;
      if (!raw.trim()) return;

      try {
        this.data.addTask(raw);
        this.input.value = '';
        this.charCounter.textContent = '0/100';
        this.render();
        this._showToast('Task added');
      } catch (err) {
        this._showToast(err.message, true);
      }
    }

    _handleToggle(id) {
      try {
        this.data.toggleTask(id);
        this.render();
      } catch (err) {
        this._showToast(err.message, true);
      }
    }

    _handleDelete(id) {
      try {
        this.data.deleteTask(id);
        this.render();
        this._showToast('Task deleted');
      } catch (err) {
        this._showToast(err.message, true);
      }
    }

    _handleClearCompleted() {
      const tasks = this.data.getTasks();
      const completed = tasks.filter((t) => t.completed);
      if (completed.length === 0) {
        this._showToast('No completed tasks to clear');
        return;
      }
      completed.forEach((t) => this.data.deleteTask(t.id));
      this.render();
      this._showToast(`Cleared ${completed.length} completed task(s)`);
    }

    // ----- Inline Editing -----

    _startEdit(id) {
      this._cancelEdit(); // clear any pending edit
      const item = this.taskList.querySelector(`[data-id="${id}"]`);
      if (!item) return;

      const titleEl = item.querySelector('.task-title');
      const currentTitle = titleEl.textContent;

      this.editingId = id;
      titleEl.style.display = 'none';

      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'task-edit-input';
      input.value = currentTitle;
      input.dataset.editId = id;
      input.maxLength = 100;
      titleEl.parentNode.insertBefore(input, titleEl);
      input.focus();
      input.select();
    }

    _commitEdit(id, newTitle) {
      if (this.editingId !== id) return;
      if (!newTitle.trim()) {
        this._cancelEdit();
        return;
      }
      try {
        this.data.updateTask(id, { title: newTitle.trim() });
        this.render();
        this._showToast('Task updated');
      } catch (err) {
        this._showToast(err.message, true);
        this._cancelEdit();
      }
    }

    _cancelEdit() {
      if (!this.editingId) return;
      const item = this.taskList.querySelector(`[data-id="${this.editingId}"]`);
      if (item) {
        const input = item.querySelector('.task-edit-input');
        const titleEl = item.querySelector('.task-title');
        if (input) input.remove();
        if (titleEl) titleEl.style.display = '';
      }
      this.editingId = null;
    }

    // ----- Render -----

    render() {
      const allTasks = this.data.getTasks();
      const filtered = this._getFilteredTasks(allTasks);

      // Render list
      this._renderList(filtered);

      // Update counts
      const activeCount = allTasks.filter((t) => !t.completed).length;
      this.taskCount.textContent = `${activeCount} item${activeCount !== 1 ? 's' : ''}`;

      // Toggle empty state
      this.emptyState.classList.toggle('visible', filtered.length === 0);

      // Validate input button state
      this.addBtn.disabled = !this.input.value.trim();
    }

    _renderList(tasks) {
      this._cancelEdit();
      this.taskList.innerHTML = tasks
        .map(
          (t) => `
        <li class="task-item${t.completed ? ' completed' : ''}" data-id="${t.id}">
          <input
            type="checkbox"
            class="task-checkbox"
            ${t.completed ? 'checked' : ''}
            aria-label="Mark task as ${t.completed ? 'incomplete' : 'complete'}"
          >
          <span class="task-title">${this._escapeHtml(t.title)}</span>
          <div class="task-actions">
            <button class="btn-icon delete-btn" title="Delete task" aria-label="Delete task">🗑️</button>
          </div>
        </li>
      `
        )
        .join('');
    }

    /** Simple HTML escaping */
    _escapeHtml(str) {
      const div = document.createElement('div');
      div.appendChild(document.createTextNode(str));
      return div.innerHTML;
    }

    // ----- Toast Notification -----

    _showToast(msg, isError = false) {
      let toast = document.querySelector('.toast');
      if (!toast) {
        toast = document.createElement('div');
        toast.className = 'toast';
        document.body.appendChild(toast);
      }
      toast.textContent = msg;
      toast.style.background = isError ? '#dc2626' : '#1e293b';
      toast.classList.add('show');
      clearTimeout(this._toastTimer);
      this._toastTimer = setTimeout(() => {
        toast.classList.remove('show');
      }, 2500);
    }
  }

  // ==========================================
  // Boot
  // ==========================================

  let dataModule;
  try {
    dataModule = new DataModule();
  } catch (err) {
    console.error(err.message);
    // Show a persistent error in the UI
    const storageStatus = document.getElementById('storage-status');
    if (storageStatus) {
      storageStatus.textContent = '⚠️ localStorage unavailable';
      storageStatus.style.color = '#dc2626';
    }
    // Create a no-op data module that returns empty
    dataModule = {
      getTasks: () => [],
      addTask: () => { throw new Error(err.message); },
      updateTask: () => { throw new Error(err.message); },
      deleteTask: () => {},
      toggleTask: () => {},
    };
  }

  const ui = new UIController(dataModule);
  ui.init();
})();
