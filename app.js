/**
 * TodoList Application
 * View (HTML+CSS) → Controller (App) → Model (TodoStore) → localStorage
 * Zero external dependencies. ES6+ classes. Browser-only.
 */

/* ==================================================================
 * Model Layer — TodoStore
 * ================================================================== */
class TodoStore {
  static STORAGE_KEY = 'todolist_tasks';

  /** Load tasks from localStorage */
  static load() {
    try {
      const raw = localStorage.getItem(TodoStore.STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      // Rehydrate dates and ensure valid shape
      return parsed
        .filter(t => t && typeof t.id === 'string')
        .map(t => ({
          id: t.id,
          text: typeof t.text === 'string' ? t.text : '',
          completed: !!t.completed,
          createdAt: t.createdAt || new Date().toISOString()
        }));
    } catch {
      return [];
    }
  }

  /** Save tasks to localStorage */
  static save(tasks) {
    try {
      localStorage.setItem(TodoStore.STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {
      console.error('TodoStore: failed to save', e);
    }
  }

  /** Generate a unique id */
  static uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }
}

/* ==================================================================
 * Controller Layer — App
 * ================================================================== */
class App {
  constructor() {
    this.tasks = TodoStore.load();
    this.filter = 'all';    // 'all' | 'active' | 'completed'
    this.editingId = null;   // id of task currently being edited

    // DOM references
    this.$ = {
      form: document.getElementById('todo-form'),
      input: document.getElementById('todo-input'),
      list: document.getElementById('todo-list'),
      empty: document.getElementById('empty-state'),
      count: document.getElementById('item-count'),
      clearBtn: document.getElementById('clear-completed'),
      filterBtns: document.querySelectorAll('.filter-btn')
    };

    this.bindEvents();
    this.render();
  }

  /* ----- Event Binding ----- */
  bindEvents() {
    // Add task
    this.$.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.addTask();
    });

    // Clear completed
    this.$.clearBtn.addEventListener('click', () => {
      this.clearCompleted();
    });

    // Filter buttons (event delegation on toolbar)
    this.$.filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.setFilter(btn.dataset.filter);
      });
    });

    // Task list event delegation (toggle, delete, edit start, edit submit)
    this.$.list.addEventListener('click', (e) => {
      const li = e.target.closest('.todo-item');
      if (!li) return;
      const id = li.dataset.id;

      if (e.target.classList.contains('todo-checkbox')) {
        this.toggleTask(id);
      } else if (e.target.classList.contains('delete-btn')) {
        this.deleteTask(id);
      } else if (e.target.classList.contains('todo-text')) {
        this.startEdit(id);
      }
    });

    // Edit input keydown (Enter to save, Escape to cancel)
    this.$.list.addEventListener('keydown', (e) => {
      if (e.target.classList.contains('todo-edit-input')) {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.submitEdit(e.target);
        } else if (e.key === 'Escape') {
          this.cancelEdit();
        }
      }
    });

    // Blur on edit input also saves
    this.$.list.addEventListener('blur', (e) => {
      if (e.target.classList.contains('todo-edit-input')) {
        this.submitEdit(e.target);
      }
    }, true);
  }

  /* ----- CRUD Operations ----- */

  /** Add a new task */
  addTask() {
    const text = this.$.input.value.trim();
    if (!text) return;

    this.tasks.unshift({
      id: TodoStore.uid(),
      text,
      completed: false,
      createdAt: new Date().toISOString()
    });

    this.$.input.value = '';
    this.$.input.focus();
    this.persist();
    this.render();
  }

  /** Toggle task completed state */
  toggleTask(id) {
    const task = this.tasks.find(t => t.id === id);
    if (!task) return;
    task.completed = !task.completed;
    this.persist();
    this.render();
  }

  /** Delete a task */
  deleteTask(id) {
    this.tasks = this.tasks.filter(t => t.id !== id);
    if (this.editingId === id) this.editingId = null;
    this.persist();
    this.render();
  }

  /** Start inline editing */
  startEdit(id) {
    const task = this.tasks.find(t => t.id === id);
    if (!task || task.completed) return;
    this.editingId = id;
    this.render();
    // Auto-focus the edit input
    requestAnimationFrame(() => {
      const input = document.querySelector(`.todo-item[data-id="${id}"] .todo-edit-input`);
      if (input) {
        input.value = task.text;
        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);
      }
    });
  }

  /** Submit edit from input element */
  submitEdit(input) {
    if (this.editingId === null) return;
    const text = input.value.trim();
    if (text) {
      const task = this.tasks.find(t => t.id === this.editingId);
      if (task) task.text = text;
    }
    this.editingId = null;
    this.persist();
    this.render();
  }

  /** Cancel edit, reverting to original text */
  cancelEdit() {
    this.editingId = null;
    this.render();
  }

  /** Clear all completed tasks */
  clearCompleted() {
    this.tasks = this.tasks.filter(t => !t.completed);
    this.persist();
    this.render();
  }

  /** Set current filter */
  setFilter(filter) {
    if (this.filter === filter) return;
    this.filter = filter;

    // Update active class on filter buttons
    this.$.filterBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.filter === filter);
    });

    this.render();
  }

  /** Get filtered tasks */
  getFilteredTasks() {
    switch (this.filter) {
      case 'active':
        return this.tasks.filter(t => !t.completed);
      case 'completed':
        return this.tasks.filter(t => t.completed);
      default:
        return this.tasks;
    }
  }

  /* ----- Persistence ----- */
  persist() {
    TodoStore.save(this.tasks);
  }

  /* ----- Rendering ----- */
  render() {
    const filtered = this.getFilteredTasks();
    const totalActive = this.tasks.filter(t => !t.completed).length;
    const hasCompleted = this.tasks.some(t => t.completed);

    // Update item count
    this.$.count.textContent = `${totalActive} item${totalActive !== 1 ? 's' : ''} left`;

    // Toggle clear completed button visibility
    this.$.clearBtn.style.display = hasCompleted ? '' : 'none';

    // Toggle empty state
    if (this.tasks.length === 0) {
      this.$.list.innerHTML = '';
      this.$.empty.classList.remove('hidden');
      return;
    }
    this.$.empty.classList.add('hidden');

    // Render task items
    this.$.list.innerHTML = filtered.map(task => this.renderTask(task)).join('');

    // Re-check checkboxes after DOM injection (ensure checked state)
    filtered.forEach(task => {
      const checkbox = document.querySelector(`.todo-item[data-id="${task.id}"] .todo-checkbox`);
      if (checkbox && task.completed) {
        checkbox.checked = true;
      }
    });
  }

  /** Render a single task item as HTML string */
  renderTask(task) {
    const isEditing = this.editingId === task.id;
    const textClass = task.completed ? 'todo-text completed' : 'todo-text';

    let textContent;
    if (isEditing) {
      textContent = `<input type="text" class="todo-edit-input" value="${this.escapeHtml(task.text)}" />`;
    } else {
      textContent = `<span class="${textClass}">${this.escapeHtml(task.text)}</span>`;
    }

    return `
      <li class="todo-item${task.completed ? ' completed' : ''}" data-id="${task.id}">
        <input type="checkbox" class="todo-checkbox" ${task.completed ? 'checked' : ''} />
        ${textContent}
        <button class="delete-btn" title="Delete task">&times;</button>
      </li>
    `;
  }

  /** Escape HTML to prevent XSS */
  escapeHtml(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }
}

/* ==================================================================
 * Bootstrap
 * ================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  new App();
});
