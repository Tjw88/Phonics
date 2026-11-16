import { BANK } from '../src/engine/data';
import { lintBank } from '../src/engine/linter';

const issues = lintBank();
console.log(`${BANK.length} words, ${BANK.filter((w) => w.oralOnly).length} oral-only`);
if (issues.length) {
  for (const i of issues) console.log(`  ✗ ${i.word}: ${i.kind} - ${i.detail}`);
  process.exit(1);
}
console.log('content lint: OK');
