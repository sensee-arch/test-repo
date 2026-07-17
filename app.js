/* =========================================
   Todo List App — Model + Controller
   ========================================= */

(function () {
  'use strict';

  // =========================================
  // Helpers
  // =========================================

  /** Generate a simple unique id */
  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  /** Validate a todo item structure */
  function isValidTodo(item) {
    return (
      item &&
      typeof item.id === 'string' &&
      typeof item.title === 'string' &&
      typeof item.completed === 'boolean'
    );
  }

  /** Sanitize a todo item (repair if possible) */
  function sanitizeTodo(item) {
    if (!item || typeof item !== 'object') return null;
    return {
      id: typeof item.id === 'string' ? item.id : generateId(),
      title: typeof item.title === 'string' ? item.title.trim() || '未命名任务' : '未命名任务',
      completed: typeof item.completed === 'boolean' ? item.completed : false,
      createdAt: typeof item.createdAt === 'string' ? item.createdAt : new Date().toISOString(),
    };
  }

  /** Notify user with a temporary message */
  function notifyUser(message, type) {
    type = type || 'info';
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();

    const el = document.createElement('div');
    el.className = 'notification notification--' + type;
    el.textContent = message;
    el.setAttribute('role', 'alert');
    document.querySelector('.app').prepend(el);

    // Auto-remove after 3 seconds
    setTimeout(function () {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 3000);
  }

  // =========================================
  // Model Layer — Data & Persistence
  // =========================================

  /** Task data model */
  class Task {
    constructor(title) {
      this.id = generateId();
      this.title = title.trim();
      this.completed = false;
      this.createdAt = new Date().toISOString();
    }
  }

  /** localStorage CRUD wrapper */
  const Store = {
    KEY: 'todos',

    /** Load all todos from localStorage */
    load() {
      try {
        const raw = localStorage.getItem(this.KEY);
        if (!raw) return [];
        const data = JSON.parse(raw);
        // Ensure it's an array; if not, reset
        if (!Array.isArray(data)) {
          console.warn('Store.load: data is not an array, resetting');
          this.save([]);
          return [];
        }
        // Sanitize each item (repair corrupted entries, drop unfixable ones)
        return data.map(sanitizeTodo).filter(Boolean);
      } catch (e) {
        console.error('Store.load error:', e);
        return [];
      }
    },

    /** Save all todos to localStorage */
    save(todos) {
      try {
        localStorage.setItem(this.KEY, JSON.stringify(todos));
        return true;
      } catch (e) {
        if (e.name === 'QuotaExceededError' || e.code === 22) {
          console.error('Store.save: localStorage quota exceeded');
          notifyUser('存储空间已满，请删除一些待办事项后再试', 'error');
        } else {
          console.error('Store.save error:', e);
          notifyUser('保存失败，请检查浏览器存储设置', 'error');
        }
        return false;
      }
    },

    /** Get all todos */
    getAll() {
      return this.load();
    },

    /** Get a single todo by id */
    getById(id) {
      return this.load().find(t => t.id === id) || null;
    },

    /** Add a new todo; returns the created task or null on failure */
    add(title) {
      const todos = this.load();
      const task = new Task(title);
      todos.push(task);
      if (this.save(todos)) return task;
      return null;
    },

    /** Update a todo by id (partial update) */
    update(id, changes) {
      const todos = this.load();
      const index = todos.findIndex(t => t.id === id);
      if (index === -1) return null;
      todos[index] = { ...todos[index], ...changes };
      if (!this.save(todos)) return null;
      return todos[index];
    },

    /** Delete a todo by id */
    delete(id) {
      let todos = this.load();
      todos = todos.filter(t => t.id !== id);
      this.save(todos);
      return todos;
    },

    /** Toggle completed state */
    toggle(id) {
      const todo = this.getById(id);
      if (!todo) return null;
      return this.update(id, { completed: !todo.completed });
    },

    /** Clear all completed todos */
    clearCompleted() {
      let todos = this.load();
      todos = todos.filter(t => !t.completed);
      this.save(todos);
      return todos;
    },

    /** Export todos as JSON string */
    export() {
      return JSON.stringify(this.load(), null, 2);
    },

    /** Import todos from JSON string (appends) */
    import(jsonStr) {
      try {
        const imported = JSON.parse(jsonStr);
        if (!Array.isArray(imported)) throw new Error('数据格式无效：期望数组');
        if (imported.length === 0) {
          notifyUser('导入文件中没有待办事项', 'info');
          return null;
        }
        // Sanitize imported items
        const sanitized = imported.map(sanitizeTodo).filter(Boolean);
        if (sanitized.length === 0) {
          notifyUser('导入文件中没有有效的待办事项', 'info');
          return null;
        }
        const existing = this.load();
        const merged = [...existing, ...sanitized];
        if (!this.save(merged)) return null;
        notifyUser('成功导入 ' + sanitized.length + ' 项待办事项', 'success');
        return merged;
      } catch (e) {
        console.error('Store.import error:', e);
        notifyUser('导入失败：' + e.message, 'error');
        return null;
      }
    },
  };

  // =========================================
  // Controller Layer — UI & Event Handling
  // =========================================

  class TodoApp {
    constructor() {
      // State
      this.currentFilter = 'all';
      this.editingId = null;
      // Guard to handle rapid edit actions
      this._editingGuard = false;

      // DOM references
      this.$form = document.getElementById('addForm');
      this.$input = document.getElementById('todoInput');
      this.$list = document.getElementById('todoList');
      this.$emptyState = document.getElementById('emptyState');
      this.$itemCount = document.getElementById('itemCount');
      this.$clearCompleted = document.getElementById('clearCompleted');
      this.$filters = document.querySelectorAll('.toolbar__filter');
      this.$btnExport = document.getElementById('btnExport');
      this.$btnImport = document.getElementById('btnImport');
      this.$fileInput = document.getElementById('fileInput');

      // Init
      this.bindEvents();
      this.render();
    }

    // -----------------------------------------
    // Render
    // -----------------------------------------

    /** Get filtered todos based on current filter */
    getFilteredTodos() {
      const all = Store.getAll();
      switch (this.currentFilter) {
        case 'active':
          return all.filter(t => !t.completed);
        case 'completed':
          return all.filter(t => t.completed);
        default:
          return all;
      }
    }

    /** Render the todo list and empty state */
    render() {
      const todos = this.getFilteredTodos();
      const allTodos = Store.getAll();

      // Clear list
      this.$list.innerHTML = '';

      // Show/hide empty state
      if (todos.length === 0) {
        this.$emptyState.hidden = false;
        this.$list.hidden = true;
      } else {
        this.$emptyState.hidden = true;
        this.$list.hidden = false;

        // Render each item
        todos.forEach(todo => {
          const el = this.createTodoElement(todo);
          this.$list.appendChild(el);
        });
      }

      // Update count
      const activeCount = allTodos.filter(t => !t.completed).length;
      this.$itemCount.textContent = activeCount + ' 项待办';

      // Update filter button styles
      this.$filters.forEach(function (btn) {
        var filter = btn.dataset.filter;
        if (filter === this.currentFilter) {
          btn.classList.add('btn--filter--active');
        } else {
          btn.classList.remove('btn--filter--active');
        }
      }, this);

      // Update clear completed button visibility
      const completedCount = allTodos.filter(t => t.completed).length;
      this.$clearCompleted.hidden = completedCount === 0;
    }

    /** Create a single todo DOM element */
    createTodoElement(todo) {
      const isEditing = this.editingId === todo.id;
      const item = document.createElement('div');
      item.className = 'todo-item' +
        (todo.completed ? ' todo-item--completed' : '') +
        (isEditing ? ' todo-item--editing' : '');
      item.dataset.id = todo.id;

      if (isEditing) {
        // Editing mode
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'todo-item__edit-input';
        input.value = todo.title;
        input.maxLength = 200;
        input.autofocus = true;

        // Save on Enter, cancel on Escape
        input.addEventListener('keydown', function (e) {
          if (e.key === 'Enter') {
            e.preventDefault();
            this.saveEdit(todo.id, input.value);
          } else if (e.key === 'Escape') {
            this.cancelEdit();
          }
        }.bind(this));

        // Save on blur (debounced to avoid race with Enter)
        var self = this;
        input.addEventListener('blur', function () {
          setTimeout(function () {
            if (self.editingId === todo.id) {
              self.saveEdit(todo.id, input.value);
            }
          }, 150);
        });

        item.appendChild(input);

        // Focus the input after render
        requestAnimationFrame(function () {
          input.focus();
          input.select();
        });
      } else {
        // Normal display mode

        // Checkbox
        const checkboxWrap = document.createElement('label');
        checkboxWrap.className = 'todo-item__checkbox';
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = todo.completed;
        checkboxWrap.appendChild(checkbox);
        const checkmark = document.createElement('span');
        checkmark.className = 'checkmark';
        checkboxWrap.appendChild(checkmark);

        checkbox.addEventListener('change', function () {
          Store.toggle(todo.id);
          this.render();
        }.bind(this));

        item.appendChild(checkboxWrap);

        // Text
        const textSpan = document.createElement('span');
        textSpan.className = 'todo-item__text';
        textSpan.textContent = todo.title;
        // Double-click to edit
        textSpan.addEventListener('dblclick', function () {
          this.startEdit(todo.id);
        }.bind(this));
        item.appendChild(textSpan);

        // Actions
        const actions = document.createElement('div');
        actions.className = 'todo-item__actions';

        // Edit button
        const editBtn = document.createElement('button');
        editBtn.className = 'btn btn--icon btn--icon--edit';
        editBtn.title = '编辑';
        editBtn.textContent = '✏️';
        editBtn.addEventListener('click', function () {
          this.startEdit(todo.id);
        }.bind(this));
        actions.appendChild(editBtn);

        // Delete button
        const delBtn = document.createElement('button');
        delBtn.className = 'btn btn--icon';
        delBtn.title = '删除';
        delBtn.textContent = '🗑️';
        delBtn.addEventListener('click', function () {
          Store.delete(todo.id);
          if (this.editingId === todo.id) this.editingId = null;
          this.render();
        }.bind(this));
        actions.appendChild(delBtn);

        item.appendChild(actions);
      }

      return item;
    }

    // -----------------------------------------
    // Event Binding
    // -----------------------------------------

    bindEvents() {
      // Add todo form submit
      this.$form.addEventListener('submit', function (e) {
        e.preventDefault();
        this.addTodo();
      }.bind(this));

      // Filter buttons
      this.$filters.forEach(function (btn) {
        btn.addEventListener('click', function () {
          this.currentFilter = btn.dataset.filter;
          this.editingId = null;
          this.render();
        }.bind(this));
      }.bind(this));

      // Clear completed
      this.$clearCompleted.addEventListener('click', function () {
        Store.clearCompleted();
        this.editingId = null;
        this.render();
      }.bind(this));

      // Export button
      if (this.$btnExport) {
        this.$btnExport.addEventListener('click', function () {
          this.exportTodos();
        }.bind(this));
      }

      // Import button
      if (this.$btnImport) {
        this.$btnImport.addEventListener('click', function () {
          this.$fileInput.click();
        }.bind(this));
      }

      // File input for import
      if (this.$fileInput) {
        this.$fileInput.addEventListener('change', function () {
          this.importTodos(this.$fileInput);
        }.bind(this));
      }

      // Keyboard shortcut: Escape to clear input focus
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && document.activeElement === this.$input) {
          this.$input.blur();
        }
      }.bind(this));
    }

    // -----------------------------------------
    // Actions
    // -----------------------------------------

    /** Add a new todo */
    addTodo() {
      const title = this.$input.value.trim();
      if (!title) {
        this.$input.focus();
        return;
      }
      const task = Store.add(title);
      if (!task) return; // storage full
      this.$input.value = '';
      this.$input.focus();
      this.currentFilter = 'all';
      this.editingId = null;
      this.render();
    }

    /** Start editing a todo (with guard against rapid re-entry) */
    startEdit(id) {
      if (this._editingGuard) return;
      this._editingGuard = true;
      this.editingId = id;
      this.render();
      // Release guard after render completes
      var self = this;
      requestAnimationFrame(function () {
        self._editingGuard = false;
      });
    }

    /** Save the edited todo */
    saveEdit(id, newTitle) {
      // Skip if already cancelled
      if (this.editingId !== id) return;
      const trimmed = newTitle.trim();
      if (trimmed) {
        Store.update(id, { title: trimmed });
      } else {
        // If empty, delete the todo
        Store.delete(id);
      }
      this.editingId = null;
      this.render();
    }

    /** Cancel editing */
    cancelEdit() {
      this.editingId = null;
      this.render();
    }

    /** Export todos to a downloadable JSON file */
    exportTodos() {
      const data = Store.export();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'todos-' + new Date().toISOString().slice(0, 10) + '.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      notifyUser('已导出 ' + Store.getAll().length + ' 项待办事项', 'success');
    }

    /** Import todos from a selected file */
    importTodos(fileInput) {
      const file = fileInput.files[0];
      if (!file) return;

      // Validate file size (max 1MB)
      if (file.size > 1024 * 1024) {
        notifyUser('导入文件超过大小限制（最大 1MB）', 'error');
        fileInput.value = '';
        return;
      }

      const reader = new FileReader();
      var self = this;
      reader.addEventListener('load', function () {
        Store.import(reader.result);
        self.editingId = null;
        self.render();
        fileInput.value = '';
      });
      reader.addEventListener('error', function () {
        notifyUser('文件读取失败', 'error');
        fileInput.value = '';
      });
      reader.readAsText(file, 'UTF-8');
    }
  }

  // =========================================
  // Notification Styles (dynamically injected)
  // =========================================

  (function injectNotificationStyles() {
    const styleId = 'todo-notification-styles';
    if (document.getElementById(styleId)) return;

    const css = `
.notification {
  position: fixed;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 24px;
  border-radius: var(--radius-md, 10px);
  font-size: 0.9rem;
  font-weight: 600;
  z-index: 9999;
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
  animation: notification-in 0.25s ease;
  max-width: 90%;
  text-align: center;
}
.notification--info {
  background: var(--color-primary, #4a90d9);
  color: #fff;
}
.notification--success {
  background: var(--color-success, #27ae60);
  color: #fff;
}
.notification--error {
  background: var(--color-danger, #e74c3c);
  color: #fff;
}
@keyframes notification-in {
  from { opacity: 0; transform: translateX(-50%) translateY(-12px); }
  to { opacity: 1; transform: translateX(-50%) translateY(0); }
}`;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = css;
    document.head.appendChild(style);
  })();

  // =========================================
  // Boot
  // =========================================

  document.addEventListener('DOMContentLoaded', function () {
    window.todoApp = new TodoApp();
  });

})();
