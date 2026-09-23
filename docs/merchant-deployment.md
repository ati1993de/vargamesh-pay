# Merchant deployment

## Phase 1: simple checkout

A shop generates a VargaMesh Pay URI and QR code. The wallet opens it, validates
the request and signs locally. The merchant verifies payment manually.

This phase is simple, auditable and non-custodial.

## Phase 2: unique order addresses

For automatic confirmation, assign one receiving address per order using a
carefully designed merchant wallet/watch-only architecture. Keep spending keys
off the web server where possible.

The watcher can then map:

```text
order -> unique VMESH address -> expected amount -> confirmed transaction
```

## Phase 3: notifications

A merchant backend may expose its own webhook to WooCommerce after the watcher
has independently verified the transaction and chosen confirmation threshold.

The payer wallet never needs the merchant's webhook secret.

## Do not use

- one shared-address total balance as proof for concurrent orders
- customer WIF/private key collection
- Core RPC credentials in browser JavaScript
- hidden auto-signing
- floating-point arithmetic for on-chain amount construction
