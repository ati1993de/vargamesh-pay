# Android integration

The VargaMesh Android wallet can use VargaMesh Pay without exposing wallet keys
to the checkout website.

## Manifest deep link

Add an intent filter to the wallet activity responsible for payment requests:

```xml
<intent-filter>
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="vargamesh" />
</intent-filter>
```

## Processing flow

```text
scan QR / open vargamesh: link
        |
        v
parse URI as untrusted input
        |
        v
validate VMESH address + amount + expires + req-* fields
        |
        v
populate Send screen
        |
        v
show recipient + amount + fee + network
        |
        v
user confirms
        |
        v
local signing
        |
        v
broadcast signed raw transaction
```

Do not sign from an intent handler directly.

## QR scanning

The existing QR scanner should first check for the `vargamesh:` scheme. If it is
a payment URI, parse the fields and open the Send screen. Raw `vm1...` addresses
can remain supported as amount-less payment requests.

## Defensive limits

Recommended:

- URI <= 4096 bytes
- label <= 128 characters
- message <= 256 characters
- reference <= 128 characters
- amount <= 8 decimal places
- reject duplicate known parameters
- reject unknown `req-*` parameters
- reject expired requests
