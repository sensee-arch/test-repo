/**
 * Application Module — Todo List main logic
 *
 * Organised into three logical sections:
 *   - Ui    : DOM references and rendering
 *   - Evts  : Event handlers
 *   - Boot  : Initialisation
 */

/* ═══════════════════════════════════════════════
   Ui — DOM references and rendering helpers
   ═══════════════════════════════════════════════ */

const Ui = (function () {
  'use strict';

  /* ─── State ─── */

  let currentFilter = 'all'; // 'all' | 'active' | 'completed'
  let editingId = null;

  /* ─── DOM refs ─── */

  let $todoForm;
  let $todoInput;
  let $todoList;
  let $filterButtons;
  let $clearCompleted;
  let $todoCount;

  /* ─── Helpers ─── */

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function getFilteredTasks() {
    const all = Store.getAll();
    if (currentFilter === 'active') return all.filter((t) => !t.completed);
    if (currentFilter === 'completed') return all.filter((t) => t.completed);
    return all;
  }

  function updateFooter() {
    const all = Store.getAll();
    const remaining = all.filter((t) => !t.completed).length;
    $todoCount.textContent =
      remaining + ' item' + (remaining !== 1 ? 's' : '') + ' left';

    $filterButtons.forEach((btn) => {
      btn.classList.toggle('selected', btn.dataset.filter === currentFilter);
    });

    $clearCompleted.style.display = all.some((t) => t.completed)
      ? 'block'
      : 'none';
  }

  /* ─── Render ─── */

  function render() {
    const filtered = getFilteredTasks();
    const fragment = document.createDocumentFragment();

    if (filtered.length === 0) {
      const emptyMsg = document.createElement('li');
      emptyMsg.className = 'empty-state';
      emptyMsg.textContent =
        currentFilter === 'all'
          ? 'No tasks yet. Add one above!'
          : currentFilter === 'active'
          ? 'No active tasks. 🎉'
          : 'No completed tasks.';
      fragment.appendChild(emptyMsg);
    } else {
      filtered.forEach(function (task) {
        const li = document.createElement('li');
        li.className = 'todo-item' + (task.completed ? ' completed' : '');
        li.dataset.id = task.id;

        if (editingId === task.id) {
          li.classList.add('editing');
          li.innerHTML =
            '<input class="edit-input" type="text" value="' +
            escapeHtml(task.title) +
            '" />';
        } else {
          li.innerHTML =
            '<input class="toggle" type="checkbox"' +
            (task.completed ? ' checked' : '') +
            ' />' +
            '<label class="todo-title">' +
            escapeHtml(task.title) +
            '</label>' +
            '<button class="destroy" aria-label="Delete task">&times;</button>';
        }

        fragment.appendChild(li);
      });
    }

    $todoList.innerHTML = '';
    $todoList.appendChild(fragment);
    updateFooter();
  }

  /* ─── Public API ─── */

  return {
    /** Initialise DOM references. */
    init: function () {
      $todoForm = document.getElementById('todo-form');
      $todoInput = document.getElementById('todo-input');
      $todoList = document.getElementById('todo-list');
      $filterButtons = document.querySelectorAll('.filter-btn');
      $clearCompleted = document.getElementById('clear-completed');
      $todoCount = document.getElementById('todo-count');
    },

    render: render,

    getFilter: function () {
      return currentFilter;
    },

    setFilter: function (filter) {
      currentFilter = filter;
      render();
    },

    getEditingId: function () {
      return editingId;
    },

    setEditingId: function (id) {
      editingId = id;
    },

    focusInput: function () {
      $todoInput.value = '';
      $todoInput.focus();
    },
  };
})();

/* ═══════════════════════════════════════════════
   Evts — Event handlers
   ═══════════════════════════════════════════════ */

const Evts = (function () {
  'use strict';

  /* ─── Handlers ─── */

  function handleFormSubmit(e) {
    e.preventDefault();
    const input = document.getElementById('todo-input');
    Store.add(input.value);
    Ui.render();
    Ui.focusInput();
  }

  function handleListClick(e) {
    const li = e.target.closest('.todo-item');
    if (!li) return;
    const id = li.dataset.id;

    if (e.target.classList.contains('toggle')) {
      Store.toggle(id);
      Ui.render();
    } else if (e.target.classList.contains('destroy')) {
      Store.delete(id);
      if (Ui.getEditingId() === id) Ui.setEditingId(null);
      Ui.render();
    }
  }

  function handleListDblClick(e) {
    const label = e.target.closest('.todo-title');
    if (!label) return;
    const li = label.closest('.todo-item');
    if (!li) return;
    const id = li.dataset.id;
    if (Ui.getEditingId() === id) return;

    Ui.setEditingId(id);
    Ui.render();

    // Focus and select the edit input
    const input = document.querySelector(
      '.todo-item[data-id="' + id + '"] .edit-input'
    );
    if (input) {
      input.focus();
      input.select();
    }
  }

  function handleListKeydown(e) {
    if (e.key === 'Escape') {
      Ui.setEditingId(null);
      Ui.render();
      return;
    }
    if (e.key !== 'Enter') return;
    const li = e.target.closest('.todo-item');
    if (!li) return;
    const id = li.dataset.id;
    const newTitle = e.target.value;
    Store.update(id, newTitle);
    Ui.setEditingId(null);
    Ui.render();
  }

  function handleEditBlur(e) {
    const li = e.target.closest('.todo-item');
    if (!li) return;
    const id = li.dataset.id;
    if (Ui.getEditingId() === id) {
      Store.update(id, e.target.value);
      Ui.setEditingId(null);
      Ui.render();
    }
  }

  function handleFilterClick(e) {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    Ui.setFilter(btn.dataset.filter);
  }

  function handleClearCompleted() {
    Store.clearCompleted();
    Ui.render();
  }

  /* ─── Public API ─── */

  return {
    /** Bind all event listeners. */
    bind: function () {
      document.getElementById('todo-form').addEventListener('submit', handleFormSubmit);

      const list = document.getElementById('todo-list');
      list.addEventListener('click', handleListClick);
      list.addEventListener('dblclick', handleListDblClick);
      list.addEventListener('keydown', handleListKeydown);
      list.addEventListener('focusout', handleEditBlur);

      document.querySelectorAll('.filter-btn').forEach(function (btn) {
        btn.addEventListener('click', handleFilterClick);
      });

      document
        .getElementById('clear-completed')
        .addEventListener('click', handleClearCompleted);
    },
  };
})();

/* ═══════════════════════════════════════════════
   Boot — Initialisation
   ═══════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', function () {
  'use strict';
  Ui.init();
  Evts.bind();
  Ui.render();
});
