// Frees the backend's dev port before nodemon starts, in case a previous
// run's ts-node process was orphaned (a known nodemon+ts-node+Windows quirk
// where the shell wrapper gets killed but the underlying node.exe doesn't).
// Safe to run when nothing is listening — it just does nothing in that case.
require('dotenv').config();
const { execSync } = require('child_process');

const port = process.env.PORT || '4000';

function run(cmd) {
  try {
    return execSync(cmd, { stdio: ['ignore', 'pipe', 'ignore'] }).toString();
  } catch {
    return '';
  }
}

if (process.platform === 'win32') {
  const output = run(
    `powershell -NoProfile -Command "(Get-NetTCPConnection -LocalPort ${port} -State Listen -ErrorAction SilentlyContinue).OwningProcess"`,
  );
  const pids = [...new Set(output.split(/\s+/).filter((p) => /^\d+$/.test(p)))];
  for (const pid of pids) {
    run(`powershell -NoProfile -Command "Stop-Process -Id ${pid} -Force -ErrorAction SilentlyContinue"`);
    console.log(`[free-port] Killed stray process ${pid} on port ${port}`);
  }
} else {
  const output = run(`lsof -ti tcp:${port}`);
  const pids = output.split('\n').map((p) => p.trim()).filter(Boolean);
  for (const pid of pids) {
    run(`kill -9 ${pid}`);
    console.log(`[free-port] Killed stray process ${pid} on port ${port}`);
  }
}
