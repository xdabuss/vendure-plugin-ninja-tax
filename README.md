# NinjaAPI US Tax Plugin

This plugin provides a simple way to add in US sales tax to Vendure orders. The plugin adds `TaxLines` to an order based on the customer's zipcode.
Tax data is retrieved from `https://api-ninjas.com/api/salestax`. State, city, county, and misc. tax rates for a given zip code are retrieved from this endpoint and added as separate `TaxLines`.

## Usage

1. `yarn add @xdabuss/vendure-plugin-ninja-tax`
2. Add plugin to vendure config:

```ts
export const config: VendureConfig = {
  // .. the rest of your vendure config
  plugins: [
    NinjaTaxPlugin.init({fallbackTaxRate: 15}),
    )},
};
```

`fallbackTaxRate` is an optional value that will be used for a US customer if the call to NinjaAPI fails. If unset, its default is 15%, since that should cover even the highest US sales tax locations. My thinking is you'd rather let the order continue (and possible refund the extra tax later) with a default rate than have the order fail if NinjaAPI is unresponsive.

3. Create Ninja API [account](https://api-ninjas.com/api), create API key, add `NINJA_KEY=<example_key>` to root level `.env` file

## Relevant Docs

-   https://api-ninjas.com/api/salestax
-   https://docs.vendure.io/guides/core-concepts/taxes/
-   https://docs.vendure.io/reference/typescript-api/tax/tax-line-calculation-strategy
-   https://docs.vendure.io/reference/typescript-api/orders/order-item-price-calculation-strategy/

## Notes

-   If the shiping address is not from the US (`order.shippingAddress.countryCode !== "US"`), the tax lines will be calculated using Vendure's `DefaultTaxLineCalculationStrategy`

## Possible improvements

-   Use caching for the tax rates so that NinjaAPI doesn't need to be called if customer's zipcode is already in cache

## Development

Run `yarn dev` to start Vendure on http://localhost:3050/admin

## License

MIT
