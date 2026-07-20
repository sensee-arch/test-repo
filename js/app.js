/* ═══════════════════════════════════════════════
   Todo List SPA — JavaScript (js/app.js)
   Modular architecture: DataModule · RenderModule · EventModule
   ═══════════════════════════════════════════════ */

/* ─── Constants ─── */

const STORAGE_KEY = 'todolist-tasks';
const STORAGE_WARN_THRESHOLD = 500;
const STORAGE_WARN_SIZE = 4 * 1024 * 1024; // 4 MB
const ANIMATION_DURATION_MS = 300;

/* ═══════════════════════════════════════════════
   DataModule — localStorage CRUD + onChange
   ═══════════════════════════════════════════════ */

class DataModule {
  /** @type {boolean} */
  #available = true;

  /** @type {Array<function>} */
  #listeners = [];

  /** @type {Array} In-memory fallback when localStorage is unavailable */
  #fallbackData = [];

  constructor() {
    this.#probeStorage();
  }

  /** Probe localStorage availability; show warning if unavailable. */
  #probeStorage() {
    try {
      const probeKey = '__todolist_probe__';
      localStorage.setItem(probeKey, '1');
      localStorage.removeItem(probeKey);
    } catch {
      this.#available = false;
      this.#showStorageWarning();
    }
  }

  /** Display warning banner when localStorage is unavailable. */
  #showStorageWarning() {
    const banner = document.createElement('div');
    banner.className = 'todo-warning';
    banner.textContent = '⚠️ localStorage unavailable — data will not persist beyond this session.';
    const container = document.querySelector('.todo-container');
    if (container) {
      container.prepend(banner);
    }
  }

  /** Warn if storage is nearing capacity limits. */
  #checkStorageCapacity(json) {
    const size = new Blob([json]).size;
    if (size > STORAGE_WARN_SIZE) {
      console.warn(
        `DataModule: localStorage usage ~${(size / 1024 / 1024).toFixed(1)} MB, approaching ~5 MB limit.`
      );
    }
  }

  /**
   * Read all tasks from storage.
   * @returns {Array<Object>}
   */
  getTasks() {
    if (!this.#available) return this.#fallbackData.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw === null) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed)
        ? parsed.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        : [];
    } catch (e) {
      console.warn('DataModule.getTasks: parse error, returning empty array', e);
      return [];
    }
  }

  /** Persist task array to storage. */
  #saveTasks(taskArray) {
    if (!this.#available) {
      this.#fallbackData = taskArray;
      return;
    }
    try {
      const json = JSON.stringify(taskArray);
      this.#checkStorageCapacity(json);
      localStorage.setItem(STORAGE_KEY, json);
    } catch (e) {
      console.error('DataModule.#saveTasks: write failed', e);
    }
  }

  /** Generate UUID v4. */
  #generateId() {
    try {
      return crypto.randomUUID();
    } catch {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
      });
    }
  }

  /** Notify all change listeners. */
  #notify() {
    const tasks = this.getTasks();
    const stats = this.getStats();
    for (const cb of this.#listeners) {
      try { cb({ tasks, stats }); } catch (e) {
        console.warn('DataModule: onChange callback error', e);
      }
    }
  }

  /**
   * Register a change listener.
   * @param {function} cb - Receives { tasks, stats }
   */
  onChange(cb) {
    if (typeof cb === 'function') this.#listeners.push(cb);
  }

  /**
   * Add a new task.
   * @param {string} title - 1-200 chars, trimmed
   * @returns {Object} Created task
   */
  addTask(title) {
    if (typeof title !== 'string') throw new Error('addTask: title must be a string');
    const trimmed = title.trim();
    if (trimmed.length === 0) throw new Error('addTask: title cannot be empty');
    if (trimmed.length > 200) throw new Error('addTask: title exceeds 200 characters');

    const task = {
      id: this.#generateId(),
      title: trimmed,
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const tasks = this.getTasks();
    tasks.push(task);
    this.#saveTasks(tasks);
    this.#notify();
    return task;
  }

  /**
   * Update a task's fields by id.
   * @param {string} id
   * @param {{ title?: string, completed?: boolean }} data
   * @returns {Object} Updated task
   */
  updateTask(id, data) {
    const tasks = this.getTasks();
    const task = tasks.find((t) => t.id === id);
    if (!task) throw new Error(`updateTask: task "${id}" not found`);

    if (data.title !== undefined) {
      const trimmed = String(data.title).trim();
      if (trimmed.length === 0) throw new Error('updateTask: title cannot be empty');
      if (trimmed.length > 200) throw new Error('updateTask: title exceeds 200 characters');
      task.title = trimmed;
    }
    if (data.completed !== undefined) task.completed = Boolean(data.completed);

    task.updatedAt = new Date().toISOString();
    this.#saveTasks(tasks);
    this.#notify();
    return { ...task };
  }

  /**
   * Delete a task by id.
   * @param {string} id
   * @returns {boolean} true if deleted, false if not found
   */
  deleteTask(id) {
    const tasks = this.getTasks();
    const idx = tasks.findIndex((t) => t.id === id);
    if (idx === -1) return false;
    tasks.splice(idx, 1);
    this.#saveTasks(tasks);
    this.#notify();
    return true;
  }

  /**
   * Toggle a task's completed status.
   * @param {string} id
   * @returns {Object} Updated task
   */
  toggleTask(id) {
    const tasks = this.getTasks();
    const task = tasks.find((t) => t.id === id);
    if (!task) throw new Error(`toggleTask: task "${id}" not found`);
    task.completed = !task.completed;
    task.updatedAt = new Date().toISOString();
    this.#saveTasks(tasks);
    this.#notify();
    return { ...task };
  }

  /**
   * Get task statistics.
   * @returns {{ total: number, completed: number, active: number }}
   */
  getStats() {
    const tasks = this.getTasks();
    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    return { total, completed, active: total - completed };
  }
}

/* ═══════════════════════════════════════════════
   RenderModule — DOM rendering + animations
   ═══════════════════════════════════════════════ */

class RenderModule {
  /** @type {HTMLElement} */
  #containerEl;

  /** @type {HTMLElement} */
  #statsEl;

  /** @type {HTMLElement} */
  #clearBtnEl;

  /** @type {NodeList} */
  #filterBtns;

  /**
   * @param {HTMLElement} containerEl - Task list <ul>
   * @param {HTMLElement} statsEl - Item count <span>
   * @param {HTMLElement} clearBtnEl - "Clear completed" button
   * @param {NodeList} filterBtns - Filter buttons
   */
  constructor(containerEl, statsEl, clearBtnEl, filterBtns) {
    this.#containerEl = containerEl;
    this.#statsEl = statsEl;
    this.#clearBtnEl = clearBtnEl;
    this.#filterBtns = filterBtns;
  }

  /** @param {string} text @returns {string} */
  #escapeHtml(text) {
    const d = document.createElement('div');
    d.textContent = text;
    return d.innerHTML;
  }

  /**
   * Create a task DOM element.
   * @param {Object} task
   * @param {boolean} animateEnter - Add fadeIn animation class
   * @returns {HTMLLIElement}
   */
  #createTaskElement(task, animateEnter = false) {
    const li = document.createElement('li');
    li.className = 'todo-item' + (task.completed ? ' todo-item--completed' : '');
    li.dataset.id = task.id;

    if (animateEnter) li.classList.add('todo-item--enter');

    li.innerHTML =
      '<input class="todo-item__toggle" type="checkbox"' +
      (task.completed ? ' checked' : '') +
      ' aria-label="Toggle task completion" />' +
      '<span class="todo-item__title">' +
      this.#escapeHtml(task.title) +
      '</span>' +
      '<button class="todo-item__destroy" aria-label="Delete task">&times;</button>';

    return li;
  }

  /**
   * Create an inline editing element.
   * @param {Object} task
   * @returns {HTMLLIElement}
   */
  createEditElement(task) {
    const li = document.createElement('li');
    li.className = 'todo-item todo-item--editing';
    li.dataset.id = task.id;
    li.innerHTML =
      '<input class="todo-item__edit-input" type="text" value="' +
      this.#escapeHtml(task.title) +
      '" />';
    return li;
  }

  /**
   * Full render of task list.
   * @param {Array<Object>} tasks
   */
  render(tasks) {
    this.#containerEl.innerHTML = '';
    if (tasks.length === 0) {
      this.renderEmpty();
      return;
    }
    const frag = document.createDocumentFragment();
    for (const t of tasks) frag.appendChild(this.#createTaskElement(t));
    this.#containerEl.appendChild(frag);
  }

  /** Show empty state message. */
  renderEmpty() {
    this.#containerEl.innerHTML =
      '<li class="todo-list__empty">还没有任务，添加一个吧！</li>';
  }

  /**
   * Update footer stats, filter selection, and clear-button visibility.
   * @param {{ total:number, completed:number, active:number }} stats
   * @param {string} currentFilter
   */
  renderStats(stats, currentFilter = 'all') {
    this.#statsEl.textContent =
      '共 ' + stats.total + ' 项，已完成 ' + stats.completed + ' 项，未完成 ' + stats.active + ' 项';

    this.#filterBtns.forEach((btn) => {
      btn.classList.toggle('todo-footer__filter-btn--selected', btn.dataset.filter === currentFilter);
    });

    this.#clearBtnEl.style.display = stats.completed > 0 ? '' : 'none';
  }

  /**
   * Prepend a task item with enter animation.
   * @param {Object} task
   */
  addTaskItem(task) {
    const empty = this.#containerEl.querySelector('.todo-list__empty');
    if (empty) this.#containerEl.innerHTML = '';

    const el = this.#createTaskElement(task, true);
    this.#containerEl.prepend(el);
    setTimeout(() => el.classList.remove('todo-item--enter'), ANIMATION_DURATION_MS);
  }

  /**
   * Animate removal, then call callback.
   * @param {string} id
   * @param {function} [onRemoved]
   */
  removeTaskItem(id, onRemoved) {
    const el = this.#containerEl.querySelector(`li[data-id="${id}"]`);
    if (!el) { if (onRemoved) onRemoved(); return; }

    el.classList.add('todo-item--exit');
    setTimeout(() => {
      if (el.parentNode) el.parentNode.removeChild(el);
      if (onRemoved) onRemoved();
    }, ANIMATION_DURATION_MS);
  }
}

/* ═══════════════════════════════════════════════
   EventModule — user interaction binding
   ═══════════════════════════════════════════════ */

class EventModule {
  /** @type {DataModule} */
  #dm;

  /** @type {RenderModule} */
  #rm;

  /** @type {HTMLElement} */
  #listEl;

  /** @type {string|null} */
  #editingId = null;

  /** @type {string} */
  #currentFilter = 'all';

  /**
   * @param {DataModule} dm
   * @param {RenderModule} rm
   * @param {HTMLElement} listEl
   */
  constructor(dm, rm, listEl) {
    this.#dm = dm;
    this.#rm = rm;
    this.#listEl = listEl;
  }

  /** @returns {Array<Object>} Filtered tasks */
  #getFiltered() {
    const all = this.#dm.getTasks();
    if (this.#currentFilter === 'active') return all.filter((t) => !t.completed);
    if (this.#currentFilter === 'completed') return all.filter((t) => t.completed);
    return all;
  }

  /** Full re-render from current filter + stats. */
  #refresh() {
    this.#rm.render(this.#getFiltered());
    this.#rm.renderStats(this.#dm.getStats(), this.#currentFilter);
  }

  /**
   * React to DataModule changes.
   * Only updates stats to preserve animation DOM state.
   * Full refresh is triggered explicitly (filter switch, etc.).
   * @param {{ tasks:Array, stats:Object }} _
   */
  onDataChanged(_) {
    this.#rm.renderStats(this.#dm.getStats(), this.#currentFilter);
  }

  /**
   * Bind add-task form submission.
   * @param {HTMLInputElement} inputEl
   * @param {HTMLFormElement} formEl
   */
  bindAddTask(inputEl, formEl) {
    formEl.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = inputEl.value.trim();
      if (!title) return;

      let task;
      try {
        task = this.#dm.addTask(title);
      } catch (err) {
        console.error('addTask failed:', err.message);
        return;
      }

      // Prepend with animation
      if (this.#currentFilter !== 'completed') {
        this.#rm.addTaskItem(task);
      } else {
        this.#refresh();
      }
      this.#rm.renderStats(this.#dm.getStats(), this.#currentFilter);

      inputEl.value = '';
      inputEl.focus();
    });
  }

  /** Bind toggle checkboxes via delegation with completion animation. */
  bindToggleCheckbox() {
    this.#listEl.addEventListener('click', (e) => {
      const cb = e.target.closest('.todo-item__toggle');
      if (!cb) return;
      const li = cb.closest('.todo-item');
      if (!li) return;
      const id = li.dataset.id;
      const wasCompleted = li.classList.contains('todo-item--completed');

      if (!wasCompleted) {
        // Completing: add scaleIn animation on checkbox + title fade
        li.classList.add('todo-item--completing');
        setTimeout(() => {
          try { this.#dm.toggleTask(id); } catch (err) {
            console.error('toggleTask failed:', err.message);
          }
          li.classList.remove('todo-item--completing');
          li.classList.add('todo-item--completed');
          this.#rm.renderStats(this.#dm.getStats(), this.#currentFilter);
        }, 300);
      } else {
        // Un-completing: toggle immediately, no animation
        try { this.#dm.toggleTask(id); } catch (err) {
          console.error('toggleTask failed:', err.message);
        }
        this.#rm.renderStats(this.#dm.getStats(), this.#currentFilter);
      }
    });
  }

  /** Bind inline editing (dblclick + Enter/Escape + blur). */
  bindEditTask() {
    this.#listEl.addEventListener('dblclick', (e) => {
      const titleEl = e.target.closest('.todo-item__title');
      if (!titleEl) return;
      const li = titleEl.closest('.todo-item');
      if (!li || li.classList.contains('todo-item--completed')) return;
      const id = li.dataset.id;
      if (this.#editingId === id) return;

      const task = this.#dm.getTasks().find((t) => t.id === id);
      if (!task) return;

      this.#editingId = id;
      li.replaceWith(this.#rm.createEditElement(task));
      const input = document.querySelector(`.todo-item--editing .todo-item__edit-input`);
      if (input) { input.focus(); input.select(); }
    });

    this.#listEl.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { this.#editingId = null; this.#refresh(); return; }
      if (e.key !== 'Enter') return;
      const input = e.target.closest('.todo-item__edit-input');
      if (!input) return;
      const li = input.closest('.todo-item');
      if (!li || this.#editingId !== li.dataset.id) return;
      this.#commitEdit(li.dataset.id, input.value);
    });

    this.#listEl.addEventListener('focusout', (e) => {
      const input = e.target.closest('.todo-item__edit-input');
      if (!input) return;
      const li = input.closest('.todo-item');
      if (!li || this.#editingId !== li.dataset.id) return;
      this.#commitEdit(li.dataset.id, input.value);
    });
  }

  /**
   * Commit an inline edit.
   * @param {string} id
   * @param {string} rawValue
   */
  #commitEdit(id, rawValue) {
    const trimmed = rawValue.trim();
    this.#editingId = null;
    if (!trimmed) { this.#dm.deleteTask(id); }
    else {
      try { this.#dm.updateTask(id, { title: trimmed }); } catch (err) {
        console.error('updateTask failed:', err.message);
      }
    }
  }

  /** Bind delete buttons via delegation with fadeOut animation. */
  bindDeleteTask() {
    this.#listEl.addEventListener('click', (e) => {
      const btn = e.target.closest('.todo-item__destroy');
      if (!btn) return;
      const li = btn.closest('.todo-item');
      if (!li) return;
      const id = li.dataset.id;
      this.#rm.removeTaskItem(id, () => {
        // After animation, delete from DataModule and refresh
        this.#dm.deleteTask(id);
        this.#rm.renderStats(this.#dm.getStats(), this.#currentFilter);
      });
    });
  }

  /**
   * Bind filter tab buttons.
   * @param {NodeList} btns
   */
  bindFilterTabs(btns) {
    btns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const filter = btn.dataset.filter;
        if (filter === this.#currentFilter) return;
        this.#currentFilter = filter;
        this.#refresh();
      });
    });
  }

  /**
   * Bind clear-completed button.
   * @param {HTMLElement} btn
   */
  bindClearCompleted(btn) {
    btn.addEventListener('click', () => {
      this.#dm.getTasks()
        .filter((t) => t.completed)
        .forEach((t) => this.#dm.deleteTask(t.id));
    });
  }
}

/* ═══════════════════════════════════════════════
   Boot
   ═══════════════════════════════════════════════ */

function initApp() {
  const listEl = document.getElementById('todo-list');
  const statsEl = document.getElementById('todo-count');
  const clearBtn = document.getElementById('clear-completed');
  const filterBtns = document.querySelectorAll('.todo-footer__filter-btn');
  const inputEl = document.getElementById('todo-input');
  const formEl = document.getElementById('todo-form');

  if (!listEl || !statsEl || !clearBtn || !inputEl || !formEl) {
    console.error('TodoList: required DOM elements missing');
    return;
  }

  const dm = new DataModule();
  const rm = new RenderModule(listEl, statsEl, clearBtn, filterBtns);
  const ev = new EventModule(dm, rm, listEl);

  // Subscribe EventModule to DataModule changes (used as safety net)
  dm.onChange((payload) => ev.onDataChanged(payload));

  // Bind all interactions
  ev.bindAddTask(inputEl, formEl);
  ev.bindToggleCheckbox();
  ev.bindEditTask();
  ev.bindDeleteTask();
  ev.bindFilterTabs(filterBtns);
  ev.bindClearCompleted(clearBtn);

  // Initial render
  rm.render(dm.getTasks());
  rm.renderStats(dm.getStats(), 'all');
}

document.addEventListener('DOMContentLoaded', initApp);
