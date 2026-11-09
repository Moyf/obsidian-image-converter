import { execFile } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { setTimeout as delay } from 'node:timers/promises';

const execFileAsync = promisify(execFile);
const manifest = JSON.parse(readFileSync(new URL('../manifest.json', import.meta.url), 'utf8'));
const settleMs = Number(process.env.RELOAD_SETTLE_MS ?? 2000);
const command = process.env.OBSIDIAN_CLI ?? (process.platform === 'win32' ? 'obsidian.com' : 'obsidian');
const tempRoot = join(tmpdir(), 'opencode');
mkdirSync(tempRoot, { recursive: true });
const tempDirectory = mkdtempSync(join(tempRoot, 'image-converter-settings-'));
const scriptPath = join(tempDirectory, 'open.js');
const successMarker = 'image-converter-settings-open';
writeFileSync(scriptPath, `
(async () => {
  const id = ${JSON.stringify(manifest.id)};
  if (!app.plugins.plugins[id]) throw new Error('Plugin is not loaded: ' + id);
  await app.plugins.unloadPlugin(id);
  await app.plugins.loadPlugin(id);
  const tab = app.setting.pluginTabs.find(item => item.id === id);
  app.setting.open();
  app.setting.openTabById(id);
  await new Promise(resolve => window.setTimeout(resolve, 300));
  if (app.setting.activeTab?.id !== id || !tab?.containerEl.isConnected) {
    throw new Error('Could not open plugin settings: ' + id);
  }
  return ${JSON.stringify(successMarker)};
})()
`, 'utf8');
const loader = `eval(require('fs').readFileSync(${JSON.stringify(scriptPath.replace(/\\/g, '/'))},'utf8'))`;

try {
  for (let attempt = 1; attempt <= 3; attempt++) {
    await delay(settleMs);
    try {
      const { stdout, stderr } = await execFileAsync(command, ['eval', `code=${loader}`], { timeout: 20000, windowsHide: true });
      if (!stdout.includes(successMarker)) throw new Error(stderr || stdout || 'No success marker from Obsidian CLI.');
      console.log(`Opened ${manifest.id} settings in Obsidian.`);
      break;
    } catch (error) {
      if (attempt === 3) throw error;
    }
  }
} finally {
  rmSync(tempDirectory, { recursive: true, force: true });
}
