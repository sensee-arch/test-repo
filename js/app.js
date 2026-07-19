// js/app.js — Controller

class TodoController {
  constructor() {
    this.repository = new LocalStorageRepository();
    this.view = new TodoView();
    this.filter = 'all';

    this.#bindEvents();
    this.#loadTodos();
  }

  // ── Event binding ───────────────────────────────────────────

  #bindEvents() {
    // Add
    this.view.form.addEventListener('submit', e => {
      e.preventDefault();
      this.#addTodo();
    });

    // Toggle & Delete (event delegation)
    this.view.list.addEventListener('click', e => {
      const li = e.target.closest('.todo-item');
      if (!li) return;
      const id = li.dataset.id;

      if (e.target.classList.contains('todo-checkbox')) {
        this.#toggleTodo(id);
      } else if (e.target.classList.contains('todo-delete-btn')) {
        this.#deleteTodo(id);
      }
    });

    // Inline edit (double-click)
    this.view.list.addEventListener('dblclick', e => {
      const label = e.target.closest('.todo-label');
      if (!label) return;
      this.#startEdit(label.closest('.todo-item'));
    });

    // Filter buttons
    this.view.filters.forEach(btn => {
      btn.addEventListener('click', () => {
        this.filter = btn.dataset.filter;
        this.view.updateFilterButtons(this.filter);
        this.#loadTodos();
      });
    });

    // Clear completed
    this.view.clearBtn.addEventListener('click', () => this.#clearCompleted());

    // Inline edit keyboard
    this.view.list.addEventListener('keydown', e => {
      if (!e.target.classList.contains('todo-edit-input')) return;
      if (e.key === 'Enter') { e.preventDefault(); this.#finishEdit(e.target); }
      if (e.key === 'Escape') { this.#cancelEdit(e.target); }
    });

    // Inline edit blur
    this.view.list.addEventListener('blur', e => {
      if (e.target.classList.contains('todo-edit-input')) this.#finishEdit(e.target);
    }, true);

    // Keyboard shortcut: Ctrl/Cmd + N to focus input
    document.addEventListener('keydown', e => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        this.view.input.focus();
      }
    });
  }

  // ── Actions ─────────────────────────────────────────────────

  #addTodo() {
    const title = this.view.getInputValue();
    if (!title) {
      this.view.showError('Please enter a task description');
      this.view.input.focus();
      return;
    }
    try {
      this.repository.create({ title });
      this.#loadTodos();
      this.view.input.focus();
    } catch (err) {
      this.view.showError(err.message);
    }
  }

  #toggleTodo(id) {
    try {
      const item = this.repository.getById(id);
      if (!item) return;
      item.toggle();
      this.repository.update(id, { completed: item.completed, updatedAt: item.updatedAt });
      this.#loadTodos();
    } catch (err) {
      this.view.showError(err.message);
    }
  }

  #deleteTodo(id) {
    this.repository.delete(id);
    this.view.removeTodoElement(id);
    setTimeout(() => this.#loadTodos(), 200);
  }

  #clearCompleted() {
    this.repository.getAll()
      .filter(i => i.completed)
      .forEach(i => this.repository.delete(i.id));
    this.#loadTodos();
  }

  // ── Inline editing ──────────────────────────────────────────

  #startEdit(li) {
    const label = li.querySelector('.todo-label');
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'todo-edit-input';
    input.value = label.textContent;
    input.maxLength = 500;
    label.replaceWith(input);
    input.focus();
    input.select();
  }

  #finishEdit(input) {
    const li = input.closest('.todo-item');
    const title = input.value.trim();
    if (!title) { this.#cancelEdit(input); return; }
    try {
      this.repository.update(li.dataset.id, { title });
    } catch { /* discard invalid data */ }
    this.#loadTodos();
  }

  #cancelEdit(_input) {
    this.#loadTodos();
  }

  // ── Data load ───────────────────────────────────────────────

  #loadTodos() {
    const items = this.repository.getAll();
    this.view.renderList(items, this.filter);
    this.view.updateClearButton(items);
  }
}

// ── Boot ──────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  new TodoController();
});
