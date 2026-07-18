/* ============================================================
   Todo List App — app.js
   Version: v1.1
   Modules: Store (localStorage CRUD + validation), App (state, render, events)
   ============================================================ */

/* ============================================================
   Module 1: Store (Data Layer)
   localStorage CRUD operations with data validation, IIFE encapsulation.
   ============================================================ */
const Store = (function () {
  'use strict';

  const STORAGE_KEY = 'todo_items';

  /* ---- Validation ---- */

  /**
   * Validate a single todo item.
   * @param {*} item
   * @returns {boolean}
   */
  function isValidTodo(item) {
    return (
      item &&
      typeof item.id === 'string' &&
      item.id.length > 0 &&
      typeof item.title === 'string' &&
      item.title.trim().length > 0 &&
      typeof item.completed === 'boolean'
    );
  }

  /**
   * Sanitize an array — filter out invalid entries.
   * @param {Array} arr
   * @returns {Array}
   */
  function sanitize(arr) {
    if (!Array.isArray(arr)) return [];
    return arr.filter(isValidTodo);
  }

  /* ---- Storage I/O ---- */

  /**
   * Read and parse todos from localStorage.
   * @returns {Array}
   */
  function getTodos() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data === null) return [];
      const parsed = JSON.parse(data);
      return sanitize(parsed);
    } catch (err) {
      console.warn('[Store] Failed to read localStorage.', err);
      return [];
    }
  }

  /**
   * Serialize and write todos to localStorage.
   * @param {Array} todos
   */
  function saveTodos(todos) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    } catch (err) {
      console.error('[Store] Failed to write localStorage.', err);
    }
  }

  /* ---- ID Generation ---- */

  /**
   * Generate a unique ID for a todo.
   * @returns {string}
   */
  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  /* ---- Public CRUD API ---- */

  return {
    /**
     * Get all todos.
     * @returns {Array}
     */
    getTodos: getTodos,

    /**
     * Add a new todo.
     * @param {string} title
     * @returns {Object|null} The created todo, or null if invalid.
     */
    addTodo: function (title) {
      const trimmed = (title || '').trim();
      if (!trimmed) return null;

      const todo = {
        id: generateId(),
        title: trimmed,
        completed: false,
        createdAt: Date.now()
      };

      const todos = getTodos();
      todos.push(todo);
      saveTodos(todos);
      return todo;
    },

    /**
     * Delete a todo by id.
     * @param {string} id
     * @returns {boolean} Whether deletion succeeded.
     */
    deleteTodo: function (id) {
      if (!id) return false;
      const todos = getTodos();
      const length = todos.length;
      const filtered = todos.filter(function (t) { return t.id !== id; });
      if (filtered.length === length) return false;
      saveTodos(filtered);
      return true;
    },

    /**
     * Toggle a todo's completed state.
     * @param {string} id
     * @returns {boolean|null} New completed state, or null if not found.
     */
    toggleTodo: function (id) {
      if (!id) return null;
      const todos = getTodos();
      const todo = todos.find(function (t) { return t.id === id; });
      if (!todo) return null;
      todo.completed = !todo.completed;
      saveTodos(todos);
      return todo.completed;
    },

    /**
     * Update a todo's title.
     * @param {string} id
     * @param {string} newTitle
     * @returns {boolean} Whether update succeeded.
     */
    updateTodo: function (id, newTitle) {
      const trimmed = (newTitle || '').trim();
      if (!id || !trimmed) return false;
      const todos = getTodos();
      const todo = todos.find(function (t) { return t.id === id; });
      if (!todo) return false;
      todo.title = trimmed;
      saveTodos(todos);
      return true;
    },

    /**
     * Remove all completed todos.
     * @returns {number} Number of removed items.
     */
    clearCompleted: function () {
      const todos = getTodos();
      const remaining = todos.filter(function (t) { return !t.completed; });
      const removed = todos.length - remaining.length;
      if (removed > 0) saveTodos(remaining);
      return removed;
    },

    /**
     * Get count of todos matching a filter.
     * @param {'all'|'active'|'completed'} filter
     * @returns {number}
     */
    count: function (filter) {
      const todos = getTodos();
      if (filter === 'active') return todos.filter(function (t) { return !t.completed; }).length;
      if (filter === 'completed') return todos.filter(function (t) { return t.completed; }).length;
      return todos.length;
    }
  };
})();

/* ============================================================
   Module 2: App (UI State, Rendering & Events)
   Central state management, DOM rendering, and event binding.
   ============================================================ */
const App = (function () {
  'use strict';

  /* ---- State ---- */
  let todos = [];
  let filter = 'all';
  let editingId = null;

  /* ---- DOM Cache ---- */
  const $todoList = document.getElementById('todo-list');
  const $newTodo = document.getElementById('new-todo');
  const $footer = document.getElementById('footer');
  const $todoCount = document.getElementById('todo-count');
  const $clearCompleted = document.getElementById('clear-completed');
  const $filterAll = document.getElementById('filter-all');
  const $filterActive = document.getElementById('filter-active');
  const $filterCompleted = document.getElementById('filter-completed');

  /* ---- Helpers ---- */
  function save() {
    Store.saveTodos(todos);
  }

  function getFilteredTodos() {
    if (filter === 'active') return todos.filter(function (t) { return !t.completed; });
    if (filter === 'completed') return todos.filter(function (t) { return t.completed; });
    return todos;
  }

  function activeCount() {
    return todos.filter(function (t) { return !t.completed; }).length;
  }

  function completedCount() {
    return todos.filter(function (t) { return t.completed; }).length;
  }

  /* ---- CRUD Operations (delegate to Store) ---- */
  function addTodo(title) {
    var todo = Store.addTodo(title);
    if (todo) {
      todos.push(todo);
      render();
    }
  }

  function deleteTodo(id) {
    if (Store.deleteTodo(id)) {
      todos = todos.filter(function (t) { return t.id !== id; });
      if (editingId === id) editingId = null;
      render();
    }
  }

  function toggleTodo(id) {
    var newState = Store.toggleTodo(id);
    if (newState !== null) {
      var todo = todos.find(function (t) { return t.id === id; });
      if (todo) todo.completed = newState;
      render();
    }
  }

  function updateTodo(id, title) {
    if (Store.updateTodo(id, title)) {
      var todo = todos.find(function (t) { return t.id === id; });
      if (todo) todo.title = title.trim();
      render();
    }
  }

  function setFilter(newFilter) {
    filter = newFilter;
    render();
  }

  function clearCompleted() {
    Store.clearCompleted();
    todos = todos.filter(function (t) { return !t.completed; });
    render();
  }

  function setEditing(id) {
    editingId = id;
    render();
    if (id) {
      var $input = document.querySelector('li[data-id="' + id + '"] .edit');
      if ($input) {
        $input.focus();
        $input.setSelectionRange($input.value.length, $input.value.length);
      }
    }
  }

  function cancelEditing() {
    editingId = null;
    render();
  }

  /* ---- Render ---- */
  function render() {
    var filtered = getFilteredTodos();
    var active = activeCount();
    var completed = completedCount();

    /* Footer visibility */
    $footer.style.display = todos.length === 0 ? 'none' : 'flex';

    /* Count */
    $todoCount.innerHTML = '<strong>' + active + '</strong> ' + (active === 1 ? 'item' : 'items') + ' left';

    /* Clear completed */
    $clearCompleted.disabled = completed === 0;
    $clearCompleted.style.display = completed > 0 ? 'inline-block' : 'none';

    /* Filter selection */
    [$filterAll, $filterActive, $filterCompleted].forEach(function ($el) { $el.classList.remove('selected'); });
    if (filter === 'all') $filterAll.classList.add('selected');
    else if (filter === 'active') $filterActive.classList.add('selected');
    else if (filter === 'completed') $filterCompleted.classList.add('selected');

    /* List items */
    if (filtered.length === 0) {
      $todoList.innerHTML = '<li class="empty-message">No todos here yet.</li>';
      return;
    }

    var html = '';
    for (var i = 0; i < filtered.length; i++) {
      var todo = filtered[i];
      var isEditing = editingId === todo.id;
      var itemClass = todo.completed ? 'completed' : '';
      if (isEditing) itemClass += ' editing';
      html += '<li data-id="' + todo.id + '" class="' + itemClass + '">'
        + '<div class="view">'
        + '<input class="toggle" type="checkbox"' + (todo.completed ? ' checked' : '') + '>'
        + '<label>' + escapeHtml(todo.title) + '</label>'
        + '<button class="destroy"></button>'
        + '</div>'
        + '<input class="edit" value="' + escapeHtml(todo.title) + '">'
        + '</li>';
    }
    $todoList.innerHTML = html;
  }

  /* ---- Escape HTML entities ---- */
  function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  /* ---- Event Binding ---- */
  function bindEvents() {
    /* New todo: Enter key */
    $newTodo.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        addTodo(this.value);
        this.value = '';
      }
    });

    /* Delegate clicks on todo list (toggle, destroy) */
    $todoList.addEventListener('click', function (e) {
      var $li = e.target.closest('li[data-id]');
      if (!$li) return;
      var id = $li.dataset.id;

      if (e.target.classList.contains('toggle')) {
        toggleTodo(id);
      } else if (e.target.classList.contains('destroy')) {
        deleteTodo(id);
      }
    });

    /* Double-click label to enter edit mode */
    $todoList.addEventListener('dblclick', function (e) {
      var $label = e.target.closest('label');
      if (!$label) return;
      var $li = $label.closest('li[data-id]');
      if (!$li) return;
      setEditing($li.dataset.id);
    });

    /* Edit input: Enter saves, Escape cancels */
    $todoList.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== 'Escape') return;
      var $input = e.target.closest('.edit');
      if (!$input) return;
      var $li = $input.closest('li[data-id]');
      if (!$li) return;
      var id = $li.dataset.id;

      if (e.key === 'Enter') {
        updateTodo(id, $input.value);
      } else if (e.key === 'Escape') {
        cancelEditing();
      }
    });

    /* Blur from edit input saves */
    $todoList.addEventListener('blur', function (e) {
      var $input = e.target.closest('.edit');
      if (!$input) return;
      var $li = $input.closest('li[data-id]');
      if (!$li) return;
      /* Small delay so click on destroy can fire before we save */
      setTimeout(function () {
        if (editingId === $li.dataset.id) {
          updateTodo($li.dataset.id, $input.value);
        }
      }, 100);
    }, true);

    /* Filter links */
    $filterAll.addEventListener('click', function (e) { e.preventDefault(); setFilter('all'); });
    $filterActive.addEventListener('click', function (e) { e.preventDefault(); setFilter('active'); });
    $filterCompleted.addEventListener('click', function (e) { e.preventDefault(); setFilter('completed'); });

    /* Clear completed */
    $clearCompleted.addEventListener('click', clearCompleted);

    /* Hash change routing */
    window.addEventListener('hashchange', function () {
      var hash = window.location.hash.replace('#/', '') || 'all';
      if (['all', 'active', 'completed'].indexOf(hash) !== -1) {
        setFilter(hash);
        [$filterAll, $filterActive, $filterCompleted].forEach(function ($el) { $el.classList.remove('selected'); });
        if (hash === 'all') $filterAll.classList.add('selected');
        else if (hash === 'active') $filterActive.classList.add('selected');
        else if (hash === 'completed') $filterCompleted.classList.add('selected');
      }
    });
  }

  /* ---- Init ---- */
  function init() {
    todos = Store.getTodos();
    /* Parse hash on load */
    var hash = window.location.hash.replace('#/', '') || 'all';
    if (['all', 'active', 'completed'].indexOf(hash) !== -1) filter = hash;
    render();
    bindEvents();
  }

  return { init: init };
})();

/* ---- Bootstrap ---- */
document.addEventListener('DOMContentLoaded', function () {
  App.init();
});
