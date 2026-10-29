#!/usr/bin/env node
/*
 * Builds browser-specific packages from extension/ (no dependencies):
 *   dist/chrome/  + dist/unsnitch-chrome.zip   (background.service_worker)
 *   dist/firefox/ + dist/unsnitch-firefox.zip  (background.scripts)
 * The manifest version is synced from package.json.
 * Requires the `zip` CLI (preinstalled on macOS and most Linux distros).
 */
import { cpSync, existsSync, readFileSync, rmSync, writeFileSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'extension');
const dist = join(root, 'dist');
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const base = JSON.parse(readFileSync(join(src, 'manifest.json'), 'utf8'));

const targets = {
  chrome(m) {
    m.background = { service_worker: base.background.service_worker };
    delete m.browser_specific_settings; // Chrome warns about unknown keys
  },
  firefox(m) {
    m.background = { scripts: base.background.scripts };
  },
};

for (const icon of new Set(Object.values(base.icons || {}))) {
  if (!existsSync(join(src, icon))) console.warn(`warning: missing ${icon}`);
}

mkdirSync(dist, { recursive: true });
for (const [name, transform] of Object.entries(targets)) {
  const out = join(dist, name);
  const zip = join(dist, `unsnitch-${name}.zip`);
  rmSync(out, { recursive: true, force: true });
  rmSync(zip, { force: true });

  cpSync(src, out, { recursive: true, filter: (p) => !p.endsWith('.DS_Store') });
  const manifest = structuredClone(base);
  manifest.version = pkg.version;
  transform(manifest);
  writeFileSync(join(out, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');

  execFileSync('zip', ['-q', '-r', '-X', zip, '.'], { cwd: out, stdio: 'inherit' });
  console.log(`built ${zip.slice(root.length + 1)}`);
}
