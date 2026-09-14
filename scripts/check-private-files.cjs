const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const { parseEnv } = require('node:util');

// Compare the configured value in memory; never log it or a matching line.
const secret = parseEnv(fs.readFileSync('.dev.vars', 'utf8')).PUBLIC_DATA_API_KEY;
assert.ok(secret && secret.length > 12, 'Local secret must exist');
const candidates = [secret];
try { candidates.push(decodeURIComponent(secret)); } catch {}
const tracked = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' }).split('\0').filter(Boolean);
assert.ok(!tracked.some(f => /(^|\/)\.(env($|\.)|dev\.vars($|\.))/.test(f) && !f.endsWith('.example')), 'Sensitive environment file tracked');
const pending = execFileSync('git', ['ls-files', '--others', '--exclude-standard', '-z', '--', 'app', 'workers', 'scripts', 'docs', 'public'], { encoding: 'utf8' }).split('\0').filter(Boolean);
function files(dir) { return fs.existsSync(dir) ? fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? files(path.join(dir, e.name)) : [path.join(dir, e.name)]) : []; }
const build = files('build');
assert.ok(!build.some(f => /[\\/]\.(dev\.vars|env)([.]|$)/.test(f)), 'Private file in build output');
let checked = 0;
for (const file of new Set([...tracked, ...pending, ...build])) {
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) continue;
  const bytes = fs.readFileSync(file);
  assert.ok(!candidates.some(value => bytes.includes(Buffer.from(value))), `Secret value found in ${file}`);
  checked++;
}
console.log(JSON.stringify({ secretNotTrackedOrBundled: 'PASS', filesChecked: checked }));
