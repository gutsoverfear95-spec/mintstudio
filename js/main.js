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

  /* ---------- Live chat loader (optional, see config.support.liveChat) ----------
     We hide the provider's own bubble and open it from our button instead,
     so the corner never shows two overlapping widgets. */
  function initLiveChat(onReady) {
    var lc = ((CFG.support || {}).liveChat) || {};
    if (!lc.provider || !lc.id) return null;

    if (lc.provider === "tawk") {
      window.Tawk_API = window.Tawk_API || {};
      window.Tawk_API.onLoad = function () {
        try { window.Tawk_API.hideWidget(); } catch (e) {}
        if (onReady) onReady();
      };
      var t = document.createElement("script");
      t.async = true; t.src = "https://embed.tawk.to/" + lc.id;
      t.charset = "UTF-8"; t.setAttribute("crossorigin", "*");
      document.head.appendChild(t);
      return function () { try { window.Tawk_API.maximize(); } catch (e) {} };
    }

    if (lc.provider === "crisp") {
      window.$crisp = []; window.CRISP_WEBSITE_ID = lc.id;
      window.$crisp.push(["do", "chat:hide"]);
      window.$crisp.push(["on", "session:loaded", function () { if (onReady) onReady(); }]);
      var c = document.createElement("script");
      c.src = "https://client.crisp.chat/l.js"; c.async = 1;
      document.head.appendChild(c);
      return function () {
        window.$crisp.push(["do", "chat:show"]);
        window.$crisp.push(["do", "chat:open"]);
      };
    }
    return null;
  }

  /* ---------- Floating support widget ---------- */
  function support() {
    var s = CFG.support || {}, b = CFG.business || {};

    // "Live chat" stays hidden until the provider actually loads, so a broken
    // or misconfigured account never leaves customers clicking a dead option.
    var liveReady = false;
    function revealLive() {
      liveReady = true;
      var el = document.querySelector(".support-item[data-live]");
      if (el) el.style.display = "flex";
    }
    var openLiveChat = initLiveChat(revealLive);

    var ico = {
      chat: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.9 8.9 0 0 1-3.8-.9L3 21l1.9-5a8.4 8.4 0 0 1 3.7-11.3 8.9 8.9 0 0 1 9.5 1.3 8.4 8.4 0 0 1 2.9 5.5z"/></svg>',
      close: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>',
      wa: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.9 8.9 0 0 1-3.8-.9L3 21l1.9-5a8.4 8.4 0 0 1 3.7-11.3 8.9 8.9 0 0 1 9.5 1.3 8.4 8.4 0 0 1 2.9 5.5z"/><path d="M8.5 9.5c0 3 2.5 5.5 5.5 5.5l1-1.2-1.8-1-.8.8a4.6 4.6 0 0 1-2-2l.8-.8-1-1.8z" fill="currentColor" stroke="none"/></svg>',
      tg: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 3 2 10.5l6 2.2L20 6l-9 8.2.4 5.3 3-3.7 4.3 3.2z"/></svg>',
      mail: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 6 10-6"/></svg>',
      live: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 10h8M8 14h5"/><path d="M21 12a8 8 0 0 1-8 8H7l-4 3V12a8 8 0 0 1 8-8h2a8 8 0 0 1 8 8z"/></svg>'
    };

    var items = [];
    if (openLiveChat) items.push({ live: true, name: "Live chat", sub: "Talk to us right here", bg: "var(--coral)", icon: ico.live });
    if (s.whatsapp) items.push({
      name: "WhatsApp", sub: "Fastest reply", bg: "#25D366", icon: ico.wa,
      href: "https://wa.me/" + String(s.whatsapp).replace(/[^0-9]/g, "")
    });
    if (s.telegram) items.push({
      name: "Telegram", sub: "Message us", bg: "#229ED9", icon: ico.tg,
      href: "https://t.me/" + String(s.telegram).replace(/^@/, "")
    });
    if (b.email) items.push({ name: "Email", sub: b.email, bg: "var(--mint-600)", icon: ico.mail, href: "mailto:" + b.email });
    if (!items.length) return;

    var wrap = document.createElement("div");
    wrap.className = "support";
    wrap.innerHTML =
      '<div class="support-panel" role="dialog" aria-label="Contact support">' +
        '<div class="support-head"><b>Need a hand?</b><span>Pick a channel — we’re happy to help.</span></div>' +
        '<div class="support-list">' +
          items.map(function (it) {
            var inner = '<span class="si" style="background:' + it.bg + '">' + it.icon + '</span>' +
                        '<span>' + it.name + '<small>' + it.sub + '</small></span>';
            return it.live
              ? '<button type="button" class="support-item" data-live="1" style="display:' + (liveReady ? "flex" : "none") + '">' + inner + '</button>'
              : '<a class="support-item" href="' + it.href + '" target="_blank" rel="noopener">' + inner + '</a>';
          }).join("") +
        '</div>' +
        (s.note ? '<p class="support-note">' + s.note + '</p>' : "") +
      '</div>' +
      '<button class="support-fab" aria-label="Contact support" aria-expanded="false">' +
        '<span class="ic-chat">' + ico.chat + '</span><span class="ic-close">' + ico.close + '</span>' +
      '</button>';
    document.body.appendChild(wrap);

    var fab = $(".support-fab", wrap);
    function setOpen(on) {
      wrap.classList.toggle("open", on);
      fab.setAttribute("aria-expanded", on ? "true" : "false");
    }
    fab.addEventListener("click", function (e) {
      e.stopPropagation();
      setOpen(!wrap.classList.contains("open"));
    });
    var liveBtn = $("[data-live]", wrap);
    if (liveBtn && openLiveChat) liveBtn.addEventListener("click", function () { setOpen(false); openLiveChat(); });
    $$(".support-item", wrap).forEach(function (el) {
      el.addEventListener("click", function () { if (!el.hasAttribute("data-live")) setOpen(false); });
    });
    document.addEventListener("click", function (e) { if (!wrap.contains(e.target)) setOpen(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") setOpen(false); });
  }

  document.addEventListener("DOMContentLoaded", function () {
    fillBusiness(); nav(); faq(); pricing(); baAll(); reveal(); support();
  });
})();
