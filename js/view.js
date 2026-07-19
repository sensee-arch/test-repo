/**
 * ToDo List — View Layer
 *
 * Responsibilities:
 * - Render todo items to the DOM
 * - Manage DOM event delegation
 * - Animation and empty-state display
 * - Accessible keyboard and ARIA support
 */

class TodoView {
  /**
   * @param {HTMLElement} container - Mount point for the todo list
   */
  constructor(container) {
    this._container = container;
    this._listEl = container.querySelector('#todo-list');
    this._emptyEl = container.querySelector('#empty-state');
    this._counterEl = container.querySelector('#todo-count');
  }

  /* ── Rendering ─────────────────────────────────────────── */

  /**
   * Render a list of TodoItem objects
   * @param {TodoItem[]} items
   */
  render(items) {
    this._renderList(items);
    this._updateCounter(items);
    this._toggleEmptyState(items.length === 0);
  }

  /**
   * Re-render a single item by id (avoids full list rebuild)
   * @param {TodoItem} item
   * @param {TodoItem[]} allItems - Full list for counter accuracy
   */
  renderItem(item, allItems) {
    const existingLi = this._listEl.querySelector(`[data-id="${item.id}"]`);
    if (existingLi) {
      existingLi.replaceWith(this._createItemElement(item));
    } else {
      // Item doesn't exist in DOM yet — append
      this._listEl.appendChild(this._createItemElement(item));
    }
    this._updateCounter(allItems);
    this._toggleEmptyState(allItems.length === 0);
  }

  /**
   * Remove an item from the DOM by id
   * @param {string} id
   * @param {TodoItem[]} allItems
   */
  removeItemFromDOM(id, allItems) {
    const el = this._listEl.querySelector(`[data-id="${id}"]`);
    if (el) {
      el.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
      el.style.opacity = '0';
      el.style.transform = 'translateX(-20px)';
      setTimeout(() => el.remove(), 200);
    }
    this._updateCounter(allItems);
    this._toggleEmptyState(allItems.length === 0);
  }

  /** Clear the entire list DOM */
  clearListDOM() {
    this._listEl.innerHTML = '';
  }

  /* ── Internal Rendering Helpers ────────────────────────── */

  /**
   * @param {TodoItem[]} items
   */
  _renderList(items) {
    const fragment = document.createDocumentFragment();
    items.forEach((item) => {
      fragment.appendChild(this._createItemElement(item));
    });
    this._listEl.innerHTML = '';
    this._listEl.appendChild(fragment);
  }

  /**
   * Create a single todo item DOM element
   * @param {TodoItem} item
   * @returns {HTMLLIElement}
   */
  _createItemElement(item) {
    const li = document.createElement('li');
    li.className = `todo-item${item.completed ? ' completed' : ''}`;
    li.setAttribute('data-id', item.id);
    li.setAttribute('role', 'listitem');

    // Checkbox
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
      checkbox.className = 'todo-checkbox';
    checkbox.checked = item.completed;
    checkbox.setAttribute('aria-label', `Mark "${item.title}" as ${item.completed ? 'incomplete' : 'complete'}`);
    li.appendChild(checkbox);

    // Title (label)
    const label = document.createElement('label');
    label.className = 'todo-label';
    label.textContent = item.title;
    li.appendChild(label);

    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'todo-delete';
    deleteBtn.textContent = '✕';
    deleteBtn.setAttribute('aria-label', `Delete "${item.title}"`);
    deleteBtn.setAttribute('title', 'Delete task');
    li.appendChild(deleteBtn);

    // Animate in
    li.style.opacity = '0';
    li.style.transform = 'translateY(-8px)';
    requestAnimationFrame(() => {
      li.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
      li.style.opacity = '1';
      li.style.transform = 'translateY(0)';
    });

    return li;
  }

  /**
   * Update the items-left counter
   * @param {TodoItem[]} items
   */
  _updateCounter(items) {
    if (!this._counterEl) return;
    const remaining = items.filter((item) => !item.completed).length;
    this._counterEl.textContent = `${remaining} item${remaining !== 1 ? 's' : ''} left`;
  }

  /**
   * Show or hide the empty-state message
   * @param {boolean} isEmpty
   */
  _toggleEmptyState(isEmpty) {
    if (!this._emptyEl) return;
    this._emptyEl.style.display = isEmpty ? 'block' : 'none';
    if (isEmpty) {
      this._container.setAttribute('aria-busy', 'false');
    }
  }

  /* ── Event Delegation ──────────────────────────────────── */

  /**
   * Attach delegated event listeners to the todo list
   * @param {object} handlers - { onToggle(id, checked), onDelete(id) }
   */
  bindEvents(handlers) {
    this._listEl.addEventListener('change', (e) => {
      const checkbox = e.target.closest('.todo-checkbox');
      if (!checkbox) return;
      const li = checkbox.closest('.todo-item');
      if (!li) return;
      handlers.onToggle(li.dataset.id, checkbox.checked);
    });

    this._listEl.addEventListener('click', (e) => {
      const btn = e.target.closest('.todo-delete');
      if (!btn) return;
      const li = btn.closest('.todo-item');
      if (!li) return;
      handlers.onDelete(li.dataset.id);
    });

    // Keyboard: Enter on delete button
    this._listEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const btn = e.target.closest('.todo-delete');
        if (!btn) return;
        const li = btn.closest('.todo-item');
        if (!li) return;
        handlers.onDelete(li.dataset.id);
      }
    });
  }

  /** Focus the new-item input field */
  focusInput() {
    const input = this._container.querySelector('#new-todo-input');
    if (input) input.focus();
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TodoView };
}
