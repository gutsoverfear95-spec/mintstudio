/* =============================================================
   MINT STUDIO — SITE CONFIGURATION
   -------------------------------------------------------------
   This is the ONLY file you normally need to edit.
   Everything below (prices, services, Stripe links, contact info)
   controls what shows on the website. Save the file and refresh.
   ============================================================= */

window.MINT_CONFIG = {

  /* ---------- 1. BUSINESS INFO ---------- */
  business: {
    name: "Mint Studio",
    tagline: "Real estate photo editing that sells the space.",
    email: "hello@mintstudio.com",        // <-- your contact email
    phone: "+84 984 329 695",             // <-- your phone / WhatsApp
    instagram: "https://instagram.com/",  // <-- your social links
    currency: "USD",
    currencySymbol: "$",
    // Standard turnaround you advertise:
    turnaround: "24 hours",
  },

  /* ---------- 2. PRICING PACKAGES (per photo) ----------
     These are placeholder prices — edit freely.
     "stripeLink"  = a Stripe Payment Link for this package
                     (see README → "Connect Stripe").
     "priceId"     = only needed if you use the advanced
                     Stripe Checkout mode (paymentMode below). */
  packages: [
    {
      id: "essentials",
      name: "Essentials",
      pricePerPhoto: 1.5,
      blurb: "Clean, true-to-life edits for fast listings.",
      features: [
        "Exposure & white balance",
        "Color correction",
        "Lens distortion fix",
        "Basic spot cleanup",
        "Sharpening & straightening",
      ],
      stripeLink: "",   // <-- paste your Stripe Payment Link
      priceId: "",      // <-- optional (advanced checkout mode)
      popular: false,
    },
    {
      id: "professional",
      name: "Professional",
      pricePerPhoto: 3.0,
      blurb: "The agent favourite — bright, crisp, magazine-ready.",
      features: [
        "Everything in Essentials",
        "HDR / flash blending",
        "Sky replacement",
        "Window pull (view through glass)",
        "Minor object removal",
        "Lawn & greenery boost",
      ],
      stripeLink: "",
      priceId: "",
      popular: true,
    },
    {
      id: "premium",
      name: "Premium",
      pricePerPhoto: 6.0,
      blurb: "Luxury-grade retouching with priority turnaround.",
      features: [
        "Everything in Professional",
        "Advanced retouching",
        "Day-to-dusk conversion",
        "Reflection & screen fixes",
        "Priority 12h turnaround",
      ],
      stripeLink: "",
      priceId: "",
      popular: false,
    },
  ],

  /* ---------- 3. OPTIONAL ADD-ONS (priced per photo) ---------- */
  addons: [
    { id: "virtual_staging", name: "Virtual staging",      price: 16, priceId: "" },
    { id: "day_to_dusk",     name: "Day-to-dusk",          price: 8,  priceId: "" },
    { id: "item_removal",    name: "Item / clutter removal", price: 5, priceId: "" },
    { id: "fire_fireplace",  name: "Fire in fireplace",    price: 4,  priceId: "" },
    { id: "tv_screen",       name: "TV screen replacement",price: 4,  priceId: "" },
  ],

  /* ---------- 4. RUSH / RETURN OPTIONS ---------- */
  rush: { label: "Rush 12-hour turnaround (+50%)", multiplier: 0.5 },

  /* ---------- 5. PAYMENT MODE ----------
     "payment_link"    -> simplest. Customer is sent to the Stripe
                          Payment Link of the chosen package to pay.
                          (Set pricePerPhoto on Stripe as per-photo
                          with "adjustable quantity" on.)  DEFAULT.

     "stripe_checkout" -> advanced. Charges the EXACT computed total
                          (package + add-ons) in one go using Stripe.js.
                          Requires stripePublishableKey + every priceId
                          above, and client-only Checkout enabled in
                          your Stripe dashboard. See README. */
  paymentMode: "payment_link",
  stripePublishableKey: "",   // pk_live_... or pk_test_...  (checkout mode only)
  successUrl: "success.html", // page shown after payment
  cancelUrl: "order.html",

  /* ---------- 6. ORDER NOTIFICATION (optional but recommended) ----------
     So you get an email with the order details the moment a customer
     submits. Free option: https://web3forms.com  (paste the access key).
     Leave blank to skip — the order still proceeds to payment. */
  web3formsAccessKey: "",     // <-- get a free key at web3forms.com

  /* ---------- 7. SUPPORT CHAT (floating button, bottom-right) ----------
     Leave a field blank and that channel is simply hidden.
     Email uses business.email from section 1. */
  support: {
    whatsapp: "84984329695",   // digits only, with country code (+84 984 329 695)
    telegram: "mintsvn",       // username without the @
    note: "We usually reply within a few minutes.",

    // Optional real live chat. Leave blank until you have an account.
    //   provider: "tawk"  -> id is "propertyId/widgetId" from your Tawk.to embed code
    //   provider: "crisp" -> id is your Crisp Website ID
    // When set, "Live chat" appears as the first option in the same button.
    liveChat: { provider: "tawk", id: "6a8ace66c80352344a658473/1k0n3cgb9" },
  },

  /* ---------- 8. PORTFOLIO (optional) ----------
     Swap these for your own before/after image URLs.
     Leave as-is to use the built-in sample placeholders. */
  portfolio: [
    { label: "Living room", before: "", after: "" },
    { label: "Kitchen",     before: "", after: "" },
    { label: "Exterior dusk", before: "", after: "" },
  ],
};
