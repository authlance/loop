import { AbstractGenerator } from './abstract-generator';

export class PrerendererGenerator extends AbstractGenerator {

    async generate(): Promise<void> {
        const frontendModules = this.pck.targetFrontendModules;
        await this.write(this.pck.prerenderer('worker.js'), this.compileWorker(frontendModules));
        await this.write(this.pck.prerenderer('main.js'), this.compileMain());
    }

    protected compileWorker(frontendModules: Map<string, string>): string {
        const basePath = this.pck.frontEndBasePath || '/';
return `// @ts-check
require('reflect-metadata');
const { Container } = require('inversify');
const { backendApplicationModule } = require('@authlance/core/lib/node/backend-module');
const { backendPrerendererModule } = require('@authlance/core/lib/node/backend-prerenderer-module');
const { CliManager } = require('@authlance/core/lib/node/cli');
const { BackendPrerenderApplication } = require('@authlance/core/lib/node/backend-prerender-application');
const { frontendPrerenderedModule } = require('@authlance/core/lib/browser/frontend-prerenderer-module');
const { LoopContainer } = require('@authlance/core/lib/common/common');
const { BRAND_ICON, BRAND_LOGO, BASE_DASHBOARD_PATH } = require('@authlance/core/lib/browser/branding');
const React = require('react');
const fs = require('fs');

require.extensions['.svg'] = require.extensions['.svg'] || function(module, filename) {
    const svg = fs.readFileSync(filename, 'utf8');
    module.exports = 'data:image/svg+xml;base64,' + Buffer.from(svg, 'utf8').toString('base64');
};

const Module = require('module');
const path = require('path');
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
container.load(backendPrerendererModule);
container.load(frontendPrerenderedModule);
container.bind(LoopContainer).toConstantValue(container);

let brandIconValue;
let brandLogoValue;
try {
    brandIconValue = require('../../src/assets/brandicon.svg');
} catch (error) {
    brandIconValue = undefined;
}
try {
    brandLogoValue = require('../../src/assets/brandlogo.svg');
} catch (error) {
    brandLogoValue = undefined;
}

const resolvedBasePath = process.env.REACT_APP_BASE_PATH ?? '${basePath}';

container.bind(BRAND_ICON).toConstantValue(brandIconValue);
container.bind(BRAND_LOGO).toConstantValue(brandLogoValue);
container.bind(BASE_DASHBOARD_PATH).toConstantValue(resolvedBasePath);

function load(raw) {
    return Promise.resolve(raw.default).then(
        module => container.load(module)
    );
}

async function start() {
    const cliManager = container.get(CliManager);
    await cliManager.initializeCli(process.argv);
    const application = container.get(BackendPrerenderApplication);
    await application.preRender();
    return application.start();
}

module.exports = () => Promise.resolve()${this.compileModuleImports(frontendModules, 'require')}
    .then(() => start()).catch(reason => {
        console.error('Failed to run the prerender application.');
        if (reason) {
            console.error(reason);
        }
        throw reason;
    });`;
    }

    protected compileMain(): string {
        return `// @ts-check
const { BackendApplicationConfigProvider } = require('@authlance/core/lib/node/backend-application-config-provider');
BackendApplicationConfigProvider.set(${this.prettyStringify(this.pck.props.backend.config)});

const run = require('./worker');

module.exports = run();
`;
    }
}
