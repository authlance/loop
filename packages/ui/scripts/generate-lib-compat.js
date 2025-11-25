#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const LIB_ROOT = path.join(ROOT, 'lib');

function ensureCompatFiles(directory) {
    const entries = fs.readdirSync(directory, { withFileTypes: true });
    for (const entry of entries) {
        if (!entry.isDirectory()) {
            continue;
        }
        const subdir = path.join(directory, entry.name);
        const indexJs = path.join(subdir, 'index.js');
        const indexDts = path.join(subdir, 'index.d.ts');

        if (fs.existsSync(indexJs)) {
            const compatJs = path.join(directory, `${entry.name}.js`);
            const relative = `./${entry.name}/index.js`;
            const content = `module.exports = require('${relative.replace(/\\/g, '/')}');\n`;
            if (!fs.existsSync(compatJs) || fs.readFileSync(compatJs, 'utf8') !== content) {
                fs.writeFileSync(compatJs, content);
            }
        }

        if (fs.existsSync(indexDts)) {
            const compatDts = path.join(directory, `${entry.name}.d.ts`);
            const relative = `./${entry.name}/index`;
            const indexContent = fs.readFileSync(indexDts, 'utf8');
            const hasDefaultExport = /\bexport\s+default\b/.test(indexContent);
            let output = `export * from '${relative.replace(/\\/g, '/')}';\n`;
            if (hasDefaultExport) {
                output += `export { default } from '${relative.replace(/\\/g, '/')}';\n`;
            }
            if (!fs.existsSync(compatDts) || fs.readFileSync(compatDts, 'utf8') !== output) {
                fs.writeFileSync(compatDts, output);
            }
        }

        ensureCompatFiles(subdir);
    }
}

function buildLucideCompat() {
    const compatDir = path.join(LIB_ROOT, '_compat');
    if (!fs.existsSync(compatDir)) {
        fs.mkdirSync(compatDir, { recursive: true });
    }
    const pkgPath = require.resolve('lucide-react/package.json', { paths: [ROOT] });
    const lucideSource = path.join(path.dirname(pkgPath), 'dist', 'umd', 'lucide-react.js');
    const outfile = path.join(compatDir, 'lucide-react.cjs');
    const content = fs.readFileSync(lucideSource, 'utf8');
    fs.writeFileSync(outfile, content);
    const dtsPath = path.join(compatDir, 'lucide-react.d.ts');
    fs.writeFileSync(dtsPath, "export * from 'lucide-react';\n");
}

function main() {
    if (fs.existsSync(LIB_ROOT)) {
        ensureCompatFiles(LIB_ROOT);
        buildLucideCompat();
    }
}

try {
    main();
} catch (err) {
    console.error('Failed to generate UI compatibility files.', err);
    process.exit(1);
}
