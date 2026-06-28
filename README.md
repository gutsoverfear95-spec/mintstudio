# Mint Studio — Real Estate Photo Editing Website

A fast, bright, mobile-friendly website for a real estate photo-editing studio.
Customers browse services, build an order, and **pay in advance with Stripe**.

Built as a **static site** — deploys on Vercel or GitHub Pages. No server required.

---

## 🇻🇳 Hướng dẫn nhanh (Tiếng Việt)

1. **Sửa nội dung & giá:** mở `js/config.js` — tất cả tên studio, email, bảng giá, dịch vụ đều ở đây. Lưu file là web tự cập nhật.
2. **Nhận thanh toán (Stripe):** tạo *Payment Link* trên Stripe cho từng gói, rồi dán đường link vào `stripeLink` trong `js/config.js`. Xem mục **Connect Stripe** bên dưới.
3. **Nhận thông báo đơn hàng qua email:** lấy key miễn phí ở [web3forms.com](https://web3forms.com) → dán vào `web3formsAccessKey`.
4. **Đưa web lên mạng:** repo này đã nối Vercel — mỗi lần push là tự deploy lại.

> Khi chưa cài Stripe, web vẫn chạy: khách bấm đặt hàng → đơn được gửi cho bạn → bạn gửi link thanh toán sau.

---

## What's included

```
mintstudio/
├── index.html        # Landing page (hero, services, pricing, portfolio, FAQ)
├── order.html        # Order form + live total + Stripe payment
├── success.html      # Thank-you page (shown after payment)
├── css/style.css     # All styles
├── js/
│   ├── config.js     # ★ EDIT THIS — prices, services, Stripe links, contact
│   ├── main.js       # Nav, FAQ, before/after slider, renders pricing
│   └── order.js      # Order logic, totals, Stripe redirect
└── assets/           # favicon (add your own logo/photos here)
```

---

## 1. Edit your content & prices

Open **`js/config.js`**. Everything is labelled. You can change business info, packages
(name, `pricePerPhoto`, features), add-ons, and portfolio images. Prices are **placeholders**.

## 2. Connect Stripe (take payments)

**Mode A — Payment Links (recommended, no code):**
1. Create a free [Stripe account](https://dashboard.stripe.com/register).
2. Stripe → **Payment Links → + New**. Create one link per package; set the price **per photo** and turn on **"Let customers adjust quantity"**.
3. Paste each link into `js/config.js` under `stripeLink`.

**Mode B — exact one-click total (advanced):** set `paymentMode: "stripe_checkout"`, add `stripePublishableKey` and every `priceId`, and enable client-only Checkout in Stripe.

## 3. Get notified of every order (optional)

Get a free Access Key at [web3forms.com](https://web3forms.com) and paste it into `web3formsAccessKey` in `js/config.js`. Each order is emailed to you automatically.

## 4. Deploy on Vercel

This repo is connected to Vercel. **Add New → Project → Import** this repo, Framework preset **Other**, no build command, then Deploy. Every push to `main` auto-deploys.

(Also works on GitHub Pages: Settings → Pages → deploy from `main` / root.)

## 5. Add your own photos & logo

Replace `assets/favicon.svg` with your logo, and put real before/after image URLs into the `portfolio` array in `config.js`.

---

The site works **before** Stripe is connected — orders are captured and you can email a payment link manually. Plain HTML/CSS/JS, no build step.
