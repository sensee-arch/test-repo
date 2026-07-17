/* ============================================
   TodoList — Application Logic
   Vanilla JavaScript (ES6+), localStorage
   ============================================ */

'use strict';

(function () {
  /* ==============================
     DataStore — localStorage CRUD
     ============================== */
  class DataStore {
    static STORAGE_KEY = 'todolist_items';
    static ID_KEY = 'todolist_next_id';

    static load() {
      try {
        const raw = localStorage.getItem(DataStore.STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
      } catch {
        return [];
      }
    }

    static save(items) {
      try {
        localStorage.setItem(DataStore.STORAGE_KEY, JSON.stringify(items));
      } catch {
        /* Storage full or unavailable — silently degrade */
      }
    }

    static nextId() {
      let id = parseInt(localStorage.getItem(DataStore.ID_KEY), 10);
      if (!id || isNaN(id)) id = 1;
      localStorage.setItem(DataStore.ID_KEY, String(id + 1));
      return id;
    }
  }

  /* ==============================
     TodoItem Model
     ============================== */
  class TodoItem {
    constructor(title) {
      this.id = DataStore.nextId();
      this.title = title.trim();
      this.completed = false;
      this.createdAt = new Date().toISOString();
    }
  }

  /* ==============================
     TodoApp — Main Application
     ============================== */
  class TodoApp {
    constructor() {
      this.items = DataStore.load();
      this.currentFilter = 'all';

      /* DOM refs */
      this.form = document.getElementById('todo-form');
      this.input = document.getElementById('todo-input');
      this.list = document.getElementById('todo-list');
      this.countEl = document.getElementById('active-count');
      this.emptyState = document.getElementById('empty-state');
      this.clearBtn = document.getElementById('clear-completed');
      this.clearBar = document.getElementById('clear-bar');
      this.filterBtns = document.querySelectorAll('.filter-btn');

      this._bindEvents();
      this._render();
    }

    /* ---------- Event Binding ---------- */
    _bindEvents() {
      /* Add todo */
      this.form.addEventListener('submit', (e) => {
        e.preventDefault();
        this._addItem();
      });

      /* List event delegation */
      this.list.addEventListener('click', (e) => {
        const item = e.target.closest('.todo-item');
        if (!item) return;
        const id = Number(item.dataset.id);

        if (e.target.classList.contains('todo-checkbox')) {
          this._toggleItem(id);
        } else if (e.target.classList.contains('delete-btn')) {
          this._deleteItem(id);
        }
      });

      /* Double-click to edit */
      this.list.addEventListener('dblclick', (e) => {
        const textEl = e.target.closest('.todo-text');
        if (!textEl) return;
        const item = textEl.closest('.todo-item');
        if (!item) return;
        if (item.classList.contains('editing')) return;
        this._startEdit(item, textEl);
      });

      /* Filter buttons */
      this.filterBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
          this._setFilter(btn.dataset.filter);
        });
      });

      /* Clear completed */
      this.clearBtn.addEventListener('click', () => {
        this._clearCompleted();
      });

      /* Keyboard shortcut on input */
      this.input.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          this.input.blur();
        }
      });
    }

    /* ---------- Add Item ---------- */
    _addItem() {
      const title = this.input.value.trim();
      if (!title) {
        this.input.focus();
        return;
      }

      const item = new TodoItem(title);
      this.items.push(item);
      DataStore.save(this.items);
      this.input.value = '';
      this.input.focus();
      this._render();
    }

    /* ---------- Toggle Item ---------- */
    _toggleItem(id) {
      const item = this.items.find((i) => i.id === id);
      if (!item) return;
      item.completed = !item.completed;
      DataStore.save(this.items);
      this._render();
    }

    /* ---------- Delete Item ---------- */
    _deleteItem(id) {
      this.items = this.items.filter((i) => i.id !== id);
      DataStore.save(this.items);
      this._render();
    }

    /* ---------- Start Edit ---------- */
    _startEdit(itemEl, textEl) {
      const id = Number(itemEl.dataset.id);
      const todo = this.items.find((i) => i.id === id);
      if (!todo || todo.completed) return;

      itemEl.classList.add('editing');
      textEl.style.display = 'none';

      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'todo-edit-input';
      input.value = todo.title;
      input.maxLength = 200;
      itemEl.insertBefore(input, textEl.nextSibling);
      input.focus();
      input.select();

      const finishEdit = (save) => {
        if (save) {
          const newTitle = input.value.trim();
          if (newTitle && newTitle !== todo.title) {
            todo.title = newTitle;
            DataStore.save(this.items);
          }
        }
        itemEl.classList.remove('editing');
        input.remove();
        textEl.style.display = '';
        this._render();
      };

      input.addEventListener('blur', () => finishEdit(true));
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          finishEdit(true);
        } else if (e.key === 'Escape') {
          finishEdit(false);
        }
      });
    }

    /* ---------- Set Filter ---------- */
    _setFilter(filter) {
      this.currentFilter = filter;
      this.filterBtns.forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.filter === filter);
      });
      this._renderList();
      this._updateEmptyState();
    }

    /* ---------- Clear Completed ---------- */
    _clearCompleted() {
      this.items = this.items.filter((i) => !i.completed);
      DataStore.save(this.items);
      this._render();
    }

    /* ---------- Get Filtered Items ---------- */
    _getFiltered() {
      switch (this.currentFilter) {
        case 'active':
          return this.items.filter((i) => !i.completed);
        case 'completed':
          return this.items.filter((i) => i.completed);
        default:
          return [...this.items];
      }
    }

    /* ---------- Render ---------- */
    _render() {
      this._renderList();
      this._updateStats();
      this._updateEmptyState();
      this._updateClearButton();
    }

    _renderList() {
      const filtered = this._getFiltered();

      if (filtered.length === 0) {
        this.list.innerHTML = '';
        return;
      }

      let html = '';
      filtered.forEach((item) => {
        const checked = item.completed ? 'checked' : '';
        const completedClass = item.completed ? 'completed' : '';
        html += `
          <li class="todo-item" data-id="${item.id}">
            <input type="checkbox" class="todo-checkbox" ${checked} aria-label="Mark as ${item.completed ? 'active' : 'completed'}">
            <span class="todo-text ${completedClass}">${this._escapeHtml(item.title)}</span>
            <button class="delete-btn" aria-label="Delete todo" title="Delete">✕</button>
          </li>
        `;
      });

      this.list.innerHTML = html;
    }

    _updateStats() {
      const active = this.items.filter((i) => !i.completed).length;
      this.countEl.textContent = active;
    }

    _updateEmptyState() {
      const filtered = this._getFiltered();
      this.emptyState.hidden = filtered.length > 0;
    }

    _updateClearButton() {
      const completed = this.items.filter((i) => i.completed).length;
      this.clearBar.classList.toggle('visible', completed > 0);
    }

    /* ---------- Utils ---------- */
    _escapeHtml(str) {
      const div = document.createElement('div');
      div.textContent = str;
      return div.innerHTML;
    }
  }

  /* ==============================
     Bootstrap
     ============================== */
  document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
  });
})();
