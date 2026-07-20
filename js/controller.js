/**
 * Controller — TodoController
 * Mediates between Model and View. Handles events, validation, cross-tab sync.
 */

import { TodoStore, escapeHtml } from './model.js';
import { TodoView } from './view.js';

export class TodoController {
  constructor() {
    this.store = new TodoStore();
    this.view = new TodoView();
    this.editingId = null;
  }

  /**
   * Bootstrap: check storage, load data, bind events.
   */
  init() {
    // Feature detection
    if (!TodoStore.isAvailable()) {
      this.view.showError(
        'localStorage is not available. Data cannot be saved.'
      );
      return;
    }

    this.render();
    this.bindEvents();
    this.bindCrossTabSync();
  }

  /**
   * Render current data.
   */
  render() {
    const todos = this.store.getAll();
    this.view.render(todos);
  }

  /**
   * Bind all DOM events.
   */
  bindEvents() {
    const form = document.getElementById('todo-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = document.getElementById('todo-input');
      this.handleAdd(input.value);
      input.value = '';
      input.focus();
    });

    // Event delegation on the list for dynamic items
    this.view.listEl.addEventListener('click', (e) => {
      const li = e.target.closest('.todo-item');
      if (!li) return;
      const id = li.dataset.id;

      if (e.target.classList.contains('delete-btn')) {
        this.handleDelete(id);
      } else if (e.target.classList.contains('edit-btn')) {
        this.handleEditStart(id);
      } else if (e.target.classList.contains('save-btn')) {
        const input = li.querySelector('.edit-input');
        if (input) this.handleEditSave(id, input.value);
      } else if (e.target.classList.contains('cancel-btn')) {
        this.handleEditCancel(id);
      }
    });

    // Checkbox toggle — use change event for accessibility
    this.view.listEl.addEventListener('change', (e) => {
      if (e.target.classList.contains('todo-checkbox')) {
        const li = e.target.closest('.todo-item');
        if (li) this.handleToggle(li.dataset.id);
      }
    });

    // ESC key to cancel edit
    this.view.listEl.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.editingId) {
        this.handleEditCancel(this.editingId);
      }
    });
  }

  /**
   * Sync across tabs using the storage event.
   */
  bindCrossTabSync() {
    window.addEventListener('storage', (e) => {
      if (e.key === TodoStore.STORAGE_KEY) {
        // Only re-render if we are not the origin tab
        this.render();
      }
    });
  }

  /**
   * Add a new todo item.
   * @param {string} title
   */
  handleAdd(title) {
    const trimmed = title.trim();
    if (!trimmed) {
      this.view.showError('Please enter a task.');
      document.getElementById('todo-input').focus();
      return;
    }

    try {
      this.store.create(trimmed);
      this.render();
    } catch (err) {
      this.view.showError(err.message);
    }
  }

  /**
   * Start edit mode for an item.
   * @param {string} id
   */
  handleEditStart(id) {
    const item = this.store.getById(id);
    if (!item) return;

    this.editingId = id;
    const li = this.view.listEl.querySelector(`[data-id="${id}"]`);
    if (!li) return;

    const { input, saveBtn, cancelBtn } = this.view.enterEditMode(li, item.title);

    // Enter key to save
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.handleEditSave(id, input.value);
      }
    });
  }

  /**
   * Save an edited title.
   * @param {string} id
   * @param {string} newTitle
   */
  handleEditSave(id, newTitle) {
    const trimmed = newTitle.trim();
    if (!trimmed) {
      this.view.showError('Title cannot be empty.');
      return;
    }

    this.store.update(id, { title: trimmed });
    this.editingId = null;
    this.render();
  }

  /**
   * Cancel edit mode, revert content.
   * @param {string} id
   */
  handleEditCancel(id) {
    this.editingId = null;
    const li = this.view.listEl.querySelector(`[data-id="${id}"]`);
    if (li) this.view.exitEditMode(li);
  }

  /**
   * Delete an item after confirmation.
   * @param {string} id
   */
  handleDelete(id) {
    const item = this.store.getById(id);
    if (!item) return;

    if (confirm(`Delete "${item.title}"?`)) {
      this.store.delete(id);
      this.render();
    }
  }

  /**
   * Toggle an item's completed status.
   * @param {string} id
   */
  handleToggle(id) {
    this.store.toggle(id);
    this.render();
  }
}
