/* ============================================================
   Todo List App — app.js
   Modules: Store (data), UI (render), Events (bindings)
   Architecture: IIFE Pattern, ES6+
   ============================================================ */

/* ============================================================
   Module 1: Store (Data Layer)
   localStorage CRUD operations, IIFE encapsulation.
   ============================================================ */
const Store = (function () {
  'use strict';

  const STORAGE_KEY = 'todo_items';

  function getTodos() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data === null) return [];
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      console.warn('Store: failed to read localStorage.', err);
      return [];
    }
  }

  function saveTodos(todos) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    } catch (err) {
      console.warn('Store: failed to write localStorage.', err);
    }
  }

  function addTodo(title) {
    if (!title || !title.trim()) return null;
    const todo = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
      title: title.trim(),
      completed: false,
      createdAt: Date.now()
    };
    const todos = getTodos();
    todos.push(todo);
    saveTodos(todos);
    return todo;
  }

  function deleteTodo(id) {
    const todos = getTodos();
    const filtered = todos.filter(t => t.id !== id);
    if (filtered.length === todos.length) return false;
    saveTodos(filtered);
    return true;
  }

  function toggleTodo(id) {
    const todos = getTodos();
    const todo = todos.find(t => t.id === id);
    if (!todo) return null;
    todo.completed = !todo.completed;
    saveTodos(todos);
    return todo;
  }

  function updateTodo(id, title) {
    const trimmed = title.trim();
    if (!trimmed) return null;
    const todos = getTodos();
    const todo = todos.find(t => t.id === id);
    if (!todo) return null;
    todo.title = trimmed;
    saveTodos(todos);
    return todo;
  }

  function clearCompleted() {
    const todos = getTodos();
    const active = todos.filter(t => !t.completed);
    if (active.length === todos.length) return false;
    saveTodos(active);
    return true;
  }

  return { getTodos, saveTodos, addTodo, deleteTodo, toggleTodo, updateTodo, clearCompleted };
})();


/* ============================================================
   Module 2: UI (Render Layer)
   State management, filter logic, DOM rendering.
   ============================================================ */
const UI = (function () {
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
  function loadTodos() {
    todos = Store.getTodos();
  }

  function saveTodos() {
    Store.saveTodos(todos);
  }

  function getFilteredTodos() {
    if (filter === 'active') return todos.filter(t => !t.completed);
    if (filter === 'completed') return todos.filter(t => t.completed);
    return todos;
  }

  function activeCount() {
    return todos.filter(t => !t.completed).length;
  }

  function completedCount() {
    return todos.filter(t => t.completed).length;
  }

  /* ---- Public CRUD ---- */
  function addTodo(title) {
    const todo = Store.addTodo(title);
    if (todo) {
      loadTodos();
      render();
      return true;
    }
    return false;
  }

  function deleteTodo(id) {
    if (Store.deleteTodo(id)) {
      if (editingId === id) editingId = null;
      loadTodos();
      render();
    }
  }

  function toggleTodo(id) {
    if (Store.toggleTodo(id)) {
      loadTodos();
      render();
    }
  }

  function updateTodo(id, title) {
    const trimmed = title.trim();
    if (!trimmed) {
      deleteTodo(id);
      return;
    }
    if (Store.updateTodo(id, trimmed)) {
      loadTodos();
      render();
    }
  }

  function clearCompleted() {
    Store.clearCompleted();
    loadTodos();
    render();
  }

  /* ---- Filter ---- */
  function setFilter(newFilter) {
    filter = newFilter;
    render();
  }

  function getFilter() {
    return filter;
  }

  /* ---- Editing ---- */
  function setEditing(id) {
    editingId = id;
    render();
  }

  function cancelEditing() {
    editingId = null;
    render();
  }

  function getEditingId() {
    return editingId;
  }

  /* ---- Render ---- */
  function render() {
    const filtered = getFilteredTodos();
    const active = activeCount();
    const completed = completedCount();

    /* Footer visibility */
    $footer.style.display = todos.length === 0 ? 'none' : 'flex';

    /* Count */
    $todoCount.innerHTML = '<strong>' + active + '</strong> ' + (active === 1 ? 'item' : 'items') + ' left';

    /* Clear completed */
    $clearCompleted.disabled = completed === 0;
    $clearCompleted.style.display = completed > 0 ? 'inline-block' : 'none';

    /* Filter selection */
    [$filterAll, $filterActive, $filterCompleted].forEach(function ($el) {
      $el.classList.remove('selected');
    });
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
      var liClass = '';
      if (todo.completed) liClass += ' completed';
      if (isEditing) liClass += ' editing';
      html += '<li data-id="' + todo.id + '" class="' + liClass.trim() + '">' +
        '<div class="view">' +
        '<input class="toggle" type="checkbox"' + (todo.completed ? ' checked' : '') + '>' +
        '<label>' + escapeHtml(todo.title) + '</label>' +
        '<button class="destroy"></button>' +
        '</div>' +
        '<input class="edit" value="' + escapeHtml(todo.title) + '">' +
        '</li>';
    }
    $todoList.innerHTML = html;
  }

  /* ---- Escape HTML ---- */
  function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  /* ---- Focus edit input ---- */
  function focusEditInput(id) {
    var $input = document.querySelector('li[data-id="' + CSS.escape(id) + '"] .edit');
    if ($input) {
      $input.focus();
      $input.setSelectionRange($input.value.length, $input.value.length);
    }
  }

  /* ---- Init state from localStorage ---- */
  function init() {
    loadTodos();
    render();
  }

  return {
    init: init,
    render: render,
    addTodo: addTodo,
    deleteTodo: deleteTodo,
    toggleTodo: toggleTodo,
    updateTodo: updateTodo,
    clearCompleted: clearCompleted,
    setFilter: setFilter,
    getFilter: getFilter,
    setEditing: setEditing,
    cancelEditing: cancelEditing,
    getEditingId: getEditingId,
    focusEditInput: focusEditInput,
    getTodos: function () { return todos; }
  };
})();


/* ============================================================
   Module 3: Events (Event Bindings)
   DOM event delegation and input handling.
   ============================================================ */
const Events = (function () {
  'use strict';

  function init() {
    /* ---- New todo: Enter key ---- */
    document.getElementById('new-todo').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        var input = this;
        UI.addTodo(input.value);
        input.value = '';
      }
    });

    /* ---- Click delegation on todo list ---- */
    document.getElementById('todo-list').addEventListener('click', function (e) {
      var $li = e.target.closest('li[data-id]');
      if (!$li) return;
      var id = $li.dataset.id;

      if (e.target.classList.contains('toggle')) {
        UI.toggleTodo(id);
      } else if (e.target.classList.contains('destroy')) {
        UI.deleteTodo(id);
      }
    });

    /* ---- Double-click label to edit ---- */
    document.getElementById('todo-list').addEventListener('dblclick', function (e) {
      var $label = e.target.closest('label');
      if (!$label) return;
      var $li = $label.closest('li[data-id]');
      if (!$li) return;
      var id = $li.dataset.id;
      UI.setEditing(id);
      /* Focus the edit input after render */
      setTimeout(function () {
        UI.focusEditInput(id);
      }, 0);
    });

    /* ---- Edit input keyboard ---- */
    document.getElementById('todo-list').addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== 'Escape') return;
      var $input = e.target.closest('.edit');
      if (!$input) return;
      var $li = $input.closest('li[data-id]');
      if (!$li) return;
      var id = $li.dataset.id;

      if (e.key === 'Enter') {
        e.preventDefault();
        UI.updateTodo(id, $input.value);
      } else if (e.key === 'Escape') {
        UI.cancelEditing();
      }
    });

    /* ---- Blur from edit input ---- */
    document.getElementById('todo-list').addEventListener('blur', function (e) {
      var $input = e.target.closest('.edit');
      if (!$input) return;
      var $li = $input.closest('li[data-id]');
      if (!$li) return;
      var id = $li.dataset.id;
      /* Delay to allow destroy click to fire first */
      setTimeout(function () {
        if (UI.getEditingId() === id) {
          UI.updateTodo(id, $input.value);
        }
      }, 100);
    }, true);

    /* ---- Filter links ---- */
    document.getElementById('filter-all').addEventListener('click', function (e) {
      e.preventDefault();
      UI.setFilter('all');
    });
    document.getElementById('filter-active').addEventListener('click', function (e) {
      e.preventDefault();
      UI.setFilter('active');
    });
    document.getElementById('filter-completed').addEventListener('click', function (e) {
      e.preventDefault();
      UI.setFilter('completed');
    });

    /* ---- Clear completed ---- */
    document.getElementById('clear-completed').addEventListener('click', function () {
      UI.clearCompleted();
    });

    /* ---- Hash change routing ---- */
    window.addEventListener('hashchange', function () {
      var hash = window.location.hash.replace('#/', '') || 'all';
      if (['all', 'active', 'completed'].indexOf(hash) !== -1) {
        UI.setFilter(hash);
      }
    });
  }

  return { init: init };
})();


/* ---- Bootstrap ---- */
document.addEventListener('DOMContentLoaded', function () {
  /* Parse hash on load */
  var hash = window.location.hash.replace('#/', '') || 'all';
  if (['all', 'active', 'completed'].indexOf(hash) !== -1) {
    UI.setFilter(hash);
  }
  UI.init();
  Events.init();
});
