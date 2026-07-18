/* ===================================================
   TodoList App — Vanilla JavaScript (ES6+)
   Storage: localStorage (key: todolist_tasks)
   =================================================== */

(function () {
  'use strict';

  // ===== Constants =====
  var STORAGE_KEY = 'todolist_tasks';
  var Filters = {
    ALL: 'all',
    ACTIVE: 'active',
    COMPLETED: 'completed'
  };

  // ===== State =====
  var tasks = [];
  var currentFilter = Filters.ALL;

  // ===== DOM References =====
  var $ = function (sel, ctx) {
    return (ctx || document).querySelector(sel);
  };
  var $$ = function (sel, ctx) {
    return Array.from((ctx || document).querySelectorAll(sel));
  };

  var dom = {
    form: $('#todo-form'),
    input: $('#todo-input'),
    list: $('#todo-list'),
    count: $('#todo-count'),
    footer: $('#todo-footer'),
    clearBtn: $('#clear-completed'),
    filterBtns: function () { return $$('.filter-btn'); }
  };

  // ===== Storage =====
  function getAllTasks() {
    try {
      var data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.warn('TodoList: Failed to read from localStorage', e);
      return [];
    }
  }

  function saveTasks(tasksToSave) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasksToSave));
    } catch (e) {
      console.warn('TodoList: Failed to write to localStorage', e);
    }
  }

  // ===== Task CRUD =====
  function addTask(title) {
    var task = {
      id: generateId(),
      title: title.trim(),
      completed: false,
      createdAt: Date.now()
    };
    tasks = [task].concat(tasks);
    saveTasks(tasks);
    render();
  }

  function updateTask(id, updates) {
    tasks = tasks.map(function (t) {
      if (t.id === id) {
        return Object.assign({}, t, updates);
      }
      return t;
    });
    saveTasks(tasks);
    render();
  }

  function deleteTask(id) {
    tasks = tasks.filter(function (t) {
      return t.id !== id;
    });
    saveTasks(tasks);
    render();
  }

  function clearCompleted() {
    tasks = tasks.filter(function (t) {
      return !t.completed;
    });
    saveTasks(tasks);
    render();
  }

  // ===== Helpers =====
  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function getFilteredTasks() {
    if (currentFilter === Filters.ACTIVE) {
      return tasks.filter(function (t) { return !t.completed; });
    }
    if (currentFilter === Filters.COMPLETED) {
      return tasks.filter(function (t) { return t.completed; });
    }
    return tasks;
  }

  function getActiveCount() {
    return tasks.filter(function (t) { return !t.completed; }).length;
  }

  // ===== Render =====
  function render() {
    var filtered = getFilteredTasks();
    renderList(filtered);
    renderFooter();
  }

  function renderList(filteredTasks) {
    dom.list.innerHTML = '';

    if (filteredTasks.length === 0) {
      var emptyEl = document.createElement('div');
      emptyEl.className = 'empty-state';
      var msgEl = document.createElement('p');
      msgEl.textContent = currentFilter === Filters.COMPLETED
        ? 'No completed tasks yet. Finish something! 🎯'
        : 'No tasks yet. Add one above! ✏️';
      emptyEl.appendChild(msgEl);
      dom.list.appendChild(emptyEl);
      return;
    }

    filteredTasks.forEach(function (task) {
      var li = document.createElement('li');
      li.className = 'todo-item' + (task.completed ? ' completed' : '');
      li.dataset.id = task.id;

      // Checkbox
      var cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.className = 'todo-checkbox';
      cb.checked = task.completed;
      cb.setAttribute('aria-label', 'Toggle "' + task.title + '"');
      cb.addEventListener('change', function () {
        updateTask(task.id, { completed: cb.checked });
      });

      // Title / edit field
      var titleSpan = document.createElement('span');
      titleSpan.className = 'todo-title';
      titleSpan.textContent = task.title;
      titleSpan.setAttribute('role', 'button');
      titleSpan.setAttribute('tabindex', '0');
      titleSpan.setAttribute('aria-label', 'Edit "' + task.title + '"');

      // Double-click to edit
      titleSpan.addEventListener('dblclick', function () {
        startEditing(li, task);
      });
      titleSpan.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          startEditing(li, task);
        }
      });

      // Delete button
      var delBtn = document.createElement('button');
      delBtn.type = 'button';
      delBtn.className = 'btn btn-delete';
      delBtn.textContent = '✕';
      delBtn.setAttribute('aria-label', 'Delete "' + task.title + '"');
      delBtn.addEventListener('click', function () {
        deleteTask(task.id);
      });

      li.appendChild(cb);
      li.appendChild(titleSpan);
      li.appendChild(delBtn);
      dom.list.appendChild(li);
    });
  }

  function renderFooter() {
    var count = getActiveCount();
    dom.count.textContent = count + ' item' + (count !== 1 ? 's' : '') + ' left';

    var completedCount = tasks.length - getActiveCount();
    dom.clearBtn.disabled = completedCount === 0;
  }

  // ===== Inline Editing =====
  function startEditing(li, task) {
    var titleEl = li.querySelector('.todo-title');
    var inputEl = document.createElement('input');
    inputEl.type = 'text';
    inputEl.className = 'todo-edit-input';
    inputEl.value = task.title;
    inputEl.maxLength = 200;
    inputEl.setAttribute('aria-label', 'Edit task title');

    li.replaceChild(inputEl, titleEl);
    inputEl.focus();
    inputEl.select();

    function finishEditing(save) {
      var newTitle = inputEl.value.trim();
      if (save && newTitle && newTitle !== task.title) {
        updateTask(task.id, { title: newTitle });
      } else {
        render();
      }
    }

    function onKeydown(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        inputEl.removeEventListener('blur', onBlur);
        finishEditing(true);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        inputEl.removeEventListener('blur', onBlur);
        finishEditing(false);
      }
    }

    function onBlur() {
      finishEditing(true);
    }

    inputEl.addEventListener('keydown', onKeydown);
    inputEl.addEventListener('blur', onBlur);
  }

  // ===== Event Handlers =====
  function onFormSubmit(e) {
    e.preventDefault();
    var title = dom.input.value.trim();
    if (title) {
      addTask(title);
      dom.input.value = '';
      dom.input.focus();
    }
  }

  function onFilterClick(e) {
    var btn = e.currentTarget;
    var filter = btn.dataset.filter;
    if (filter === currentFilter) return;

    dom.filterBtns().forEach(function (b) {
      b.classList.remove('active');
      b.setAttribute('aria-selected', 'false');
    });

    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');
    currentFilter = filter;
    render();
  }

  function onClearCompleted() {
    clearCompleted();
  }

  // ===== Init =====
  function init() {
    tasks = getAllTasks();
    render();

    // Bind events
    dom.form.addEventListener('submit', onFormSubmit);

    dom.filterBtns().forEach(function (btn) {
      btn.addEventListener('click', onFilterClick);
    });

    dom.clearBtn.addEventListener('click', onClearCompleted);
  }

  // Boot
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
