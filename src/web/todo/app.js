/* ============================================================
   Todo List App — app.js
   Version: v1.0
   ============================================================ */

/* ============================================================
   Module 1: Storage Layer
   IIFE wrapping localStorage with error handling.
   ============================================================ */
const Storage = (function () {
  'use strict';

  /** Key used for localStorage persistence. */
  const STORAGE_KEY = 'todo_items';

  /**
   * Read all todos from localStorage.
   * @returns {Array<{id: string, title: string, completed: boolean, createdAt: number}>}
   */
  function getTodos() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data === null) {
        return [];
      }
      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed)) {
        console.warn('Storage.getTodos: stored data is not an array, returning empty.');
        return [];
      }
      return parsed;
    } catch (err) {
      console.warn('Storage.getTodos: failed to read from localStorage.', err);
      return [];
    }
  }

  /**
   * Save todos to localStorage.
   * @param {Array} todos - Array of TodoItem objects.
   */
  function saveTodos(todos) {
    try {
      const serialized = JSON.stringify(todos);
      localStorage.setItem(STORAGE_KEY, serialized);
    } catch (err) {
      console.warn('Storage.saveTodos: failed to write to localStorage.', err);
    }
  }

  return {
    getTodos: getTodos,
    saveTodos: saveTodos,
  };
})();

/* ============================================================
   Module 2: State Layer
   IIFE managing central state and CRUD operations.
   ============================================================ */
const State = (function () {
  'use strict';

  /** @type {Array<{id: string, title: string, completed: boolean, createdAt: number}>} */
  let todos = [];

  /** @type {'all'|'active'|'completed'} */
  let filter = 'all';

  /** @type {string|null} */
  let editingId = null;

  /** Callback registered by Render module. Called after every mutation. */
  let onRender = null;

  /**
   * Generate a short unique ID.
   * @returns {string}
   */
  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  /**
   * Persist current todos and trigger render callback.
   */
  function saveAndRender() {
    Storage.saveTodos(todos);
    if (typeof onRender === 'function') {
      onRender();
    }
  }

  /**
   * Initialize state from Storage.
   */
  function init() {
    todos = Storage.getTodos();
  }

  /**
   * Add a new todo item.
   * @param {string} title
   */
  function addTodo(title) {
    const trimmed = (title || '').trim();
    if (trimmed === '') {
      return;
    }
    const todo = {
      id: generateId(),
      title: trimmed,
      completed: false,
      createdAt: Date.now(),
    };
    todos.unshift(todo);
    saveAndRender();
  }

  /**
   * Delete a todo by id.
   * @param {string} id
   */
  function deleteTodo(id) {
    todos = todos.filter(function (t) { return t.id !== id; });
    if (editingId === id) {
      editingId = null;
    }
    saveAndRender();
  }

  /**
   * Toggle a todo's completed state.
   * @param {string} id
   */
  function toggleTodo(id) {
    for (var i = 0; i < todos.length; i++) {
      if (todos[i].id === id) {
        todos[i].completed = !todos[i].completed;
        break;
      }
    }
    saveAndRender();
  }

  /**
   * Update a todo's title.
   * @param {string} id
   * @param {string} title
   */
  function updateTodo(id, title) {
    const trimmed = (title || '').trim();
    if (trimmed === '') {
      return;
    }
    for (var i = 0; i < todos.length; i++) {
      if (todos[i].id === id) {
        todos[i].title = trimmed;
        break;
      }
    }
    saveAndRender();
  }

  /**
   * Remove all completed todos.
   */
  function clearCompleted() {
    todos = todos.filter(function (t) { return !t.completed; });
    saveAndRender();
  }

  /**
   * Set the current filter.
   * @param {'all'|'active'|'completed'} f
   */
  function setFilter(f) {
    filter = f;
    saveAndRender();
  }

  /**
   * Get todos filtered by current filter.
   * @returns {Array}
   */
  function getFilteredTodos() {
    if (filter === 'active') {
      return todos.filter(function (t) { return !t.completed; });
    }
    if (filter === 'completed') {
      return todos.filter(function (t) { return t.completed; });
    }
    return todos;
  }

  /**
   * Get the current todos (unfiltered).
   * @returns {Array}
   */
  function getTodos() {
    return todos;
  }

  /**
   * Get the current filter value.
   * @returns {'all'|'active'|'completed'}
   */
  function getFilter() {
    return filter;
  }

  /**
   * Set the editing id (or null to cancel).
   * @param {string|null} id
   */
  function setEditing(id) {
    editingId = id;
  }

  /**
   * Get the current editing id.
   * @returns {string|null}
   */
  function getEditing() {
    return editingId;
  }

  return {
    init: init,
    addTodo: addTodo,
    deleteTodo: deleteTodo,
    toggleTodo: toggleTodo,
    updateTodo: updateTodo,
    clearCompleted: clearCompleted,
    setFilter: setFilter,
    getFilteredTodos: getFilteredTodos,
    getTodos: getTodos,
    getFilter: getFilter,
    setEditing: setEditing,
    getEditing: getEditing,
    set onRender(fn) { onRender = fn; },
    get onRender() { return onRender; },
  };
})();

/* ============================================================
   Module 3: Render Layer
   IIFE that registers with State and updates the DOM.
   ============================================================ */
const Render = (function () {
  'use strict';

  /** Cache DOM references for performance. */
  var todoListEl = document.getElementById('todo-list');
  var todoCountEl = document.getElementById('todo-count');
  var footerEl = document.getElementById('footer');
  var clearCompletedEl = document.getElementById('clear-completed');
  var filterAllEl = document.getElementById('filter-all');
  var filterActiveEl = document.getElementById('filter-active');
  var filterCompletedEl = document.getElementById('filter-completed');

  /**
   * Render the entire UI from current State.
   */
  function render() {
    var filteredTodos = State.getFilteredTodos();
    var allTodos = State.getTodos();
    var currentFilter = State.getFilter();
    var editingId = State.getEditing();

    // --- Render list ---
    todoListEl.innerHTML = '';

    for (var i = 0; i < filteredTodos.length; i++) {
      var todo = filteredTodos[i];
      var li = document.createElement('li');

      if (todo.completed) {
        li.classList.add('completed');
      }
      if (editingId === todo.id) {
        li.classList.add('editing');
      }

      // Checkbox
      var cb = document.createElement('input');
      cb.className = 'toggle';
      cb.type = 'checkbox';
      if (todo.completed) {
        cb.checked = true;
      }
      li.appendChild(cb);

      // Label
      var label = document.createElement('label');
      label.textContent = todo.title;
      li.appendChild(label);

      // Delete button
      var btn = document.createElement('button');
      btn.className = 'destroy';
      li.appendChild(btn);

      // Edit input (hidden until .editing class applied)
      var editInput = document.createElement('input');
      editInput.className = 'edit';
      editInput.value = todo.title;
      li.appendChild(editInput);

      todoListEl.appendChild(li);
    }

    // --- Count ---
    var activeCount = 0;
    for (var j = 0; j < allTodos.length; j++) {
      if (!allTodos[j].completed) {
        activeCount++;
      }
    }
    todoCountEl.innerHTML = '<strong>' + activeCount + '</strong> ' + (activeCount === 1 ? 'item left' : 'items left');

    // --- Filter highlight ---
    filterAllEl.className = currentFilter === 'all' ? 'selected' : '';
    filterActiveEl.className = currentFilter === 'active' ? 'selected' : '';
    filterCompletedEl.className = currentFilter === 'completed' ? 'selected' : '';

    // --- Footer visibility ---
    if (allTodos.length > 0) {
      footerEl.classList.remove('hidden');
    } else {
      footerEl.classList.add('hidden');
    }

    // --- Clear completed visibility ---
    var completedCount = allTodos.length - activeCount;
    if (completedCount > 0) {
      clearCompletedEl.classList.remove('hidden');
    } else {
      clearCompletedEl.classList.add('hidden');
    }
  }

  // Register render callback with State
  State.onRender = render;

  return {
    render: render,
  };
})();
