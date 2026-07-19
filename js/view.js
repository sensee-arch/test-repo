/* =============================================================
   ToDo List — View Layer
   Renders the todo list UI, handles DOM construction and updates
   ============================================================= */

class TodoListView {
  constructor() {
    /* DOM references */
    this._els = {
      list: document.getElementById('todo-list'),
      emptyState: document.getElementById('empty-state'),
      count: document.getElementById('todo-count'),
      clearBtn: document.getElementById('clear-completed-btn'),
      form: document.getElementById('new-todo-form'),
      input: document.getElementById('new-todo-input'),
      submitBtn: document.getElementById('new-todo-submit'),
      filterBtns: document.querySelectorAll('.filter-btn'),
      sortSelect: document.getElementById('sort-select'),
    };

    /** @type {string|null} Currently editing item id */
    this.editingId = null;

    /** @type {Function|null} Callbacks set by controller */
    this.onAdd = null;
    this.onToggle = null;
    this.onDelete = null;
    this.onEditStart = null;
    this.onEditSave = null;
    this.onEditCancel = null;
    this.onClearCompleted = null;
    this.onFilterChange = null;
    this.onSortChange = null;

    this._bindEvents();
  }

  /* ---------- Event Binding ---------- */
  _bindEvents() {
    /* Add form submit */
    this._els.form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (typeof this.onAdd === 'function') {
        this.onAdd(this._els.input.value);
      }
    });

    /* Filter buttons */
    this._els.filterBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        if (typeof this.onFilterChange === 'function') {
          this.onFilterChange(btn.dataset.filter);
        }
      });
    });

    /* Sort select */
    this._els.sortSelect.addEventListener('change', () => {
      if (typeof this.onSortChange === 'function') {
        this.onSortChange(this._els.sortSelect.value);
      }
    });

    /* Clear completed */
    this._els.clearBtn.addEventListener('click', () => {
      if (typeof this.onClearCompleted === 'function') {
        this.onClearCompleted();
      }
    });
  }

  /* ---------- Input Management ---------- */
  clearInput() {
    this._els.input.value = '';
    this._els.input.focus();
  }

  /* ---------- Render ---------- */
  /**
   * Render the full todo list.
   * @param {TodoItem[]} items - Items to render (already filtered/sorted)
   * @param {object} stats - { total, completed, active }
   * @param {string} currentFilter - 'all' | 'active' | 'completed'
   * @param {boolean} hasCompleted - Whether there are completed items
   */
  render(items, stats, currentFilter, hasCompleted) {
    this._renderList(items);
    this._renderEmptyState(items.length === 0);
    this._renderStats(stats);
    this._updateClearButton(hasCompleted);
    this._updateActiveFilter(currentFilter);
  }

  /**
   * Build and render the list DOM.
   * @param {TodoItem[]} items
   */
  _renderList(items) {
    const list = this._els.list;
    list.innerHTML = '';

    items.forEach((item) => {
      const li = this._createListItem(item);
      list.appendChild(li);
    });
  }

  /**
   * Create a single list item element.
   * @param {TodoItem} item
   * @returns {HTMLLIElement}
   */
  _createListItem(item) {
    const li = document.createElement('li');
    li.className = 'todo-item';
    li.dataset.id = item.id;

    if (this.editingId === item.id) {
      this._buildEditMode(li, item);
    } else {
      this._buildDisplayMode(li, item);
    }

    return li;
  }

  /**
   * Build a display-mode list item.
   * @param {HTMLLIElement} li
   * @param {TodoItem} item
   */
  _buildDisplayMode(li, item) {
    /* Checkbox */
    const checkbox = document.createElement('span');
    checkbox.className = 'todo-checkbox' + (item.completed ? ' completed' : '');
    checkbox.setAttribute('role', 'checkbox');
    checkbox.setAttribute('aria-checked', String(item.completed));
    checkbox.setAttribute('tabindex', '0');
    checkbox.addEventListener('click', () => {
      if (typeof this.onToggle === 'function') this.onToggle(item.id);
    });
    checkbox.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (typeof this.onToggle === 'function') this.onToggle(item.id);
      }
    });
    li.appendChild(checkbox);

    /* Title */
    const title = document.createElement('span');
    title.className = 'todo-title' + (item.completed ? ' completed' : '');
    title.textContent = item.title;
    title.addEventListener('click', () => {
      if (typeof this.onToggle === 'function') this.onToggle(item.id);
    });
    li.appendChild(title);

    /* Action buttons */
    const actions = document.createElement('div');
    actions.className = 'todo-actions';

    if (!item.completed) {
      const editBtn = document.createElement('button');
      editBtn.className = 'btn-edit';
      editBtn.textContent = 'Edit';
      editBtn.setAttribute('aria-label', `Edit "${item.title}"`);
      editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (typeof this.onEditStart === 'function') this.onEditStart(item.id);
      });
      actions.appendChild(editBtn);
    }

    const delBtn = document.createElement('button');
    delBtn.className = 'btn-delete';
    delBtn.textContent = 'Del';
    delBtn.setAttribute('aria-label', `Delete "${item.title}"`);
    delBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (typeof this.onDelete === 'function') this.onDelete(item.id);
    });
    actions.appendChild(delBtn);

    li.appendChild(actions);
  }

  /**
   * Build an inline-edit-mode list item.
   * @param {HTMLLIElement} li
   * @param {TodoItem} item
   */
  _buildEditMode(li, item) {
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'todo-edit-input';
    input.value = item.title;
    input.setAttribute('aria-label', 'Edit task title');
    input.maxLength = 500;

    const finishEdit = () => {
      if (typeof this.onEditSave === 'function') this.onEditSave(item.id, input.value);
    };

    const cancelEdit = () => {
      if (typeof this.onEditCancel === 'function') this.onEditCancel();
    };

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') finishEdit();
      if (e.key === 'Escape') cancelEdit();
    });

    li.appendChild(input);

    const actions = document.createElement('div');
    actions.className = 'todo-actions';

    const saveBtn = document.createElement('button');
    saveBtn.className = 'btn-save';
    saveBtn.textContent = 'Save';
    saveBtn.addEventListener('click', finishEdit);
    actions.appendChild(saveBtn);

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'btn-cancel';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.addEventListener('click', cancelEdit);
    actions.appendChild(cancelBtn);

    li.appendChild(actions);

    /* Auto-focus the edit input */
    requestAnimationFrame(() => {
      input.focus();
      input.select();
    });
  }

  /* ---------- Empty State ---------- */
  _renderEmptyState(isEmpty) {
    this._els.emptyState.classList.toggle('visible', isEmpty);
  }

  /* ---------- Stats ---------- */
  _renderStats(stats) {
    this._els.count.textContent = `${stats.active} item${stats.active !== 1 ? 's' : ''} left`;
  }

  /* ---------- Clear Button ---------- */
  _updateClearButton(hasCompleted) {
    this._els.clearBtn.disabled = !hasCompleted;
  }

  /* ---------- Active Filter ---------- */
  _updateActiveFilter(filter) {
    this._els.filterBtns.forEach((btn) => {
      const isActive = btn.dataset.filter === filter;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', String(isActive));
    });
  }

  /* ---------- Storage Warning ---------- */
  showStorageWarning() {
    const el = document.getElementById('storage-warning');
    if (el) el.classList.add('visible');
  }
}
