const SCHEME = "vargamesh";
const KNOWN = new Set(["amount", "label", "message", "reference", "expires"]);
const MAX = { label: 128, message: 256, reference: 128 };

export function validateAmount(value) {
  const s = String(value ?? "");
  if (!/^(?:0|[1-9]\d*)(?:\.\d{1,8})?$/.test(s)) {
    throw new Error("Invalid VMESH amount");
  }
  const [whole, frac = ""] = s.split(".");
  const units = BigInt(whole) * 100000000n + BigInt((frac + "00000000").slice(0, 8));
  if (units <= 0n) throw new Error("Amount must be greater than zero");
  return { text: s, units };
}

export function validateAddress(address) {
  const s = String(address ?? "").trim();
  // This SDK performs structural screening only. Wallets MUST perform full
  // network checksum/program validation before signing.
  if (!/^vm1[0-9ac-hj-np-z]{20,100}$/i.test(s)) {
    throw new Error("Invalid VMESH address format");
  }
  return s;
}

function cleanText(name, value) {
  const s = String(value ?? "");
  if (/[\u0000-\u001f\u007f]/.test(s)) throw new Error(`${name} contains control characters`);
  if ([...s].length > MAX[name]) throw new Error(`${name} is too long`);
  return s;
}

export function buildPaymentUri(input) {
  const address = validateAddress(input.address);
  const params = new URLSearchParams();

  if (input.amount !== undefined && input.amount !== null && input.amount !== "") {
    params.set("amount", validateAmount(input.amount).text);
  }
  for (const name of ["label", "message", "reference"]) {
    if (input[name] !== undefined && input[name] !== null && input[name] !== "") {
      params.set(name, cleanText(name, input[name]));
    }
  }
  if (input.expires !== undefined && input.expires !== null && input.expires !== "") {
    const n = Number(input.expires);
    if (!Number.isSafeInteger(n) || n <= 0) throw new Error("Invalid expires timestamp");
    params.set("expires", String(n));
  }

  const q = params.toString();
  return `${SCHEME}:${address}${q ? `?${q}` : ""}`;
}

export function parsePaymentUri(uri, options = {}) {
  if (typeof uri !== "string" || uri.length > 4096) throw new Error("Invalid payment URI");
  const m = uri.match(/^([a-z][a-z0-9+.-]*):([^?]*)(?:\?(.*))?$/i);
  if (!m || m[1].toLowerCase() !== SCHEME) throw new Error("Unsupported URI scheme");

  const address = validateAddress(decodeURIComponent(m[2]));
  const rawQuery = m[3] || "";
  const params = new URLSearchParams(rawQuery);
  const seen = new Set();
  const out = { scheme: SCHEME, address };

  for (const [name, value] of params.entries()) {
    if (seen.has(name) && KNOWN.has(name)) throw new Error(`Duplicate parameter: ${name}`);
    seen.add(name);

    if (name.startsWith("req-") && !KNOWN.has(name)) {
      throw new Error(`Unsupported required parameter: ${name}`);
    }
    if (!KNOWN.has(name)) continue;

    if (name === "amount") {
      const a = validateAmount(value);
      out.amount = a.text;
      out.amountUnits = a.units;
    } else if (name === "expires") {
      if (!/^\d+$/.test(value)) throw new Error("Invalid expires timestamp");
      const n = Number(value);
      if (!Number.isSafeInteger(n) || n <= 0) throw new Error("Invalid expires timestamp");
      out.expires = n;
    } else {
      out[name] = cleanText(name, value);
    }
  }

  if (out.expires && (options.now ?? Math.floor(Date.now() / 1000)) > out.expires) {
    throw new Error("Payment request expired");
  }

  return out;
}
