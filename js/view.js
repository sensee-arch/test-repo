/**
 * ToDo List — View Layer
 *
 * Responsibilities:
 *  - DOM rendering engine for the todo list
 *  - Event delegation for interactive elements
 *  - Entry/exit animations and empty-state display
 *  - Accessible using ARIA roles, labels, and keyboard support
 *  - Toast notifications for errors and warnings
 */

class TodoView {
  /** @param {HTMLElement} root — Mount point */
  constructor(root) {
    this._root = root;

    /* Cache DOM references */
    this._listEl        = root.querySelector('#todoList');
    this._formEl        = root.querySelector('#todoForm');
    this._inputEl       = root.querySelector('#todoInput');
    this._addBtn        = root.querySelector('#addBtn');
    this._helpEl        = root.querySelector('#inputHelp');
    this._emptyEl       = root.querySelector('#emptyState');
    this._itemsLeftEl   = root.querySelector('#itemsLeft');
    this._storageWarnEl = root.querySelector('#storageWarn');
    this._toastEl       = root.querySelector('#errorToast');
    this._clearBtn      = root.querySelector('#clearCompletedBtn');
    this._filterBtns    = root.querySelectorAll('.filter-btn');
  }

  /* ── Rendering ─────────────────────────────────────────── */

  /**
   * Full render: clears and rebuilds the list
   * @param {TodoItem[]} items — already filtered and sorted
   * @param {number}     totalCount — unfiltered total for counter
   * @param {string}     activeFilter — 'all' | 'active' | 'completed'
   */
  render(items, totalCount, activeFilter) {
    this._renderList(items);
    this._updateCounter(totalCount);
    this._updateEmptyState(items.length === 0);
    this._updateFilterButtons(activeFilter);
  }

  _renderList(items) {
    this._listEl.innerHTML = '';
    if (items.length === 0) return;

    const fragment = document.createDocumentFragment();
    items.forEach((item, i) => {
      fragment.appendChild(this._createItemElement(item, i));
    });
    this._listEl.appendChild(fragment);
  }

  /**
   * Create a single list item element
   * @param {TodoItem} item
   * @param {number}   index — for staggered animation
   * @returns {HTMLLIElement}
   */
  _createItemElement(item, index = 0) {
    const li = document.createElement('li');
    li.className = `todo-item${item.completed ? ' completed' : ''}`;
    li.dataset.id = item.id;
    li.setAttribute('role', 'listitem');

    /* Checkbox */
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.className = 'todo-checkbox';
    cb.checked = item.completed;
    cb.setAttribute('aria-label', `Mark "${this._escapeAttr(item.title)}" as ${item.completed ? 'incomplete' : 'complete'}`);
    li.appendChild(cb);

    /* Title span (use textContent to prevent XSS) */
    const titleSpan = document.createElement('span');
    titleSpan.className = 'todo-title';
    titleSpan.textContent = item.title;
    li.appendChild(titleSpan);

    /* Actions group */
    const actions = document.createElement('div');
    actions.className = 'todo-actions';

    const editBtn = document.createElement('button');
    editBtn.className = 'todo-edit icon-btn';
    editBtn.textContent = '✏️';
    editBtn.title = 'Edit task';
    editBtn.setAttribute('aria-label', `Edit "${this._escapeAttr(item.title)}"`);
    actions.appendChild(editBtn);

    const delBtn = document.createElement('button');
    delBtn.className = 'todo-delete icon-btn';
    delBtn.textContent = '🗑️';
    delBtn.title = 'Delete task';
    delBtn.setAttribute('aria-label', `Delete "${this._escapeAttr(item.title)}"`);
    actions.appendChild(delBtn);

    li.appendChild(actions);

    /* Animate in — staggered */
    const delay = Math.min(index * 40, 300);
    li.style.opacity = '0';
    li.style.transform = 'translateY(-8px)';
    requestAnimationFrame(() => {
      li.style.transition = `opacity 0.25s ease ${delay}ms, transform 0.25s ease ${delay}ms`;
      li.style.opacity = '1';
      li.style.transform = 'translateY(0)';
    });

    return li;
  }

  /* ── Single-item DOM mutation ──────────────────────────── */

  /** Remove a list item element with exit animation */
  removeItemElement(id, callback) {
    const el = this._listEl.querySelector(`[data-id="${id}"]`);
    if (!el) { callback?.(); return; }

    el.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
    el.style.opacity = '0';
    el.style.transform = 'translateX(-24px)';
    setTimeout(() => {
      el.remove();
      callback?.();
    }, 220);
  }

  /* ── Helpers ───────────────────────────────────────────── */

  _updateCounter(totalCount) {
    const active = totalCount; // will be overwritten
    this._itemsLeftEl.textContent = `${totalCount} item${totalCount !== 1 ? 's' : ''} total`;
  }

  _updateEmptyState(isEmpty) {
    this._emptyEl.classList.toggle('hidden', !isEmpty);
    this._listEl.classList.toggle('empty', isEmpty);
  }

  _updateFilterButtons(activeFilter) {
    this._filterBtns.forEach((btn) => {
      const isActive = btn.dataset.filter === activeFilter;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', String(isActive));
    });
  }

  /* ── Form / Input ─────────────────────────────────────── */

  /** @returns {string} Trimmed input value */
  getInputValue() {
    return this._inputEl.value.trim();
  }

  clearInput() {
    this._inputEl.value = '';
    this.clearHint();
    this._addBtn.disabled = true;
    this._inputEl.focus();
  }

  focusInput() {
    this._inputEl.focus();
  }

  /** @param {string} msg — validation hint or error */
  showHint(msg, isError = false) {
    this._helpEl.textContent = msg;
    this._helpEl.className = `input-hint${isError ? ' error' : ''}`;
  }

  clearHint() {
    this._helpEl.textContent = '';
    this._helpEl.className = 'input-hint';
  }

  /** Enable/disable the submit button based on input state */
  setAddButtonEnabled(enabled) {
    this._addBtn.disabled = !enabled;
  }

  /* ── Toast ─────────────────────────────────────────────── */

  /** Show a transient error toast */
  showToast(message, durationMs = 4000) {
    this._toastEl.textContent = message;
    this._toastEl.classList.remove('hidden');
    this._toastEl.classList.add('visible');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => {
      this._toastEl.classList.remove('visible');
      this._toastEl.classList.add('hidden');
    }, durationMs);
  }

  /** Show/hide the storage full warning */
  showStorageWarning(visible) {
    this._storageWarnEl.classList.toggle('hidden', !visible);
  }

  /* ── Dialogs ───────────────────────────────────────────── */

  confirmDelete() {
    return confirm('Delete this task?');
  }

  confirmClearCompleted() {
    return confirm('Remove all completed tasks? This cannot be undone.');
  }

  promptEdit(currentTitle) {
    const result = prompt('Edit task:', currentTitle);
    if (result === null) return null; // cancelled
    return result.trim();
  }

  /* ── Event Delegation ──────────────────────────────────── */

  /**
   * Bind user interaction events via delegation.
   * @param {object} handlers
   * @property {Function} handlers.onSubmit    — (title: string) => void
   * @property {Function} handlers.onToggle    — (id: string) => void
   * @property {Function} handlers.onDelete    — (id: string) => void
   * @property {Function} handlers.onEdit      — (id: string) => void
   * @property {Function} handlers.onFilter    — (filter: string) => void
   * @property {Function} handlers.onClearDone — () => void
   */
  bindEvents(handlers) {
    /* Form submit */
    this._formEl.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = this.getInputValue();
      if (title) handlers.onSubmit(title);
    });

    /* Input validation on every keystroke */
    this._inputEl.addEventListener('input', () => {
      const v = this.getInputValue();
      this.setAddButtonEnabled(v.length > 0);
      if (v.length > 0) this.clearHint();
    });

    /* List event delegation */
    this._listEl.addEventListener('change', (e) => {
      const cb = e.target.closest('.todo-checkbox');
      if (!cb) return;
      const li = cb.closest('.todo-item');
      if (li) handlers.onToggle(li.dataset.id);
    });

    this._listEl.addEventListener('click', (e) => {
      const li = e.target.closest('.todo-item');
      if (!li) return;
      const id = li.dataset.id;

      if (e.target.closest('.todo-delete')) {
        handlers.onDelete(id);
      } else if (e.target.closest('.todo-edit')) {
        handlers.onEdit(id);
      }
    });

    /* Delete — also handle keyboard activation */
    this._listEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        const del = e.target.closest('.todo-delete');
        if (del) {
          e.preventDefault();
          const li = del.closest('.todo-item');
          if (li) handlers.onDelete(li.dataset.id);
        }
      }
    });

    /* Filter buttons */
    this._filterBtns.forEach((btn) => {
      btn.addEventListener('click', () => handlers.onFilter(btn.dataset.filter));
    });

    /* Clear completed */
    this._clearBtn.addEventListener('click', () => handlers.onClearDone());
  }

  /* ── Sanitization ──────────────────────────────────────── */

  _escapeAttr(text) {
    return text.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TodoView };
}
