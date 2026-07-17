/**
 * Application Module — Todo List main logic
 * Handles rendering, events, CRUD, filtering, inline editing
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
    createdAt: new Date().toISOString(),
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
  if (currentFilter === 'active') return tasks.filter((t) => !t.completed);
  if (currentFilter === 'completed') return tasks.filter((t) => t.completed);
  return tasks;
}

/* ─── Rendering ─── */

function render() {
  const filtered = getFilteredTasks();
  const fragment = document.createDocumentFragment();

  filtered.forEach((task) => {
    const li = document.createElement('li');
    li.className = `todo-item${task.completed ? ' completed' : ''}`;
    li.dataset.id = task.id;

    if (editingId === task.id) {
      li.classList.add('editing');
      li.innerHTML = `
        <input class="edit-input" type="text" value="${escapeHtml(task.title)}" />
      `;
    } else {
      li.innerHTML = `
        <input class="toggle" type="checkbox" ${task.completed ? 'checked' : ''} />
        <label class="todo-title">${escapeHtml(task.title)}</label>
        <button class="destroy" aria-label="Delete task">&times;</button>
      `;
    }

    fragment.appendChild(li);
  });

  $todoList.innerHTML = '';
  $todoList.appendChild(fragment);

  updateFooter();
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function updateFooter() {
  const remaining = tasks.filter((t) => !t.completed).length;
  $todoCount.textContent = `${remaining} item${remaining !== 1 ? 's' : ''} left`;

  $filterButtons.forEach((btn) => {
    btn.classList.toggle('selected', btn.dataset.filter === currentFilter);
  });

  $clearCompleted.style.display = tasks.some((t) => t.completed) ? 'block' : 'none';
}

/* ─── CRUD ─── */

function addTask(title) {
  const trimmed = title.trim();
  if (!trimmed) return;
  tasks.push(createTask(trimmed));
  persistTasks();
  render();
}

function deleteTask(id) {
  tasks = tasks.filter((t) => t.id !== id);
  if (editingId === id) editingId = null;
  persistTasks();
  render();
}

function toggleTask(id) {
  const task = tasks.find((t) => t.id === id);
  if (!task) return;
  task.completed = !task.completed;
  persistTasks();
  render();
}

function updateTaskTitle(id, newTitle) {
  const trimmed = newTitle.trim();
  if (!trimmed) return deleteTask(id);
  const task = tasks.find((t) => t.id === id);
  if (!task) return;
  task.title = trimmed;
  editingId = null;
  persistTasks();
  render();
}

function clearCompleted() {
  tasks = tasks.filter((t) => !t.completed);
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
  const li = e.target.closest('.todo-item');
  if (!li) return;
  const id = li.dataset.id;

  if (e.target.classList.contains('toggle')) {
    toggleTask(id);
  } else if (e.target.classList.contains('destroy')) {
    deleteTask(id);
  }
}

function handleListDblClick(e) {
  const li = e.target.closest('.todo-item');
  if (!li) return;
  const id = li.dataset.id;
  if (editingId === id) return;
  editingId = id;
  render();
  // Focus and select the edit input
  const input = document.querySelector(`.todo-item[data-id="${id}"] .edit-input`);
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
  const li = e.target.closest('.todo-item');
  if (!li) return;
  updateTaskTitle(li.dataset.id, e.target.value);
}

function handleEditBlur(e) {
  const li = e.target.closest('.todo-item');
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
  // Use event delegation for blur on dynamically created edit inputs
  $todoList.addEventListener('focusout', handleEditBlur);

  $filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => setFilter(btn.dataset.filter));
  });

  $clearCompleted.addEventListener('click', clearCompleted);

  render();
}

document.addEventListener('DOMContentLoaded', init);
