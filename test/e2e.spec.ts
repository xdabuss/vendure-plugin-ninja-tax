import path from 'path';

import { ChannelService, OrderService, RequestContext } from '@vendure/core';
import { SqljsInitializer, createTestEnvironment, registerInitializer, testConfig } from '@vendure/testing';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { initialData } from './config/initial-data';
import { NinjaTaxPlugin } from '../src/ninja-tax.plugin';
import { NinjaTaxService } from '../src/services/ninja-tax.service';
import { NinjaTaxLineCalculationStrategy } from '../src/strategies/ninja-tax-calc.strategy';

registerInitializer('sqljs', new SqljsInitializer(path.join(__dirname, '__data__')));

describe('NinjaAPI tax plugin', () => {
    const { server, adminClient, shopClient } = createTestEnvironment({
        ...testConfig,
        //plugins: [NinjaTaxPlugin.init({ fallbackTaxRate: 0.18 })],
        plugins: [NinjaTaxPlugin.init({})],
    });

    let ninjaService: NinjaTaxService;
    let orderService: OrderService;
    let taxStrategy: NinjaTaxLineCalculationStrategy;

    beforeAll(async () => {
        await server.init({
            productsCsvPath: path.join(__dirname, 'config/products.csv'),
            initialData,
            customerCount: 2,
        });
        await adminClient.asSuperAdmin();
    }, 60000);

    afterEach(() => {
        vi.restoreAllMocks();
    });

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
        const spy = vi.spyOn(ninjaService, 'getTaxLinesForZipCode');
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
        const spy = vi.spyOn(ninjaService, 'getTaxLinesForZipCode');
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

    //
    it('uses default fallback tax rate when when NinjaAPI is unavailable', async () => {
        orderService = server.app.get(OrderService);
        ninjaService = server.app.get(NinjaTaxService);
        vi.spyOn(ninjaService, '_getNinjaTaxRates').mockRejectedValue(new Error('NinjaAPI is unavailable'));
        const spy = vi.spyOn(ninjaService, 'getTaxLinesForZipCode');

        const ctx = new RequestContext({
            apiType: 'admin',
            authorizedAsOwnerOnly: false,
            channel: await server.app.get(ChannelService).getDefaultChannel(),
            isAuthorized: true,
        });
        const order = await orderService.create(ctx, 1);
        await orderService.addItemToOrder(ctx, order.id, 1, 1);
        await orderService.setShippingAddress(ctx, order.id, {
            countryCode: 'US',
            streetLine1: '123 Main St',
            postalCode: '60013',
        });
        expect(spy).toHaveLastReturnedWith([{ description: 'Fallback US tax', taxRate: 0.15 }]);
    });

    // uses custom fallback tax rate when when NinjaAPI is unavailable
});
