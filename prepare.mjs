import { spawnSync } from 'node:child_process';
import { cpSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.dirname(fileURLToPath(import.meta.url));
const addonDir = path.join(repoRoot, 'ember-select');
const require = createRequire(path.join(addonDir, 'package.json'));
const rollupDir = path.dirname(require.resolve('rollup/package.json'));
const rollupBin = path.join(rollupDir, 'dist', 'bin', 'rollup');

const build = spawnSync(process.execPath, [rollupBin, '--config'], {
  cwd: addonDir,
  stdio: 'inherit',
});

if (build.error) {
  console.error(build.error);
  process.exit(1);
}

if (build.status !== 0) {
  process.exit(build.status ?? 1);
}

// npm installs this git repo from a cache checkout named git-clone*.
// Embroider needs the published package root to be the addon itself.
// pnpm in the real checkout keeps the workspace layout.
const packedForNpm = repoRoot.includes(`${path.sep}git-clone`);
if (!packedForNpm) {
  process.exit(0);
}

const addonPkg = JSON.parse(readFileSync(path.join(addonDir, 'package.json'), 'utf8'));
delete addonPkg.packageManager;
delete addonPkg.volta;
delete addonPkg.scripts;

const rootDist = path.join(repoRoot, 'dist');
const rootMain = path.join(repoRoot, 'addon-main.cjs');
rmSync(rootDist, { recursive: true, force: true });
cpSync(path.join(addonDir, 'dist'), rootDist, { recursive: true });
cpSync(path.join(addonDir, 'addon-main.cjs'), rootMain);
writeFileSync(path.join(repoRoot, 'package.json'), `${JSON.stringify(addonPkg, null, 2)}\n`);
