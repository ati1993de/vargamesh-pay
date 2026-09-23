import test from "node:test";
import assert from "node:assert/strict";
import { buildPaymentUri, parsePaymentUri, validateAmount } from "../src/index.js";

const ADDRESS = "vm1qw508d6qejxtdg4y5r3zarvary0c5xw7kr9qdyv";

test("build and parse payment URI", () => {
  const uri = buildPaymentUri({
    address: ADDRESS,
    amount: "12.5",
    label: "Varga-Tech",
    message: "Invoice 4711",
    reference: "INV-4711",
    expires: 2000000000
  });
  const p = parsePaymentUri(uri, { now: 1900000000 });
  assert.equal(p.address, ADDRESS);
  assert.equal(p.amount, "12.5");
  assert.equal(p.amountUnits, 1250000000n);
  assert.equal(p.reference, "INV-4711");
});

test("smallest unit", () => {
  assert.equal(validateAmount("0.00000001").units, 1n);
});

test("reject excess precision", () => {
  assert.throws(() => validateAmount("0.000000001"));
});

test("reject scientific notation", () => {
  assert.throws(() => validateAmount("1e3"));
});

test("reject duplicate known parameter", () => {
  assert.throws(() => parsePaymentUri(`vargamesh:${ADDRESS}?amount=1&amount=2`));
});

test("reject unsupported required extension", () => {
  assert.throws(() => parsePaymentUri(`vargamesh:${ADDRESS}?req-foo=1`));
});

test("reject expired request", () => {
  assert.throws(() => parsePaymentUri(`vargamesh:${ADDRESS}?expires=100`, { now: 101 }));
});
