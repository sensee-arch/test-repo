/* ============================================
   TodoList Web App — Application Logic
   CRUD + DOM Manipulation + Event Handling
   ============================================ */

(function () {
  'use strict';

  // --- Configuration ---
  const STORAGE_KEY = 'todolist_tasks';
  const FILTERS = { ALL: 'all', ACTIVE: 'active', COMPLETED: 'completed' };

  // --- State ---
  let tasks = [];
  let currentFilter = FILTERS.ALL;

  // --- DOM References ---
  let els = {};

  // --- Task Factory ---
  function createTask(title) {
    return {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
      title: title.trim(),
      completed: false,
      createdAt: Date.now()
    };
  }

  // =====================================================================
  //  DATA LAYER — localStorage persistence
  // =====================================================================

  /** Load all tasks from localStorage */
  function getAllTasks() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.warn('[TodoList] localStorage read failed:', e.message);
      return [];
    }
  }

  /** Persist tasks array to localStorage */
  function saveTasks(tasksArray) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasksArray));
    } catch (e) {
      console.warn('[TodoList] localStorage write failed:', e.message);
    }
  }

  /** Add a new task. Returns created Task or null. */
  function addTask(title) {
    const trimmed = title.trim();
    if (!trimmed) return null;
    const task = createTask(trimmed);
    tasks.push(task);
    saveTasks(tasks);
    return task;
  }

  /** Update a task's properties by id. Returns updated Task or null. */
  function updateTask(id, updates) {
    const idx = tasks.findIndex(t => t.id === id);
    if (idx === -1) return null;
    tasks[idx] = { ...tasks[idx], ...updates };
    saveTasks(tasks);
    return tasks[idx];
  }

  /** Remove a task by id. Returns true if deleted. */
  function removeTask(id) {
    const len = tasks.length;
    tasks = tasks.filter(t => t.id !== id);
    if (tasks.length !== len) {
      saveTasks(tasks);
      return true;
    }
    return false;
  }

  /** Toggle a task's completed status. Returns toggled Task or null. */
  function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return null;
    task.completed = !task.completed;
    saveTasks(tasks);
    return task;
  }

  /** Remove all completed tasks. Returns count removed. */
  function clearCompleted() {
    const prevLen = tasks.length;
    tasks = tasks.filter(t => !t.completed);
    const removed = prevLen - tasks.length;
    if (removed > 0) saveTasks(tasks);
    return removed;
  }

  // =====================================================================
  //  FILTER / QUERY helpers
  // =====================================================================

  function getFilteredTasks(filter) {
    switch (filter) {
      case FILTERS.ACTIVE:  return tasks.filter(t => !t.completed);
      case FILTERS.COMPLETED: return tasks.filter(t => t.completed);
      default:              return tasks;
    }
  }

  function getActiveCount() {
    return tasks.filter(t => !t.completed).length;
  }

  function getCompletedCount() {
    return tasks.filter(t => t.completed).length;
  }

  // =====================================================================
  //  RENDER layer — DOM manipulation
  // =====================================================================

  function renderTasks() {
    const filtered = getFilteredTasks(currentFilter);
    const listEl = els.taskList;
    listEl.innerHTML = '';

    if (filtered.length === 0) {
      renderEmptyState(listEl);
      renderCounter();
      renderClearButton();
      return;
    }

    const fragment = document.createDocumentFragment();
    filtered.forEach(task => {
      fragment.appendChild(createTaskElement(task));
    });
    listEl.appendChild(fragment);

    renderCounter();
    renderClearButton();
  }

  function createTaskElement(task) {
    const li = document.createElement('li');
    li.className = 'task-item' + (task.completed ? ' completed' : '');
    li.dataset.id = task.id;

    // Checkbox
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'task-checkbox';
    checkbox.checked = task.completed;
    checkbox.setAttribute('aria-label',
      'Mark "' + task.title + '" as ' + (task.completed ? 'active' : 'completed'));

    // --- Event: toggle completion ---
    checkbox.addEventListener('change', function () {
      toggleTask(task.id);
      renderTasks();
    });

    // Title (double-click for inline edit)
    const titleSpan = document.createElement('span');
    titleSpan.className = 'task-title';
    titleSpan.textContent = task.title;

    // --- Event: inline edit on double-click ---
    titleSpan.addEventListener('dblclick', function () {
      enableInlineEdit(titleSpan, task.id);
    });

    // Delete button
    const delBtn = document.createElement('button');
    delBtn.className = 'delete-btn';
    delBtn.textContent = '✕';
    delBtn.setAttribute('aria-label', 'Delete "' + task.title + '"');

    // --- Event: delete task ---
    delBtn.addEventListener('click', function () {
      removeTask(task.id);
      renderTasks();
    });

    li.appendChild(checkbox);
    li.appendChild(titleSpan);
    li.appendChild(delBtn);
    return li;
  }

  function renderEmptyState(listEl) {
    const emptyMsg = document.createElement('div');
    emptyMsg.className = 'empty-state';

    if (currentFilter === FILTERS.ALL) {
      emptyMsg.innerHTML = '<div class="empty-icon">📝</div><p>还没有待办事项，添加一个吧！</p>';
    } else if (currentFilter === FILTERS.ACTIVE) {
      emptyMsg.innerHTML = '<div class="empty-icon">✅</div><p>没有活跃的待办事项 🎉</p>';
    } else {
      emptyMsg.innerHTML = '<div class="empty-icon">📭</div><p>没有已完成的待办事项</p>';
    }
    listEl.appendChild(emptyMsg);
  }

  function renderCounter() {
    const active = getActiveCount();
    const total = tasks.length;
    els.taskCounter.textContent = total === 0 ? '' : active + ' / ' + total + ' 项未完成';
  }

  function renderClearButton() {
    els.clearBtn.disabled = getCompletedCount() === 0;
  }

  // =====================================================================
  //  INLINE EDIT — contenteditable
  // =====================================================================

  function enableInlineEdit(span, taskId) {
    if (span.contentEditable === 'true') return;

    const originalText = span.textContent;
    span.contentEditable = 'true';
    span.focus();

    // Select all text
    const range = document.createRange();
    range.selectNodeContents(span);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);

    function finishEdit(save) {
      span.contentEditable = 'false';
      sel.removeAllRanges();
      if (save) {
        const newTitle = span.textContent.trim();
        if (newTitle && newTitle !== originalText) {
          updateTask(taskId, { title: newTitle });
        } else if (!newTitle) {
          span.textContent = originalText;
        }
      } else {
        span.textContent = originalText;
      }
    }

    function onBlur() {
      finishEdit(true);
      cleanup();
    }
    function onKeydown(e) {
      if (e.key === 'Enter') { e.preventDefault(); span.blur(); }
      else if (e.key === 'Escape') { finishEdit(false); cleanup(); }
    }
    function cleanup() {
      span.removeEventListener('blur', onBlur);
      span.removeEventListener('keydown', onKeydown);
    }

    span.addEventListener('blur', onBlur);
    span.addEventListener('keydown', onKeydown);
  }

  // =====================================================================
  //  FILTER controls
  // =====================================================================

  function setFilter(filter) {
    currentFilter = filter;
    els.filterBtns.forEach(btn => {
      const active = btn.dataset.filter === filter;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    renderTasks();
  }

  // =====================================================================
  //  INIT — cache DOM, load data, bind top-level events
  // =====================================================================

  function cacheDom() {
    els = {
      form:       document.getElementById('addTaskForm'),
      input:      document.getElementById('taskInput'),
      taskList:   document.getElementById('taskList'),
      filterBtns: document.querySelectorAll('.filter-btn'),
      taskCounter: document.getElementById('taskCounter'),
      clearBtn:   document.getElementById('clearCompletedBtn')
    };
  }

  function bindEvents() {
    // --- Event: add task form submit ---
    els.form.addEventListener('submit', function (e) {
      e.preventDefault();
      const title = els.input.value.trim();
      if (!title) return;
      addTask(title);
      els.input.value = '';
      els.input.focus();
      renderTasks();
    });

    // --- Event: filter tab clicks ---
    els.filterBtns.forEach(btn => {
      btn.addEventListener('click', function () {
        setFilter(btn.dataset.filter);
      });
    });

    // --- Event: clear completed ---
    els.clearBtn.addEventListener('click', function () {
      const removed = clearCompleted();
      if (removed > 0) renderTasks();
    });
  }

  function init() {
    cacheDom();
    tasks = getAllTasks();
    setFilter(FILTERS.ALL);
    bindEvents();
  }

  // --- Boot ---
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
