/**
 * Renderer Module — DOM rendering layer for Todo List
 * Receives data, produces DOM. No Store dependency.
 * All text via textContent (XSS-safe). DocumentFragment for batch appends.
 * @module renderer
 */

/* eslint-env browser */
/* exported Renderer */

var Renderer = (function () {
  'use strict';

  /* ─── DOM references (set via init) ─── */

  /** @type {HTMLUListElement} */
  var $todoList;
  /** @type {NodeListOf<HTMLButtonElement>} */
  var $filterButtons;
  /** @type {HTMLButtonElement} */
  var $clearCompleted;
  /** @type {HTMLSpanElement} */
  var $todoCount;

  /**
   * Initialize the renderer with DOM element references.
   * Must be called once before any render calls.
   * @param {object} refs - DOM references
   * @param {HTMLUListElement} refs.todoList - The <ul id="todo-list"> element
   * @param {NodeListOf<HTMLButtonElement>} refs.filterButtons - Filter button elements
   * @param {HTMLButtonElement} refs.clearCompleted - Clear completed button
   * @param {HTMLSpanElement} refs.todoCount - Todo count span
   */
  function init(refs) {
    $todoList = refs.todoList;
    $filterButtons = refs.filterButtons;
    $clearCompleted = refs.clearCompleted;
    $todoCount = refs.todoCount;
  }

  /**
   * Get filtered and sorted copy of todos for display.
   * Incomplete items first, then completed; within each group, newest first.
   * @param {Todo[]} todos - All todo items
   * @param {'all'|'active'|'completed'} activeFilter - Current filter
   * @returns {Todo[]} Filtered and sorted array
   */
  function getFilteredTodos(todos, activeFilter) {
    var filtered = todos;
    if (activeFilter === 'active') {
      filtered = todos.filter(function (t) { return !t.completed; });
    } else if (activeFilter === 'completed') {
      filtered = todos.filter(function (t) { return t.completed; });
    }
    return filtered.slice().sort(function (a, b) {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  /**
   * Full re-render of the todo list.
   * Clears list, renders filtered todos or empty state, updates counts and filters.
   * @param {Todo[]} todos - All todo items
   * @param {object} [options] - Render options
   * @param {'all'|'active'|'completed'} [options.activeFilter='all'] - Current filter
   * @param {string|null} [options.editingId=null] - ID of task being edited
   */
  function render(todos, options) {
    options = options || {};
    var activeFilter = options.activeFilter || 'all';
    var editingId = options.editingId || null;

    var filtered = getFilteredTodos(todos, activeFilter);
    var fragment = document.createDocumentFragment();

    if (filtered.length === 0) {
      fragment.appendChild(renderEmptyState(activeFilter));
    } else {
      for (var i = 0; i < filtered.length; i++) {
        var li = renderTodoItem(filtered[i], editingId);
        fragment.appendChild(li);
      }
    }

    $todoList.innerHTML = '';
    $todoList.appendChild(fragment);
    renderCounts(todos);
    highlightFilter(activeFilter);
  }

  /**
   * Create a single todo list item element.
   * @param {Todo} todo - Todo item data
   * @param {string|null} [editingId] - If set and matches todo.id, renders in edit mode
   * @returns {HTMLLIElement} The <li> element
   */
  function renderTodoItem(todo, editingId) {
    var li = document.createElement('li');
    li.className = 'todo-item' + (todo.completed ? ' completed' : '');
    li.dataset.id = todo.id;

    if (editingId === todo.id) {
      li.classList.add('editing');
      li.classList.add('todo-item--editing');
      var editInput = document.createElement('input');
      editInput.className = 'edit-input';
      editInput.type = 'text';
      editInput.value = todo.title;
      li.appendChild(editInput);
    } else {
      var cb = document.createElement('input');
      cb.className = 'toggle';
      cb.type = 'checkbox';
      cb.checked = todo.completed;

      var label = document.createElement('label');
      label.className = 'todo-title';
      label.textContent = todo.title;

      var delBtn = document.createElement('button');
      delBtn.className = 'destroy';
      delBtn.setAttribute('aria-label', 'Delete task');
      delBtn.textContent = '\u00D7';

      li.appendChild(cb);
      li.appendChild(label);
      li.appendChild(delBtn);
    }

    return li;
  }

  /**
   * Create an empty state list item.
   * @param {'all'|'active'|'completed'} activeFilter - Current filter
   * @returns {HTMLLIElement} Empty state <li>
   */
  function renderEmptyState(activeFilter) {
    var li = document.createElement('li');
    li.className = 'empty-state';
    var msg = activeFilter === 'all'
      ? 'No tasks yet. Add one above!'
      : activeFilter === 'active'
        ? 'No active tasks. \uD83C\uDF89'
        : 'No completed tasks.';
    li.textContent = msg;
    return li;
  }

  /**
   * Update the footer count and show/hide clear-completed button with count.
   * @param {Todo[]} todos - All todo items
   */
  function renderCounts(todos) {
    var remaining = 0;
    var completedCount = 0;
    for (var i = 0; i < todos.length; i++) {
      if (!todos[i].completed) {
        remaining++;
      } else {
        completedCount++;
      }
    }
    $todoCount.textContent = remaining + ' item' + (remaining !== 1 ? 's' : '') + ' left';

    if (completedCount > 0) {
      $clearCompleted.style.display = '';
      $clearCompleted.textContent = 'Clear completed (' + completedCount + ')';
    } else {
      $clearCompleted.style.display = 'none';
    }
  }

  /**
   * Highlight the active filter button using .filter-btn--active class.
   * @param {'all'|'active'|'completed'} activeFilter - Active filter
   */
  function highlightFilter(activeFilter) {
    for (var i = 0; i < $filterButtons.length; i++) {
      var btn = $filterButtons[i];
      if (btn.dataset.filter === activeFilter) {
        btn.classList.add('filter-btn--active');
      } else {
        btn.classList.remove('filter-btn--active');
      }
    }
  }

  /**
   * Enter edit mode: replace title label with an input field, focus, select all.
   * @param {HTMLElement} todoItem - The todo <li> element
   * @param {string} currentText - Current title text
   */
  function enterEditMode(todoItem, currentText) {
    var label = todoItem.querySelector('.todo-title');
    if (!label) return;

    todoItem.classList.add('editing');

    var input = document.createElement('input');
    input.className = 'edit-input';
    input.type = 'text';
    input.value = currentText;

    label.replaceWith(input);
    input.focus();
    input.select();
  }

  /* ─── Public API ─── */

  return {
    init: init,
    render: render,
    renderTodoItem: renderTodoItem,
    renderEmptyState: renderEmptyState,
    renderCounts: renderCounts,
    highlightFilter: highlightFilter,
    enterEditMode: enterEditMode
  };
})();
