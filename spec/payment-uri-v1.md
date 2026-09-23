# VargaMesh Pay URI Specification v1

Status: Draft 0.1.0  
Scheme: `vargamesh`

## 1. Purpose

The URI format lets a merchant, invoice, QR code or website describe a VMESH
payment request in a format that a VargaMesh-compatible wallet can parse.

## 2. Syntax

```text
vargamesh:<address>[?name=value[&name=value...]]
```

Example:

```text
vargamesh:vm1qexample...?amount=12.5&label=Varga-Tech&message=Invoice-4711
```

The scheme is case-insensitive. Implementations SHOULD emit lowercase
`vargamesh:`.

## 3. Address

The path component is the VMESH destination address. Wallets MUST validate the
address against the active VargaMesh network before allowing the user to sign.

An implementation MUST NOT infer that a string is safe merely because it starts
with `vm1`.

## 4. Amount

`amount` is denominated in VMESH, not in smallest units.

Rules:

- decimal notation only
- value MUST be greater than zero
- maximum 8 fractional digits
- no scientific notation
- no sign prefix
- no thousands separators

Valid:

```text
amount=1
amount=0.00000001
amount=12.50000000
```

Invalid:

```text
amount=-1
amount=1e3
amount=0.000000001
amount=1,000
```

Wallets SHOULD convert the amount to an integer number of smallest units before
transaction construction.

## 5. Text parameters

`label`, `message` and `reference` are UTF-8 text encoded using standard URI
percent-encoding.

They are display metadata. They are NOT automatically written into the
blockchain and MUST NOT be treated as proof that a blockchain transaction
contains the merchant reference.

## 6. Expiration

`expires` is an optional Unix timestamp in seconds.

If the current time is greater than `expires`, a wallet SHOULD reject the payment
request or require the user to obtain a new request.

## 7. Required extensions

Parameter names beginning with `req-` are required extensions.

A wallet that does not understand a `req-*` parameter MUST reject the URI rather
than silently ignoring it.

Normal unknown parameters MAY be ignored.

## 8. Duplicate parameters

A URI containing a duplicate known parameter MUST be rejected. This prevents
ambiguous requests such as two different `amount` fields.

## 9. User confirmation

Before signing, a wallet MUST show at least:

- destination address
- VMESH amount
- transaction fee
- network

If present, the wallet SHOULD also show label, message, reference and expiration.

A wallet MUST NOT sign solely because a QR code was scanned or a deep link was
opened.

## 10. Security requirements

- Websites MUST NOT request or receive customer WIF/private keys.
- Wallet signing remains local to the wallet.
- Payment pages SHOULD use HTTPS.
- Wallets MUST validate the address and amount independently of the merchant UI.
- Wallets SHOULD warn on expired requests.
- Wallets SHOULD reject malformed percent-encoding and control characters.
- Wallets SHOULD cap metadata lengths to prevent UI abuse.

Recommended limits in v1:

```text
label      <= 128 UTF-8 characters
message    <= 256 UTF-8 characters
reference  <= 128 UTF-8 characters
```

## 11. Canonical parameter order

Canonical emitters SHOULD order known parameters as:

```text
amount, label, message, reference, expires
```

This is for reproducible output only. Parsers MUST NOT depend on ordering.

## 12. Examples

Simple amount:

```text
vargamesh:vm1qexample...?amount=2.5
```

Merchant invoice:

```text
vargamesh:vm1qexample...?amount=12.5&label=Varga-Tech&message=Invoice%204711&reference=INV-4711
```

Expiring request:

```text
vargamesh:vm1qexample...?amount=1&expires=1790180000
```
