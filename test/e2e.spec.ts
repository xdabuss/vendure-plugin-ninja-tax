import gql from 'graphql-tag';
import path from 'path';
import { SqljsInitializer, registerInitializer, createTestEnvironment, testConfig } from '@vendure/testing';
import { describe, beforeAll, afterAll, it, expect } from 'vitest';

import { NinjaTaxPlugin } from '../src/ninja-tax.plugin';
import { initialData } from './config/initial-data';

registerInitializer('sqljs', new SqljsInitializer(path.join(__dirname, '__data__')));

describe('my plugin', () => {
    const { server, adminClient, shopClient } = createTestEnvironment({
        ...testConfig,
        plugins: [NinjaTaxPlugin],
    });

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

    it('runs a blank test', async () => {
        expect(1).toEqual(1);
    });

    // it('myNewQuery returns the expected result', async () => {
    //     adminClient.asSuperAdmin(); // log in as the SuperAdmin user

    //     const query = gql`
    //         query MyNewQuery($id: ID!) {
    //             myNewQuery(id: $id) {
    //                 field1
    //                 field2
    //             }
    //         }
    //     `;
    //     const result = await adminClient.query(query, { id: 123 });

    //     expect(result.myNewQuery).toEqual({
    //         /* ... */
    //     });
    // });
});
