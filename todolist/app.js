/* =============================================================
   TodoList — Application Script
   Tech: Vanilla JavaScript ES6+, localStorage persistence
   ============================================================= */

/* ========== DataModule ==========
   Data layer: CRUD, validation, persistence
   ================================== */
class DataModule {
  constructor(storageKey = 'todolist_v2') {
    this._storageKey = storageKey;
    this._available = this._checkStorage();
  }

  /* ---------- localStorage Detection ---------- */
  _checkStorage() {
    try {
      const key = '__test__';
      localStorage.setItem(key, '1');
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      return false;
    }
  }

  isAvailable() {
    return this._available;
  }

  /* ---------- Persistence (Private) ---------- */
  _load() {
    if (!this._available) return [];
    try {
      const data = localStorage.getItem(this._storageKey);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  _save(tasks) {
    if (!this._available) return false;
    try {
      localStorage.setItem(this._storageKey, JSON.stringify(tasks));
      return true;
    } catch {
      return false;
    }
  }

  /* ---------- UUID v4 Generator ---------- */
  _generateId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = (Math.random() * 16) | 0;
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
  }

  /* ---------- Validation ---------- */
  _validateTitle(title) {
    if (typeof title !== 'string') return false;
    const t = title.trim();
    return t.length >= 1 && t.length <= 100;
  }

  _sanitizeTitle(title) {
    return title.trim();
  }

  /* ---------- Public CRUD ---------- */

  /** Get all tasks */
  getTasks() {
    return this._load();
  }

  /** Create a new task. Returns the created Task or null on failure. */
  addTask(title) {
    if (!this._validateTitle(title)) return null;

    const task = {
      id: this._generateId(),
      title: this._sanitizeTitle(title),
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const tasks = this._load();
    tasks.push(task);
    this._save(tasks);
    return task;
  }

  /** Partial update. Returns updated Task or null if not found. */
  updateTask(id, fields) {
    const tasks = this._load();
    const idx = tasks.findIndex(t => t.id === id);
    if (idx === -1) return null;

    // Validate title if being updated
    if (fields.title !== undefined && !this._validateTitle(fields.title)) {
      return null;
    }

    const allowedFields = ['title', 'completed'];
    for (const key of Object.keys(fields)) {
      if (allowedFields.includes(key)) {
        tasks[idx][key] = key === 'title' ? this._sanitizeTitle(fields[key]) : fields[key];
      }
    }
    tasks[idx].updatedAt = new Date().toISOString();

    this._save(tasks);
    return { ...tasks[idx] };
  }

  /** Delete a task by id. Returns true if deleted. */
  deleteTask(id) {
    const tasks = this._load();
    const filtered = tasks.filter(t => t.id !== id);
    if (filtered.length === tasks.length) return false;
    this._save(filtered);
    return true;
  }

  /** Toggle completed status. Returns updated Task or null. */
  toggleTask(id) {
    const tasks = this._load();
    const task = tasks.find(t => t.id === id);
    if (!task) return null;

    task.completed = !task.completed;
    task.updatedAt = new Date().toISOString();
    this._save(tasks);
    return { ...task };
  }

  /** Delete all completed tasks. Returns count deleted. */
  clearCompleted() {
    const tasks = this._load();
    const remaining = tasks.filter(t => !t.completed);
    const removed = tasks.length - remaining.length;
    if (removed > 0) {
      this._save(remaining);
    }
    return removed;
  }
}


/* ========== UI Controller ==========
   Renders tasks and handles DOM events
   ==================================== */
class TodoController {
  constructor(dataModule) {
    this.data = dataModule;
    this._filter = 'all';  // 'all' | 'active' | 'completed'
    this._editingId = null;

    // DOM refs
    this._el = {
      input: document.getElementById('todoInput'),
      addBtn: document.getElementById('addBtn'),
      list: document.getElementById('todoList'),
      empty: document.getElementById('emptyMsg'),
      total: document.getElementById('totalCount'),
      done: document.getElementById('doneCount'),
      warning: document.getElementById('storageWarning'),
      filterBtns: document.querySelectorAll('.filter-btn'),
      clearBtn: document.getElementById('clearCompleted'),
    };

    this._bindEvents();
    this._checkStorage();
    this.render();
  }

  /* ---------- Storage Warning ---------- */
  _checkStorage() {
    if (!this.data.isAvailable()) {
      this._el.warning.classList.add('visible');
    }
  }

  /* ---------- Event Binding ---------- */
  _bindEvents() {
    // Add task
    this._el.addBtn.addEventListener('click', () => this._handleAdd());
    this._el.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this._handleAdd();
    });

    // Filter buttons
    this._el.filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this._filter = btn.dataset.filter;
        this._el.filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.render();
      });
    });

    // Clear completed
    this._el.clearBtn.addEventListener('click', () => {
      const count = this.data.clearCompleted();
      if (count > 0) this.render();
    });
  }

  _handleAdd() {
    const title = this._el.input.value;
    if (!title.trim()) return;

    const task = this.data.addTask(title);
    if (task) {
      this._el.input.value = '';
      this._el.input.focus();
      this.render();
    }
  }

  /* ---------- Task Event Delegation ---------- */
  _handleToggle(id) {
    this.data.toggleTask(id);
    this.render();
  }

  _handleDelete(id) {
    this.data.deleteTask(id);
    if (this._editingId === id) this._editingId = null;
    this.render();
  }

  _handleStartEdit(id) {
    this._editingId = id;
    this.render();
  }

  _handleFinishEdit(id, value) {
    const title = value.trim();
    if (!title) return;
    this.data.updateTask(id, { title });
    this._editingId = null;
    this.render();
  }

  _handleCancelEdit() {
    this._editingId = null;
    this.render();
  }

  /* ---------- Render ---------- */
  render() {
    const tasks = this.data.getTasks();
    const filtered = this._getFilteredTasks(tasks);

    this._el.list.innerHTML = '';

    if (filtered.length === 0) {
      this._el.empty.style.display = 'block';
    } else {
      this._el.empty.style.display = 'none';
      filtered.forEach(task => {
        const li = this._createTaskElement(task);
        this._el.list.appendChild(li);
      });
    }

    this._updateStats(tasks);
  }

  _getFilteredTasks(tasks) {
    switch (this._filter) {
      case 'active':
        return tasks.filter(t => !t.completed);
      case 'completed':
        return tasks.filter(t => t.completed);
      default:
        return tasks;
    }
  }

  _createTaskElement(task) {
    const li = document.createElement('li');
    li.className = 'todo-item';

    // Checkbox
    const cb = document.createElement('span');
    cb.className = 'checkbox' + (task.completed ? ' done' : '');
    cb.setAttribute('role', 'checkbox');
    cb.setAttribute('aria-checked', String(task.completed));
    cb.addEventListener('click', () => this._handleToggle(task.id));
    li.appendChild(cb);

    if (this._editingId === task.id) {
      // Inline edit mode
      const inp = document.createElement('input');
      inp.className = 'edit-input';
      inp.value = task.title;
      inp.setAttribute('aria-label', '编辑待办事项');

      const finishEdit = () => {
        this._handleFinishEdit(task.id, inp.value);
      };
      inp.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') finishEdit();
        if (e.key === 'Escape') this._handleCancelEdit();
      });

      li.appendChild(inp);

      const actions = document.createElement('div');
      actions.className = 'actions';

      const saveBtn = document.createElement('button');
      saveBtn.textContent = '保存';
      saveBtn.className = 'btn-save';
      saveBtn.addEventListener('click', finishEdit);

      const cancelBtn = document.createElement('button');
      cancelBtn.textContent = '取消';
      cancelBtn.className = 'btn-cancel';
      cancelBtn.addEventListener('click', () => this._handleCancelEdit());

      actions.appendChild(saveBtn);
      actions.appendChild(cancelBtn);
      li.appendChild(actions);

      // Auto-focus
      requestAnimationFrame(() => { inp.focus(); inp.select(); });
    } else {
      // Display mode
      const text = document.createElement('span');
      text.className = 'text' + (task.completed ? ' done' : '');
      text.textContent = task.title;
      text.addEventListener('click', () => this._handleToggle(task.id));
      li.appendChild(text);

      const actions = document.createElement('div');
      actions.className = 'actions';

      if (!task.completed) {
        const editBtn = document.createElement('button');
        editBtn.textContent = '编辑';
        editBtn.className = 'btn-edit';
        editBtn.addEventListener('click', () => this._handleStartEdit(task.id));
        actions.appendChild(editBtn);
      }

      const delBtn = document.createElement('button');
      delBtn.textContent = '删除';
      delBtn.className = 'btn-del';
      delBtn.addEventListener('click', () => this._handleDelete(task.id));
      actions.appendChild(delBtn);

      li.appendChild(actions);
    }

    return li;
  }

  _updateStats(tasks) {
    const total = tasks.length;
    const done = tasks.filter(t => t.completed).length;
    const pending = total - done;
    this._el.total.textContent = `共 ${total} 项（未完成 ${pending}）`;
    this._el.done.textContent = `已完成 ${done} 项`;
  }
}


/* ========== Bootstrap ========== */
document.addEventListener('DOMContentLoaded', () => {
  const dataModule = new DataModule();
  window._todoApp = new TodoController(dataModule);
});
