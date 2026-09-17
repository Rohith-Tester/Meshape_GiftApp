# MeShape Gift Shop

Premium gifting e-commerce website for **MeShape Gift Shop**, developed by **Craft Tech**.

Backend: Firebase (Firestore + Authentication) + Cloudinary (image hosting) + Vercel (frontend hosting).

## Getting started (local development)

```bash
npm install
cp .env.example .env    # then fill in your Firebase/Cloudinary values — see below
npm run dev              # http://localhost:5173
npm run build             # production build into dist/
npm run preview           # preview the production build locally
```

## One-time backend setup

This only needs to be done once per environment (do it once for your real
production project; optionally again for a separate free Firebase project
if you want a staging/testing environment).

1. **Create a Firebase project** at https://console.firebase.google.com
2. **Enable Firestore** (Native mode, any region close to India)
3. **Enable Authentication → Email/Password** sign-in method
4. **Copy your Firebase web config** into `.env` (Project Settings →
   General → "Your apps" → add a Web app if you haven't) — see
   `.env.example` for the exact variable names
5. **Create a Cloudinary account** at https://cloudinary.com, then:
   - Copy your **Cloud Name** from the dashboard into `.env`
   - Settings → Upload → Upload presets → Add upload preset → set
     **Signing Mode to "Unsigned"**, restrict allowed formats to
     jpg/png/webp, set a max file size (~5MB), and set a fixed folder —
     copy the preset name into `.env`
6. **Run the admin setup scripts** — see `admin-scripts/README.md` for
   full steps (creating the one admin user, granting the admin claim,
   and seeding the database with the starting demo catalogue)
7. **Deploy the Firestore Security Rules**:
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase deploy --only firestore:rules
   ```
8. **Deploy the frontend to Vercel**, setting the same environment
   variables from your `.env` in the Vercel project's Environment
   Variables settings (never commit real values to git). `vercel.json`
   in this repo already handles the SPA rewrite rule Vercel needs for
   client-side routing, plus baseline security headers.
9. **Replace `REPLACE-WITH-YOUR-DOMAIN`** in `public/sitemap.xml` and
   `public/robots.txt` with your real production domain, then submit the
   sitemap in Google Search Console.

Full detail, including the security reasoning behind each step, is in
`PROJECT_REQUIREMENTS.md` → "Phase 8 architecture notes" / "Phase 8
verification checklist" and "Phase 9 architecture notes" / "Phase 9
verification checklist".

## Project structure

```
src/
  assets/branding/   Craft Tech logo goes here (see README.md inside)
  components/
    admin/            Admin Dashboard sections, forms, auth guard
    layout/            Navbar, Footer, FloatingWhatsApp, page Layout
    ui/                 Reusable primitives (Button, Loader, EmptyState,
                        DataLoadError, ...)
  config/              Centralized business info, routes, delivery config
  context/             Global state — Products/Offers/ShopGallery (Firestore-backed),
                        Cart/Wishlist (localStorage, by design — see below),
                        AdminAuth (Firebase Auth)
  data/                Seed/demo datasets — read by admin-scripts/seedFirestore.js,
                        no longer read directly by the app itself
  lib/                 Firebase app initialization
  hooks/               useDocumentHead — dependency-free per-page SEO
  pages/               One file per route, incl. admin/
  styles/              Design tokens, global styles, shared animations
  utils/               Pricing, search, validation, Cloudinary upload/optimize, etc.
  router.jsx           All app routes — Admin is React.lazy()-loaded as its own chunk
  App.jsx / main.jsx   App bootstrap, wrapped in a top-level ErrorBoundary
admin-scripts/         Trusted, LOCAL-ONLY setup scripts (never deployed) —
                        see admin-scripts/README.md
firestore.rules        The real security boundary for admin write access
firebase.json           Firebase CLI config (points at firestore.rules)
vercel.json             SPA rewrite rule + production security headers
public/sitemap.xml      Static top-level routes (edit the domain before launch)
PROJECT_REQUIREMENTS.md   Living checklist of every spec requirement
```

## Current phase

**Phase 1 — Foundation, Architecture, Design System, Branding**,
**Phase 2 — Customer Website: Home, Catalogue, Search, Filters, Wishlist,
Product Details**,
**Phase 3 — Customization, Cart, Pickup/Delivery, Order Summary**,
**Phase 4 — Order ID + WhatsApp Order Flow**,
**Phase 5 — Our Shop, Gallery, Instagram, Google Maps**,
**Phase 6 — Admin Dashboard, Product CRUD, Shop Gallery Management**,
**Phase 7 — Offers / Discount Management**,
**Phase 8 — Backend (Firestore), Real Admin Authentication, Cloudinary Image Hosting**,
**Phase 9 — Deployment, SEO, and Performance**, and
**Phase 10 — Full QA, Bug Fixing, Final Polish**
are all complete — this is every phase in the Master Specification's
10-phase plan.
See `PROJECT_REQUIREMENTS.md` → "Phase 10 QA report" for the specific bugs
found and fixed in the final QA pass, and the full document for exactly
what's done, what's intentionally out of scope, and what still requires
your own testing in a real browser/deployment before launch.

## Before going live

- Add the real Craft Tech logo file — see `src/assets/branding/README.md`.
- Run `npm install` and `npm run build` on a machine with internet access to
  confirm a clean production build (this could not be executed inside the
  development sandbox this project was built in — see
  `PROJECT_REQUIREMENTS.md` → "Known limitation").
- Complete the "One-time backend setup" steps above — the site's product
  catalogue, offers, and admin login will not work at all without them.
- **Read `PROJECT_REQUIREMENTS.md` → "Phase 8 verification checklist"
  before considering this live.** It explicitly separates what was
  statically verified in code review from what only your own testing
  against a real Firebase/Cloudinary project can confirm — in particular,
  actually testing the Firestore Security Rules against unauthenticated
  and non-admin requests.
- **Disclosed, not hidden:** Cloudinary's upload preset is unsigned, which
  is a genuine quota-abuse risk (not a site-security risk) — see
  `src/utils/cloudinaryUpload.js` and `PROJECT_REQUIREMENTS.md` for the
  full explanation and why it was an accepted tradeoff for this budget.
- Cart and Wishlist remain `localStorage`-backed by design, not Firestore
  — see `PROJECT_REQUIREMENTS.md` → "Phase 8 architecture notes" for why.
- **New this phase:** Admin's dashboard/forms/image-manager code now loads
  as a separate bundle chunk, only when someone visits `/admin` — confirm
  this actually happened by checking your browser's Network tab on the
  homepage (no admin-named chunk should load) after `npm run build`.
- Run a Lighthouse/PageSpeed Insights pass against the real deployed site
  once it's live — see `PROJECT_REQUIREMENTS.md` → "Phase 9 verification
  checklist" for what could and couldn't be verified without a live
  deployment.
- This remains a client-rendered SPA with no server-side rendering —
  search engines that don't execute JavaScript will only see
  `index.html`'s default meta tags regardless of the per-page SEO hook.
  Google/Bing do execute JS and will see the real per-page titles.
- **Replace `public/og-image.svg`** with a real 1200×630 JPG/PNG photo
  before relying on social link previews (WhatsApp/Facebook/etc.) looking
  their best — the SVG placeholder closes a real dangling-reference bug
  found in Phase 10 QA, but SVG `og:image` support is inconsistent across
  platforms.
- **Read `PROJECT_REQUIREMENTS.md` → "Phase 10 QA report"** — it lists
  specific, genuine bugs found and fixed in the final QA pass (not a
  rubber-stamp confirmation), plus what a code-review pass cannot
  substitute for: an actual look-over in a real browser across real
  device sizes before launch.
