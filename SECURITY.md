# Security

## Trust boundary

VargaMesh Pay creates payment requests. It does not need the payer's private key.

Never add private keys, WIFs, seed phrases, wallet passwords, Core RPC
credentials or signing secrets to a web checkout, WordPress installation,
JavaScript bundle or payment URI.

## Wallet requirements

A wallet integration must:

1. parse untrusted URI input defensively;
2. validate the VMESH address for the active network;
3. parse the amount as integer smallest units, never floating point transaction arithmetic;
4. show recipient, amount and fee before signing;
5. sign locally;
6. broadcast only the completed raw transaction;
7. reject unknown `req-*` parameters;
8. reject duplicate known parameters;
9. reject expired requests.

## Merchant matching

A shared receiving address is not enough for reliable automated order matching.
Multiple customers can pay the same address and blockchain balances are not an
order ledger.

For production auto-confirmation use one of:

- a unique receiving address per order from an audited merchant wallet design;
- an audited payment service/watch-only derivation architecture;
- explicit manual confirmation.

The included WooCommerce v0.1 gateway intentionally uses manual confirmation.

## Reporting

Please report security issues privately to the project owner before public
disclosure when practical.
