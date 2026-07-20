/**
 * Unit tests for the TodoList storage layer.
 * Runs in Node.js with a simulated localStorage.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert').strict;

// ---- Simulated localStorage ----
const store = {};
const localStorageMock = {
  getItem: (key) => (store[key] !== undefined ? store[key] : null),
  setItem: (key, val) => { store[key] = String(val); },
  removeItem: (key) => { delete store[key]; },
  clear: () => { Object.keys(store).forEach(k => delete store[k]); },
  get length() { return Object.keys(store).length; },
  key: (i) => Object.keys(store)[i] || null,
};

// ---- Load storage.js with mock ----
global.crypto = {
  randomUUID: () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  }),
};
global.localStorage = localStorageMock;
global.console = { ...console, warn: () => {} }; // suppress quota warnings in tests

const storageCode = fs.readFileSync(path.join(__dirname, '..', 'storage.js'), 'utf-8');
eval(storageCode);

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    passed++;
    console.log(`  ✅ ${name}`);
  } catch (err) {
    failed++;
    console.log(`  ❌ ${name}: ${err.message}`);
  }
}

function clearStorage() {
  localStorageMock.clear();
}

// ---- Run Tests ----

console.log('\n📦 storage.js Unit Tests\n');

// Reset before suite
clearStorage();

// 1. getTasks on empty storage
test('getTasks returns empty array when no data', () => {
  const tasks = getTasks();
  assert.equal(Array.isArray(tasks), true);
  assert.equal(tasks.length, 0);
});

// 2. addTask creates valid task
test('addTask creates a task with correct shape', () => {
  clearStorage();
  const task = addTask('Buy groceries');
  assert.equal(typeof task.id, 'string');
  assert.ok(task.id.length > 0);
  assert.equal(task.title, 'Buy groceries');
  assert.equal(task.completed, false);
  assert.ok(task.createdAt);
  assert.ok(task.updatedAt);
  assert.equal(task.createdAt, task.updatedAt);
});

// 3. getTasks returns persisted tasks
test('getTasks returns stored tasks after add', () => {
  clearStorage();
  addTask('Task A');
  addTask('Task B');
  const tasks = getTasks();
  assert.equal(tasks.length, 2);
  assert.equal(tasks[0].title, 'Task A');
  assert.equal(tasks[1].title, 'Task B');
});

// 4. updateTask updates fields
test('updateTask updates title and updatedAt', () => {
  clearStorage();
  const task = addTask('Old title');
  const updated = updateTask(task.id, { title: 'New title' });
  assert.notEqual(updated, null);
  assert.equal(updated.title, 'New title');
  // updatedAt should be >= createdAt (may be equal if within same ms)
  assert.ok(new Date(updated.updatedAt) >= new Date(updated.createdAt));
  // Verify persistence
  const tasks = getTasks();
  assert.equal(tasks[0].title, 'New title');
});

// 5. updateTask returns null for missing id
test('updateTask returns null for non-existent id', () => {
  clearStorage();
  const result = updateTask('no-such-id', { title: 'x' });
  assert.equal(result, null);
});

// 6. toggleTask flips completed
test('toggleTask flips completed status', () => {
  clearStorage();
  const task = addTask('Toggle me');
  assert.equal(task.completed, false);
  const toggled = toggleTask(task.id);
  assert.equal(toggled.completed, true);
  const toggledAgain = toggleTask(task.id);
  assert.equal(toggledAgain.completed, false);
});

// 7. toggleTask returns null for missing id
test('toggleTask returns null for non-existent id', () => {
  clearStorage();
  const result = toggleTask('no-such-id');
  assert.equal(result, null);
});

// 8. deleteTask removes task
test('deleteTask removes task by id', () => {
  clearStorage();
  const t1 = addTask('Task 1');
  addTask('Task 2');
  deleteTask(t1.id);
  const tasks = getTasks();
  assert.equal(tasks.length, 1);
  assert.equal(tasks[0].title, 'Task 2');
});

// 9. deleteTask does nothing for missing id
test('deleteTask no-ops for non-existent id', () => {
  clearStorage();
  addTask('Task');
  deleteTask('no-such-id');
  assert.equal(getTasks().length, 1);
});

// 10. UUID format validation
test('generateId produces UUID v4 format', () => {
  const id = generateId();
  // v4 UUID pattern: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
  assert.ok(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id));
});

// 11. UUID uniqueness
test('generateId produces unique ids', () => {
  const ids = new Set();
  for (let i = 0; i < 100; i++) ids.add(generateId());
  assert.equal(ids.size, 100);
});

// 12. Storage key is correct
test('localStorage key used is todolist_tasks', () => {
  clearStorage();
  addTask('key-test');
  // Check that localStorage has an item at the expected key
  const raw = localStorageMock.getItem('todolist_tasks');
  assert.ok(raw !== null && raw !== undefined, 'todolist_tasks key should exist in storage');
  const data = JSON.parse(raw);
  assert.equal(Array.isArray(data), true);
  assert.equal(data.length, 1);
  assert.equal(data[0].title, 'key-test');
});

// 13. Task timestamps are ISO-8601
test('addTask creates valid ISO-8601 timestamps', () => {
  clearStorage();
  const task = addTask('Timestamp test');
  const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
  assert.ok(isoRegex.test(task.createdAt), `createdAt "${task.createdAt}" not ISO-8601`);
  assert.ok(isoRegex.test(task.updatedAt), `updatedAt "${task.updatedAt}" not ISO-8601`);
});

// 14. Data integrity: add → reload → verify
test('Data persists through add → getTasks cycle', () => {
  clearStorage();
  const original = addTask('Persist check');
  const tasks = getTasks();
  assert.equal(tasks.length, 1);
  assert.equal(tasks[0].id, original.id);
  assert.equal(tasks[0].title, original.title);
  assert.equal(tasks[0].completed, original.completed);
  assert.equal(tasks[0].createdAt, original.createdAt);
});

// 15. Multiple tasks and ordering
test('Tasks are stored in insertion order', () => {
  clearStorage();
  const a = addTask('Alpha');
  const b = addTask('Beta');
  const c = addTask('Gamma');
  const tasks = getTasks();
  assert.equal(tasks[0].id, a.id);
  assert.equal(tasks[1].id, b.id);
  assert.equal(tasks[2].id, c.id);
});

// 16. Edit only specified fields
test('updateTask only modifies provided fields', () => {
  clearStorage();
  const task = addTask('Original');
  const updated = updateTask(task.id, { completed: true });
  assert.equal(updated.title, 'Original');
  assert.equal(updated.completed, true);
});

// ---- Summary ----
console.log(`\n📊 Results: ${passed} passed, ${failed} failed, ${passed + failed} total\n`);

// Return exit code
process.exit(failed > 0 ? 1 : 0);
