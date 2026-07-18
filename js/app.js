/* ============================================
   Todo List App — Vanilla JS (ES6+)
   Modules: store, ui, evts (IIFE pattern)
   ============================================ */

/* ---------- Data Layer (store) ---------- */
const Store = (() => {
  const STORAGE_KEY = 'todo_list_app';

  function getTodos() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  function saveTodos(todos) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }

  function addTodo(text) {
    const trimmed = text.trim();
    if (!trimmed) return null;
    const todos = getTodos();
    const todo = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      text: trimmed,
      completed: false,
      createdAt: Date.now(),
    };
    todos.push(todo);
    saveTodos(todos);
    return todo;
  }

  function updateTodo(id, updates) {
    const todos = getTodos();
    const idx = todos.findIndex(t => t.id === id);
    if (idx === -1) return null;
    todos[idx] = { ...todos[idx], ...updates };
    saveTodos(todos);
    return todos[idx];
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

  function clearCompleted() {
    const todos = getTodos();
    const active = todos.filter(t => !t.completed);
    if (active.length === todos.length) return false;
    saveTodos(active);
    return true;
  }

  return { getTodos, addTodo, updateTodo, deleteTodo, toggleTodo, clearCompleted };
})();

/* ---------- UI Render (ui) ---------- */
const UI = (() => {
  const listEl = document.getElementById('todo-list');
  const emptyEl = document.getElementById('empty-state');
  const statsEl = document.getElementById('stats-text');

  let currentFilter = 'all';

  function setFilter(filter) {
    currentFilter = filter;
    render();
  }

  function getFilter() {
    return currentFilter;
  }

  function render() {
    const todos = Store.getTodos();
    const filtered = filterTodos(todos);

    if (filtered.length === 0) {
      listEl.innerHTML = '';
      emptyEl.classList.remove('hidden');
      updateStats(todos);
      return;
    }

    emptyEl.classList.add('hidden');
    listEl.innerHTML = filtered.map(todo => createTodoItem(todo)).join('');
    updateStats(todos);
  }

  function filterTodos(todos) {
    switch (currentFilter) {
      case 'active':     return todos.filter(t => !t.completed);
      case 'completed':  return todos.filter(t => t.completed);
      default:           return [...todos];
    }
  }

  function createTodoItem(todo) {
    const checked = todo.completed ? 'checked' : '';
    const cls = todo.completed ? 'todo-item completed' : 'todo-item';
    return `
      <li class="${cls}" data-id="${todo.id}">
        <input type="checkbox" class="todo-checkbox" ${checked} aria-label="标记完成">
        <span class="todo-text" contenteditable="false" role="textbox" aria-label="待办文本">${escapeHtml(todo.text)}</span>
        <button class="todo-delete-btn" aria-label="删除">✕</button>
      </li>
    `;
  }

  function updateStats(todos) {
    const total = todos.length;
    const done = todos.filter(t => t.completed).length;
    statsEl.textContent = `${done} / ${total} 已完成`;
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  return { render, setFilter, getFilter };
})();

/* ---------- Event Handler (evts) ---------- */
const Evts = (() => {
  function init() {
    // Form submit — add todo
    document.getElementById('todo-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const input = document.getElementById('todo-input');
      const todo = Store.addTodo(input.value);
      if (todo) {
        input.value = '';
        UI.render();
      }
    });

    // Event delegation — toggle, delete, inline edit
    document.getElementById('todo-list').addEventListener('click', (e) => {
      const li = e.target.closest('.todo-item');
      if (!li) return;
      const id = li.dataset.id;

      if (e.target.classList.contains('todo-checkbox')) {
        Store.toggleTodo(id);
        UI.render();
        return;
      }

      if (e.target.classList.contains('todo-delete-btn')) {
        Store.deleteTodo(id);
        UI.render();
        return;
      }
    });

    // Inline edit — dblclick activates, blur/blur save
    document.getElementById('todo-list').addEventListener('dblclick', (e) => {
      const textEl = e.target.closest('.todo-text');
      if (!textEl) return;
      if (textEl.contentEditable === 'true') return;
      textEl.contentEditable = 'true';
      textEl.focus();

      // Select all text
      const range = document.createRange();
      range.selectNodeContents(textEl);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    });

    document.getElementById('todo-list').addEventListener('blur', (e) => {
      const textEl = e.target.closest('.todo-text');
      if (!textEl) return;
      commitInlineEdit(textEl);
    }, true);

    document.getElementById('todo-list').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const textEl = e.target.closest('.todo-text');
        if (textEl) {
          textEl.blur();
        }
      }
      if (e.key === 'Escape') {
        const textEl = e.target.closest('.todo-text');
        if (textEl) {
          textEl.contentEditable = 'false';
          UI.render(); // restore original text
        }
      }
    });

    function commitInlineEdit(textEl) {
      if (textEl.contentEditable !== 'true') return;
      textEl.contentEditable = 'false';
      const li = textEl.closest('.todo-item');
      if (!li) return;
      const id = li.dataset.id;
      const newText = textEl.textContent.trim();
      if (newText) {
        Store.updateTodo(id, { text: newText });
        UI.render();
      } else {
        // Empty text — delete
        Store.deleteTodo(id);
        UI.render();
      }
    }

    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        UI.setFilter(btn.dataset.filter);
      });
    });

    // Clear completed
    document.getElementById('clear-btn').addEventListener('click', () => {
      Store.clearCompleted();
      UI.render();
    });

    // Initial render
    UI.render();
  }

  return { init };
})();

/* ---------- Boot ---------- */
document.addEventListener('DOMContentLoaded', () => {
  Evts.init();
});
