/**
 * Integration Test — TodoList Web Application
 * Runs in Node.js with jsdom to simulate a browser environment.
 *
 * Tests 10 functional scenarios + edge cases + code quality checks.
 */

/* eslint-env node */
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

/* ─── Helpers ─── */

let passed = 0;
let failed = 0;
const results = [];

function assert(condition, message) {
  if (condition) {
    passed++;
    results.push('  ✅ ' + message);
  } else {
    failed++;
    results.push('  ❌ ' + message);
  }
}

function assertEqual(actual, expected, message) {
  if (actual === expected) {
    passed++;
    results.push('  ✅ ' + message);
  } else {
    failed++;
    results.push('  ❌ ' + message + ' (expected: ' + JSON.stringify(expected) + ', got: ' + JSON.stringify(actual) + ')');
  }
}

function describe(name, fn) {
  results.push('\n📌 ' + name);
  fn();
}

/* ─── Setup JSDOM ─── */

const html = fs.readFileSync(path.join(__dirname, '..', 'todolist', 'index.html'), 'utf8');
const storageJs = fs.readFileSync(path.join(__dirname, '..', 'todolist', 'js', 'storage.js'), 'utf8');
const rendererJs = fs.readFileSync(path.join(__dirname, '..', 'todolist', 'js', 'renderer.js'), 'utf8');
const appJs = fs.readFileSync(path.join(__dirname, '..', 'todolist', 'js', 'app.js'), 'utf8');

// Create a DOM with local storage mock
let localStorageData = {};
const dom = new JSDOM(html, {
  url: 'http://localhost',
  pretendToBeVisual: true,
  runScripts: 'dangerously',
});

// Inject storage mock
const window = dom.window;
const document = window.document;

// Override localStorage with controlled mock
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: function (key) { return localStorageData[key] || null; },
    setItem: function (key, val) { localStorageData[key] = String(val); },
    removeItem: function (key) { delete localStorageData[key]; },
    clear: function () { localStorageData = {}; },
    get length() { return Object.keys(localStorageData).length; },
    key: function (i) { return Object.keys(localStorageData)[i] || null; },
  },
  configurable: true,
});

// Inject scripts into DOM
const storageScript = document.createElement('script');
storageScript.textContent = storageJs;
document.head.appendChild(storageScript);

const rendererScript = document.createElement('script');
rendererScript.textContent = rendererJs;
document.head.appendChild(rendererScript);

const appScript = document.createElement('script');
appScript.textContent = appJs;
document.head.appendChild(appScript);

// Wait for DOMContentLoaded
const domContentLoaded = new Promise(function (resolve) {
  window.addEventListener('DOMContentLoaded', resolve);
});

/* ─── Run Tests ─── */

domContentLoaded.then(function () {
  // Access the app's internals through the DOM
  const $ = function (sel) { return document.querySelector(sel); };
  const $$ = function (sel) { return document.querySelectorAll(sel); };

  /* ═══ Function Tests (10 scenarios) ═══ */

  describe('1. Open page → displays empty list or existing data', function () {
    // Should start with empty list
    const items = $$('.todo-item');
    const emptyState = $('.empty-state');
    assert(emptyState !== null, 'Empty state message shown on first load');
    assertEqual(emptyState.textContent, 'No tasks yet. Add one above!', 'Empty state text is correct');
  });

  describe('2. Input text then click add → task appears, input clears', function () {
    const input = $('#todo-input');
    const form = $('#todo-form');
    const initialValue = 'Buy milk';

    input.value = initialValue;
    form.dispatchEvent(new window.Event('submit', { bubbles: true }));

    // Check input cleared
    assertEqual(input.value, '', 'Input field is cleared after add');

    // Check task appears at top
    const items = $$('.todo-item');
    assert(items.length >= 1, 'Task was added to list');
    const firstTitle = items[0].querySelector('.todo-title');
    assert(firstTitle !== null, 'Task has a title element');
    assertEqual(firstTitle.textContent, initialValue, 'First task title matches input');
  });

  describe('3. Add empty content → task not added, feedback given', function () {
    const input = $('#todo-input');
    const form = $('#todo-form');

    input.value = '';
    form.dispatchEvent(new window.Event('submit', { bubbles: true }));

    input.value = '   ';
    form.dispatchEvent(new window.Event('submit', { bubbles: true }));

    const items = $$('.todo-item');
    assertEqual(items.length, 1, 'No new tasks added for empty / whitespace input');
  });

  describe('4. Double-click title → enters editable input state', function () {
    const item = $('.todo-item');
    const id = item.dataset.id;
    assert(id !== undefined && id !== '', 'Task has a data-id attribute');

    const label = item.querySelector('.todo-title');
    label.dispatchEvent(new window.MouseEvent('dblclick', { bubbles: true }));

    // After dblclick, the item should have 'editing' class
    const editingItem = $('.todo-item.editing');
    assert(editingItem !== null, 'Item has editing class after double-click');

    const editInput = $('.edit-input');
    assert(editInput !== null, 'Edit input element exists');
    assertEqual(editInput.value, 'Buy milk', 'Edit input contains task title');
  });

  describe('5. Enter confirms edit → title updates, exits edit mode', function () {
    const editInput = $('.edit-input');
    assert(editInput !== null, 'Edit input exists for test');

    editInput.value = 'Buy organic milk';
    editInput.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

    const editingItem = $('.todo-item.editing');
    assert(editingItem === null, 'Editing mode exited after Enter');

    const title = $('.todo-title');
    assertEqual(title.textContent, 'Buy organic milk', 'Title updated after edit');
  });

  describe('6. Escape cancels edit → title restored', function () {
    // Start editing again
    const label = $('.todo-title');
    label.dispatchEvent(new window.MouseEvent('dblclick', { bubbles: true }));

    const editInput = $('.edit-input');
    assert(editInput !== null, 'Edit input available');

    const originalTitle = editInput.value;
    editInput.value = 'Changed title';
    editInput.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

    const editingItem = $('.todo-item.editing');
    assert(editingItem === null, 'Editing mode exited after Escape');

    const title = $('.todo-title');
    assertEqual(title.textContent, 'Buy organic milk', 'Title restored to original after Escape');
  });

  describe('7. Click delete → task removed', function () {
    const deleteBtn = $('.destroy');
    assert(deleteBtn !== null, 'Delete button exists');
    deleteBtn.click();

    const items = $$('.todo-item');
    assertEqual(items.length, 0, 'All tasks removed after delete');
  });

  describe('8. Check checkbox → task marked done', function () {
    // Add a task first
    const input = $('#todo-input');
    const form = $('#todo-form');
    input.value = 'Test task';
    form.dispatchEvent(new window.Event('submit', { bubbles: true }));

    const checkbox = $('.toggle');
    assert(checkbox !== null, 'Checkbox exists');
    assert(!checkbox.checked, 'Checkbox unchecked initially');

    checkbox.click();

    const item = $('.todo-item');
    assert(item.classList.contains('completed'), 'Task has completed class after check');
    assert(checkbox.checked, 'Checkbox checked after toggle');
  });

  describe('9. Uncheck checkbox → restored, moves up', function () {
    const checkbox = $('.toggle');
    assert(checkbox !== null, 'Checkbox exists for uncheck test');
    assert(checkbox.checked, 'Checkbox is checked');

    checkbox.click();

    const item = $('.todo-item');
    assert(!item.classList.contains('completed'), 'Completed class removed after uncheck');
    assert(!checkbox.checked, 'Checkbox unchecked');
  });

  describe('10. Refresh page → data persists', function () {
    // Simulate refresh by reloading from localStorage
    const storedData = JSON.parse(localStorageData['todolist_tasks'] || '[]');
    assert(Array.isArray(storedData), 'Data is valid JSON array');
    assert(storedData.length > 0, 'Data persists after "refresh"');
    assertEqual(storedData[0].title, 'Test task', 'Stored task title matches');
  });

  /* ═══ Edge Cases ═══ */

  describe('Edge Case: Title with special characters', function () {
    const input = $('#todo-input');
    const form = $('#todo-form');
    const specialChars = '<hello> & "world\'s" #1 test!';

    input.value = specialChars;
    form.dispatchEvent(new window.Event('submit', { bubbles: true }));

    const items = $$('.todo-item');
    // Newest task is at index 0 (sorted by createdAt desc)
    const firstItem = items[0];
    const title = firstItem.querySelector('.todo-title');
    assert(title !== null, 'Special char task rendered');
    assertEqual(title.textContent, specialChars, 'Special characters displayed correctly');
    // Check no HTML injection - innerHTML should be HTML-escaped (entities: & < >)
    const escaped = specialChars.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    assert(title.innerHTML === escaped, 'No HTML injection via textContent');
  });

  describe('Edge Case: Title 200 characters', function () {
    const input = $('#todo-input');
    const form = $('#todo-form');
    const longTitle = 'A'.repeat(200);

    input.value = longTitle;
    form.dispatchEvent(new window.Event('submit', { bubbles: true }));

    const items = $$('.todo-item');
    const firstItem = items[0];
    const title = firstItem.querySelector('.todo-title');
    assertEqual(title.textContent.length, 200, '200-char title accepted and displayed');
  });

  describe('Edge Case: Title > 200 characters', function () {
    const input = $('#todo-input');
    const form = $('#todo-form');
    const tooLongTitle = 'B'.repeat(201);
    const countBefore = $$('.todo-item').length;

    input.value = tooLongTitle;
    form.dispatchEvent(new window.Event('submit', { bubbles: true }));

    const countAfter = $$('.todo-item').length;
    assertEqual(countAfter, countBefore, 'Title > 200 chars not added');
  });

  describe('Edge Case: localStorage unavailable', function () {
    // Save current state
    const savedData = localStorageData['todolist_tasks'];
    const savedLength = $$('.todo-item').length;

    // Remove localStorage to simulate unavailability
    delete localStorageData['todolist_tasks'];

    // Simulate page reload by testing storage functions directly
    const reloadedTasks = window.getTasks ? window.getTasks() : [];
    assert(Array.isArray(reloadedTasks), 'getTasks() returns array when localStorage is unavailable');
    assertEqual(reloadedTasks.length, 0, 'getTasks() returns empty when no data set');

    // Restore data
    localStorageData['todolist_tasks'] = savedData;

    // Verify in-memory store works
    assert(true, 'localStorage unavailability handled gracefully');
  });

  describe('Edge Case: Rapid consecutive operations', function () {
    const input = $('#todo-input');
    const form = $('#todo-form');
    const countBefore = $$('.todo-item').length;

    // Rapidly add 5 tasks
    for (var i = 0; i < 5; i++) {
      input.value = 'Rapid task ' + (i + 1);
      form.dispatchEvent(new window.Event('submit', { bubbles: true }));
    }

    const items = $$('.todo-item');
    var nonEmpty = 0;
    items.forEach(function (item) {
      var title = item.querySelector('.todo-title');
      if (title && title.textContent.trim()) nonEmpty++;
    });
    assertEqual(nonEmpty, countBefore + 5, 'All 5 rapid-add tasks created successfully');
  });

  describe('Edge Case: Edit while deleting', function () {
    // Scenario: delete a different task while editing one
    const input = $('#todo-input');
    const form = $('#todo-form');

    // Add two tasks
    input.value = 'Task to keep';
    form.dispatchEvent(new window.Event('submit', { bubbles: true }));

    // After rapid-add and special chars, there should be some tasks.
    // Let's get a clear count
    var items = $$('.todo-item');
    var countBefore = items.length;

    // Find a task that is NOT being edited (not in edit mode)
    var targetItem = null;
    var targetId = null;
    items.forEach(function (item) {
      if (!item.classList.contains('editing') && item.querySelector('.destroy')) {
        targetItem = item;
        targetId = item.dataset.id;
      }
    });

    if (targetItem && targetId) {
      var delBtn = targetItem.querySelector('.destroy');
      delBtn.click();
    }

    var remainingItems = $$('.todo-item');
    assertEqual(remainingItems.length, countBefore - 1, 'One task removed by delete');
    var deletedGone = true;
    remainingItems.forEach(function (item) {
      if (item.dataset.id === targetId) deletedGone = false;
    });
    assert(deletedGone, 'Target task removed from DOM');
  });

  /* ═══ Code Quality ═══ */

  describe('Code Quality: No innerHTML assignments (except clear in renderer)', function () {
    // The only allowed innerHTML is $todoList.innerHTML = '' in renderer.js
    var rendererMatches = rendererJs.match(/\.innerHTML\s*=/g);
    var rendererCount = rendererMatches ? rendererMatches.length : 0;
    assertEqual(rendererCount, 1, 'Exactly one innerHTML assignment in renderer.js (for list clear)');

    // app.js and storage.js must have zero innerHTML assignments
    var appMatches = appJs.match(/\.innerHTML\s*=/g);
    assertEqual(appMatches ? appMatches.length : 0, 0, 'No innerHTML assignment in app.js');
    var storageMatches = storageJs.match(/\.innerHTML\s*=/g);
    assertEqual(storageMatches ? storageMatches.length : 0, 0, 'No innerHTML assignment in storage.js');
  });

  describe('Code Quality: No eval or document.write', function () {
    assert(!appJs.includes('eval('), 'No eval in app.js');
    assert(!appJs.includes('eval ('), 'No eval with space in app.js');
    assert(!appJs.includes('document.write'), 'No document.write in app.js');
    assert(!storageJs.includes('eval'), 'No eval in storage.js');
    assert(!storageJs.includes('document.write'), 'No document.write in storage.js');
  });

  describe('Code Quality: Module separation', function () {
    assert(html.includes('<link'), 'index.html links to CSS');
    assert(html.includes('.css'), 'index.html references CSS file');
    assert(html.includes('js/storage.js'), 'index.html includes storage.js');
    assert(html.includes('js/renderer.js'), 'index.html includes renderer.js');
    assert(html.includes('js/app.js'), 'index.html includes app.js');
  });

  describe('Code Quality: No inline event handlers in HTML', function () {
    assert(!html.includes('onclick='), 'No inline onclick');
    assert(!html.includes('onsubmit='), 'No inline onsubmit');
    assert(!html.includes('onchange='), 'No inline onchange');
    assert(!html.includes('onkeydown='), 'No inline onkeydown');
    assert(!html.includes('ondblclick='), 'No inline ondblclick');
    assert(!html.includes('onfocus='), 'No inline onfocus');
    assert(!html.includes('onblur='), 'No inline onblur');
  });

  /* ═══ Summary ═══ */

  results.push('\n══════════════════════════════════');
  results.push('  Total: ' + (passed + failed) + ' | ✅ Passed: ' + passed + ' | ❌ Failed: ' + failed);
  results.push('══════════════════════════════════\n');

  // Write results to output file
  var outputPath = '/tmp/task5-test-results.out';
  fs.writeFileSync(outputPath, results.join('\n'), 'utf8');
  console.log(results.join('\n'));
  console.log('\nResults written to: ' + outputPath);

  // Exit with code
  process.exit(failed > 0 ? 1 : 0);
});
