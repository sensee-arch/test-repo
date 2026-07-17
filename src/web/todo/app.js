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

/* ============================================================
   Module 4: Event Layer
   IIFE that binds all DOM event listeners.
   ============================================================ */
const Events = (function () {
  'use strict';

  var newTodoInput = document.getElementById('new-todo');
  var todoListEl = document.getElementById('todo-list');
  var filterAllEl = document.getElementById('filter-all');
  var filterActiveEl = document.getElementById('filter-active');
  var filterCompletedEl = document.getElementById('filter-completed');
  var clearCompletedEl = document.getElementById('clear-completed');

  /**
   * Get the todo ID from a child element's parent <li>.
   * Walks up to find the <li>, then maps by index to filtered todos.
   * @param {Element} el
   * @returns {string|null}
   */
  function getIdFromChild(el) {
    while (el && el.tagName !== 'LI') {
      el = el.parentNode;
    }
    if (el && el.parentNode === todoListEl) {
      var children = todoListEl.children;
      for (var i = 0; i < children.length; i++) {
        if (children[i] === el) {
          var filtered = State.getFilteredTodos();
          if (filtered[i]) {
            return filtered[i].id;
          }
        }
      }
    }
    return null;
  }

  /**
   * Handle new todo input.
   */
  function onNewTodoKeydown(e) {
    if (e.key === 'Enter') {
      var val = newTodoInput.value;
      State.addTodo(val);
      newTodoInput.value = '';
    }
  }

  /**
   * Handle clicks on the todo list (event delegation).
   */
  function onTodoListClick(e) {
    var target = e.target;

    // Toggle checkbox
    if (target.classList.contains('toggle')) {
      var id = getIdFromChild(target);
      if (id) {
        State.toggleTodo(id);
      }
      return;
    }

    // Delete button
    if (target.classList.contains('destroy')) {
      var id = getIdFromChild(target);
      if (id) {
        State.deleteTodo(id);
      }
      return;
    }
  }

  /** @type {Element|null} Track the currently focused edit input. */
  var currentEditInput = null;

  /** @type {function} Bound edit keydown handler reference. */
  var boundEditKeydown = null;

  /** @type {function} Bound edit blur handler reference. */
  var boundEditBlur = null;

  /**
   * Save the current edit and exit mode.
   * @param {string} id
   */
  function saveCurrentEdit(id) {
    if (currentEditInput) {
      State.updateTodo(id, currentEditInput.value);
    }
    exitEditMode();
  }

  /**
   * Cancel the current edit mode and restore (Escape key).
   */
  function cancelEditMode() {
    if (currentEditInput && boundEditKeydown && boundEditBlur) {
      currentEditInput.removeEventListener('keydown', boundEditKeydown);
      currentEditInput.removeEventListener('blur', boundEditBlur);
    }
    State.setEditing(null);
    Render.render();
    currentEditInput = null;
    boundEditKeydown = null;
    boundEditBlur = null;
  }

  /**
   * Exit edit mode, save, and clean up listeners.
   */
  function exitEditMode() {
    if (currentEditInput && boundEditKeydown && boundEditBlur) {
      currentEditInput.removeEventListener('keydown', boundEditKeydown);
      currentEditInput.removeEventListener('blur', boundEditBlur);
    }
    State.setEditing(null);
    Render.render();
    currentEditInput = null;
    boundEditKeydown = null;
    boundEditBlur = null;
  }

  /**
   * Handle double-click on label to enter edit mode.
   */
  function onTodoListDblclick(e) {
    var target = e.target;

    if (target.tagName !== 'LABEL') {
      return;
    }

    var id = getIdFromChild(target);
    if (!id) {
      return;
    }

    // Set editing ID
    State.setEditing(id);

    // Re-render to show editing state
    Render.render();

    // Find the edit input index by matching id in filtered list
    var filtered = State.getFilteredTodos();
    var idx = -1;
    for (var i = 0; i < filtered.length; i++) {
      if (filtered[i].id === id) {
        idx = i;
        break;
      }
    }
    if (idx === -1) {
      return;
    }

    var li = todoListEl.children[idx];
    if (!li) {
      return;
    }

    var editInput = li.querySelector('.edit');
    if (!editInput) {
      return;
    }

    currentEditInput = editInput;
    editInput.focus();
    editInput.select();

    /**
     * Handle keydown on edit input.
     */
    function onEditKeydown(ev) {
      if (ev.key === 'Enter') {
        saveCurrentEdit(id);
      } else if (ev.key === 'Escape') {
        cancelEditMode();
      }
    }

    /**
     * Handle blur on edit input.
     */
    function onEditBlur() {
      saveCurrentEdit(id);
    }

    boundEditKeydown = onEditKeydown;
    boundEditBlur = onEditBlur;

    editInput.addEventListener('keydown', onEditKeydown);
    editInput.addEventListener('blur', onEditBlur);
  }

  /**
   * Handle filter link clicks.
   */
  function onFilterClick(e) {
    var target = e.target;
    if (target.id === 'filter-all') {
      State.setFilter('all');
    } else if (target.id === 'filter-active') {
      State.setFilter('active');
    } else if (target.id === 'filter-completed') {
      State.setFilter('completed');
    }
    e.preventDefault();
  }

  /**
   * Handle clear completed click.
   */
  function onClearClick() {
    State.clearCompleted();
  }

  /**
   * Bind all event listeners.
   */
  function bindEvents() {
    // New todo input
    newTodoInput.addEventListener('keydown', onNewTodoKeydown);

    // Todo list event delegation
    todoListEl.addEventListener('click', onTodoListClick);
    todoListEl.addEventListener('dblclick', onTodoListDblclick);

    // Filter links
    filterAllEl.addEventListener('click', onFilterClick);
    filterActiveEl.addEventListener('click', onFilterClick);
    filterCompletedEl.addEventListener('click', onFilterClick);

    // Clear completed
    clearCompletedEl.addEventListener('click', onClearClick);
  }

  return {
    bindEvents: bindEvents,
  };
})();

/* ============================================================
   Module 5: Integration (Bootstrap)
   Initializes all modules in order.
   ============================================================ */
(function () {
  'use strict';

  // Step 1: Initialize State from Storage
  State.init();

  // Step 2: Render is auto-registered via State.onRender = render (inside Render IIFE)
  // Step 3: Bind events
  Events.bindEvents();

  // Step 4: Initial render
  Render.render();
})();
