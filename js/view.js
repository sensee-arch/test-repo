/* =============================================
   ToDo List App — View Layer
   ============================================= */

/**
 * View — Handles DOM rendering and event delegation.
 */
class TodoView {
  constructor() {
    // Root elements
    this.appEl = document.getElementById('app');

    // Form & input
    this.formEl = document.getElementById('todo-form');
    this.inputEl = document.getElementById('todo-input');

    // List
    this.listEl = document.getElementById('todo-list');
    this.emptyStateEl = document.getElementById('empty-state');

    // Footer
    this.itemCountEl = document.getElementById('item-count');
    this.filterBarEl = document.querySelector('.filter-bar');
    this.clearBtnEl = document.getElementById('clear-completed');

    // Delegate event handlers (set by controller)
    this.onAdd = null;
    this.onToggle = null;
    this.onDelete = null;
    this.onEditStart = null;
    this.onEditSubmit = null;
    this.onEditCancel = null;
    this.onFilterChange = null;
    this.onClearCompleted = null;

    // Internal state
    this.currentFilter = 'all';
    this.editingId = null;

    this._bindEvents();
  }

  /* ---- Event Binding ---- */

  _bindEvents() {
    // Form submit → add todo
    this.formEl.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = this.inputEl.value.trim();
      if (!title) return;
      if (this.onAdd) this.onAdd(title);
      this.inputEl.value = '';
      this.inputEl.focus();
    });

    // List click delegation → toggle, delete, or start edit
    this.listEl.addEventListener('click', (e) => {
      // Checkbox toggle
      const checkbox = e.target.closest('.todo-checkbox');
      if (checkbox) {
        const li = checkbox.closest('.todo-item');
        if (li && this.onToggle) this.onToggle(li.dataset.id);
        return;
      }

      // Delete button
      const deleteBtn = e.target.closest('.btn-delete');
      if (deleteBtn) {
        const li = deleteBtn.closest('.todo-item');
        if (li && this.onDelete) this.onDelete(li.dataset.id);
        return;
      }

      // Title double-click → start inline edit
      const titleEl = e.target.closest('.todo-title');
      if (titleEl && e.detail === 2) {
        const li = titleEl.closest('.todo-item');
        if (li && this.onEditStart) this.onEditStart(li.dataset.id, titleEl.textContent);
      }
    });

    // List keydown delegation → edit submit / cancel
    this.listEl.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const input = e.target.closest('.todo-edit-input');
        if (input && this.onEditCancel) {
          this.onEditCancel();
          e.preventDefault();
        }
      }
      if (e.key === 'Enter') {
        const input = e.target.closest('.todo-edit-input');
        if (input && this.onEditSubmit) {
          this.onEditSubmit(input.value.trim());
          e.preventDefault();
        }
      }
    });

    // List change delegation → edit input blur submits
    this.listEl.addEventListener('blur', (e) => {
      const input = e.target.closest('.todo-edit-input');
      // Use setTimeout so click events on other elements fire first
      if (input && this.onEditSubmit) {
        setTimeout(() => this.onEditSubmit(input.value.trim()), 100);
      }
    }, true);

    // Filter bar click
    this.filterBarEl.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter-btn');
      if (!btn || btn.classList.contains('active')) return;
      if (this.onFilterChange) {
        this.onFilterChange(btn.dataset.filter);
      }
    });

    // Clear completed
    this.clearBtnEl.addEventListener('click', () => {
      if (this.onClearCompleted) this.onClearCompleted();
    });
  }

  /* ---- Render ---- */

  /**
   * Render the full list and footer.
   * @param {Array} items — full item array
   * @param {string} filter — 'all' | 'active' | 'completed'
   */
  render(items, filter) {
    this.currentFilter = filter || 'all';
    const filtered = this._filterItems(items, this.currentFilter);

    // Render list
    this.listEl.innerHTML = filtered
      .map((item) => this._buildItemHTML(item))
      .join('');

    // Empty state
    this.emptyStateEl.classList.toggle('hidden', filtered.length > 0);

    // Footer
    const activeCount = items.filter((i) => !i.completed).length;
    this.itemCountEl.textContent = `${activeCount} item${activeCount !== 1 ? 's' : ''} left`;

    // Active filter button
    this.filterBarEl.querySelectorAll('.filter-btn').forEach((btn) => {
      const isActive = btn.dataset.filter === this.currentFilter;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });

    // Clear completed visibility
    const hasCompleted = items.some((i) => i.completed);
    this.clearBtnEl.style.display = hasCompleted ? 'inline-block' : 'none';
  }

  /**
   * Filter items based on current filter state.
   * @param {Array} items
   * @param {string} filter
   * @returns {Array}
   */
  _filterItems(items, filter) {
    switch (filter) {
      case 'active':
        return items.filter((i) => !i.completed);
      case 'completed':
        return items.filter((i) => i.completed);
      default:
        return [...items];
    }
  }

  /**
   * Build HTML for a single todo item.
   * @param {object} item
   * @returns {string}
   */
  _buildItemHTML(item) {
    const isEditing = this.editingId === item.id;
    const titleClass = item.completed ? 'todo-title completed' : 'todo-title';
    const safeTitle = this._escapeHtml(item.title);

    return `
      <li class="todo-item" data-id="${item.id}" role="listitem">
        <input
          type="checkbox"
          class="todo-checkbox"
          ${item.completed ? 'checked' : ''}
          aria-label="Mark '${safeTitle}' as ${item.completed ? 'incomplete' : 'complete'}"
        >
        ${isEditing
          ? `<input type="text" class="todo-edit-input" value="${safeTitle}" autofocus>`
          : `<span class="${titleClass}">${safeTitle}</span>`
        }
        <button class="btn-delete" aria-label="Delete '${safeTitle}'">&times;</button>
      </li>
    `;
  }

  /* ---- Inline Edit Lifecycle ---- */

  /**
   * Enter inline edit mode for a specific item.
   * @param {string} id
   */
  enterEditMode(id) {
    this.editingId = id;
  }

  /**
   * Exit inline edit mode.
   */
  exitEditMode() {
    this.editingId = null;
  }

  /* ---- Utility ---- */

  /**
   * Escape HTML special characters to prevent XSS.
   * @param {string} text
   * @returns {string}
   */
  _escapeHtml(text) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(text));
    return div.innerHTML;
  }
}
