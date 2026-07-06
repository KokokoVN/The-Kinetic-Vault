const http = require('http');

async function run() {
  console.log("1. Creating payment...");
  const payRes = await fetch("http://localhost:8814/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderId: 9999, amount: 50000, currency: "VND", method: "SEPAY" })
  });
  if (!payRes.ok) {
    console.error("Failed to create payment:", await payRes.text());
    return;
  }
  const payment = await payRes.json();
  console.log("Created Payment:", payment);
  const pid = payment.id;

  console.log("2. Sending webhook for DH" + pid);
  const whRes = await fetch("http://localhost:3000/api/payments/sepay/webhook", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": "sepay_webhook_9f3a2c1f7e8b4a6c" },
    body: JSON.stringify({ code: "DH" + pid, transferType: "in", transferAmount: 50000, referenceCode: "TEST_UI_CLICK" })
  });
  console.log("Webhook Res:", whRes.status, await whRes.text());

  console.log("3. Checking payment status...");
  const statRes = await fetch("http://localhost:8814/" + pid);
  console.log("Payment status:", (await statRes.json()).status);
}

run();
