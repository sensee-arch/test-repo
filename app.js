/**
 * app.js — Controller layer
 * Event handling, initialization, cross-module coordination.
 */

(function () {
  'use strict';

  let currentFilter = 'all';

  /* ─── Core update cycle ─── */

  function refreshUI() {
    const tasks = getTasks();
    render(tasks, currentFilter);
    renderStats(getStats());
  }

  /* ─── Filter helpers ─── */

  function setActiveFilterButton(filter) {
    document.querySelectorAll('.filter-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.filter === filter);
    });
  }

  function switchFilter(filter) {
    currentFilter = filter;
    setActiveFilterButton(filter);
    refreshUI();
  }

  /* ─── Event handlers ─── */

  function handleFormSubmit(e) {
    e.preventDefault();
    const input = document.getElementById('task-input');
    const text = input.value.trim();
    if (!text) return;

    addTask(text);
    input.value = '';
    refreshUI();
  }

  function handleListClick(e) {
    const li = e.target.closest('.task-item');
    if (!li) return;
    const id = li.dataset.id;

    if (e.target.classList.contains('task-checkbox')) {
      toggleTask(id);
      refreshUI();
    }

    if (e.target.classList.contains('task-delete')) {
      deleteTask(id);
      refreshUI();
    }
  }

  function handleListDblClick(e) {
    const span = e.target.closest('.task-text');
    if (!span || span.classList.contains('completed')) return;

    const li = span.closest('.task-item');
    if (!li) return;
    const id = li.dataset.id;

    const tasks = getTasks();
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    _enterEditMode(li, task);
  }

  function handleListKeydown(e) {
    const input = e.target.closest('.task-edit-input');
    if (!input) return;

    const li = input.closest('.task-item');
    const id = li ? li.dataset.id : input.dataset.taskId;
    if (!id) return;

    if (e.key === 'Enter') {
      e.preventDefault();
      const text = input.value.trim();
      if (text) {
        updateTask(id, { text });
      } else {
        deleteTask(id);
      }
      refreshUI();
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      refreshUI();
    }
  }

  function handleClearCompleted() {
    const removed = clearCompleted();
    if (removed > 0) refreshUI();
  }

  function handleStorageChange(e) {
    if (e.key === STORAGE_KEY || e.key === null) {
      refreshUI();
    }
  }

  /* ─── Init ─── */

  function init() {
    // Form submit
    document.getElementById('task-form').addEventListener('submit', handleFormSubmit);

    // Event delegation on task list
    const taskList = document.getElementById('task-list');
    taskList.addEventListener('click', handleListClick);
    taskList.addEventListener('dblclick', handleListDblClick);
    taskList.addEventListener('keydown', handleListKeydown);

    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach((btn) => {
      btn.addEventListener('click', () => switchFilter(btn.dataset.filter));
    });

    // Clear completed
    document.getElementById('clear-completed').addEventListener('click', handleClearCompleted);

    // Cross-tab sync
    window.addEventListener('storage', handleStorageChange);

    // Initial render
    refreshUI();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
