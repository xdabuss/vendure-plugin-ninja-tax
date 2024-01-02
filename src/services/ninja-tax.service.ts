import { Inject, Injectable } from '@nestjs/common';
import { TaxLine } from '@vendure/common/lib/generated-types';
import { Logger } from '@vendure/core';
import axios, { AxiosResponse } from 'axios';

import { NINJA_KEY, NINJA_TAX_API_URL, NINJA_TAX_PLUGIN_OPTIONS } from '../constants';
import { NinjaTaxPluginInitOptions, NinjaTaxRates } from '../types';

@Injectable()
export class NinjaTaxService {
    constructor(@Inject(NINJA_TAX_PLUGIN_OPTIONS) private options: NinjaTaxPluginInitOptions) {}

    async getTaxLinesForZipCode(zipCode: string): Promise<TaxLine[]> {
        try {
            const taxRates = await this._getNinjaTaxRates(zipCode);
            return this._getTaxLines(taxRates);
        } catch (error) {
            Logger.error(`Error getting tax rates from NinjaAPI: ${error}`);
            return [{ description: 'Fallback US tax', taxRate: this.options.fallbackTaxRate as number }];
        }
    }

    async _getNinjaTaxRates(zipCode: string): Promise<NinjaTaxRates> {
        const response: AxiosResponse<NinjaTaxRates[]> = await axios.get(
            `${NINJA_TAX_API_URL}?zip_code=${zipCode}`,
            {
                headers: {
                    'X-Api-Key': `${NINJA_KEY}`,
                },
            },
        );
        return response.data[0];
    }

    _getTaxLines(taxRates: NinjaTaxRates): TaxLine[] {
        const taxLines = Object.keys(taxRates)
            .filter(key => key !== 'zip_code' && key !== 'total_rate')
            .filter(key => {
                return Number(taxRates[key as keyof NinjaTaxRates]) !== 0;
            })
            .map(key => {
                return {
                    description: key.replace('_rate', ''),
                    taxRate: Number(taxRates[key as keyof NinjaTaxRates]) * 100,
                };
            });
        return taxLines;
    }
}
