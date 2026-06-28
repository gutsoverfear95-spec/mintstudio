/* =============================================================
   MINT STUDIO — order.js
   Renders the order form, computes the live total, and starts
   payment (Stripe Payment Link or Stripe.js Checkout).
   ============================================================= */
(function () {
  "use strict";
  var CFG = window.MINT_CONFIG || {};
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var sym = (CFG.business && CFG.business.currencySymbol) || "$";
  var money = function (n) { return sym + (Math.round(n * 100) / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };
  var pkgs = CFG.packages || [], addons = CFG.addons || [], rush = CFG.rush || { label: "Rush", multiplier: 0.5 };

  function qparam(k) { return new URLSearchParams(location.search).get(k); }

  /* ---------- Render package + add-on choices ---------- */
  function renderChoices() {
    var pre = qparam("pkg");
    $("#pkg-options").innerHTML = pkgs.map(function (p, i) {
      var checked = pre ? (p.id === pre) : (p.popular || i === 0);
      return '<label class="pkg-opt"><input type="radio" name="package" value="' + p.id + '" ' + (checked ? "checked" : "") + '>' +
        '<span class="box"><span><b>' + p.name + '</b><small>' + (p.blurb || "") + '</small></span>' +
        '<span class="p">' + money(p.pricePerPhoto) + '/photo</span></span></label>';
    }).join("");

    $("#addon-grid").innerHTML = addons.map(function (a) {
      return '<label class="addon"><input type="checkbox" value="' + a.id + '">' +
        '<span>' + a.name + '</span><span class="ap">+' + money(a.price) + '</span></label>';
    }).join("");

    $("#rush-label").textContent = rush.label;
  }

  /* ---------- Read current selection ---------- */
  function getState() {
    var pkgId = (($('input[name="package"]:checked') || {}).value) || (pkgs[0] && pkgs[0].id);
    var pkg = pkgs.filter(function (p) { return p.id === pkgId; })[0] || pkgs[0];
    var photos = Math.max(1, parseInt($("#photos").value, 10) || 1);
    var picked = $$("#addon-grid input:checked").map(function (c) {
      return addons.filter(function (a) { return a.id === c.value; })[0];
    }).filter(Boolean);
    var isRush = $("#rush").checked;
    return { pkg: pkg, photos: photos, addons: picked, rush: isRush };
  }

  /* ---------- Compute + render summary ---------- */
  function compute(s) {
    var base = s.pkg.pricePerPhoto * s.photos;
    var addTotal = s.addons.reduce(function (t, a) { return t + a.price * s.photos; }, 0);
    var sub = base + addTotal;
    var rushFee = s.rush ? sub * rush.multiplier : 0;
    return { base: base, addTotal: addTotal, sub: sub, rushFee: rushFee, total: sub + rushFee };
  }

  function renderSummary() {
    var s = getState(), c = compute(s);
    var lines = [];
    lines.push(["", '<span class="sum-line"><span>' + s.pkg.name + ' &times; ' + s.photos + ' photos</span><span>' + money(c.base) + '</span></span>']);
    s.addons.forEach(function (a) {
      lines.push(["", '<span class="sum-line"><span>' + a.name + ' &times; ' + s.photos + '</span><span>' + money(a.price * s.photos) + '</span></span>']);
    });
    if (s.rush) lines.push(["", '<span class="sum-line"><span>Rush surcharge</span><span>' + money(c.rushFee) + '</span></span>']);
    $("#sum-lines").innerHTML = lines.map(function (l) { return l[1]; }).join("");
    $("#sum-total").textContent = money(c.total);
    $$(".addon").forEach(function (l) { l.classList.toggle("checked", l.querySelector("input").checked); });
    return { s: s, c: c };
  }

  /* ---------- Build readable order summary (for email + success) ---------- */
  function orderText(d) {
    var f = d.fields, s = d.s, c = d.c;
    var L = [
      "NEW ORDER — " + (CFG.business ? CFG.business.name : "Mint Studio"),
      "----------------------------------------",
      "Package:  " + s.pkg.name + " (" + money(s.pkg.pricePerPhoto) + "/photo)",
      "Photos:   " + s.photos,
      "Add-ons:  " + (s.addons.length ? s.addons.map(function (a) { return a.name; }).join(", ") : "none"),
      "Rush:     " + (s.rush ? "Yes" : "No"),
      "TOTAL:    " + money(c.total) + " " + ((CFG.business && CFG.business.currency) || "USD"),
      "----------------------------------------",
      "Name:     " + f.name,
      "Email:    " + f.email,
      "Phone:    " + f.phone,
      "Property: " + f.property,
      "Photos link: " + f.link,
      "Notes:    " + (f.notes || "-")
    ];
    return L.join("\n");
  }

  /* ---------- Notify studio via Web3Forms (optional) ---------- */
  function notify(d) {
    var key = CFG.web3formsAccessKey;
    if (!key) return Promise.resolve();
    return fetch("https://api.web3forms.com/submit", {
      method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        access_key: key,
        subject: "New order: " + d.fields.name + " — " + money(d.c.total),
        from_name: d.fields.name,
        email: d.fields.email,
        message: orderText(d)
      })
    }).catch(function () { /* don't block payment if notify fails */ });
  }

  /* ---------- Stripe.js checkout (advanced exact-total mode) ---------- */
  function stripeCheckout(d) {
    return new Promise(function (resolve, reject) {
      if (!window.Stripe || !CFG.stripePublishableKey) return reject(new Error("Stripe.js not configured"));
      var stripe = window.Stripe(CFG.stripePublishableKey);
      var items = [];
      if (d.s.pkg.priceId) items.push({ price: d.s.pkg.priceId, quantity: d.s.photos });
      d.s.addons.forEach(function (a) { if (a.priceId) items.push({ price: a.priceId, quantity: d.s.photos }); });
      if (!items.length) return reject(new Error("No Stripe price IDs configured"));
      stripe.redirectToCheckout({
        lineItems: items, mode: "payment",
        successUrl: location.origin + location.pathname.replace(/order\.html$/, "") + (CFG.successUrl || "success.html"),
        cancelUrl: location.href,
        customerEmail: d.fields.email
      }).then(function (r) { if (r.error) reject(r.error); });
    });
  }

  /* ---------- Submit ---------- */
  function submit(e) {
    e.preventDefault();
    var r = renderSummary();
    var fields = {
      name: $("#f-name").value.trim(),
      email: $("#f-email").value.trim(),
      phone: $("#f-phone").value.trim(),
      property: $("#f-property").value.trim(),
      link: $("#f-link").value.trim(),
      notes: $("#f-notes").value.trim()
    };
    var form = $("#order-form");
    if (!form.checkValidity()) { form.reportValidity(); return; }

    var d = { fields: fields, s: r.s, c: r.c };
    var btn = $("#pay-btn"); btn.disabled = true; var txt = btn.textContent; btn.textContent = "Processing…";

    // Save for the success page
    try { sessionStorage.setItem("mint_last_order", orderText(d)); sessionStorage.setItem("mint_last_total", money(d.c.total)); } catch (err) {}

    notify(d).then(function () {
      if (CFG.paymentMode === "stripe_checkout") {
        return stripeCheckout(d).catch(function (err) { fallback(d, btn, txt, err); });
      }
      // payment_link mode
      var link = d.s.pkg.stripeLink;
      if (link) {
        var url = link + (link.indexOf("?") > -1 ? "&" : "?") + "prefilled_email=" + encodeURIComponent(fields.email);
        window.location.href = url;
      } else {
        fallback(d, btn, txt);
      }
    });
  }

  // Shown when Stripe isn't connected yet — order still captured.
  function fallback(d, btn, txt, err) {
    btn.disabled = false; btn.textContent = txt;
    var box = $("#pay-msg");
    var sent = !!CFG.web3formsAccessKey;
    box.style.display = "block";
    box.innerHTML = (sent
      ? "✓ Your order request was sent to our studio. "
      : "Online payment isn’t connected yet. ") +
      "We’ll email you a secure Stripe payment link at <b>" + (d.fields.email || "your email") + "</b> shortly. " +
      "<br><span style='color:#6b7d92;font-size:12px'>(Studio note: add your Stripe Payment Links in <code>js/config.js</code> to charge instantly.)</span>";
    box.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (!$("#order-form")) return;
    renderChoices();
    renderSummary();
    $("#order-form").addEventListener("input", renderSummary);
    $("#order-form").addEventListener("change", renderSummary);
    $("#order-form").addEventListener("submit", submit);
  });
})();
