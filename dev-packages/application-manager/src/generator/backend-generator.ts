/********************************************************************************
 * Copyright (C) 2017 TypeFox and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * This Source Code may also be made available under the following Secondary
 * Licenses when the conditions for such availability set forth in the Eclipse
 * Public License v. 2.0 are satisfied: GNU General Public License, version 2
 * with the GNU Classpath Exception which is available at
 * https://www.gnu.org/software/classpath/license.html.
 *
 * SPDX-License-Identifier: EPL-2.0 OR GPL-2.0 WITH Classpath-exception-2.0
 ********************************************************************************/

import * as os from 'os';
import { AbstractGenerator } from './abstract-generator';

export class BackendGenerator extends AbstractGenerator {

    async generate(): Promise<void> {
        const backendModules = this.pck.targetBackendModules;
        const frontendModules = this.pck.targetFrontendModules;
        await this.write(this.pck.backend('server.js'), this.compileServer(backendModules, frontendModules));
        await this.write(this.pck.backend('main.js'), this.compileMain(backendModules));
    }

    protected compileServer(backendModules: Map<string, string>, frontendModules: Map<string, string>): string {
        let basePath = '/';
        if (this.pck && this.pck.frontEndBasePath) {
            basePath = this.pck.frontEndBasePath;
        }
        const docsBasePath = this.pck.docsBasePath;
        const docsRegistration = docsBasePath !== undefined ? `
if (typeof globalThis.__docs_require__ !== 'function') {
    globalThis.__docs_require__ = require;
}
const repoRoot = path.join(__dirname, '../../../..');
registerDocs({
    docsDir: path.join(repoRoot, 'docs'),
    compiledDir: path.join(repoRoot, '${docsBasePath}'),
});

function registerDocs(options = {}) {
    if (Module.__loopDocsPatched) {
        return;
    }
    const docsDir = options.docsDir ?? path.join(repoRoot, 'docs');
    const compiledDir = options.compiledDir ?? path.join(repoRoot, '${docsBasePath}');
    const originalResolveFilename = Module._resolveFilename;

    Module._resolveFilename = function patchedResolve(request, parent, isMain, resolveOptions) {
        if (typeof request === 'string' && request.startsWith('@docs/')) {
            return mapDocRequest(request, docsDir, compiledDir);
        }
        return originalResolveFilename.call(this, request, parent, isMain, resolveOptions);
    };

    Module.__loopDocsPatched = true;
}

function mapDocRequest(request, docsDir, compiledDir) {
    const relativeDocPath = request.slice('@docs/'.length);
    const compiledPath = path.join(compiledDir, relativeDocPath).replace(/\\.mdx$/, '.js');
    if (fs.existsSync(compiledPath)) {
        return compiledPath;
    }

    const sourcePath = path.join(docsDir, relativeDocPath);
    if (!fs.existsSync(sourcePath)) {
        throw new Error('[docs] Unable to resolve MDX module "' + request + '". Looked in ' + sourcePath + '.');
    }

    throw new Error(
        '[docs] Compiled output not found for "' + request + '". Expected ' + compiledPath + '. ' +
            'Run "yarn --cwd packages/saas build" or "node scripts/build-docs.mjs" to regenerate documentation bundles.'
    );
}
` : '';
        return `// @ts-check
require('reflect-metadata');
const path = require('path');
const express = require('express');
const React = require('react');
const { Container } = require('inversify');
const fs = require('fs');

require.extensions['.svg'] = require.extensions['.svg'] || function(module, filename) {
    const svg = fs.readFileSync(filename, 'utf8');
    module.exports = 'data:image/svg+xml;base64,' + Buffer.from(svg, 'utf8').toString('base64');
};

const brandicon = require('../../src/assets/brandicon.svg');
const brandLogo = require('../../src/assets/brandlogo.svg');
const { backendApplicationModule } = require('@authlance/core/lib/node/backend-module');
const { messagingBackendModule } = require('@authlance/core/lib/node/messaging/messaging-backend-module');
const { CliManager } = require('@authlance/core/lib/node/cli');
const { BackendApplication } = require('@authlance/core/lib/node/backend-application');
const { LoopContainer } = require('@authlance/core/lib/common/common');
const { ServerRenderContainer } = require('@authlance/core/lib/node/html-renderer');
const { MutableServerRenderContainerProvider } = require('@authlance/core/lib/node/server-render-container-provider');
const { BRAND_ICON, BRAND_LOGO, BASE_DASHBOARD_PATH } = require('@authlance/core/lib/browser/branding');
const WebSocket = require('ws');
const Module = require('module');
${docsRegistration}
const lucideCompatPath = (() => {
    const searchPaths = Module._nodeModulePaths(__dirname);
    for (const base of searchPaths) {
        const candidate = path.join(base, '@authlance/ui/lib/_compat/lucide-react.cjs');
        if (fs.existsSync(candidate)) {
            return candidate;
        }
    }
    return undefined;
})();

const turnstileStub = (() => {
    const Turnstile = React.forwardRef(function TurnstileStub(props, ref) {
        return React.createElement('div', Object.assign({ ref, 'data-turnstile-stub': true }, props));
    });
    Turnstile.displayName = 'TurnstileStub';
    return {
        __esModule: true,
        default: Turnstile,
        Turnstile,
    };
})();

if (!Module.__loopLucidePatched && lucideCompatPath) {
    const originalLoad = Module._load;
    Module._load = function patchedLoad(request) {
        if (request === 'lucide-react') {
            return originalLoad.call(this, lucideCompatPath, arguments[1], arguments[2]);
        }
        return originalLoad.apply(this, arguments);
    };
    Module.__loopLucidePatched = true;
}
if (!Module.__loopTurnstilePatched) {
    const originalLoad = Module._load;
    Module._load = function patchedTurnstile(request) {
        if (request === '@marsidev/react-turnstile') {
            return turnstileStub;
        }
        return originalLoad.apply(this, arguments);
    };
    Module.__loopTurnstilePatched = true;
}

const container = new Container();
container.load(backendApplicationModule);
container.load(messagingBackendModule);
container.bind(BRAND_ICON).toConstantValue(brandicon);
container.bind(BRAND_LOGO).toConstantValue(brandLogo);
container.bind(BASE_DASHBOARD_PATH).toConstantValue('${basePath}');
container.bind(LoopContainer).toConstantValue(container);

const renderContainerProvider = new MutableServerRenderContainerProvider();
container.bind(ServerRenderContainer).toConstantValue(renderContainerProvider);

const frontendModulePaths = new Set();

renderContainerProvider.setContainer(createRenderContainer());
setupWebpackDevServerSync();

function load(raw) {
    return Promise.resolve(raw.default).then(
        module => container.load(module)
    );
}

function loadChild(raw, moduleId) {
    if (moduleId) {
        frontendModulePaths.add(moduleId);
    }
    const moduleOrFactory = raw && raw.default ? raw.default : raw;
    return Promise.resolve(moduleOrFactory).then(
        module => renderContainerProvider.getContainer().load(module)
    );
}

function createRenderContainer() {
    const child = container.createChild();
    const { backendPrerendererModule } = require('@authlance/core/lib/node/backend-prerenderer-module');
    const { frontendPrerenderedModule } = require('@authlance/core/lib/browser/frontend-prerenderer-module');
    child.load(backendPrerendererModule);
    child.load(frontendPrerenderedModule);
    child.bind(BRAND_ICON).toConstantValue(brandicon);
    child.bind(BRAND_LOGO).toConstantValue(brandLogo);
    child.bind(BASE_DASHBOARD_PATH).toConstantValue('${basePath}');
    child.bind(LoopContainer).toConstantValue(child);
    loadFrontendModules(child);
    return child;
}

function loadFrontendModules(target) {
    frontendModulePaths.forEach(modulePath => {
        try {
            const required = require(modulePath);
            const moduleOrFactory = required && required.default ? required.default : required;
            target.load(moduleOrFactory);
        } catch (error) {
            console.error('[SSR] Failed to load frontend module for SSR', modulePath, error);
        }
    });
}

const SSR_CACHE_PATTERN = new RegExp(path.sep + 'lib' + path.sep + '(browser|node)' + path.sep);
const PACKAGES_SEGMENT = path.sep + 'packages' + path.sep;
const EXAMPLES_SEGMENT = path.sep + 'examples' + path.sep;
let reloadInProgress = false;
let pendingReloadReason = undefined;

function clearRenderModuleCache() {
    Object.keys(require.cache).forEach(key => {
        if ((key.includes(PACKAGES_SEGMENT) || key.includes(EXAMPLES_SEGMENT)) && SSR_CACHE_PATTERN.test(key)) {
            delete require.cache[key];
        }
    });
}

function resetRenderContainer(reason) {
    if (reloadInProgress) {
        pendingReloadReason = reason || pendingReloadReason;
        return;
    }
    reloadInProgress = true;
    try {
        clearRenderModuleCache();
        const nextContainer = createRenderContainer();
        renderContainerProvider.setContainer(nextContainer);
        if (reason) {
            console.info('[SSR] Reloaded server render container (' + reason + ')');
        } else {
            console.info('[SSR] Reloaded server render container');
        }
    } catch (error) {
        console.error('[SSR] Failed to reload server render container', error);
    } finally {
        reloadInProgress = false;
        if (pendingReloadReason) {
            const followUpReason = pendingReloadReason;
            pendingReloadReason = undefined;
            resetRenderContainer(followUpReason);
        }
    }
}

function setupWebpackDevServerSync() {
    if (process.env.DEV_PROXY_WEBPACK !== 'true') {
        return;
    }
    const devServerUrl = process.env.WEBPACK_DEV_SERVER_URL || 'http://localhost:3002';
    const wsUrl = resolveDevServerWebSocketUrl(devServerUrl);
    let lastHash = undefined;
    let appliedHash = undefined;
    let reconnectDelay = 1000;

    function connect() {
        const socket = new WebSocket(wsUrl, {
            headers: {
                Origin: devServerUrl,
            },
        });

        socket.on('open', () => {
            reconnectDelay = 1000;
            console.info('[SSR] Connected to webpack dev server updates');
        });

        socket.on('message', (data) => {
            let payload;
            try {
                const text = typeof data === 'string' ? data : data.toString();
                payload = JSON.parse(text);
            } catch (_error) {
                return;
            }
            if (!payload || typeof payload.type !== 'string') {
                return;
            }
            switch (payload.type) {
                case 'hash':
                    lastHash = payload.data;
                    break;
                case 'ok':
                case 'still-ok':
                case 'content-changed':
                case 'warnings':
                    if (lastHash && lastHash !== appliedHash) {
                        appliedHash = lastHash;
                        resetRenderContainer('webpack compile');
                    }
                    break;
                case 'errors':
                    console.warn('[SSR] webpack dev server reported build errors; skipping SSR reload');
                    break;
                default:
                    break;
            }
        });

        socket.on('close', () => {
            console.warn('[SSR] Disconnected from webpack dev server, attempting to reconnect...');
            setTimeout(connect, reconnectDelay);
            reconnectDelay = Math.min(reconnectDelay * 2, 10000);
        });

        socket.on('error', (error) => {
            console.warn('[SSR] Webpack dev server socket error', error && error.message ? error.message : error);
            socket.close();
        });
    }

    connect();
}

function resolveDevServerWebSocketUrl(baseUrl) {
    try {
        const url = new URL(baseUrl);
        url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
        const trimmedPath = url.pathname.replace(/[/]+$/, '');
        url.pathname = trimmedPath + '/ws';
        url.search = '';
        return url.toString();
    } catch (_error) {
        return baseUrl.replace(/^http/, 'ws').replace(/[/]+$/, '') + '/ws';
    }
}

function start() {
    const cliManager = container.get(CliManager);
    return cliManager.initializeCli(process.argv).then(function () {
        const application = container.get(BackendApplication);
        application.use(express.static(path.join(__dirname, '../../lib')));
        application.use(express.static(path.join(__dirname, '../../lib/index.html')));
        application.setStaticFilesPath(path.resolve(path.join(__dirname, '../../lib')));
        return application.start();
    });
}

module.exports = () => Promise.resolve()${this.compileBackendModuleImports(backendModules)}${this.compileFrontendChildModuleImports(frontendModules)}
    .then(() => start()).catch(reason => {
        console.error('Failed to start the backend application.');
        if (reason) {
            console.error(reason);
        }
        throw reason;
    });`;
    }

    protected compileFrontendChildModuleImports(frontendModules: Map<string, string>): string {
        if (frontendModules.size === 0) {
            return '';
        }
        const lines = Array.from(frontendModules.values()).map(modulePath =>
            `    .then(function () { return Promise.resolve(require('${modulePath}')).then(function (raw) { return loadChild(raw, '${modulePath}'); }) })`
        );
        return os.EOL + lines.join(os.EOL);
    }

    protected compileMain(backendModules: Map<string, string>): string {
        return `// @ts-check
const { BackendApplicationConfigProvider } = require('@authlance/core/lib/node/backend-application-config-provider');
const main = require('@authlance/core/lib/node/main');
BackendApplicationConfigProvider.set(${this.prettyStringify(this.pck.props.backend.config)});

const serverModule = require('./server');
const address = main.start(serverModule());
address.then(function (address) {
    if (process && process.send) {
        process.send(address.port.toString());
    }
});
module.exports = address;
`;
    }

}
