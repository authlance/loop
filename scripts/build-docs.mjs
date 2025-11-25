#!/usr/bin/env node
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs/promises'
import { compile } from '@mdx-js/mdx'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '..')
const docsRoot = path.join(repoRoot, 'docs')
const outputRoot = path.join(repoRoot, 'packages/saas/lib/docs')

async function main() {
    const entries = await collectDocs(docsRoot)
    await Promise.all(
        entries.map(async (docPath) => {
            const relative = path.relative(docsRoot, docPath)
            const target = path.join(outputRoot, relative.replace(/\.mdx$/, '.js'))
            const source = await fs.readFile(docPath, 'utf8')
            const compiled = await compile(source, {
                development: false,
                providerImportSource: '@mdx-js/react',
                outputFormat: 'function-body',
            })
const wrapped = wrapAsCommonJs(String(compiled), docPath)
            await fs.mkdir(path.dirname(target), { recursive: true })
            await fs.writeFile(target, wrapped, 'utf8')
        })
    )
    console.info(`[build-docs] Compiled ${entries.length} MDX files into ${outputRoot}`)
}

async function collectDocs(root) {
    const result = []
    async function walk(dir) {
        const children = await fs.readdir(dir, { withFileTypes: true })
        for (const entry of children) {
            const fullPath = path.join(dir, entry.name)
            if (entry.isDirectory()) {
                await walk(fullPath)
                continue
            }
            if (entry.isFile() && entry.name.endsWith('.mdx')) {
                result.push(fullPath)
            }
        }
    }
    await walk(root)
    return result
}

function wrapAsCommonJs(compiledSource, originalPath) {
    const banner = `// Generated from ${path.relative(repoRoot, originalPath)}`
    return `${banner}
const React = require('react');
function mdx(type, props) {
    const args = Array.prototype.slice.call(arguments, 2);
    return React.createElement.apply(React, [type, props, ...args]);
}
function useMDXComponents(components) {
    return components || {};
}
const __mdxFactory = function () {
${compiledSource}
};
module.exports = __mdxFactory.call(null, {
    jsx: mdx,
    jsxs: mdx,
    Fragment: React.Fragment,
    useMDXComponents,
});
`
}

main().catch((error) => {
    console.error('[build-docs] Failed to compile docs', error)
    process.exitCode = 1
})
