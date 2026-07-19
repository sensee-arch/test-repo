/**
 * Unit tests for store.js
 * Run with: node tests/store.test.cjs
 */

// Mock localStorage only (no DOM needed)
const _store = {};
global.localStorage = {
  getItem: (k) => _store[k] ?? null,
  setItem: (k, v) => { _store[k] = String(v); },
  removeItem: (k) => { delete _store[k]; },
  clear: () => { Object.keys(_store).forEach((k) => delete _store[k]); },
  get length() { return Object.keys(_store).length; },
  key: (i) => Object.keys(_store)[i] ?? null,
};

// Load store.js
const fs = require('fs');
const path = require('path');
const storeCode = fs.readFileSync(path.join(__dirname, '..', 'store.js'), 'utf8');
eval(storeCode);

// Test counters
let passed = 0;
let failed = 0;

function assert(condition, msg) {
  if (condition) {
    passed++;
  } else {
    failed++;
    console.error(`  ✗ FAIL: ${msg}`);
  }
}

function test(name, fn) {
  console.log(`\n▶ ${name}`);
  localStorage.clear();
  fn();
}

// Helper to avoid Date.now() collision (adds micro-delay)
let _idCounter = 0;
const _origDateNow = Date.now;
Date.now = () => _origDateNow() + (++_idCounter);

/* ──────────────────────────────────── */
/* Tests                                  */
/* ──────────────────────────────────── */

test('getTasks returns empty array when no data', () => {
  const tasks = getTasks();
  assert(Array.isArray(tasks), 'getTasks returns an array');
  assert(tasks.length === 0, 'getTasks returns empty array initially');
});

test('addTask creates task with correct structure', () => {
  const task = addTask('Buy groceries');
  assert(typeof task.id === 'string' && task.id.length > 0, 'task.id is non-empty string');
  assert(task.text === 'Buy groceries', `task.text is "Buy groceries", got "${task.text}"`);
  assert(task.completed === false, 'task.completed is false');
  assert(typeof task.createdAt === 'string', 'task.createdAt is string');
  assert(typeof task.updatedAt === 'string', 'task.updatedAt is string');
  assert(task.createdAt === task.updatedAt, 'createdAt === updatedAt on creation');
});

test('addTask trims whitespace and escapes HTML', () => {
  const task = addTask('  <script>alert(1)</script>  ');
  assert(task.text.includes('&lt;'), 'HTML in text is escaped (&lt; present)');
  assert(task.text.includes('&gt;'), 'HTML in text is escaped (&gt; present)');
  assert(!task.text.includes('<script>'), 'raw HTML tags removed from text');
});

test('addTask trims leading/trailing whitespace', () => {
  const task = addTask('  Hello World  ');
  assert(task.text === 'Hello World', `trimmed text, got "${task.text}"`);
});

test('getTasks returns all tasks', () => {
  addTask('Task 1');
  addTask('Task 2');
  addTask('Task 3');
  const tasks = getTasks();
  assert(tasks.length === 3, 'getTasks returns 3 tasks');
});

test('updateTask updates fields and updatedAt', () => {
  const task = addTask('Original');
  const before = task.updatedAt;
  const updated = updateTask(task.id, { text: 'Updated' });
  assert(updated !== null, 'updateTask returns updated task');
  assert(updated.text === 'Updated', `text updated to "Updated", got "${updated.text}"`);
  assert(updated.updatedAt !== before, 'updatedAt changed');
});

test('updateTask escapes HTML in text', () => {
  const task = addTask('Clean');
  const updated = updateTask(task.id, { text: '<b>Bold</b>' });
  assert(updated.text.includes('&lt;b&gt;'), 'HTML escaped in update (contains &lt;b&gt;)');
});

test('updateTask returns null for non-existent id', () => {
  const result = updateTask('nonexistent', { text: 'x' });
  assert(result === null, 'updateTask on non-existent id returns null');
});

test('deleteTask removes task', () => {
  addTask('Task 1');
  const task2 = addTask('Task 2');
  addTask('Task 3');
  const deleted = deleteTask(task2.id);
  assert(deleted === true, 'deleteTask returns true');
  const tasks = getTasks();
  assert(tasks.length === 2, '2 tasks remain after deletion');
  assert(tasks.every((t) => t.id !== task2.id), 'deleted task not in list');
});

test('deleteTask returns false for non-existent id', () => {
  const result = deleteTask('nonexistent');
  assert(result === false, 'deleteTask on non-existent id returns false');
});

test('toggleTask toggles completed status', () => {
  const task = addTask('Toggle me');
  assert(task.completed === false, 'initial completed is false');

  const toggled1 = toggleTask(task.id);
  assert(toggled1.completed === true, 'after first toggle, completed is true');

  const toggled2 = toggleTask(task.id);
  assert(toggled2.completed === false, 'after second toggle, completed is false');
});

test('toggleTask returns null for non-existent id', () => {
  const result = toggleTask('nonexistent');
  assert(result === null, 'toggleTask on non-existent id returns null');
});

test('clearCompleted removes only completed tasks', () => {
  addTask('Task A');
  addTask('Task B');
  const c = addTask('Task C');
  toggleTask(c.id);
  addTask('Task D');
  const e = addTask('Task E');
  toggleTask(e.id);

  const removed = clearCompleted();
  assert(removed === 2, 'clearCompleted removed 2 tasks');

  const tasks = getTasks();
  assert(tasks.length === 3, `3 tasks remain, got ${tasks.length}`);
  assert(tasks.every((t) => !t.completed), 'all remaining tasks are active');
});

test('clearCompleted returns 0 when no completed tasks', () => {
  addTask('Active 1');
  addTask('Active 2');
  const removed = clearCompleted();
  assert(removed === 0, 'clearCompleted returns 0 when no completed tasks');
});

test('getStats returns correct counts', () => {
  addTask('Active 1');
  addTask('Active 2');
  const c = addTask('Task C');
  toggleTask(c.id);

  const stats = getStats();
  assert(stats.total === 3, `total=3, got ${stats.total}`);
  assert(stats.active === 2, `active=2, got ${stats.active}`);
  assert(stats.completed === 1, `completed=1, got ${stats.completed}`);
});

test('getStats returns zeros for empty list', () => {
  const stats = getStats();
  assert(stats.total === 0, `total=0, got ${stats.total}`);
  assert(stats.active === 0, `active=0, got ${stats.active}`);
  assert(stats.completed === 0, `completed=0, got ${stats.completed}`);
});

test('_escapeHtml escapes special characters', () => {
  const result = _escapeHtml('<script>alert("x&y")</script>');
  assert(result.includes('&lt;'), '&lt; present');
  assert(result.includes('&gt;'), '&gt; present');
  assert(result.includes('&amp;'), '&amp; present');
  assert(result.includes('&quot;'), '&quot; present');
});

test('_escapeHtml returns empty string for empty input', () => {
  assert(_escapeHtml('') === '', 'empty string stays empty');
});

test('_escapeHtml handles plain text without alteration', () => {
  const result = _escapeHtml('Hello world');
  assert(result === 'Hello world', 'plain text unchanged');
});

/* ─── Summary ─── */

console.log('\n═══════════════════════════════');
console.log(`  Passed: ${passed}  |  Failed: ${failed}`);
console.log('═══════════════════════════════');

if (failed > 0) {
  process.exit(1);
}
