/**
 * The plugin can be configured using the following options:
 */
export interface NinjaTaxPluginInitOptions {
    // The fallback US sales tax rate (percentage) to use if the NinjaAPI is unavailable
    // range: 0 - 100
    fallbackTaxRate?: number;
}

export type NinjaTaxRates = {
    zip_code: string;
    total_rate: string;
    state_rate: string;
    city_rate: string;
    county_rate: string;
    additional_rate: string;
};
