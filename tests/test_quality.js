/**
 * Code quality checks for the TodoList application.
 */
const fs = require('fs');
const path = require('path');

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

console.log('\n🔍 Code Quality Checks\n');

// 1. No innerHTML in app.js
test('app.js: zero innerHTML assignment (reads in comments ok)', () => {
  const content = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf-8');
  // Remove comments first, then check for innerHTML assignment pattern
  const noComments = content.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
  // Check for assignment: .innerHTML =  or .innerHTML+=
  const assignPattern = /\.innerHTML\s*=/;
  if (assignPattern.test(noComments)) {
    // Find the actual lines
    const lines = content.split('\n');
    const badLines = lines
      .map((l, i) => [i + 1, l])
      .filter(([_, l]) => {
        const stripped = l.replace(/\/\/.*$/, '').replace(/\/\*[\s\S]*?\*\//g, '');
        return assignPattern.test(stripped);
      });
    if (badLines.length > 0) {
      throw new Error(`Found innerHTML assignments at lines: ${badLines.map(([n]) => n).join(', ')}`);
    }
  }
});

// 2. No innerHTML in storage.js
test('storage.js: zero innerHTML usage', () => {
  const content = fs.readFileSync(path.join(__dirname, '..', 'storage.js'), 'utf-8');
  if (content.includes('innerHTML')) {
    throw new Error('innerHTML found in storage.js');
  }
});

// 3. HTML has meta viewport
test('index.html: has meta viewport', () => {
  const content = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf-8');
  if (!content.includes('name="viewport"') && !content.includes("name='viewport'")) {
    throw new Error('Missing viewport meta tag');
  }
});

// 4. HTML uses semantic elements
test('index.html: uses semantic header/main/section', () => {
  const content = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf-8');
  const checks = ['<header>', '<main>', '<section'];
  checks.forEach(tag => {
    if (!content.includes(tag)) {
      throw new Error(`Missing semantic element: ${tag}`);
    }
  });
});

// 5. CSS has CSS Variables
test('style.css: defines CSS Variables', () => {
  const content = fs.readFileSync(path.join(__dirname, '..', 'style.css'), 'utf-8');
  if (!content.includes('--primary') || !content.includes('--bg') || !content.includes('--text')) {
    throw new Error('Missing required CSS variables (--primary, --bg, --text)');
  }
});

// 6. CSS has completed state
test('style.css: has .completed state styling', () => {
  const content = fs.readFileSync(path.join(__dirname, '..', 'style.css'), 'utf-8');
  if (!content.includes('.completed') || !content.includes('line-through')) {
    throw new Error('Missing .completed class with line-through');
  }
});

// 7. CSS has responsive breakpoints
test('style.css: has responsive breakpoints', () => {
  const content = fs.readFileSync(path.join(__dirname, '..', 'style.css'), 'utf-8');
  if (!content.includes('@media (max-width: 480px)') && !content.includes('@media (max-width:480px)')) {
    throw new Error('Missing 480px breakpoint');
  }
});

// 8. app.js has required functions
test('app.js: all required functions present', () => {
  const content = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf-8');
  const required = ['init', 'render', 'handleAdd', 'handleEdit', 'handleSave',
    'handleCancel', 'handleDelete', 'handleToggle', 'setFilter', 'escapeHtml'];
  required.forEach(fn => {
    if (!content.includes(`function ${fn}`) && !content.includes(`${fn} = `) && !content.includes(`${fn}(`)) {
      throw new Error(`Missing function: ${fn}`);
    }
  });
});

// 9. storage.js has all CRUD functions
test('storage.js: all CRUD functions present', () => {
  const content = fs.readFileSync(path.join(__dirname, '..', 'storage.js'), 'utf-8');
  const required = ['function getTasks', 'function addTask', 'function updateTask',
    'function deleteTask', 'function toggleTask'];
  required.forEach(fn => {
    if (!content.includes(fn)) {
      throw new Error(`Missing ${fn}`);
    }
  });
});

// 10. storage.js has uuid fallback
test('storage.js: has crypto.randomUUID fallback', () => {
  const content = fs.readFileSync(path.join(__dirname, '..', 'storage.js'), 'utf-8');
  if (!content.includes('randomUUID') || !content.includes('Math.random')) {
    throw new Error('Missing crypto.randomUUID() fallback using Math.random');
  }
});

// 11. All files exist
test('All required files exist', () => {
  const base = path.join(__dirname, '..');
  ['index.html', 'style.css', 'storage.js', 'app.js'].forEach(f => {
    const fullPath = path.join(base, f);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`Missing required file: ${f}`);
    }
  });
});

// ---- Summary ----
console.log(`\n📊 Results: ${passed} passed, ${failed} failed, ${passed + failed} total\n`);
process.exit(failed > 0 ? 1 : 0);
