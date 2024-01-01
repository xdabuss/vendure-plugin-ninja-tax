import gql from 'graphql-tag';
import path from 'path';
import { SqljsInitializer, registerInitializer, createTestEnvironment, testConfig } from '@vendure/testing';
import { ChannelService, OrderService, RequestContext } from '@vendure/core';
import { describe, beforeAll, afterAll, it, expect, vi } from 'vitest';

import { NinjaTaxPlugin } from '../src/ninja-tax.plugin';
import { NinjaTaxService } from '../src/services/ninja-tax.service';
import { initialData } from './config/initial-data';

registerInitializer('sqljs', new SqljsInitializer(path.join(__dirname, '__data__')));

describe('NinjaAPI tax plugin', () => {
    const { server, adminClient, shopClient } = createTestEnvironment({
        ...testConfig,
        plugins: [NinjaTaxPlugin],
    });

    let ninjaService: NinjaTaxService;
    let orderService: OrderService;

    beforeAll(async () => {
        await server.init({
            productsCsvPath: path.join(__dirname, 'config/products.csv'),
            initialData,
            customerCount: 2,
        });
        await adminClient.asSuperAdmin();
    }, 60000);

    afterAll(async () => {
        await server.destroy();
    });

    it('calls ninja api to get tax lines', async () => {
        ninjaService = server.app.get(NinjaTaxService);
        const taxLines = await ninjaService.getTaxLinesForZipCode('60013');
        expect(taxLines.length);
    });

    it('converts ninja tax rates to tax lines', async () => {
        ninjaService = server.app.get(NinjaTaxService);
        const taxRates = {
            zip_code: '60013',
            total_rate: '0.080000',
            state_rate: '0.062500',
            city_rate: '0.010000',
            county_rate: '0.000000',
            additional_rate: '0.007500',
        };
        const taxLines = ninjaService._getTaxLines(taxRates);
        expect(taxLines).toEqual([
            { description: 'state', taxRate: 6.25 },
            { description: 'city', taxRate: 1 },
            { description: 'additional', taxRate: 0.75 },
        ]);
    });

    it('gets tax rates from NinjaAPI only when a shipping address is added to the order', async () => {
        orderService = server.app.get(OrderService);
        ninjaService = server.app.get(NinjaTaxService);
        const spy = vi
            .spyOn(ninjaService, 'getTaxLinesForZipCode')
            .mockImplementation(() => Promise.resolve([{ description: '', taxRate: 0 }]));

        const ctx = new RequestContext({
            apiType: 'admin',
            authorizedAsOwnerOnly: false,
            channel: await server.app.get(ChannelService).getDefaultChannel(),
            isAuthorized: true,
        });
        // create a new order
        const order = await orderService.create(ctx, 1);
        // add a product to the order
        await orderService.addItemToOrder(ctx, order.id, 1, 1);
        // assert that NinjaApi has not been called
        expect(spy).not.toHaveBeenCalled();
        // add a shipping address to the order
        await orderService.setShippingAddress(ctx, order.id, {
            countryCode: 'US',
            streetLine1: '123 Main St',
            postalCode: '60013',
        });
        // assert that NinjaApi has been called
        expect(spy).toHaveBeenCalled();
    });

    it('does not get tax rates from NinjaAPI when the shipping address is outside of the US', async () => {
        orderService = server.app.get(OrderService);
        ninjaService = server.app.get(NinjaTaxService);
        const spy = vi
            .spyOn(ninjaService, 'getTaxLinesForZipCode')
            .mockImplementation(() => Promise.resolve([{ description: '', taxRate: 0 }]));

        const ctx = new RequestContext({
            apiType: 'admin',
            authorizedAsOwnerOnly: false,
            channel: await server.app.get(ChannelService).getDefaultChannel(),
            isAuthorized: true,
        });
        // create a new order
        const order = await orderService.create(ctx, 1);
        // add a product to the order
        await orderService.addItemToOrder(ctx, order.id, 1, 1);
        // add a non-US shipping address to the order
        await orderService.setShippingAddress(ctx, order.id, {
            countryCode: 'DE',
            streetLine1: '999 Bier St',
            postalCode: '30159',
        });
        // assert that NinjaApi has not been called
        expect(spy).not.toHaveBeenCalled();
    });
});
