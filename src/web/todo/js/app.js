/* ── Logic Layer ──
 * Task CRUD, state management, event handling, DOM rendering.
 * No innerHTML for user text — uses textContent only.
 * No eval / new Function.
 */

(function () {
  'use strict';

  /* ── State ── */
  let items = [];
  let currentFilter = 'all';

  /* ── DOM References ── */
  const todoForm = document.getElementById('todoForm');
  const todoInput = document.getElementById('todoInput');
  const taskList = document.getElementById('taskList');
  const emptyState = document.getElementById('emptyState');
  const taskCount = document.getElementById('taskCount');
  const clearBtn = document.getElementById('clearBtn');
  const filterBtns = document.querySelectorAll('.filter-btn');

  /* ── Utilities ── */
  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  /* ── Storage Ops ── */
  function loadItems() {
    items = Storage.load();
    render();
  }

  function saveItems() {
    Storage.save(items);
  }

  /* ── CRUD ── */

  /** Add a new task. */
  function addTask(title) {
    const trimmed = title.trim();
    if (!trimmed) return false;

    items.push({
      id: generateId(),
      title: trimmed,
      completed: false,
      createdAt: Date.now()
    });

    saveItems();
    render();
    return true;
  }

  /** Toggle a task's completed state. */
  function toggleTask(id) {
    const item = items.find(function (t) { return t.id === id; });
    if (!item) return;
    item.completed = !item.completed;
    saveItems();
    render();
  }

  /** Delete a task. */
  function deleteTask(id) {
    items = items.filter(function (t) { return t.id !== id; });
    saveItems();
    render();
  }

  /** Update a task's title (inline edit save). */
  function updateTaskTitle(id, newTitle) {
    const trimmed = newTitle.trim();
    if (!trimmed) return false;

    const item = items.find(function (t) { return t.id === id; });
    if (!item) return false;

    item.title = trimmed;
    saveItems();
    render();
    return true;
  }

  /** Clear all completed tasks. */
  function clearCompleted() {
    const hadCompleted = items.some(function (t) { return t.completed; });
    items = items.filter(function (t) { return !t.completed; });
    if (hadCompleted) {
      saveItems();
      render();
    }
  }

  /* ── Filtering ── */

  function getFilteredItems() {
    if (currentFilter === 'active') {
      return items.filter(function (t) { return !t.completed; });
    }
    if (currentFilter === 'completed') {
      return items.filter(function (t) { return t.completed; });
    }
    return items; // 'all'
  }

  function setFilter(filter) {
    currentFilter = filter;
    filterBtns.forEach(function (btn) {
      var isActive = btn.getAttribute('data-filter') === filter;
      btn.classList.toggle('active', isActive);
    });
    render();
  }

  /* ── Rendering ── */

  function updateTaskCount() {
    var count = getFilteredItems().length;
    var total = items.length;
    var text = count + ' item' + (count !== 1 ? 's' : '');
    if (currentFilter !== 'all' && total !== count) {
      text += ' (filtered)';
    }
    taskCount.textContent = text;
  }

  function toggleEmptyState(show) {
    emptyState.classList.toggle('visible', show);
  }

  /** Create a task list item element (textContent-safe). */
  function createTaskElement(task) {
    var li = document.createElement('li');
    li.className = 'task-item' + (task.completed ? ' completed' : '');
    li.setAttribute('data-id', task.id);
    li.setAttribute('role', 'listitem');

    // Checkbox
    var checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'task-checkbox';
    checkbox.checked = task.completed;
    checkbox.setAttribute('aria-label', 'Mark "' + task.title + '" as ' + (task.completed ? 'incomplete' : 'complete'));

    // Title (click to edit)
    var titleSpan = document.createElement('span');
    titleSpan.className = 'task-title';
    titleSpan.textContent = task.title;

    // Delete button
    var delBtn = document.createElement('button');
    delBtn.className = 'task-delete';
    delBtn.textContent = '✕';
    delBtn.setAttribute('aria-label', 'Delete "' + task.title + '"');

    // Append
    li.appendChild(checkbox);
    li.appendChild(titleSpan);
    li.appendChild(delBtn);

    /* ── Event: Toggle ── */
    checkbox.addEventListener('change', function () {
      toggleTask(task.id);
    });

    /* ── Event: Delete ── */
    delBtn.addEventListener('click', function () {
      // Animate removal
      li.classList.add('removing');
      var self = li;
      setTimeout(function () {
        deleteTask(task.id);
      }, 200);
    });

    /* ── Event: Inline Edit (double-click) ── */
    titleSpan.addEventListener('dblclick', function () {
      enterEditMode(li, task, titleSpan);
    });

    return li;
  }

  /** Enter inline edit mode on a task. */
  function enterEditMode(li, task, titleSpan) {
    var input = document.createElement('input');
    input.type = 'text';
    input.className = 'task-edit-input';
    input.value = task.title;
    input.maxLength = 200;

    li.replaceChild(input, titleSpan);
    input.focus();
    input.select();

    var saveEdit = function () {
      var newVal = input.value;
      if (updateTaskTitle(task.id, newVal)) {
        // updateTaskTitle calls render() which rebuilds everything
      } else {
        // Invalid input: cancel and re-render
        render();
      }
    };

    var cancelEdit = function () {
      render();
    };

    input.addEventListener('blur', saveEdit);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        input.blur();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        cancelEdit();
      }
    });
  }

  function render() {
    var filtered = getFilteredItems();

    // Clear list
    while (taskList.firstChild) {
      taskList.removeChild(taskList.firstChild);
    }

    // Build list
    filtered.forEach(function (task) {
      var el = createTaskElement(task);
      taskList.appendChild(el);
    });

    // Empty state
    toggleEmptyState(filtered.length === 0);

    // Count
    updateTaskCount();
  }

  /* ── Event Handlers ── */

  // Form submit: add task
  todoForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var title = todoInput.value;
    if (addTask(title)) {
      todoInput.value = '';
      todoInput.focus();
    }
  });

  // Clear completed
  clearBtn.addEventListener('click', clearCompleted);

  // Filter buttons
  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var filter = btn.getAttribute('data-filter');
      setFilter(filter);
    });
  });

  /* ── Init ── */
  loadItems();
})();
