/* =========================================
   Todo List App — Model + Controller
   ========================================= */

(function () {
  'use strict';

  // =========================================
  // Model Layer — Data & Persistence
  // =========================================

  /** Generate a simple unique id */
  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

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
        const data = localStorage.getItem(this.KEY);
        return data ? JSON.parse(data) : [];
      } catch (e) {
        console.error('Store.load error:', e);
        return [];
      }
    },

    /** Save all todos to localStorage */
    save(todos) {
      try {
        localStorage.setItem(this.KEY, JSON.stringify(todos));
      } catch (e) {
        console.error('Store.save error:', e);
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

    /** Add a new todo; returns updated array */
    add(title) {
      const todos = this.load();
      const task = new Task(title);
      todos.push(task);
      this.save(todos);
      return task;
    },

    /** Update a todo by id (partial update) */
    update(id, changes) {
      const todos = this.load();
      const index = todos.findIndex(t => t.id === id);
      if (index === -1) return null;
      todos[index] = { ...todos[index], ...changes };
      this.save(todos);
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
        if (!Array.isArray(imported)) throw new Error('Invalid format');
        const existing = this.load();
        const merged = [...existing, ...imported];
        this.save(merged);
        return merged;
      } catch (e) {
        console.error('Store.import error:', e);
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

      // DOM references
      this.$form = document.getElementById('addForm');
      this.$input = document.getElementById('todoInput');
      this.$list = document.getElementById('todoList');
      this.$emptyState = document.getElementById('emptyState');
      this.$itemCount = document.getElementById('itemCount');
      this.$clearCompleted = document.getElementById('clearCompleted');
      this.$filters = document.querySelectorAll('.toolbar__filter');

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
      this.$itemCount.textContent = `${activeCount} 项待办`;

      // Update filter button styles
      this.$filters.forEach(btn => {
        const filter = btn.dataset.filter;
        btn.classList.toggle('btn--filter--active', filter === this.currentFilter);
      });
    }

    /** Create a single todo DOM element */
    createTodoElement(todo) {
      const isEditing = this.editingId === todo.id;
      const item = document.createElement('div');
      item.className = `todo-item${todo.completed ? ' todo-item--completed' : ''}${isEditing ? ' todo-item--editing' : ''}`;
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
        input.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            this.saveEdit(todo.id, input.value);
          } else if (e.key === 'Escape') {
            this.cancelEdit();
          }
        });

        // Save on blur (with small delay to allow click on other elements)
        input.addEventListener('blur', () => {
          setTimeout(() => {
            if (this.editingId === todo.id) {
              this.saveEdit(todo.id, input.value);
            }
          }, 100);
        });

        item.appendChild(input);

        // Focus the input after render
        requestAnimationFrame(() => {
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

        checkbox.addEventListener('change', () => {
          Store.toggle(todo.id);
          this.render();
        });

        item.appendChild(checkboxWrap);

        // Text
        const textSpan = document.createElement('span');
        textSpan.className = 'todo-item__text';
        textSpan.textContent = todo.title;
        // Double-click to edit
        textSpan.addEventListener('dblclick', () => {
          this.startEdit(todo.id);
        });
        item.appendChild(textSpan);

        // Actions
        const actions = document.createElement('div');
        actions.className = 'todo-item__actions';

        // Edit button
        const editBtn = document.createElement('button');
        editBtn.className = 'btn btn--icon btn--icon--edit';
        editBtn.title = '编辑';
        editBtn.textContent = '✏️';
        editBtn.addEventListener('click', () => {
          this.startEdit(todo.id);
        });
        actions.appendChild(editBtn);

        // Delete button
        const delBtn = document.createElement('button');
        delBtn.className = 'btn btn--icon';
        delBtn.title = '删除';
        delBtn.textContent = '🗑️';
        delBtn.addEventListener('click', () => {
          Store.delete(todo.id);
          if (this.editingId === todo.id) this.editingId = null;
          this.render();
        });
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
      this.$form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.addTodo();
      });

      // Filter buttons
      this.$filters.forEach(btn => {
        btn.addEventListener('click', () => {
          this.currentFilter = btn.dataset.filter;
          this.editingId = null;
          this.render();
        });
      });

      // Clear completed
      this.$clearCompleted.addEventListener('click', () => {
        Store.clearCompleted();
        this.editingId = null;
        this.render();
      });

      // Keyboard shortcut: Ctrl+Z to clear input focus
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && document.activeElement === this.$input) {
          this.$input.blur();
        }
      });
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
      Store.add(title);
      this.$input.value = '';
      this.$input.focus();
      this.currentFilter = 'all';
      this.editingId = null;
      this.render();
    }

    /** Start editing a todo */
    startEdit(id) {
      this.editingId = id;
      this.render();
    }

    /** Save the edited todo */
    saveEdit(id, newTitle) {
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
  }

  // =========================================
  // Boot
  // =========================================

  document.addEventListener('DOMContentLoaded', () => {
    window.todoApp = new TodoApp();
  });

})();
