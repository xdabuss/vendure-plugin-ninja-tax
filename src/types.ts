/**
 * The plugin can be configured using the following options:
 */
export interface NinjaTaxPluginInitOptions {}

export type NinjaTaxRates = {
    zip_code: string;
    total_rate: string;
    state_rate: string;
    city_rate: string;
    county_rate: string;
    additional_rate: string;
};
