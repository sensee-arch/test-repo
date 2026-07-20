/**
 * app.js — UI controller for the TodoList application
 *
 * Responsibilities:
 *  - DOM initialization & rendering
 *  - Event binding (add/edit/delete/toggle/filter)
 *  - Input validation & sanitization
 *  - State management (currentFilter)
 */

/* ===== State ===== */
let currentFilter = 'all'; // 'all' | 'active' | 'completed'

/* ===== DOM References ===== */
const todoListEl = document.getElementById('todo-list');
const emptyStateEl = document.getElementById('empty-state');
const newTaskInput = document.getElementById('new-task-input');
const addTaskBtn = document.getElementById('add-task-btn');
const filterBtns = document.querySelectorAll('.filter-btn');

/* ===== Helper: XSS-safe HTML escape ===== */
function escapeHtml(str) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return String(str).replace(/[&<>"']/g, (ch) => map[ch]);
}

/* ===== Render ===== */
function render() {
  const allTasks = getTasks();
  let filteredTasks;

  switch (currentFilter) {
    case 'active':
      filteredTasks = allTasks.filter((t) => !t.completed);
      break;
    case 'completed':
      filteredTasks = allTasks.filter((t) => t.completed);
      break;
    default:
      filteredTasks = allTasks;
  }

  // Show/hide empty state
  if (filteredTasks.length === 0) {
    emptyStateEl.hidden = false;
  } else {
    emptyStateEl.hidden = true;
  }

  // Build DOM — textContent only, no innerHTML
  todoListEl.textContent = '';

  filteredTasks.forEach((task) => {
    const item = document.createElement('div');
    item.className = 'todo-item';
    if (task.completed) item.classList.add('completed');
    item.dataset.id = task.id;

    // Checkbox
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'checkbox';
    checkbox.checked = task.completed;
    checkbox.setAttribute('aria-label', 'Toggle completion');

    // Title span
    const titleSpan = document.createElement('span');
    titleSpan.className = 'task-title';
    titleSpan.textContent = task.title;

    // Hidden edit input
    const editInput = document.createElement('input');
    editInput.type = 'text';
    editInput.className = 'edit-input';
    editInput.value = task.title;
    editInput.setAttribute('aria-label', 'Edit task');

    // Edit action buttons (hidden by default)
    const editActions = document.createElement('div');
    editActions.className = 'edit-actions';

    const saveBtn = document.createElement('button');
    saveBtn.className = 'save-btn';
    saveBtn.textContent = 'Save';

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'cancel-btn';
    cancelBtn.textContent = 'Cancel';

    editActions.appendChild(saveBtn);
    editActions.appendChild(cancelBtn);

    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = 'Delete';

    item.appendChild(checkbox);
    item.appendChild(titleSpan);
    item.appendChild(editInput);
    item.appendChild(editActions);
    item.appendChild(deleteBtn);
    todoListEl.appendChild(item);
  });

  // Update filter button active state
  filterBtns.forEach((btn) => {
    if (btn.dataset.filter === currentFilter) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Update Add button state
  updateAddButtonState();
}

/* ===== Input validation ===== */
function updateAddButtonState() {
  addTaskBtn.disabled = newTaskInput.value.trim().length === 0;
}

/* ===== Handlers ===== */

function handleAdd() {
  const title = newTaskInput.value.trim();
  if (!title) return;
  addTask(title);
  newTaskInput.value = '';
  render();
  newTaskInput.focus();
}

function handleEdit(id) {
  const item = document.querySelector(`.todo-item[data-id="${id}"]`);
  if (!item) return;
  // Do not allow editing completed tasks
  if (item.classList.contains('completed')) return;
  item.classList.add('editing');
  const editInput = item.querySelector('.edit-input');
  if (editInput) {
    editInput.focus();
    editInput.setSelectionRange(editInput.value.length, editInput.value.length);
  }
}

function handleSave(id) {
  const item = document.querySelector(`.todo-item[data-id="${id}"]`);
  if (!item) return;
  const editInput = item.querySelector('.edit-input');
  if (!editInput) return;
  const newTitle = editInput.value.trim();
  if (!newTitle) {
    // Revert to original if empty
    handleCancel(id);
    return;
  }
  updateTask(id, { title: newTitle });
  item.classList.remove('editing');
  render();
}

function handleCancel(id) {
  const item = document.querySelector(`.todo-item[data-id="${id}"]`);
  if (!item) return;
  // Restore original title from storage
  const tasks = getTasks();
  const task = tasks.find((t) => t.id === id);
  const editInput = item.querySelector('.edit-input');
  if (editInput && task) {
    editInput.value = task.title;
  }
  item.classList.remove('editing');
}

async function handleDelete(id) {
  if (!confirm('Are you sure you want to delete this task?')) return;
  deleteTask(id);
  render();
}

function handleToggle(id) {
  toggleTask(id);
  render();
}

function setFilter(filter) {
  currentFilter = filter;
  render();
}

/* ===== Event Binding ===== */

// Add button click
addTaskBtn.addEventListener('click', handleAdd);

// Enter key in new task input
newTaskInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    if (!addTaskBtn.disabled) {
      handleAdd();
    }
  }
});

// Input validation on typing
newTaskInput.addEventListener('input', updateAddButtonState);

// Filter buttons
filterBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    setFilter(btn.dataset.filter);
  });
});

// Event delegation on todo-list container
todoListEl.addEventListener('click', (e) => {
  const item = e.target.closest('.todo-item');
  if (!item) return;
  const id = item.dataset.id;

  // Delete button
  if (e.target.classList.contains('delete-btn')) {
    e.stopPropagation();
    handleDelete(id);
    return;
  }

  // Save button (editing mode)
  if (e.target.classList.contains('save-btn')) {
    e.stopPropagation();
    handleSave(id);
    return;
  }

  // Cancel button (editing mode)
  if (e.target.classList.contains('cancel-btn')) {
    e.stopPropagation();
    handleCancel(id);
    return;
  }

  // Checkbox toggle
  if (e.target.classList.contains('checkbox')) {
    e.stopPropagation();
    handleToggle(id);
    return;
  }

  // Task title click → enter edit mode
  if (e.target.classList.contains('task-title')) {
    e.stopPropagation();
    handleEdit(id);
    return;
  }
});

// Keyboard support: Enter to save, Escape to cancel during editing
todoListEl.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const editInput = e.target.closest('.edit-input');
    if (editInput) {
      e.preventDefault();
      const item = editInput.closest('.todo-item');
      if (item) handleSave(item.dataset.id);
    }
  }
  if (e.key === 'Escape') {
    const editInput = e.target.closest('.edit-input');
    if (editInput) {
      e.preventDefault();
      const item = editInput.closest('.todo-item');
      if (item) handleCancel(item.dataset.id);
    }
  }
});

/* ===== Bootstrap ===== */
function init() {
  render();
}

init();
