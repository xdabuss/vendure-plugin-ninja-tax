export const NINJA_TAX_PLUGIN_OPTIONS = Symbol('NINJA_TAX_PLUGIN_OPTIONS');
export const loggerCtx = 'NinjaTaxPlugin';
export const NINJA_TAX_API_URL = 'https://api.api-ninjas.com/v1/salestax';
export const NINJA_KEY = process.env.NINJA_KEY;
// 15% chosen since it should cover even the highest tax areas of the US
export const DEFAULT_FALLBACK_TAX_RATE = 15;
