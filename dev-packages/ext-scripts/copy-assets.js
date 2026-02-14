'use strict';

const fs = require('fs');
const fsp = fs.promises;
const path = require('path');

async function copyIfExists(subDir, cwd = process.cwd()) {
  const srcDir = path.resolve(cwd, 'src', subDir);
  if (!fs.existsSync(srcDir)) {
    return;
  }

  const destDir = path.resolve(cwd, 'lib', subDir);
  await fsp.mkdir(destDir, { recursive: true });
  await fsp.cp(srcDir, destDir, { recursive: true, force: true });
}

async function copyAssets(cwd = process.cwd()) {
  await Promise.all([copyIfExists('assets', cwd), copyIfExists('styles', cwd)]);
}

module.exports = copyAssets;

if (require.main === module) {
  copyAssets().catch(err => {
    console.error('copyassets failed', err);
    process.exit(1);
  });
}
