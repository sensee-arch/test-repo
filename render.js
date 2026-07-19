/**
 * render.js — DOM rendering layer
 * Builds UI from data state. No direct localStorage access.
 */

/**
 * Create a single task DOM element.
 * @param {Task} task
 * @returns {HTMLLIElement}
 */
function _createTaskElement(task) {
  const li = document.createElement('li');
  li.className = 'task-item';
  li.dataset.id = task.id;

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'task-checkbox';
  checkbox.checked = task.completed;

  const span = document.createElement('span');
  span.className = 'task-text' + (task.completed ? ' completed' : '');
  span.textContent = task.text;

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'task-delete';
  deleteBtn.textContent = '×';
  deleteBtn.setAttribute('aria-label', 'Delete task');

  li.appendChild(checkbox);
  li.appendChild(span);
  li.appendChild(deleteBtn);

  return li;
}

/**
 * Enter inline edit mode for a task element.
 * @param {HTMLElement} element — .task-item element
 * @param {Task} task
 */
function _enterEditMode(element, task) {
  const span = element.querySelector('.task-text');
  if (!span) return;

  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'task-edit-input';
  input.value = task.text;
  input.dataset.taskId = task.id;

  span.replaceWith(input);
  input.focus();
  input.select();
}

/**
 * Render the full task list with filter.
 * @param {Task[]} tasks
 * @param {'all' | 'active' | 'completed'} filter
 */
function render(tasks, filter) {
  const listEl = document.getElementById('task-list');
  if (!listEl) return;

  const filtered = tasks.filter((t) => {
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  listEl.innerHTML = '';

  if (filtered.length === 0) {
    renderEmptyState();
    return;
  }

  const fragment = document.createDocumentFragment();
  filtered.forEach((task) => {
    fragment.appendChild(_createTaskElement(task));
  });
  listEl.appendChild(fragment);
}

/**
 * Render the stats bar.
 * @param {{ total: number, active: number, completed: number }} stats
 */
function renderStats(stats) {
  const itemsLeftEl = document.getElementById('items-left');
  if (itemsLeftEl) {
    itemsLeftEl.textContent = `${stats.active} item${stats.active !== 1 ? 's' : ''} left`;
  }

  renderClearCompleted(stats);
}

/**
 * Show/hide the clear-completed button based on completed count.
 * @param {{ total: number, active: number, completed: number }} stats
 */
function renderClearCompleted(stats) {
  const btn = document.getElementById('clear-completed');
  if (!btn) return;
  if (stats.completed > 0) {
    btn.classList.remove('hidden');
  } else {
    btn.classList.add('hidden');
  }
}

/**
 * Render an empty state message in the task list.
 */
function renderEmptyState() {
  const listEl = document.getElementById('task-list');
  if (!listEl) return;

  listEl.innerHTML = `
    <li class="empty-state">
      <div class="empty-state-icon">📝</div>
      <div class="empty-state-text">No tasks yet. Add one above!</div>
    </li>
  `;
}
