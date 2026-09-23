# VargaMesh Pay

**Open payment URI and checkout toolkit for the VargaMesh (VMESH) network.**

VargaMesh Pay standardizes how wallets, websites, invoices and merchant tools
request a VMESH payment without giving a web application access to a private key.

```text
vargamesh:vm1q...?amount=12.5&label=Varga-Tech&message=Invoice-4711
```

## What this repository contains

- **VargaMesh Pay URI v1 specification**
- dependency-free **JavaScript SDK** for building/parsing payment URIs
- browser checkout demo with QR generation
- **WooCommerce/WordPress gateway prototype** for self-custody manual VMESH payments
- Android integration notes for VargaMesh Android
- security model and merchant deployment guidance
- CI tests for the URI implementation

## Security model

VargaMesh Pay is intentionally non-custodial.

```text
Merchant / Website
      |
      | creates payment request only
      v
vargamesh:vm1...?...amount=...
      |
      | QR / deep link
      v
Wallet
      |
      | validates destination + amount
      | signs locally with the user's key
      v
VargaMesh transaction
```

A merchant website does **not** receive the customer's private key, WIF or wallet
password. A wallet must never sign a payment silently: recipient, amount, fee and
network must be shown to the user before confirmation.

## URI v1

Canonical example:

```text
vargamesh:vm1qexample...?amount=12.50000000&label=Varga-Tech&message=Invoice-4711&reference=INV-4711
```

Supported v1 parameters:

| Parameter | Required | Meaning |
| --- | --- | --- |
| `amount` | no | VMESH amount, decimal, maximum 8 fractional digits |
| `label` | no | Human-readable recipient/merchant label |
| `message` | no | Human-readable payment message |
| `reference` | no | Merchant-side reference shown to the user; not stored on-chain |
| `expires` | no | Unix timestamp after which a wallet should reject the request |

Unknown normal parameters may be ignored. Unknown parameters beginning with
`req-` **must cause rejection**, allowing future required extensions.

See [`spec/payment-uri-v1.md`](spec/payment-uri-v1.md).

## Repository layout

```text
VargaMesh-Pay/
├── spec/                       protocol specification
├── packages/js-sdk/            URI build/parse library
├── packages/web-checkout/       browser checkout + QR demo
├── packages/wordpress-plugin/   WooCommerce gateway prototype
├── docs/                        Android, merchant and security docs
├── examples/                    ready-to-copy examples
└── .github/workflows/           CI
```

## JavaScript SDK

```bash
cd packages/js-sdk
npm test
```

```js
import { buildPaymentUri, parsePaymentUri } from "./src/index.js";

const uri = buildPaymentUri({
  address: "vm1qexample...",
  amount: "12.5",
  label: "Varga-Tech",
  message: "Invoice 4711",
  reference: "INV-4711"
});

const payment = parsePaymentUri(uri);
```

## Web checkout demo

```bash
cd packages/web-checkout
npm install
npm run dev
```

The demo creates a payment URI, renders it as a QR code and exposes a
`vargamesh:` deep link. It does not handle private keys.

## WordPress / WooCommerce

`packages/wordpress-plugin/vargamesh-pay/` contains a first non-custodial
WooCommerce gateway. The merchant configures a receiving VMESH address. Orders
are placed **On hold** after checkout and the customer receives a VMESH payment
URI and QR-compatible payment string.

v0.1 does not auto-confirm blockchain payments because reliable merchant
matching requires unique order addresses or a dedicated watcher service. The
plugin deliberately does not guess from a shared address balance.

## Android

The Android wallet should register the `vargamesh:` scheme and pass the parsed
request to its native Send screen. The wallet must validate the URI again locally
before signing.

See [`docs/android-integration.md`](docs/android-integration.md).

## Network constants used by this project

- Network: VargaMesh mainnet
- Ticker: `VMESH`
- URI scheme: `vargamesh`
- Mainnet address prefix/HRP expected by the current wallet tooling: `vm1`
- Amount precision: 8 decimal places

## Scope

VargaMesh Pay is a payment-request standard and integration toolkit, **not** a
custodial processor, bank account, exchange or hosted wallet.

## Version

Current specification/toolkit version: **0.1.0**.
