/* ===== Store Layer ===== */
const Store = {
  STORAGE_KEY: 'todo_tasks',

  getAll() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  save(tasks) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(tasks));
  },

  nextId(tasks) {
    return tasks.length > 0 ? Math.max(...tasks.map((t) => t.id)) + 1 : 1;
  },
};

/* ===== App State ===== */
const state = {
  tasks: [],
  filter: 'all', // 'all' | 'active' | 'completed'
  editingId: null,
};

/* ===== Renderer ===== */
const Renderer = {
  listEl: document.getElementById('todo-list'),
  countEl: document.getElementById('count'),
  filterBtns: document.querySelectorAll('.filter-btn'),

  render() {
    const filtered = this._getFilteredTasks();
    this.listEl.innerHTML = '';

    if (filtered.length === 0) {
      this.listEl.innerHTML =
        '<li class="empty-state">' +
        (state.filter === 'completed'
          ? 'No completed tasks yet.'
          : 'No tasks yet. Add one above!') +
        '</li>';
    } else {
      filtered.forEach((task) => {
        const li = document.createElement('li');
        li.className = 'todo-item';
        li.dataset.id = task.id;

        if (state.editingId === task.id) {
          li.appendChild(this._renderEditMode(task));
        } else {
          li.appendChild(this._renderViewMode(task));
        }

        this.listEl.appendChild(li);
      });
    }

    this._updateCount();
    this._updateFilterUI();
  },

  _renderViewMode(task) {
    const fragment = document.createDocumentFragment();

    // Checkbox
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'todo-checkbox';
    checkbox.checked = task.completed;
    checkbox.addEventListener('change', () =>
      App.toggleTask(task.id, checkbox.checked)
    );

    // Text
    const textSpan = document.createElement('span');
    textSpan.className = 'todo-text' + (task.completed ? ' completed' : '');
    textSpan.textContent = task.text;
    textSpan.addEventListener('dblclick', () => App.startEdit(task.id));

    // Delete button
    const delBtn = document.createElement('button');
    delBtn.className = 'btn-delete';
    delBtn.innerHTML = '&times;';
    delBtn.setAttribute('aria-label', 'Delete task');
    delBtn.addEventListener('click', () => App.deleteTask(task.id));

    fragment.appendChild(checkbox);
    fragment.appendChild(textSpan);
    fragment.appendChild(delBtn);
    return fragment;
  },

  _renderEditMode(task) {
    const fragment = document.createDocumentFragment();

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'todo-edit-input';
    input.value = task.text;
    input.autofocus = true;

    const saveEdit = () => {
      const val = input.value.trim();
      if (val && val !== task.text) {
        App.updateTask(task.id, val);
      } else {
        state.editingId = null;
        this.render();
      }
    };

    input.addEventListener('blur', saveEdit);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        input.blur();
      } else if (e.key === 'Escape') {
        state.editingId = null;
        this.render();
      }
    });

    // Use a small delay to ensure focus works
    setTimeout(() => input.focus(), 0);

    fragment.appendChild(input);
    return fragment;
  },

  _getFilteredTasks() {
    if (state.filter === 'active') {
      return state.tasks.filter((t) => !t.completed);
    }
    if (state.filter === 'completed') {
      return state.tasks.filter((t) => t.completed);
    }
    return state.tasks;
  },

  _updateCount() {
    const remaining = state.tasks.filter((t) => !t.completed).length;
    this.countEl.textContent =
      remaining + ' item' + (remaining !== 1 ? 's' : '') + ' left';
  },

  _updateFilterUI() {
    this.filterBtns.forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.filter === state.filter);
    });
  },
};

/* ===== App Controller ===== */
const App = {
  init() {
    state.tasks = Store.getAll();
    Renderer.render();
    this._bindEvents();
  },

  _bindEvents() {
    // Add task form
    document.getElementById('todo-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const input = document.getElementById('todo-input');
      const text = input.value.trim();
      if (text) {
        this.addTask(text);
        input.value = '';
        input.focus();
      }
    });

    // Filter buttons
    Renderer.filterBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        state.filter = btn.dataset.filter;
        state.editingId = null;
        Renderer.render();
      });
    });

    // Clear completed
    document.getElementById('clear-completed').addEventListener('click', () => {
      this.clearCompleted();
    });
  },

  addTask(text) {
    const task = {
      id: Store.nextId(state.tasks),
      text,
      completed: false,
      createdAt: Date.now(),
    };
    state.tasks.push(task);
    Store.save(state.tasks);
    Renderer.render();
  },

  toggleTask(id, completed) {
    const task = state.tasks.find((t) => t.id === id);
    if (task) {
      task.completed = completed;
      Store.save(state.tasks);
      Renderer.render();
    }
  },

  deleteTask(id) {
    state.tasks = state.tasks.filter((t) => t.id !== id);
    if (state.editingId === id) state.editingId = null;
    Store.save(state.tasks);
    Renderer.render();
  },

  startEdit(id) {
    state.editingId = id;
    Renderer.render();
  },

  updateTask(id, newText) {
    const task = state.tasks.find((t) => t.id === id);
    if (task) {
      task.text = newText;
    }
    state.editingId = null;
    Store.save(state.tasks);
    Renderer.render();
  },

  clearCompleted() {
    state.tasks = state.tasks.filter((t) => !t.completed);
    state.editingId = null;
    Store.save(state.tasks);
    Renderer.render();
  },
};

/* ===== Boot ===== */
document.addEventListener('DOMContentLoaded', () => App.init());
