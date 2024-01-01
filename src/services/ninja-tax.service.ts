import axios from 'axios';
import { AxiosResponse } from 'axios';
import { Injectable } from '@nestjs/common';
import { TaxLine } from '@vendure/common/lib/generated-types';

import { NINJA_TAX_API_URL, NINJA_KEY } from '../constants';
import { NinjaTaxRates } from '../types';

@Injectable()
export class NinjaTaxService {
    // refactor into 2 methods
    async getTaxRates(zipCode: string): Promise<TaxLine[]> {
        const response: AxiosResponse<NinjaTaxRates[]> = await axios.get(
            `${NINJA_TAX_API_URL}?zip_code=${zipCode}`,
            {
                headers: {
                    'X-Api-Key': `${NINJA_KEY}`,
                },
            },
        );
        const taxRateResponse = response.data[0];

        const taxLines = Object.keys(taxRateResponse)
            .filter(key => key !== 'zip_code' && key !== 'total_rate')
            .filter(key => {
                return Number(taxRateResponse[key as keyof NinjaTaxRates]) !== 0;
            })
            .map(key => {
                return {
                    description: key.replace('_rate', ''),
                    taxRate: Number(taxRateResponse[key as keyof NinjaTaxRates]) * 100,
                };
            });
        return taxLines;
    }
}
