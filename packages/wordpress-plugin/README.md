# VargaMesh Pay for WooCommerce

Prototype v0.1 manual gateway.

## Important

The plugin does not hold keys and does not automatically mark orders paid.
The configured address is public only.

The current implementation assumes that the WooCommerce order total is already
denominated in VMESH. Fiat/VMESH exchange-rate conversion is intentionally not
included in v0.1 because a trustworthy rate source and rounding policy must be
specified first.

For production merchant automation, add a dedicated payment watcher and unique
receiving addresses per order rather than checking one shared address balance.
