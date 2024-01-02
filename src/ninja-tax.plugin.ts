import { PluginCommonModule, Type, VendurePlugin } from '@vendure/core';

import { NINJA_TAX_PLUGIN_OPTIONS } from './constants';
import { NinjaTaxService } from './services/ninja-tax.service';
import { NinjaTaxLineCalculationStrategy } from './strategies/ninja-tax-calc.strategy';
import { NinjaTaxPluginInitOptions } from './types';

@VendurePlugin({
    imports: [PluginCommonModule],
    providers: [
        NinjaTaxService,
        { provide: NINJA_TAX_PLUGIN_OPTIONS, useFactory: () => NinjaTaxPlugin.options },
    ],
    configuration: config => {
        config.taxOptions.taxLineCalculationStrategy = new NinjaTaxLineCalculationStrategy();
        return config;
    },
    compatibility: '^2.0.0',
})
export class NinjaTaxPlugin {
    static options: NinjaTaxPluginInitOptions;

    static init(options: NinjaTaxPluginInitOptions): Type<NinjaTaxPlugin> {
        this.options = options;
        return NinjaTaxPlugin;
    }
}
