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

import * as paths from 'path';
import { AbstractGenerator } from './abstract-generator';

export class WebpackGenerator extends AbstractGenerator {

    async generate(): Promise<void> {
        await this.write(this.configPath, this.compileWebpackConfig());
    }

    get configPath(): string {
        return this.pck.path('webpack.config.js');
    }

    protected resolve(moduleName: string, path: string): string {
        return this.pck.resolveModulePath(moduleName, path).split(paths.sep).join('/');
    }

    protected compileWebpackConfig(): string {
        const bundleFileName = this.pck.props.frontend.config.bundleName ? this.pck.props.frontend.config.bundleName : 'bundle.js';
        return `// @ts-check
const path = require('path');
const webpack = require('webpack');
const yargs = require('yargs');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CircularDependencyPlugin = require('circular-dependency-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const DotenvWebpackPlugin = require('dotenv-webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

const outputPath = path.resolve(__dirname, 'lib');
const { mode, staticCompression }  = yargs.option('mode', {
    description: "Mode to use",
    choices: ["development", "production"],
    default: "production"
}).option('static-compression', {
    description: 'Controls whether to enable compression of static artifacts.',
    type: 'boolean',
    default: true
}).argv;
const bundleName = ${JSON.stringify(bundleFileName)};
const cssFileName = (() => {
    const parts = bundleName.split('?');
    const file = parts[0];
    const query = parts[1] ? \`?\${parts.slice(1).join('?')}\` : '';
    if (!file) {
        return \`bundle.css\${query}\`;
    }
    const normalized = file.endsWith('.js')
        ? \`\${file.slice(0, -3)}.css\`
        : \`\${file}.css\`;
    return \`\${normalized}\${query}\`;
})();

const plugins = [
    new webpack.ProvidePlugin({
        // the Buffer class doesn't exist in the browser but some dependencies rely on it
        Buffer: ['buffer', 'Buffer'],
    }),
    new DotenvWebpackPlugin({
      path: './.env',
    }),
    // new BundleAnalyzerPlugin(),
];
// it should go after copy-plugin in order to compress monaco as well
if (staticCompression) {
    plugins.push(new CompressionPlugin());
}
plugins.push(new CircularDependencyPlugin({
    exclude: /(node_modules|examples)\\/./,
    failOnError: false // https://github.com/nodejs/readable-stream/issues/280#issuecomment-297076462
}));
plugins.push(new MiniCssExtractPlugin({
    filename: cssFileName,
    chunkFilename: '[name].[contenthash:8].css',
}));

module.exports = {
    mode,
    plugins,
    devtool: 'source-map',
    entry: path.resolve(__dirname, 'src-gen/frontend/index.js'),
    output: {
        filename: bundleName,
        path: outputPath,
        devtoolModuleFilenameTemplate: 'webpack:///[resource-path]?[loaders]'
    },
    devServer: {
        static: outputPath,
        allowedHosts: 'all',
        port: 3002,
        hot: true,
        historyApiFallback: true, // for SPA routing
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        client: {
            webSocketURL: 'auto://0.0.0.0:0/ws'
        }
    },
    target: 'web',
    cache: staticCompression,
    module: {
        rules: [
            {
                test: /\\.mdx?$/,
                use: [
                    {
                        loader: '@mdx-js/loader',
                        options: {
                            providerImportSource: '@mdx-js/react',
                        }
                    }
                ]
            },
            {
                test: /\\.css$/,
                exclude: /materialcolors\\.css$|\\.useable\\.css$/,
                use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader']
            },
            {
                test: /materialcolors\\.css$|\\.useable\\.css$/,
                use: [
                    {
                        loader: 'style-loader',
                        options: {
                            esModule: false,
                            injectType: 'lazySingletonStyleTag',
                            attributes: {
                                id: 'theia-theme'
                            }
                        }
                    },
                    'css-loader'
                ]
            },
            {
                test: /\\.(ttf|eot|svg)(\\?v=\\d+\\.\\d+\\.\\d+)?$/,
                type: 'asset',
                parser: {
                    dataUrlCondition: {
                        maxSize: 10000,
                    }
                },
                generator: {
                    dataUrl: {
                        mimetype: 'image/svg+xml'
                    }
                }
            },
            {
                test: /\\.(jpg|png|gif)$/,
                type: 'asset/resource',
                generator: {
                    filename: '[hash].[ext]'
                }
            },
            {
                // see https://github.com/eclipse-theia/theia/issues/556
                test: /source-map-support/,
                loader: 'ignore-loader'
            },
            {
                test: /\\.js$/,
                enforce: 'pre',
                loader: 'source-map-loader',
                exclude: [
                    /node_modules/,
                    /jsonc-parser/,
                    /fast-plist/,
                    /onigasm/,
                    /inversify/
                ]
            },
            {
                test: /\\.woff(2)?(\\?v=[0-9]\\.[0-9]\\.[0-9])?$/,
                type: 'asset',
                parser: {
                    dataUrlCondition: {
                        maxSize: 10000,
                    }
                },
                generator: {
                    dataUrl: {
                        mimetype: 'image/svg+xml'
                    }
                }
            },
            {
                test: /node_modules[\\\\|\/](vscode-languageserver-types|vscode-uri|jsonc-parser|vscode-languageserver-protocol)/,
                loader: 'umd-compat-loader'
            },
            {
                test: /\\.wasm$/,
                type: 'asset/resource'
            },
            {
                test: /\\.plist$/,
                type: 'asset/resource'
            },
            {
                test: /\\.js$/,
                // include only es6 dependencies to transpile them to es5 classes
                include: [
                    /monaco-languageclient|vscode-ws-jsonrpc|vscode-jsonrpc|vscode-languageserver-protocol|vscode-languageserver-types|vscode-languageclient/,
                    path.resolve(__dirname, '../../packages')
                ],
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                        plugins: [
                            // reuse runtime babel lib instead of generating it in each js file
                            '@babel/plugin-transform-runtime',
                            // ensure that classes are transpiled
                            '@babel/plugin-transform-classes'
                        ],
                        // see https://github.com/babel/babel/issues/8900#issuecomment-431240426
                        sourceType: 'unambiguous',
                        cacheDirectory: true
                    }
                }
            }
        ]
    },
    resolve: {
        fallback: {
            'child_process': false,
            'crypto': false,
            'net': false,
            'path': require.resolve('path-browserify'),
            'process': false,
            'os': false,
            'timers': false,
            'stream': require.resolve('stream-browserify')
        },
        extensions: ['.js', '.mdx', '.png'],
        alias: {
            '@assets': path.resolve(__dirname, 'lib/assets'),
            '@docs': path.resolve(__dirname, '../../docs'),
        }
    },
    stats: {
        warnings: true,
        children: true
    }
};`;
    }

}
