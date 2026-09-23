import { buildPaymentUri, parsePaymentUri } from "../packages/js-sdk/src/index.js";

const address = "vm1qw508d6qejxtdg4y5r3zarvary0c5xw7kr9qdyv";
const uri = buildPaymentUri({
  address,
  amount: "12.5",
  label: "Varga-Tech",
  message: "Invoice 4711",
  reference: "INV-4711"
});

console.log(uri);
console.log(parsePaymentUri(uri));
