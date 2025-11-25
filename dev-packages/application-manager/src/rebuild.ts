import fs = require('fs-extra');
import path = require('path');

export function rebuild(target: 'browser', modules: string[]): void {
    const nodeModulesPath = path.join(process.cwd(), 'node_modules');
    const browserModulesPath = path.join(process.cwd(), '.browser_modules');

    if (target === 'browser' && fs.existsSync(browserModulesPath)) {
        for (const moduleName of collectModulePaths(browserModulesPath)) {
            console.log('Reverting ' + moduleName);
            const src = path.join(browserModulesPath, moduleName);
            const dest = path.join(nodeModulesPath, moduleName);
            fs.removeSync(dest);
            fs.copySync(src, dest);
        }
        fs.removeSync(browserModulesPath);
    } else {
        console.log('native node modules are already rebuilt for ' + target);
    }
}

function collectModulePaths(root: string): string[] {
    const moduleRelativePaths: string[] = [];
    for (const dirName of fs.readdirSync(root)) {
        if (fs.existsSync(path.join(root, dirName, 'package.json'))) {
            moduleRelativePaths.push(dirName);
        } else if (fs.lstatSync(path.join(root, dirName)).isDirectory()) {
            moduleRelativePaths.push(...collectModulePaths(path.join(root, dirName)).map(p => path.join(dirName, p)));
        }
    }
    return moduleRelativePaths;
}
