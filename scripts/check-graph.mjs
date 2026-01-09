// Runs isobar 0.7.1 on this repository and asserts the fixture invariants.
// Usage: node scripts/check-graph.mjs [main|regression]   exit 0 all ok, 1 a check failed, 2 bad usage, 3 isobar failed
// Each check compares actual(graph) with expected as JSON, so the checks themselves need no branches.
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const INVOICE = 'server/services/invoiceService.ts';
const ORDER = 'server/services/orderService.ts';
const SHIPMENT = 'server/services/shipmentService.ts';
const REPORTS = 'client/services/reportsApi.ts';
const RULES = ['layer:hook>service', 'layer:route>service', 'name:hook-prefix', 'name:service', 'name:component', 'exports:service', 'exports:hook', 'tests:place'];
const LABELS = { true: 'ok  ', false: 'FAIL' };

const fn = (g, file, name) => g.files[file].functions.find((f) => f.name === name);
const pattern = (g, id) => g.conventions.patterns.find((p) => p.id === id);
const profile = (f) => [f.over, f.cognitive, f.cyclomatic, f.time];

const CHECKS = {
  main: [
    { name: 'no security warnings', actual: (g) => g.security.warnings.length, expected: 0 },
    { name: 'no import cycles', actual: (g) => g.cycles.length, expected: 0 },
    { name: '10 routes', actual: (g) => g.http.routes.length, expected: 10 },
    { name: 'at least 8 calls matched to a route', actual: (g) => g.http.matched >= 8, expected: true },
    { name: `hotspot #1 is ${INVOICE} with >= 8 commits`, actual: (g) => [g.hotspots[0].file, g.hotspots[0].commits >= 8], expected: [INVOICE, true] },
    { name: `no test imports ${INVOICE}`, actual: (g) => g.files[INVOICE].imported_by.filter((f) => g.files[f].kind === 'test'), expected: [] },
    ...RULES.map((id) => ({ name: `${id} is a rule`, actual: (g) => pattern(g, id).strength, expected: 'rule' })),
    { name: 'layer:hook>service covers 12 imports', actual: (g) => pattern(g, 'layer:hook>service').total, expected: 12 },
    { name: 'no pattern has exceptions', actual: (g) => g.conventions.patterns.flatMap((p) => p.exceptions), expected: [] },
    { name: 'estimateDelivery is over cognitive and cyclomatic', actual: (g) => fn(g, SHIPMENT, 'estimateDelivery').over, expected: ['cognitive', 'cyclomatic'] },
    { name: 'summarizeOrders is listed within every limit: cognitive 1, cyclomatic 2, O(n)', actual: (g) => profile(fn(g, ORDER, 'summarizeOrders')), expected: [undefined, 1, 2, 'O(n)'] },
  ],
  regression: [
    { name: 'exactly one serious security warning, in server/routes/orders.ts', actual: (g) => g.security.warnings.filter((w) => w.level === 'serious').map((w) => w.file), expected: ['server/routes/orders.ts'] },
    { name: `${REPORTS} calls GET /api/orders/export with no route`, actual: (g) => g.files[REPORTS].calls.filter((c) => c.path === '/api/orders/export').map((c) => [c.method, c.target]), expected: [['GET', undefined]] },
    { name: `layer:hook>service is a rule whose only exception is ${REPORTS}`, actual: (g) => [pattern(g, 'layer:hook>service').strength, pattern(g, 'layer:hook>service').exceptions], expected: ['rule', [REPORTS]] },
    { name: 'summarizeOrders is over cognitive', actual: (g) => fn(g, ORDER, 'summarizeOrders').over.includes('cognitive'), expected: true },
    { name: 'summarizeOrders runs in O(n·m) with a scan-in-loop issue', actual: (g) => [fn(g, ORDER, 'summarizeOrders').time, fn(g, ORDER, 'summarizeOrders').refactor.some((r) => r.kind === 'scan-in-loop')], expected: ['O(n·m)', true] },
    { name: 'estimateDelivery is listed within every limit', actual: (g) => fn(g, SHIPMENT, 'estimateDelivery').over, expected: undefined },
    { name: `hotspot #1 is still ${INVOICE}`, actual: (g) => g.hotspots[0].file, expected: INVOICE },
  ],
};

// A missing file, function or pattern throws inside actual(), and that check reports FAIL.
function passes(check, graph) {
  try {
    return JSON.stringify(check.actual(graph)) === JSON.stringify(check.expected);
  } catch {
    return false;
  }
}

function report(check, graph) {
  const ok = passes(check, graph);
  console.log(`${LABELS[ok]} ${check.name}`);
  return ok;
}

const [mode = 'main'] = process.argv.slice(2);
if (!Object.hasOwn(CHECKS, mode)) {
  console.error('usage: node scripts/check-graph.mjs [main|regression]');
  process.exit(2);
}
const out = mkdtempSync(join(tmpdir(), 'check-graph-'));
const root = fileURLToPath(new URL('..', import.meta.url));
const isobar = spawnSync('npx', ['-y', 'isobar@0.7.1', '.', '--format', 'json', '-q', '-o', join(out, 'graph.json')], { cwd: root, stdio: 'inherit' });
if (isobar.status !== 0) {
  console.error(`isobar exited with ${isobar.status}`);
  process.exit(3);
}
const graph = JSON.parse(readFileSync(join(out, 'graph.json'), 'utf8'));
rmSync(out, { recursive: true, force: true });
const results = CHECKS[mode].map((check) => report(check, graph));
const failed = results.filter((ok) => !ok).length;
console.log(`${mode}: ${results.length - failed}/${results.length} checks ok`);
process.exit(Math.min(failed, 1));
