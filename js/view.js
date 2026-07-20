/**
 * View — TodoView
 * Pure DOM rendering layer. Receives data, produces DOM elements.
 * No direct localStorage or business logic.
 */

import { escapeHtml } from './model.js';

export class TodoView {
  constructor() {
    this.listEl = document.getElementById('todo-list');
    this.statsEl = document.getElementById('todo-stats');
    this.errorEl = document.getElementById('todo-error');
  }

  /**
   * Full list re-render from an array of items.
   * @param {Array<Object>} todos
   */
  render(todos) {
    if (!Array.isArray(todos) || todos.length === 0) {
      this.renderEmpty();
      this.renderStats(todos || []);
      return;
    }

    this.clearError();
    const fragment = document.createDocumentFragment();
    for (const todo of todos) {
      fragment.appendChild(this.renderItem(todo));
    }

    this.listEl.innerHTML = '';
    this.listEl.appendChild(fragment);
    this.renderStats(todos);
  }

  /**
   * Empty state placeholder.
   */
  renderEmpty() {
    this.listEl.innerHTML =
      '<li class="empty-state"><p>📋</p><p>No todos yet. Add one above!</p></li>';
  }

  /**
   * Render a single todo item as an <li> element.
   * @param {Object} todo
   * @returns {HTMLLIElement}
   */
  renderItem(todo) {
    const li = document.createElement('li');
    li.className = 'todo-item' + (todo.completed ? ' completed' : '');
    li.dataset.id = todo.id;

    // Checkbox
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'todo-checkbox';
    checkbox.checked = todo.completed;
    checkbox.setAttribute('aria-label', `Toggle "${todo.title}"`);

    // Title
    const titleSpan = document.createElement('span');
    titleSpan.className = 'todo-title';
    titleSpan.textContent = todo.title;

    // Action buttons
    const actions = document.createElement('div');
    actions.className = 'todo-actions';

    const editBtn = document.createElement('button');
    editBtn.className = 'edit-btn';
    editBtn.textContent = '\u270F\uFE0F';
    editBtn.setAttribute('aria-label', `Edit "${todo.title}"`);

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = '\uD83D\uDDD1\uFE0F';
    deleteBtn.setAttribute('aria-label', `Delete "${todo.title}"`);

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    li.appendChild(checkbox);
    li.appendChild(titleSpan);
    li.appendChild(actions);

    return li;
  }

  /**
   * Update stats display.
   * @param {Array<Object>} todos
   */
  renderStats(todos) {
    if (!this.statsEl) return;
    const total = Array.isArray(todos) ? todos.length : 0;
    const completed = Array.isArray(todos)
      ? todos.filter((t) => t.completed).length
      : 0;
    this.statsEl.innerHTML =
      `<span id="todo-count">${total} item${total !== 1 ? 's' : ''}</span>` +
      `<span id="todo-completed">${completed} completed</span>`;
  }

  /**
   * Show error message.
   * @param {string} msg
   */
  showError(msg) {
    if (this.errorEl) {
      this.errorEl.textContent = msg;
      this.errorEl.hidden = false;
    }
  }

  /**
   * Clear error message.
   */
  clearError() {
    if (this.errorEl) {
      this.errorEl.textContent = '';
      this.errorEl.hidden = true;
    }
  }

  /**
   * Enter edit mode for a list item.
   * @param {HTMLLIElement} li
   * @param {string} currentTitle
   */
  enterEditMode(li, currentTitle) {
    li.classList.add('editing');

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'edit-input';
    input.value = currentTitle;
    input.setAttribute('aria-label', 'Edit task');

    const saveBtn = document.createElement('button');
    saveBtn.className = 'save-btn';
    saveBtn.textContent = 'Save';

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'cancel-btn';
    cancelBtn.textContent = 'Cancel';

    const editActions = document.createElement('div');
    editActions.className = 'edit-actions';
    editActions.appendChild(saveBtn);
    editActions.appendChild(cancelBtn);

    li.insertBefore(input, li.firstChild);
    li.appendChild(editActions);

    input.focus();
    input.select();

    return { input, saveBtn, cancelBtn };
  }

  /**
   * Exit edit mode, restoring display state.
   * @param {HTMLLIElement} li
   */
  exitEditMode(li) {
    li.classList.remove('editing');
    const editInput = li.querySelector('.edit-input');
    const editActions = li.querySelector('.edit-actions');
    if (editInput) editInput.remove();
    if (editActions) editActions.remove();
  }
}
