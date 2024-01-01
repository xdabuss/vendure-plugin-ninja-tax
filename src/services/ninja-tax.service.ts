import axios from 'axios';
import { AxiosResponse } from 'axios';
import { Injectable } from '@nestjs/common';
import { TaxLine } from '@vendure/common/lib/generated-types';

import { NINJA_TAX_API_URL, NINJA_KEY } from '../constants';
import { NinjaTaxRates } from '../types';

@Injectable()
export class NinjaTaxService {
    async getTaxLinesForZipCode(zipCode: string): Promise<TaxLine[]> {
        const taxRates = await this._getNinjaTaxRates(zipCode);
        return this._getTaxLines(taxRates);
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
