/**
 * Run all test suites sequentially.
 */
import { execSync } from 'child_process';

const suites = [
  { name: 'Model Unit Tests', cmd: 'node tests/model.unit.test.mjs' },
  { name: 'Integration Tests', cmd: `PLAYWRIGHT_BROWSERS_PATH=~/.openclaw/workspace/.browsers node tests/integration.mjs` },
];

let allPassed = true;

for (const suite of suites) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`  Running: ${suite.name}`);
  console.log(`${'='.repeat(60)}\n`);
  try {
    execSync(suite.cmd, { cwd: process.cwd(), stdio: 'inherit', shell: true });
    console.log(`\n  ✅ ${suite.name}: PASSED`);
  } catch {
    console.log(`\n  ❌ ${suite.name}: FAILED`);
    allPassed = false;
  }
}

console.log(`\n${'='.repeat(60)}`);
console.log(allPassed ? '  ✅ ALL TESTS PASSED' : '  ❌ SOME TESTS FAILED');
console.log(`${'='.repeat(60)}`);

process.exit(allPassed ? 0 : 1);
