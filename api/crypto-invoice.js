/* =============================================================
   MINT STUDIO — CRYPTO INVOICE (Vercel serverless function)
   -------------------------------------------------------------
   Creates a NOWPayments invoice for the exact order total and
   returns its payment URL. The customer then picks whichever coin
   and network they want (USDT TRC20/BEP20, USDC, BTC, ETH, ...).

   SETUP (once):
     1. Create a NOWPayments account and add your payout wallet.
     2. Store Settings -> API keys -> generate a key.
     3. Vercel -> Project -> Settings -> Environment Variables:
          NOWPAYMENTS_API_KEY = <your key>
        Add it to Production (and Preview if you use it), then redeploy.

   The key lives only in Vercel. It is never sent to the browser.

   ⚠️  PRICES BELOW MUST MATCH js/config.js
   The server recalculates the total from these numbers and ignores
   whatever the browser sends, so nobody can edit the page and pay $0.01.
   If you change a price in config.js, change it here too.
   ============================================================= */

const PACKAGES = {
  essentials:   { name: "Essentials",   price: 1.5 },
  professional: { name: "Professional", price: 3.0 },
  premium:      { name: "Premium",      price: 6.0 },
};

const ADDONS = {
  virtual_staging: { name: "Virtual staging",        price: 16 },
  day_to_dusk:     { name: "Day-to-dusk",            price: 8 },
  item_removal:    { name: "Item / clutter removal", price: 5 },
  fire_fireplace:  { name: "Fire in fireplace",      price: 4 },
  tv_screen:       { name: "TV screen replacement",  price: 4 },
};

const RUSH_MULTIPLIER = 0.5;   // must match config.rush.multiplier
const MAX_PHOTOS = 2000;

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.NOWPAYMENTS_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "Server is missing NOWPAYMENTS_API_KEY" });
    return;
  }

  const body = (req.body && typeof req.body === "object") ? req.body : {};

  // ---- validate + recalculate the total server-side ----
  const pkg = PACKAGES[body.packageId];
  if (!pkg) {
    res.status(400).json({ error: "Unknown package" });
    return;
  }

  let photos = parseInt(body.photos, 10);
  if (!Number.isFinite(photos)) photos = 1;
  photos = Math.max(1, Math.min(MAX_PHOTOS, photos));

  const addonIds = Array.isArray(body.addons)
    ? body.addons.filter(function (id) { return Object.prototype.hasOwnProperty.call(ADDONS, id); })
    : [];
  const rush = body.rush === true;

  let total = pkg.price * photos;
  addonIds.forEach(function (id) { total += ADDONS[id].price * photos; });
  if (rush) total += total * RUSH_MULTIPLIER;
  total = Math.round(total * 100) / 100;

  if (!(total > 0)) {
    res.status(400).json({ error: "Invalid order total" });
    return;
  }

  // ---- build a readable description for the invoice ----
  let description = pkg.name + " x " + photos + " photos";
  if (addonIds.length) {
    description += " + " + addonIds.map(function (id) { return ADDONS[id].name; }).join(", ");
  }
  if (rush) description += " + rush turnaround";

  const proto = req.headers["x-forwarded-proto"] || "https";
  const origin = proto + "://" + req.headers.host;

  const orderId = "MINT-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7).toUpperCase();

  try {
    const response = await fetch("https://api.nowpayments.io/v1/invoice", {
      method: "POST",
      headers: { "x-api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        price_amount: total,
        price_currency: "usd",
        order_id: orderId,
        order_description: description,
        success_url: origin + "/success.html",
        cancel_url: origin + "/order.html",
      }),
    });

    const data = await response.json().catch(function () { return {}; });

    if (!response.ok || !data.invoice_url) {
      res.status(502).json({
        error: data.message || "Payment provider rejected the request",
      });
      return;
    }

    res.status(200).json({
      invoice_url: data.invoice_url,
      order_id: orderId,
      total: total,
    });
  } catch (err) {
    res.status(502).json({ error: "Could not reach the payment provider" });
  }
};
