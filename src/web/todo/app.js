/* ============================================================
   Todo List App — app.js
   Version: v1.0
   Modules: Store (localStorage CRUD), UI (rendering), Events (DOM bindings)
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

  return { getTodos, saveTodos };
})();

/* ============================================================
   Module 2: State & UI Render
   Central state, CRUD, filter logic, and DOM rendering.
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
  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function save() {
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

  /* ---- CRUD Operations ---- */
  function addTodo(title) {
    const trimmed = title.trim();
    if (!trimmed) return;
    todos.push({
      id: generateId(),
      title: trimmed,
      completed: false,
      createdAt: Date.now()
    });
    save();
    render();
  }

  function deleteTodo(id) {
    todos = todos.filter(t => t.id !== id);
    if (editingId === id) editingId = null;
    save();
    render();
  }

  function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
      todo.completed = !todo.completed;
      save();
      render();
    }
  }

  function updateTodo(id, title) {
    const trimmed = title.trim();
    if (!trimmed) {
      deleteTodo(id);
      return;
    }
    const todo = todos.find(t => t.id === id);
    if (todo) {
      todo.title = trimmed;
      save();
      render();
    }
  }

  function setFilter(newFilter) {
    filter = newFilter;
    render();
  }

  function clearCompleted() {
    todos = todos.filter(t => !t.completed);
    save();
    render();
  }

  function setEditing(id) {
    editingId = id;
    render();
    if (id) {
      const $input = document.querySelector(`li[data-id="${id}"] .edit`);
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
    const filtered = getFilteredTodos();
    const active = activeCount();
    const completed = completedCount();

    /* Footer visibility */
    $footer.style.display = todos.length === 0 ? 'none' : 'flex';

    /* Count */
    $todoCount.innerHTML = `<strong>${active}</strong> ${active === 1 ? 'item' : 'items'} left`;

    /* Clear completed */
    $clearCompleted.disabled = completed === 0;
    $clearCompleted.style.display = completed > 0 ? 'inline-block' : 'none';

    /* Filter selection */
    [$filterAll, $filterActive, $filterCompleted].forEach($el => $el.classList.remove('selected'));
    if (filter === 'all') $filterAll.classList.add('selected');
    else if (filter === 'active') $filterActive.classList.add('selected');
    else if (filter === 'completed') $filterCompleted.classList.add('selected');

    /* List items */
    if (filtered.length === 0) {
      $todoList.innerHTML = '<li class="empty-message">No todos here yet.</li>';
      return;
    }

    let html = '';
    for (const todo of filtered) {
      const isEditing = editingId === todo.id;
      html += `<li data-id="${todo.id}" class="${todo.completed ? 'completed' : ''}${isEditing ? ' editing' : ''}">
        <div class="view">
          <input class="toggle" type="checkbox" ${todo.completed ? 'checked' : ''}>
          <label>${escapeHtml(todo.title)}</label>
          <button class="destroy"></button>
        </div>
        <input class="edit" value="${escapeHtml(todo.title)}">
      </li>`;
    }
    $todoList.innerHTML = html;
  }

  /* ---- Escape HTML entities ---- */
  function escapeHtml(str) {
    const div = document.createElement('div');
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
      const $li = e.target.closest('li[data-id]');
      if (!$li) return;
      const id = $li.dataset.id;

      if (e.target.classList.contains('toggle')) {
        toggleTodo(id);
      } else if (e.target.classList.contains('destroy')) {
        deleteTodo(id);
      }
    });

    /* Double-click label to enter edit mode */
    $todoList.addEventListener('dblclick', function (e) {
      const $label = e.target.closest('label');
      if (!$label) return;
      const $li = $label.closest('li[data-id]');
      if (!$li) return;
      setEditing($li.dataset.id);
    });

    /* Edit input: Enter saves, Escape cancels */
    $todoList.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== 'Escape') return;
      const $input = e.target.closest('.edit');
      if (!$input) return;
      const $li = $input.closest('li[data-id]');
      if (!$li) return;
      const id = $li.dataset.id;

      if (e.key === 'Enter') {
        updateTodo(id, $input.value);
      } else if (e.key === 'Escape') {
        cancelEditing();
      }
    });

    /* Blur from edit input saves */
    $todoList.addEventListener('blur', function (e) {
      const $input = e.target.closest('.edit');
      if (!$input) return;
      const $li = $input.closest('li[data-id]');
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
      const hash = window.location.hash.replace('#/', '') || 'all';
      if (['all', 'active', 'completed'].includes(hash)) {
        setFilter(hash);
        /* Update filter visual */
        [$filterAll, $filterActive, $filterCompleted].forEach($el => $el.classList.remove('selected'));
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
    const hash = window.location.hash.replace('#/', '') || 'all';
    if (['all', 'active', 'completed'].includes(hash)) filter = hash;
    render();
    bindEvents();
  }

  return { init };
})();

/* ---- Bootstrap ---- */
document.addEventListener('DOMContentLoaded', function () {
  App.init();
});
