import QRCode from "qrcode";
import { buildPaymentUri } from "./pay-uri.js";

const $ = id => document.getElementById(id);
$("create").addEventListener("click", async () => {
  try {
    const uri = buildPaymentUri({
      address: $("address").value.trim(),
      amount: $("amount").value.trim(),
      label: $("label").value.trim(),
      message: $("message").value.trim(),
      reference: $("reference").value.trim()
    });
    $("uri").textContent = uri;
    $("open").href = uri;
    await QRCode.toCanvas($("qr"), uri, { errorCorrectionLevel: "M", width: 256, margin: 2 });
    $("result").hidden = false;
  } catch (e) {
    alert(e.message || String(e));
  }
});
