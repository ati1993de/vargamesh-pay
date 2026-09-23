export function buildPaymentUri({address, amount, label, message, reference}) {
  address = String(address || "").trim();
  if (!/^vm1[0-9ac-hj-np-z]{20,100}$/i.test(address)) throw new Error("Invalid VMESH address format");
  const p = new URLSearchParams();
  if (amount) {
    if (!/^(?:0|[1-9]\d*)(?:\.\d{1,8})?$/.test(amount) || Number(amount) <= 0) throw new Error("Invalid amount");
    p.set("amount", amount);
  }
  if (label) p.set("label", label);
  if (message) p.set("message", message);
  if (reference) p.set("reference", reference);
  return `vargamesh:${address}${p.size ? `?${p}` : ""}`;
}
