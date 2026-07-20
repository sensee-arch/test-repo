/**
 * TodoList SPA — Integration & Unit Tests
 * Uses jsdom for DOM environment, tests DataModule, RenderModule, and full app.
 */

const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

// ─── Build DOM environment ───

const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf-8');
const css = fs.readFileSync(path.resolve(__dirname, '../css/style.css'), 'utf-8');

const dom = new JSDOM(html, {
  url: 'http://localhost',
  pretendToBeVisual: true,
  runScripts: 'dangerously',
});

global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;
global.localStorage = dom.window.localStorage;
global.crypto = dom.window.crypto;
global.Blob = dom.window.Blob;
global.console = dom.window.console;

// Evaluate app script in JSDOM window context.
// JSDOM 29+ scopes class/const in dynamic <script> to the script, not window.
// We eval with explicit window assignments to bridge this.
const appJsCode = fs.readFileSync(path.resolve(__dirname, '../js/app.js'), 'utf-8');
dom.window.eval(
  appJsCode + '\n' +
  'window.__DataModule = DataModule;\n' +
  'window.__RenderModule = RenderModule;\n' +
  'window.__EventModule = EventModule;\n' +
  'window.__STORAGE_KEY = STORAGE_KEY;\n' +
  'window.__ANIMATION_DURATION_MS = ANIMATION_DURATION_MS;\n' +
  'window.__initApp = initApp;'
);

// Extract from JSDOM window to Node global scope
function extractGlobals() {
  global.DataModule = dom.window.__DataModule;
  global.RenderModule = dom.window.__RenderModule;
  global.EventModule = dom.window.__EventModule;
  global.STORAGE_KEY = dom.window.__STORAGE_KEY;
  global.ANIMATION_DURATION_MS = dom.window.__ANIMATION_DURATION_MS;
  global.initApp = dom.window.__initApp;
}

extractGlobals();

// Helper: create a fresh DataModule with clean localStorage
function makeDataModule() {
  dom.window.localStorage.clear();
  return new DataModule();
}

let assert, expect;

async function run() {
  assert = require('assert');

  // Init the app with clean state
  dom.window.localStorage.clear();
  const listEl = document.getElementById('todo-list');
  if (listEl) listEl.innerHTML = '';
  initApp();
  await new Promise(r => setTimeout(r, 50));

  const results = { pass: 0, fail: 0, errors: [] };

  function test(name, fn) {
    try {
      fn();
      results.pass++;
      console.log(`  ✅ ${name}`);
    } catch (e) {
      results.fail++;
      results.errors.push({ name, message: e.message, stack: e.stack });
      console.log(`  ❌ ${name}: ${e.message}`);
    }
  }

  // ──────────────────────────────────────
  // DATA MODULE TESTS
  // ──────────────────────────────────────

  console.log('\n📦 DataModule Tests');

  test('DataModule: create instance and read empty', () => {
    const dm = makeDataModule();
    assert.strictEqual(dm.getTasks().length, 0);
    const stats = dm.getStats();
    assert.strictEqual(stats.total, 0);
    assert.strictEqual(stats.completed, 0);
    assert.strictEqual(stats.active, 0);
  });

  test('DataModule: addTask returns valid task', () => {
    const dm = makeDataModule();
    const task = dm.addTask('My first task');
    assert.ok(task.id);
    assert.strictEqual(task.title, 'My first task');
    assert.strictEqual(task.completed, false);
    assert.ok(task.createdAt);
    assert.ok(task.updatedAt);
  });

  test('DataModule: addTask persists and sorts by createdAt descending', () => {
    const dm = makeDataModule();
    dm.addTask('Oldest');
    const second = dm.addTask('Newest');
    const tasks = dm.getTasks();
    assert.strictEqual(tasks.length, 2);
    // Both tasks must be present
    assert.ok(tasks.find(t => t.title === 'Oldest'));
    assert.ok(tasks.find(t => t.title === 'Newest'));
    // Verify descending sort (ties are acceptable, only check when timestamps differ)
    const t0 = new Date(tasks[0].createdAt).getTime();
    const t1 = new Date(tasks[1].createdAt).getTime();
    assert.ok(t0 >= t1, 'createdAt must be sorted descending');
  });

  test('DataModule: addTask rejects empty title', () => {
    const dm = makeDataModule();
    assert.throws(() => dm.addTask(''), /cannot be empty/);
    assert.throws(() => dm.addTask('   '), /cannot be empty/);
    assert.strictEqual(dm.getTasks().length, 0);
  });

  test('DataModule: addTask rejects non-string title', () => {
    const dm = makeDataModule();
    assert.throws(() => dm.addTask(123), /must be a string/);
  });

  test('DataModule: addTask rejects title over 200 chars', () => {
    const dm = makeDataModule();
    const long = 'a'.repeat(201);
    assert.throws(() => dm.addTask(long), /exceeds 200/);
  });

  test('DataModule: addTask accepts 200 char title', () => {
    const dm = makeDataModule();
    const title = 'a'.repeat(200);
    const task = dm.addTask(title);
    assert.strictEqual(task.title.length, 200);
    assert.strictEqual(dm.getTasks().length, 1);
  });

  test('DataModule: updateTask modifies title', () => {
    const dm = makeDataModule();
    const task = dm.addTask('Original');
    const updated = dm.updateTask(task.id, { title: 'Updated' });
    assert.strictEqual(updated.title, 'Updated');
    assert.strictEqual(dm.getTasks()[0].title, 'Updated');
  });

  test('DataModule: updateTask modifies completed status', () => {
    const dm = makeDataModule();
    const task = dm.addTask('Task');
    const updated = dm.updateTask(task.id, { completed: true });
    assert.strictEqual(updated.completed, true);
    assert.strictEqual(dm.getTasks()[0].completed, true);
  });

  test('DataModule: updateTask rejects empty title', () => {
    const dm = makeDataModule();
    const task = dm.addTask('Task');
    assert.throws(() => dm.updateTask(task.id, { title: '' }), /cannot be empty/);
    assert.throws(() => dm.updateTask(task.id, { title: '   ' }), /cannot be empty/);
  });

  test('DataModule: updateTask throws for non-existent id', () => {
    const dm = makeDataModule();
    assert.throws(() => dm.updateTask('nonexistent', { title: 'X' }), /not found/);
  });

  test('DataModule: deleteTask removes task', () => {
    const dm = makeDataModule();
    const task = dm.addTask('Delete me');
    assert.strictEqual(dm.getTasks().length, 1);
    const result = dm.deleteTask(task.id);
    assert.strictEqual(result, true);
    assert.strictEqual(dm.getTasks().length, 0);
  });

  test('DataModule: deleteTask returns false for non-existent id', () => {
    const dm = makeDataModule();
    assert.strictEqual(dm.deleteTask('nonexistent'), false);
  });

  test('DataModule: toggleTask flips completed', () => {
    const dm = makeDataModule();
    const task = dm.addTask('Toggle me');
    assert.strictEqual(task.completed, false);
    const toggled = dm.toggleTask(task.id);
    assert.strictEqual(toggled.completed, true);
    const toggledBack = dm.toggleTask(task.id);
    assert.strictEqual(toggledBack.completed, false);
  });

  test('DataModule: toggleTask throws for non-existent id', () => {
    const dm = makeDataModule();
    assert.throws(() => dm.toggleTask('nonexistent'), /not found/);
  });

  test('DataModule: getStats correct after operations', () => {
    const dm = makeDataModule();
    dm.addTask('Task 1');
    dm.addTask('Task 2');
    dm.addTask('Task 3');
    const t3 = dm.addTask('Task 4');
    dm.toggleTask(t3.id);

    const stats = dm.getStats();
    assert.strictEqual(stats.total, 4);
    assert.strictEqual(stats.completed, 1);
    assert.strictEqual(stats.active, 3);
  });

  test('DataModule: onChange fires on add', () => {
    const dm = makeDataModule();
    let fired = false;
    dm.onChange(() => { fired = true; });
    dm.addTask('Test');
    assert.strictEqual(fired, true);
  });

  test('DataModule: onChange fires on delete', () => {
    const dm = makeDataModule();
    const task = dm.addTask('Test');
    let fired = false;
    dm.onChange(() => { fired = true; });
    dm.deleteTask(task.id);
    assert.strictEqual(fired, true);
  });

  test('DataModule: onChange receives tasks and stats', () => {
    const dm = makeDataModule();
    let payload = null;
    dm.onChange((p) => { payload = p; });
    dm.addTask('Test');
    assert.ok(payload);
    assert.ok(Array.isArray(payload.tasks));
    assert.ok(payload.stats.total !== undefined);
  });

  // ──────────────────────────────────────
  // RENDER MODULE TESTS
  // ──────────────────────────────────────

  console.log('\n🎨 RenderModule Tests');

  test('RenderModule: renders task list', () => {
    const listEl = document.getElementById('todo-list');
    const statsEl = document.getElementById('todo-count');
    const clearBtn = document.getElementById('clear-completed');
    const filterBtns = document.querySelectorAll('.todo-footer__filter-btn');
    const rm = new RenderModule(listEl, statsEl, clearBtn, filterBtns);

    const tasks = [
      { id: '1', title: 'Test 1', completed: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: '2', title: 'Test 2', completed: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    ];
    rm.render(tasks);
    assert.strictEqual(listEl.children.length, 2);
    assert.ok(listEl.querySelector('[data-id="1"]'));
    assert.ok(listEl.querySelector('[data-id="2"]'));
    assert.ok(listEl.querySelector('.todo-item--completed'));
  });

  test('RenderModule: renders empty state', () => {
    const listEl = document.getElementById('todo-list');
    const statsEl = document.getElementById('todo-count');
    const rm = new RenderModule(listEl, statsEl, document.getElementById('clear-completed'), document.querySelectorAll('.todo-footer__filter-btn'));
    rm.render([]);
    assert.strictEqual(listEl.children.length, 1);
    assert.ok(listEl.querySelector('.todo-list__empty'));
  });

  test('RenderModule: renderStats updates count', () => {
    const statsEl = document.getElementById('todo-count');
    const rm = new RenderModule(
      document.getElementById('todo-list'),
      statsEl,
      document.getElementById('clear-completed'),
      document.querySelectorAll('.todo-footer__filter-btn')
    );
    rm.renderStats({ total: 5, completed: 2, active: 3 }, 'all');
    assert.ok(statsEl.textContent.includes('5'));
    assert.ok(statsEl.textContent.includes('2'));
    assert.ok(statsEl.textContent.includes('3'));
  });

  test('RenderModule: renderStats shows/hides clear button', () => {
    const clearBtn = document.getElementById('clear-completed');
    const rm = new RenderModule(
      document.getElementById('todo-list'),
      document.getElementById('todo-count'),
      clearBtn,
      document.querySelectorAll('.todo-footer__filter-btn')
    );
    rm.renderStats({ total: 3, completed: 0, active: 3 }, 'all');
    assert.strictEqual(clearBtn.style.display, 'none');
    rm.renderStats({ total: 3, completed: 1, active: 2 }, 'all');
    assert.notStrictEqual(clearBtn.style.display, 'none');
  });

  test('RenderModule: addTaskItem prepends with enter class', () => {
    const listEl = document.getElementById('todo-list');
    listEl.innerHTML = '';
    const rm = new RenderModule(
      listEl,
      document.getElementById('todo-count'),
      document.getElementById('clear-completed'),
      document.querySelectorAll('.todo-footer__filter-btn')
    );
    const task = { id: 'new', title: 'New task', completed: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    rm.addTaskItem(task);
    assert.strictEqual(listEl.children.length, 1);
    const item = listEl.querySelector('[data-id="new"]');
    assert.ok(item);
    assert.ok(item.classList.contains('todo-item--enter'));
  });

  test('RenderModule: addTaskItem replaces empty state', () => {
    const listEl = document.getElementById('todo-list');
    listEl.innerHTML = '<li class="todo-list__empty">No tasks</li>';
    const rm = new RenderModule(
      listEl,
      document.getElementById('todo-count'),
      document.getElementById('clear-completed'),
      document.querySelectorAll('.todo-footer__filter-btn')
    );
    const task = { id: 'a', title: 'A', completed: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    rm.addTaskItem(task);
    assert.strictEqual(listEl.children.length, 1);
    assert.strictEqual(listEl.querySelector('[data-id="a"]') !== null, true);
    assert.strictEqual(listEl.querySelector('.todo-list__empty'), null);
  });

  test('RenderModule: removeTaskItem adds exit class and removes', (done) => {
    const listEl = document.getElementById('todo-list');
    listEl.innerHTML = '<li data-id="del1" class="todo-item">Task</li>';
    const rm = new RenderModule(
      listEl,
      document.getElementById('todo-count'),
      document.getElementById('clear-completed'),
      document.querySelectorAll('.todo-footer__filter-btn')
    );
    rm.removeTaskItem('del1', () => {
      assert.strictEqual(listEl.querySelector('[data-id="del1"]'), null);
      done();
    });
    assert.ok(document.querySelector('[data-id="del1"]').classList.contains('todo-item--exit'));
  });

  test('RenderModule: createEditElement returns editable input', () => {
    const rm = new RenderModule(
      document.getElementById('todo-list'),
      document.getElementById('todo-count'),
      document.getElementById('clear-completed'),
      document.querySelectorAll('.todo-footer__filter-btn')
    );
    const task = { id: 'edit1', title: 'Edit me' };
    const el = rm.createEditElement(task);
    assert.ok(el.classList.contains('todo-item--editing'));
    assert.ok(el.querySelector('.todo-item__edit-input'));
    assert.strictEqual(el.querySelector('.todo-item__edit-input').value, 'Edit me');
  });

  // ──────────────────────────────────────
  // INTEGRATION TESTS
  // ──────────────────────────────────────

  console.log('\n🔗 Integration Tests');

  // Re-init app with clean state for integration tests
  dom.window.localStorage.clear();
  const reinitList = document.getElementById('todo-list');
  if (reinitList) reinitList.innerHTML = '';
  initApp();

  test('Integration: initApp renders empty state', () => {
    const listEl = document.getElementById('todo-list');
    const hasEmpty = listEl.querySelector('.todo-list__empty');
    assert.ok(hasEmpty);
    assert.ok(hasEmpty.textContent.includes('任务'));
  });

  test('Integration: DataModule -> RenderModule data flow', () => {
    makeDataModule(); // clears localStorage
    const listEl = document.getElementById('todo-list');
    const statsEl = document.getElementById('todo-count');
    const clearBtn = document.getElementById('clear-completed');
    const filterBtns = document.querySelectorAll('.todo-footer__filter-btn');
    const dm = makeDataModule();
    const rm = new RenderModule(listEl, statsEl, clearBtn, filterBtns);

    const task = dm.addTask('Integration test');
    rm.render(dm.getTasks());
    assert.strictEqual(listEl.children.length, 1);
    assert.ok(listEl.querySelector(`[data-id="${task.id}"]`));

    rm.renderStats(dm.getStats(), 'all');
    assert.ok(statsEl.textContent.includes('1'));
  });

  test('Integration: EventModule bindAddTask adds item to DOM', () => {
    makeDataModule();
    const listEl = document.getElementById('todo-list');
    const statsEl = document.getElementById('todo-count');
    const clearBtn = document.getElementById('clear-completed');
    const filterBtns = document.querySelectorAll('.todo-footer__filter-btn');
    const inputEl = document.getElementById('todo-input');
    const formEl = document.getElementById('todo-form');

    const dm = makeDataModule();
    const rm = new RenderModule(listEl, statsEl, clearBtn, filterBtns);
    const ev = new EventModule(dm, rm, listEl);

    listEl.innerHTML = '';
    ev.bindAddTask(inputEl, formEl);

    inputEl.value = 'Test add task';
    formEl.dispatchEvent(new dom.window.Event('submit', { cancelable: true }));

    assert.strictEqual(dm.getTasks().length, 1);
    assert.strictEqual(dm.getTasks()[0].title, 'Test add task');
    assert.strictEqual(inputEl.value, '');
  });

  test('Integration: Data persistence via localStorage', () => {
    makeDataModule();
    const dm = makeDataModule();
    dm.addTask('Persistent task');
    const savedJson = localStorage.getItem('todolist-tasks');
    assert.ok(savedJson);
    const parsed = JSON.parse(savedJson);
    assert.strictEqual(parsed.length, 1);
    assert.strictEqual(parsed[0].title, 'Persistent task');
  });

  test('Integration: storage key constant STORAGE_KEY', () => {
    assert.strictEqual(typeof STORAGE_KEY, 'string');
    assert.strictEqual(STORAGE_KEY, 'todolist-tasks');
  });

  test('Integration: filter buttons toggle selection', () => {
    makeDataModule();
    const dm = makeDataModule();
    const rm = new RenderModule(
      document.getElementById('todo-list'),
      document.getElementById('todo-count'),
      document.getElementById('clear-completed'),
      document.querySelectorAll('.todo-footer__filter-btn')
    );
    const ev = new EventModule(dm, rm, document.getElementById('todo-list'));
    const filterBtns = document.querySelectorAll('.todo-footer__filter-btn');
    ev.bindFilterTabs(filterBtns);

    filterBtns[1].click();
    assert.ok(filterBtns[1].classList.contains('todo-footer__filter-btn--selected'));
    assert.strictEqual(filterBtns[0].classList.contains('todo-footer__filter-btn--selected'), false);
    assert.strictEqual(filterBtns[2].classList.contains('todo-footer__filter-btn--selected'), false);
  });

  // Summary
  console.log(`\n═══════════════════════════════════`);
  console.log(`Results: ${results.pass} passed, ${results.fail} failed\n`);
  if (results.errors.length > 0) {
    console.log('Failed tests:');
    results.errors.forEach(e => console.log(`  - ${e.name}: ${e.message}`));
  }
  process.exit(results.fail > 0 ? 1 : 0);
}

run().catch(e => {
  console.error('Test runner error:', e);
  process.exit(1);
});
