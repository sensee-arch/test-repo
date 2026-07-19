/**
 * Application Module — Todo List main logic
 * Handles rendering, events, CRUD, filtering, inline editing
 * Architecture: Storage → State → Render → Events
 */

/* ─── State ─── */

let tasks = [];
let currentFilter = 'all'; // 'all' | 'active' | 'completed'
let editingId = null;

/* ─── DOM refs (populated on init) ─── */

let $todoForm, $todoInput, $todoList, $filterButtons, $clearCompleted, $todoCount;

/* ─── Task model ─── */

function createTask(title) {
  return {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    title: title.trim(),
    completed: false,
    createdAt: Date.now(),
  };
}

/* ─── Storage ─── */

function loadTasks() {
  tasks = getTasks();
}

function persistTasks() {
  saveTasks(tasks);
}

/* ─── Filtering ─── */

function getFilteredTasks() {
  if (currentFilter === 'active') return tasks.filter(function (t) { return !t.completed; });
  if (currentFilter === 'completed') return tasks.filter(function (t) { return t.completed; });
  return tasks;
}

/* ─── Rendering ─── */

function render() {
  var filtered = getFilteredTasks();
  var fragment = document.createDocumentFragment();

  if (filtered.length === 0) {
    var li = document.createElement('li');
    li.className = 'empty-state';
    var msg = currentFilter === 'all'
      ? 'No tasks yet. Add one above!'
      : currentFilter === 'active'
        ? 'No active tasks. \uD83C\uDF89'
        : 'No completed tasks.';
    li.textContent = msg;
    fragment.appendChild(li);
  } else {
    filtered.forEach(function (task) {
      var li = document.createElement('li');
      li.className = 'todo-item' + (task.completed ? ' completed' : '');
      li.dataset.id = task.id;

      if (editingId === task.id) {
        li.classList.add('editing');
        var input = document.createElement('input');
        input.className = 'edit-input';
        input.type = 'text';
        input.value = task.title;
        li.appendChild(input);
      } else {
        var cb = document.createElement('input');
        cb.className = 'toggle';
        cb.type = 'checkbox';
        cb.checked = task.completed;

        var label = document.createElement('label');
        label.className = 'todo-title';
        label.textContent = task.title;

        var delBtn = document.createElement('button');
        delBtn.className = 'destroy';
        delBtn.setAttribute('aria-label', 'Delete task');
        delBtn.textContent = '\u00D7';

        li.appendChild(cb);
        li.appendChild(label);
        li.appendChild(delBtn);
      }

      fragment.appendChild(li);
    });
  }

  $todoList.innerHTML = '';
  $todoList.appendChild(fragment);
  updateFooter();
}

function updateFooter() {
  var remaining = tasks.filter(function (t) { return !t.completed; }).length;
  $todoCount.textContent = remaining + ' item' + (remaining !== 1 ? 's' : '') + ' left';

  $filterButtons.forEach(function (btn) {
    btn.classList.toggle('selected', btn.dataset.filter === currentFilter);
  });

  var hasCompleted = tasks.some(function (t) { return t.completed; });
  $clearCompleted.style.display = hasCompleted ? '' : 'none';
}

/* ─── CRUD ─── */

function addTask(title) {
  var trimmed = title.trim();
  if (!trimmed) return;
  tasks.push(createTask(trimmed));
  persistTasks();
  render();
}

function deleteTask(id) {
  tasks = tasks.filter(function (t) { return t.id !== id; });
  if (editingId === id) editingId = null;
  persistTasks();
  render();
}

function toggleTask(id) {
  var task = tasks.find(function (t) { return t.id === id; });
  if (!task) return;
  task.completed = !task.completed;
  persistTasks();
  render();
}

function updateTaskTitle(id, newTitle) {
  var trimmed = newTitle.trim();
  if (!trimmed) {
    deleteTask(id);
    return;
  }
  var task = tasks.find(function (t) { return t.id === id; });
  if (!task) return;
  task.title = trimmed;
  editingId = null;
  persistTasks();
  render();
}

function clearCompleted() {
  tasks = tasks.filter(function (t) { return !t.completed; });
  persistTasks();
  render();
}

function setFilter(filter) {
  currentFilter = filter;
  render();
}

/* ─── Event handling ─── */

function handleFormSubmit(e) {
  e.preventDefault();
  addTask($todoInput.value);
  $todoInput.value = '';
  $todoInput.focus();
}

function handleListClick(e) {
  var li = e.target.closest('.todo-item');
  if (!li) return;
  var id = li.dataset.id;

  if (e.target.classList.contains('toggle')) {
    toggleTask(id);
  } else if (e.target.classList.contains('destroy')) {
    deleteTask(id);
  }
}

function handleListDblClick(e) {
  var li = e.target.closest('.todo-item');
  if (!li || li.classList.contains('editing')) return;
  var id = li.dataset.id;
  editingId = id;
  render();
  // Focus and select the edit input
  var input = document.querySelector('.todo-item[data-id="' + id + '"] .edit-input');
  if (input) {
    input.focus();
    input.select();
  }
}

function handleListKeydown(e) {
  if (e.key === 'Escape') {
    editingId = null;
    render();
    return;
  }
  if (e.key !== 'Enter') return;
  var li = e.target.closest('.todo-item');
  if (!li) return;
  updateTaskTitle(li.dataset.id, e.target.value);
}

function handleEditBlur(e) {
  var li = e.target.closest('.todo-item');
  if (!li) return;
  if (editingId === li.dataset.id) {
    updateTaskTitle(li.dataset.id, e.target.value);
  }
}

/* ─── Initialisation ─── */

function init() {
  $todoForm = document.getElementById('todo-form');
  $todoInput = document.getElementById('todo-input');
  $todoList = document.getElementById('todo-list');
  $filterButtons = document.querySelectorAll('.filter-btn');
  $clearCompleted = document.getElementById('clear-completed');
  $todoCount = document.getElementById('todo-count');

  loadTasks();

  $todoForm.addEventListener('submit', handleFormSubmit);
  $todoList.addEventListener('click', handleListClick);
  $todoList.addEventListener('dblclick', handleListDblClick);
  $todoList.addEventListener('keydown', handleListKeydown);
  $todoList.addEventListener('focusout', handleEditBlur);

  $filterButtons.forEach(function (btn) {
    btn.addEventListener('click', function () { setFilter(btn.dataset.filter); });
  });

  $clearCompleted.addEventListener('click', clearCompleted);

  render();
}

document.addEventListener('DOMContentLoaded', init);
