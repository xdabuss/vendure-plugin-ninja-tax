import path from 'path';

import { AdminUiPlugin } from '@vendure/admin-ui-plugin';
import { DefaultLogger, DefaultSearchPlugin, LogLevel, mergeConfig } from '@vendure/core';
import { SqljsInitializer, createTestEnvironment, registerInitializer } from '@vendure/testing';
import { compileUiExtensions } from '@vendure/ui-devkit/compiler';

import { NinjaTaxPlugin } from './src/ninja-tax.plugin';
import { initialData } from './test/config/initial-data';

(async () => {
    require('dotenv').config();
    const { testConfig } = require('@vendure/testing');
    registerInitializer('sqljs', new SqljsInitializer(path.join(__dirname, '__data__')));
    const config = mergeConfig(testConfig, {
        logger: new DefaultLogger({ level: LogLevel.Debug }),
        apiOptions: {
            adminApiPlayground: {},
            shopApiPlayground: {},
        },
        plugins: [
            NinjaTaxPlugin.init({}),
            DefaultSearchPlugin,
            AdminUiPlugin.init({
                port: 3002,
                route: 'admin',
                // app: compileUiExtensions({
                //   outputPath: path.join(__dirname, '__admin-ui'),
                //   extensions: [],
                //   devMode: true,
                // }),
            }),
        ],
    });
    const { server, shopClient, adminClient } = createTestEnvironment(config);
    await server.init({
        initialData,
        productsCsvPath: path.join(__dirname, '/test/config/products.csv'),
    });
    // Can run any more setup code here...
})();
