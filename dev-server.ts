import { AdminUiPlugin } from '@vendure/admin-ui-plugin';
import {
    ChannelService,
    DefaultLogger,
    DefaultSearchPlugin,
    LogLevel,
    RequestContext,
    StockMovementService,
    mergeConfig,
} from '@vendure/core';
import { SqljsInitializer, createTestEnvironment, registerInitializer } from '@vendure/testing';
import path from 'path';
import { initialData } from './test/config/initial-data';
import { NinjaTaxPlugin } from './src/ninja-tax.plugin';
import { compileUiExtensions } from '@vendure/ui-devkit/compiler';

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
                //   extensions: [BackInStockPlugin.uiExtensions],
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
    // Publish a StockMovementEvent to trigger the BackInStockEvent
    // const ctx = new RequestContext({
    //     apiType: 'admin',
    //     authorizedAsOwnerOnly: false,
    //     channel: await server.app.get(ChannelService).getDefaultChannel(),
    //     isAuthorized: true,
    // });
    // await new Promise(resolve => setTimeout(resolve, 1000));
    // await server.app.get(StockMovementService).adjustProductVariantStock(ctx, 1, 999);
})();
