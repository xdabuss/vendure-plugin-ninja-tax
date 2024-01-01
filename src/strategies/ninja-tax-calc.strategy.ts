import { TaxLine } from '@vendure/common/lib/generated-types';

import { CalculateTaxLinesArgs, Injector, TaxLineCalculationStrategy } from '@vendure/core';
import { NinjaTaxService } from '../services/ninja-tax.service';
import { NinjaTaxPluginInitOptions } from '../types';
import { NINJA_TAX_PLUGIN_OPTIONS } from '../constants';
/**
 * @description
 * {@link TaxLineCalculationStrategy}  which usese Ninja Tax API to calculate tax rates
 * and return the corresponding tax lines.
 *
 * @docsCategory tax
 */
export class NinjaTaxLineCalculationStrategy implements TaxLineCalculationStrategy {
    private ninjaTaxService!: NinjaTaxService;
    private options!: NinjaTaxPluginInitOptions;

    init(injector: Injector) {
        this.ninjaTaxService = injector.get(NinjaTaxService);
        this.options = injector.get(NINJA_TAX_PLUGIN_OPTIONS);
    }

    // called whenever an order is modified in some way
    // (adding/removing items, applying promotions, setting ShippingMethod etc)
    async calculate(args: CalculateTaxLinesArgs): Promise<TaxLine[]> {
        const { ctx, orderLine, applicableTaxRate, order } = args;
        const zipcode = order.shippingAddress.postalCode;

        // delay getting tax rates from NinjaAPI until a shipping address is added to the order
        if (zipcode) {
            return await this.ninjaTaxService.getTaxRates(zipcode);
        } else {
            // this is the default behavior specified by DefaultTaxLineCalculationStrategy
            return [applicableTaxRate.apply(orderLine.proratedUnitPrice)];
        }
    }
}
