# Ninja Tax Plugin

Provides a simple way to add in US sales tax to Vendure orders. Plugin will add `TaxLines` to the order based on the customer's zipcode.
Tax data is retrieved from `https://api-ninjas.com/api/salestax`.

## Usage

1. npm install
2. add to vendure config with empty options object `{}`
3. Create Ninja API account, create API key, add `NINJA_KEY=<example_key>` to root level .env file

## Relevant Docs

-   https://docs.vendure.io/guides/core-concepts/taxes/
-   https://docs.vendure.io/reference/typescript-api/tax/tax-line-calculation-strategy
-   https://docs.vendure.io/reference/typescript-api/orders/order-item-price-calculation-strategy/

## Possible improvements

-   Only add these tax lines if the customer is ordering from US Zone
-   Use caching for the tax rates so that NinjaAPI doesn't need to be called if customer's zipcode is already in cache
