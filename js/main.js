/* =============================================================
   MINT STUDIO — main.js
   Nav, FAQ, before/after slider, reveal, config-driven content.
   ============================================================= */
(function () {
  "use strict";
  var CFG = window.MINT_CONFIG || {};
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var money = function (n) {
    var sym = (CFG.business && CFG.business.currencySymbol) || "$";
    return sym + (Math.round(n * 100) / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  /* ---------- Fill business data into [data-mint] slots ---------- */
  function fillBusiness() {
    var b = CFG.business || {};
    $$("[data-mint]").forEach(function (el) {
      var key = el.getAttribute("data-mint");
      var map = {
        name: b.name, tagline: b.tagline, email: b.email, phone: b.phone,
        turnaround: b.turnaround, year: new Date().getFullYear()
      };
      if (map[key] !== undefined && map[key] !== "") {
        if (el.tagName === "A" && key === "email") el.href = "mailto:" + b.email;
        if (el.tagName === "A" && key === "phone") el.href = "tel:" + (b.phone || "").replace(/\s/g, "");
        el.textContent = map[key];
      }
    });
    var ig = $("[data-mint-ig]");
    if (ig && b.instagram) ig.href = b.instagram;
  }

  /* ---------- Mobile nav ---------- */
  function nav() {
    var toggle = $(".nav-toggle"), navEl = $(".nav");
    if (!toggle) return;
    toggle.addEventListener("click", function () { navEl.classList.toggle("open"); });
    $$(".nav-links a").forEach(function (a) {
      a.addEventListener("click", function () { navEl.classList.remove("open"); });
    });
  }

  /* ---------- FAQ accordion ---------- */
  function faq() {
    $$(".faq-q").forEach(function (q) {
      q.addEventListener("click", function () {
        var item = q.parentElement;
        var a = item.querySelector(".faq-a");
        var open = item.classList.toggle("open");
        a.style.maxHeight = open ? a.scrollHeight + "px" : 0;
      });
    });
  }

  /* ---------- Reveal on scroll ---------- */
  function reveal() {
    var els = $$(".reveal");
    if (!("IntersectionObserver" in window)) { els.forEach(function (e) { e.classList.add("in"); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    els.forEach(function (e) { io.observe(e); });
  }

  /* ---------- Sample before/after artwork (used if no real images) ---------- */
  function roomSVG(after, label) {
    var sky = after ? "#bff0ff" : "#9aa6ad";
    var wall = after ? "#fff6ea" : "#b9bcbe";
    var wall2 = after ? "#ffe9cf" : "#a9adb0";
    var floor = after ? "#e7c79b" : "#9b948b";
    var sofa = after ? "#11d6a5" : "#8d9aa0";
    var sun = after ? '<circle cx="612" cy="150" r="26" fill="#ffd36b"/>' : "";
    var grade = after
      ? '<linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bff0ff"/><stop offset="1" stop-color="#e8fff8"/></linearGradient>'
      : '<linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9aa6ad"/><stop offset="1" stop-color="#b3b8ba"/></linearGradient>';
    var svg =
      '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">' +
        '<defs>' + grade + '</defs>' +
        '<rect width="800" height="600" fill="' + wall + '"/>' +
        '<rect x="0" y="0" width="800" height="360" fill="' + wall2 + '"/>' +
        '<rect x="470" y="70" width="250" height="220" rx="6" fill="url(#g)" stroke="#fff" stroke-width="10"/>' +
        sun +
        '<rect x="486" y="180" width="218" height="100" fill="' + (after ? "#7fd6a0" : "#7e878c") + '" opacity="0.5"/>' +
        '<rect x="0" y="360" width="800" height="240" fill="' + floor + '"/>' +
        '<rect x="70" y="350" width="300" height="150" rx="18" fill="' + sofa + '"/>' +
        '<rect x="92" y="372" width="118" height="70" rx="12" fill="#ffffff" opacity="0.85"/>' +
        '<rect x="232" y="372" width="118" height="70" rx="12" fill="#ffffff" opacity="0.6"/>' +
        '<rect x="150" y="498" width="150" height="14" rx="7" fill="#000" opacity="0.10"/>' +
        '<text x="40" y="560" font-family="Plus Jakarta Sans, sans-serif" font-size="30" font-weight="800" fill="' + (after ? "#04241c" : "#3b4146") + '">' + label + '</text>' +
      '</svg>';
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  }

  /* ---------- Before/after slider ---------- */
  function initBA(el) {
    var item = (CFG.portfolio && CFG.portfolio[parseInt(el.getAttribute("data-i") || "0", 10)]) || {};
    var beforeSrc = item.before || roomSVG(false, "BEFORE");
    var afterSrc = item.after || roomSVG(true, "AFTER");
    el.innerHTML =
      '<img class="ba-pane ba-before" src="' + beforeSrc + '" alt="before">' +
      '<img class="ba-pane ba-after" src="' + afterSrc + '" alt="after">' +
      '<span class="ba-tag before">Before</span><span class="ba-tag after">After</span>' +
      '<div class="ba-divider"></div><div class="ba-handle" role="slider" aria-label="Compare"></div>';
    var after = $(".ba-after", el), div = $(".ba-divider", el), handle = $(".ba-handle", el);
    function set(p) {
      p = Math.max(2, Math.min(98, p));
      after.style.clipPath = "inset(0 0 0 " + p + "%)";
      div.style.left = p + "%"; handle.style.left = p + "%";
    }
    set(50);
    var dragging = false;
    function move(clientX) {
      var r = el.getBoundingClientRect();
      set(((clientX - r.left) / r.width) * 100);
    }
    function down(e) { dragging = true; move((e.touches ? e.touches[0] : e).clientX); }
    function mv(e) { if (dragging) move((e.touches ? e.touches[0] : e).clientX); }
    function up() { dragging = false; }
    el.addEventListener("mousedown", down); window.addEventListener("mousemove", mv); window.addEventListener("mouseup", up);
    el.addEventListener("touchstart", down, { passive: true }); window.addEventListener("touchmove", mv, { passive: true }); window.addEventListener("touchend", up);
  }
  function baAll() { $$(".ba").forEach(initBA); }

  /* ---------- Render pricing cards from config ---------- */
  function pricing() {
    var wrap = $("#pricing-grid");
    if (!wrap || !CFG.packages) return;
    var check = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
    wrap.innerHTML = CFG.packages.map(function (p) {
      var feats = (p.features || []).map(function (f) { return "<li>" + check + "<span>" + f + "</span></li>"; }).join("");
      return '' +
        '<div class="card price-card reveal ' + (p.popular ? "popular" : "") + '">' +
          (p.popular ? '<span class="badge">Most popular</span>' : "") +
          '<h3>' + p.name + '</h3>' +
          '<div class="price">' + money(p.pricePerPhoto) + '<span>/ photo</span></div>' +
          '<p class="blurb">' + (p.blurb || "") + '</p>' +
          '<ul>' + feats + '</ul>' +
          '<a class="btn ' + (p.popular ? "btn-primary" : "btn-ghost") + ' btn-block" href="order.html?pkg=' + p.id + '">Choose ' + p.name + '</a>' +
        '</div>';
    }).join("");
  }

  document.addEventListener("DOMContentLoaded", function () {
    fillBusiness(); nav(); faq(); pricing(); baAll(); reveal();
  });
})();
