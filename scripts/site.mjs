import { spawnSync, spawn } from 'node:child_process';
import { rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const hugo = process.env.HUGO_BIN || 'hugo';
const mode = process.argv[2] || 'build';
const args = process.argv.slice(3);
function run(command, argv) {
  const result = spawnSync(command, argv, {cwd: root, stdio: 'inherit'});
  if (result.error) {
    console.error(command === hugo ? 'Install Hugo Extended 0.160.1, or set HUGO_BIN to its executable path. See README.md.' : result.error.message);
    process.exit(1);
  }
  if (result.status !== 0) process.exit(result.status || 1);
}
rmSync(resolve(root, 'public'), { recursive: true, force: true });
run(hugo, ['--minify', ...args]);
run(process.execPath, ['node_modules/pagefind/lib/runner/bin.cjs', '--site', 'public', ...(mode === 'dev' ? ['--output-path', 'static/_pagefind'] : ['--output-subdir', '_pagefind'])]);
if (mode === 'dev') {
  const child = spawn(hugo, ['server', '--bind', '127.0.0.1', '--disableFastRender', ...args], {cwd: root, stdio: 'inherit'});
  process.on('SIGINT', () => child.kill('SIGINT'));
  child.on('error', error => { console.error(error.message); process.exitCode = 1; });
  child.on('exit', code => { process.exitCode = code || 0; });
}
