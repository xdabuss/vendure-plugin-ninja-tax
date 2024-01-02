# NinjaAPI US Tax Plugin

Provides a simple way to add in US sales tax to Vendure orders. Plugin will add `TaxLines` to the order based on the customer's zipcode.
Tax data is retrieved from `https://api-ninjas.com/api/salestax`.

## Usage

1. `yarn add @xdabuss/vendure-plugin-ninja-tax`
2. Add plugin to vendure config:

```ts
export const config: VendureConfig = {
  // .. the rest of your vendure config
  plugins: [
    NinjaTaxPlugin.init({}),
    )},
};
```

3. Create Ninja API [account](https://api-ninjas.com/api), create API key, add `NINJA_KEY=<example_key>` to root level `.env` file

## Relevant Docs

-   https://docs.vendure.io/guides/core-concepts/taxes/
-   https://docs.vendure.io/reference/typescript-api/tax/tax-line-calculation-strategy
-   https://docs.vendure.io/reference/typescript-api/orders/order-item-price-calculation-strategy/

## Notes

-   If the shiiping address is not from the US, the tax lines will be calculated using the `DefaultTaxLineCalculationStrategy`

## Possible improvements

-   Use caching for the tax rates so that NinjaAPI doesn't need to be called if customer's zipcode is already in cache

## Development

Run `yarn dev` to start Vendure on http://localhost:3050/admin

## License

MIT
