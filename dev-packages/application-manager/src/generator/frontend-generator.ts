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

import { AbstractGenerator } from './abstract-generator';
import { existsSync, readFileSync } from 'fs';

export class FrontendGenerator extends AbstractGenerator {

    async generate(): Promise<void> {
        const frontendModules = this.pck.targetFrontendModules;
        await this.write(this.pck.frontend('index.html'), this.compileIndexHtml(frontendModules));
        await this.write(this.pck.frontend('index.js'), this.compileIndexJs(frontendModules));
    }

    protected compileIndexPreload(frontendModules: Map<string, string>): string {
        const template = this.pck.props.generator.config.preloadTemplate;
        if (!template) {
            return '';
        }

        // Support path to html file
        if (existsSync(template)) {
            return readFileSync(template).toString();
        }

        return template;
    }

    protected compileIndexHtml(frontendModules: Map<string, string>): string {
        const basePath = this.resolveBasePath();

        const extraStylesheets = this.normalizeStylesheetConfig(this.pck.props.frontend.config.frontEndStylesheets)
            .map(entry => this.joinAssetPath(basePath, entry));

        const stylesheetMarkup = extraStylesheets
            .filter((href): href is string => Boolean(href))
            .map(href => `  <link rel="stylesheet" href="${href}" />`)
            .join('\n');

        const stylesSection = stylesheetMarkup ? `\n${stylesheetMarkup}` : '';

        return `<!DOCTYPE html>
<html class="h-full">

<head>${this.compileIndexHead(frontendModules)}
${stylesSection}
</head>

<body class="h-full">
    ${Boolean(this.pck.props.frontend.config.webApp) === false ?
        `<div id="loop-preload" class="h-full min-h-screen">${this.compileIndexPreload(frontendModules)}</div>`
        :
        `
        <div></div>
        `
    }
</body>

</html>`;
    }

    protected resolveBasePath(): string {
        if (!this.pck.frontEndBasePath || this.pck.frontEndBasePath === '') {
            return '.';
        }
        return this.pck.frontEndBasePath;
    }

    protected joinAssetPath(basePath: string, asset: string): string {
        if (!asset) {
            return asset;
        }
        if (/^https?:\/\//i.test(asset) || asset.startsWith('//')) {
            return asset;
        }
        if (asset.startsWith('/')) {
            return asset;
        }
        const normalized = asset.replace(/^\/+/, '').replace(/^\.\/+/, '');
        if (!basePath || basePath === '.' || basePath === './') {
            return `./${normalized}`;
        }
        if (basePath === '/' || basePath === '//') {
            return `/${normalized}`;
        }
        const trimmed = basePath.replace(/\/+$/, '');
        const withLeadingSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
        return `${withLeadingSlash}/${normalized}`.replace(/\/{2,}/g, '/').replace(/\/$/, '');
    }

    protected resolveCssBundleName(bundleName: string): string | undefined {
        if (!bundleName) {
            return undefined;
        }
        const parts = bundleName.split('?');
        const file = parts[0] ?? '';
        const query = parts.length > 1 ? `?${parts.slice(1).join('?')}` : '';
        if (!file) {
            return undefined;
        }
        const normalized = file.endsWith('.js')
            ? `${file.slice(0, -3)}.css`
            : `${file}.css`;
        return `${normalized}${query}`;
    }

    protected normalizeStylesheetConfig(value: unknown): string[] {
        if (!value) {
            return [];
        }
        const entries = Array.isArray(value) ? value : [value];
        return entries
            .filter((entry): entry is string => typeof entry === 'string')
            .map(entry => entry.trim())
            .filter(entry => entry.length > 0);
    }

    protected compileIndexHead(frontendModules: Map<string, string>): string {
        return `
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width">
  `;
    }

    protected compileIndexJs(frontendModules: Map<string, string>): string {
        let basePath = '/';
        if (this.pck && this.pck.frontEndBasePath) {
            basePath = this.pck.frontEndBasePath;
        }
        let backendBasePath = '/';
        if (this.pck && this.pck.backendBasePath) {
            backendBasePath = this.pck.backendBasePath;
        }
        let googleAnalyticsMeasurementId = '';
        if (this.pck && this.pck.googleAnalyticsMeasurementId) {
            googleAnalyticsMeasurementId = this.pck.googleAnalyticsMeasurementId;
        }
        let homeUrl = '';
        if (this.pck && this.pck.homeUrl) {
            homeUrl = this.pck.homeUrl;
        }
        return `// @ts-check
${this.ifBrowser("require('es6-promise/auto');")}
require('reflect-metadata');
require('setimmediate');
const { Container } = require('inversify');

const runtimeConfig = {
    basePath: process.env.REACT_APP_BASE_PATH ?? '${basePath}',
    backendBasePath: process.env.REACT_APP_BACKEND_BASE_PATH ?? '${backendBasePath}',
    googleAnalyticsMeasurementId: process.env.REACT_APP_GOOGLE_ANALYTICS_MEASUREMENT_ID ?? '${googleAnalyticsMeasurementId}',
    homeUrl: process.env.REACT_APP_HOME_URL ?? '${homeUrl}',
};

const resolvedBasePath = runtimeConfig.basePath;
const resolvedBackendBasePath = runtimeConfig.backendBasePath;

const { setRuntimeConfig } = require('@authlance/core/lib/browser/runtime-config');
setRuntimeConfig(runtimeConfig);

function createFrontendContainer() {
    const container = new Container();
${Boolean(this.pck.props.frontend.config.webApp) === false ?
    `    const _ = require('../../lib/browser');
    const brandicon = require('../../src/assets/brandicon.svg');
    const brandLogo = require('../../src/assets/brandlogo.svg');
    const { BRAND_ICON, BRAND_LOGO, BASE_DASHBOARD_PATH } = require('@authlance/core/lib/browser');
    const { FrontendApplication } = require('@authlance/core/lib/browser/frontend-application');
    const { frontendApplicationModule } = require('@authlance/core/lib/browser/frontend-application-module');
    const { messagingFrontendModule } = require('@authlance/core/lib/browser/messaging/messaging-frontend-module');
    const { LoopContainer } = require('@authlance/core/lib/common/common');

    container.bind(BRAND_ICON).toConstantValue(brandicon);
    container.bind(BRAND_LOGO).toConstantValue(brandLogo);
    container.bind(BASE_DASHBOARD_PATH).toConstantValue(resolvedBasePath);
    container.load(frontendApplicationModule);
    container.load(messagingFrontendModule);
    container.bind(LoopContainer).toConstantValue(container);
    return { container, FrontendApplication };`
:
    `    const { FrontendApplication } = require('${this.pck.props.frontend.config.frontEndApp ? this.pck.props.frontend.config.frontEndApp : '@authlance/core/lib/browser'}');
    const { frontendApplicationModule }  = require('${this.pck.props.frontend.config.frontEndModule ? this.pck.props.frontend.config.frontEndModule : '@authlance/core/lib/browser/frontend-application-module'}');
    container.load(frontendApplicationModule);
    return { container, FrontendApplication };`
}
}

const { container, FrontendApplication } = createFrontendContainer();

const { bindContainerToStore } = require('@authlance/core/lib/browser/frontend-application');
bindContainerToStore(container);

function load(raw) {
    return Promise.resolve(raw.default).then(
        module => container.load(module)
    );
}

function start() {
    const application = container.get(FrontendApplication);
    application.container = container;
    application.start();
}

const bootstrap = Promise.resolve()${this.compileFrontendModuleImports(frontendModules)}
    .then(start).catch(reason => {
        console.error('Failed to start the frontend application.');
        if (reason) {
            console.error(reason);
        }
    });

module.exports = bootstrap;
module.exports.runtimeConfig = runtimeConfig;
module.exports.createFrontendContainer = createFrontendContainer;
module.exports.container = container;
module.exports.FrontendApplication = FrontendApplication;
module.exports.start = start;
module.exports.resolvedBasePath = resolvedBasePath;
module.exports.resolvedBackendBasePath = resolvedBackendBasePath;
`;
    }

}
