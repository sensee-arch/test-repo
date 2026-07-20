/**
 * TodoStore Unit Tests
 *
 * Tests the Model layer in isolation by mocking localStorage.
 * Run: node tests/model.unit.test.mjs
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// ---------------------------------------------------------------------------
// Mock localStorage
// ---------------------------------------------------------------------------
const storage = {};
global.localStorage = {
  getItem: (k) => (k in storage ? storage[k] : null),
  setItem: (k, v) => { storage[k] = String(v); },
  removeItem: (k) => { delete storage[k]; },
  clear: () => { Object.keys(storage).forEach(k => delete storage[k]); },
  get length() { return Object.keys(storage).length; },
};

// ---------------------------------------------------------------------------
// Helper: minimal DOM shim for escapeHtml (used by model.js internally)
// Properly simulates textContent-to-innerHTML serialization.
// ---------------------------------------------------------------------------
if (typeof document === 'undefined') {
  global.document = {
    createElement: (tag) => {
      let textContent = '';
      return {
        tagName: tag.toUpperCase(),
        set textContent(v) {
          textContent = String(v);
          // Simulate browser innerHTML serialization
          this._innerHTML = textContent
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;');
        },
        get textContent() { return textContent; },
        get innerHTML() { return this._innerHTML || ''; },
        set innerHTML(v) { this._innerHTML = v; },
      };
    },
  };
}

// ---------------------------------------------------------------------------
// Load the model module
// ---------------------------------------------------------------------------
const modelPath = new URL('../js/model.js', import.meta.url).pathname;
const { TodoStore, escapeHtml } = await import(modelPath);

// ---------------------------------------------------------------------------
// Test counters
// ---------------------------------------------------------------------------
let passed = 0;
let failed = 0;
const errors = [];

function assert(condition, msg) {
  if (condition) {
    passed++;
  } else {
    failed++;
    errors.push(`  ❌ ${msg}`);
    console.log(`  ❌ ${msg}`);
  }
}

// Run a named section
function section(name) {
  console.log(`\n## ${name}`);
}

function resetStorage() {
  localStorage.clear();
}

// ===========================================================================
// TESTS
// ===========================================================================

// ---------------------------------------------------------------------------
// Storage availability
// ---------------------------------------------------------------------------
section('Storage Availability');
assert(TodoStore.isAvailable() === true, 'isAvailable() returns true');

// ---------------------------------------------------------------------------
// CRUD: Create
// ---------------------------------------------------------------------------
section('Create');

resetStorage();
const store = new TodoStore();

let item;
try {
  item = store.create('Buy groceries');
  assert(typeof item === 'object' && item !== null, 'create returns an object');
  assert(typeof item.id === 'string' && item.id.length > 0, 'create generates an id');
  assert(item.title === 'Buy groceries', `create sets title: got "${item.title}"`);
  assert(item.completed === false, 'create sets completed=false');
  assert(typeof item.createdAt === 'string', `create sets createdAt: got "${item.createdAt}"`);
  assert(typeof item.updatedAt === 'string', 'create sets updatedAt');
} catch (e) {
  failed++;
  errors.push(`  ❌ create basic: threw ${e.message}`);
  console.log(`  ❌ create basic: threw ${e.message}`);
}

// ---------------------------------------------------------------------------
// CRUD: GetAll (empty)
// ---------------------------------------------------------------------------
section('GetAll (empty)');

resetStorage();
const emptyStore = new TodoStore();
const allEmpty = emptyStore.getAll();
assert(Array.isArray(allEmpty), 'getAll returns array');
assert(allEmpty.length === 0, 'getAll returns empty array for empty store');

// ---------------------------------------------------------------------------
// CRUD: GetAll (with items)
// ---------------------------------------------------------------------------
section('GetAll (with items)');

resetStorage();
const store2 = new TodoStore();
store2.create('Alpha');
store2.create('Beta');
store2.create('Gamma');

// Stagger createdAt timestamps to verify sort order
const key = TodoStore.STORAGE_KEY;
const raw = JSON.parse(localStorage.getItem(key));
raw[0].createdAt = '2025-01-03T00:00:00.000Z'; // Alpha — newest
raw[1].createdAt = '2025-01-02T00:00:00.000Z'; // Beta
raw[2].createdAt = '2025-01-01T00:00:00.000Z'; // Gamma — oldest
localStorage.setItem(key, JSON.stringify(raw));

const all = store2.getAll();
assert(all.length === 3, `getAll returns 3 items, got ${all.length}`);
assert(all[0].title === 'Alpha', `expected first item Alpha, got "${all[0].title}"`);
assert(all[1].title === 'Beta', `expected second item Beta, got "${all[1].title}"`);
assert(all[2].title === 'Gamma', `expected third item Gamma, got "${all[2].title}"`);
// Verify createdAt descending order
assert(new Date(all[0].createdAt) > new Date(all[1].createdAt),
  'items sorted by createdAt descending (first > second)');
assert(new Date(all[1].createdAt) > new Date(all[2].createdAt),
  'items sorted by createdAt descending (second > third)');

// ---------------------------------------------------------------------------
// Create: empty title throws
// ---------------------------------------------------------------------------
section('Create validation');
resetStorage();
const store3 = new TodoStore();

try {
  store3.create('');
  assert(false, 'create("") should throw');
} catch (e) {
  assert(e.message === 'Title must be a non-empty string.', `create("") throws: "${e.message}"`);
}

try {
  store3.create('   ');
  assert(false, 'create("   ") should throw');
} catch (e) {
  assert(e.message === 'Title must be a non-empty string.', `create("   ") throws: "${e.message}"`);
}

try {
  store3.create(null);
  assert(false, 'create(null) should throw');
} catch (e) {
  assert(true, 'create(null) throws');
}

try {
  store3.create(undefined);
  assert(false, 'create(undefined) should throw');
} catch (e) {
  assert(true, 'create(undefined) throws');
}

try {
  store3.create(123);
  assert(false, 'create(123) should throw');
} catch (e) {
  assert(true, 'create(123) throws');
}

// Ensure no items were added
assert(store3.getAll().length === 0, 'no items added after failed creates');

// ---------------------------------------------------------------------------
// GetById
// ---------------------------------------------------------------------------
section('GetById');

resetStorage();
const store4 = new TodoStore();
const created = store4.create('Find me');
const found = store4.getById(created.id);
assert(found !== null, 'getById finds existing item');
assert(found.id === created.id, 'getById returns correct item');
assert(store4.getById('nonexistent-id') === null, 'getById returns null for missing id');

// ---------------------------------------------------------------------------
// Update
// ---------------------------------------------------------------------------
section('Update');

resetStorage();
const store5 = new TodoStore();
const item5 = store5.create('Old title');
const updated = store5.update(item5.id, { title: 'New title' });
assert(updated !== null, 'update returns updated item');
assert(updated.title === 'New title', `update changes title: "${updated.title}"`);
assert(updated.id === item5.id, 'update preserves id');
assert(typeof updated.updatedAt === 'string', 'update sets updatedAt');

// Partial update
const partial = store5.update(item5.id, { completed: true });
assert(partial.completed === true, 'partial update sets completed');
assert(partial.title === 'New title', 'partial update preserves other fields');

// Update non-existent
assert(store5.update('bad-id', { title: 'x' }) === null, 'update returns null for missing id');

// ---------------------------------------------------------------------------
// Delete
// ---------------------------------------------------------------------------
section('Delete');

resetStorage();
const store6 = new TodoStore();
const d1 = store6.create('Delete me');
const d2 = store6.create('Keep me');
assert(store6.delete(d1.id) === true, 'delete returns true for existing item');
assert(store6.getAll().length === 1, 'only 1 item remains after delete');
assert(store6.getById(d1.id) === null, 'deleted item is gone');
assert(store6.delete('bad-id') === false, 'delete returns false for missing id');

// ---------------------------------------------------------------------------
// Toggle
// ---------------------------------------------------------------------------
section('Toggle');

resetStorage();
const store7 = new TodoStore();
const t1 = store7.create('Toggle me');
assert(t1.completed === false, 'initial completed is false');

const toggled = store7.toggle(t1.id);
assert(toggled !== null, 'toggle returns item');
assert(toggled.completed === true, 'toggle sets completed to true');

const toggledBack = store7.toggle(t1.id);
assert(toggledBack.completed === false, 'toggle again sets completed to false');

assert(store7.toggle('bad-id') === null, 'toggle returns null for missing id');

// ---------------------------------------------------------------------------
// Edge: localStorage disabled
// ---------------------------------------------------------------------------
section('localStorage disabled');

// isAvailable tests setItem/removeItem, not getItem
const savedSetItem = global.localStorage.setItem;
global.localStorage.setItem = () => { throw new Error('disabled'); };
assert(TodoStore.isAvailable() === false, 'isAvailable returns false when setItem throws');
global.localStorage.setItem = savedSetItem;

const realRemoveItem = global.localStorage.removeItem;
global.localStorage.removeItem = () => { throw new Error('disabled'); };
assert(TodoStore.isAvailable() === false, 'isAvailable returns false when removeItem throws');
global.localStorage.removeItem = realRemoveItem;

// ---------------------------------------------------------------------------
// Edge: Quota exceeded handling
// ---------------------------------------------------------------------------
section('Quota exceeded');

resetStorage();
const storeQuota = new TodoStore();

// Temporarily make setItem throw QuotaExceededError
const realSetItem = global.localStorage.setItem;
global.localStorage.setItem = () => {
  const err = new Error('QuotaExceededError');
  err.name = 'QuotaExceededError';
  throw err;
};

try {
  storeQuota.create('Will fail');
  assert(false, 'create should throw on quota exceeded');
} catch (e) {
  assert(e.message === 'Storage quota exceeded. Please delete some items.',
    `quota exceeded message: "${e.message}"`);
}
global.localStorage.setItem = realSetItem;

// ---------------------------------------------------------------------------
// Data integrity: IDs are unique
// ---------------------------------------------------------------------------
section('Data integrity');

resetStorage();
const store8 = new TodoStore();
const ids = new Set();
for (let i = 0; i < 100; i++) {
  const it = store8.create(`Item ${i}`);
  ids.add(it.id);
}
assert(ids.size === 100, '100 items have 100 unique IDs');

// ---------------------------------------------------------------------------
// Title trimming
// ---------------------------------------------------------------------------
section('Title trimming');

resetStorage();
const store9 = new TodoStore();
const item9 = store9.create('  Trimmed  ');
assert(item9.title === 'Trimmed', `title trimmed: "${item9.title}"`);

// ---------------------------------------------------------------------------
// Escape HTML
// ---------------------------------------------------------------------------
section('escapeHtml');

assert(escapeHtml('<script>alert("xss")</script>') === '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;',
  'escapeHtml escapes script tags');
assert(escapeHtml('safe text') === 'safe text', 'escapeHtml passes safe text');
assert(escapeHtml('a & b < c > d "e" f\'g') === 'a &amp; b &lt; c &gt; d &quot;e&quot; f&#x27;g',
  'escapeHtml escapes all HTML entities');

// ===========================================================================
// Summary
// ===========================================================================
console.log('\n' + '='.repeat(50));
console.log(`📊 Model Unit Tests: ${passed} passed, ${failed} failed`);
if (errors.length > 0) {
  console.log('Errors:');
  errors.forEach((e) => console.log(`   ${e}`));
}

process.exit(failed > 0 ? 1 : 0);
