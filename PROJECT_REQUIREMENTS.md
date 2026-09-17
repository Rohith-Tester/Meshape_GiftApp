# MeShape Gift Shop — Project Requirements Checklist

Status legend: ✅ Done · 🔶 Partial / scaffolded · ⬜ Not started

| # | Requirement | Phase | Status | Location | Notes |
|---|---|---|---|---|---|
| 1 | Centralized business info config | 1 | ✅ | `src/config/business.js` | Name, address, hours, delivery text, WhatsApp/phone, Instagram, Maps link |
| 2 | Craft Tech branding, subtle, non-overpowering | 1 | 🔶 | `src/components/layout/Footer.jsx`, `src/assets/branding/README.md` | Logic + fallback wordmark in place; **real logo file must be added by client** at `src/assets/branding/craft-tech-logo.svg` |
| 3 | React + Vite + JS + React Router, component architecture | 1 | ✅ | whole `src/` tree | `npm install` could not be executed in this sandbox (no network) — see README "Known Limitation" |
| 4 | Scalable architecture for 100+ products, future backend/auth/payments | 1 | ✅ | `src/config/`, `src/context/`, Firestore (Phase 8) | Genuinely backend-backed as of Phase 8 — see rows 26–30 |
| 5 | Extreme "WOW" cinematic visual design system | 1 | 🔶 | `src/styles/tokens.css`, `src/styles/animations.css` | Palette, type scale, spacing, shadows, motion tokens defined; full hero/section animation choreography is Phase 2 |
| 6 | Loading screen | 1 | ✅ | `src/components/ui/Loader.jsx` | Single orchestrated reveal, respects `prefers-reduced-motion` |
| 7 | Glass/translucent navbar + animated mobile menu | 1 | ✅ | `src/components/layout/Navbar.jsx` | Scroll-aware blur backdrop, sliding mobile panel |
| 8 | Footer with business info + Craft Tech credit | 1 | ✅ | `src/components/layout/Footer.jsx` | |
| 9 | Floating WhatsApp button | 1 | ✅ | `src/components/layout/FloatingWhatsApp.jsx` | Links to `wa.me/<order number>` |
| 10 | All required customer routes reachable | 1 | ✅ | `src/router.jsx` | Rendered as on-brand placeholders pending their build phase |
| 11 | Admin routes reachable, security-aware placeholders | 1 | ✅ | `src/pages/admin/` | Superseded by real Firebase-backed admin auth in Phase 8 — see rows 26–28 |
| 12 | Home page hero + sections | 2 | ✅ | `src/pages/Home.jsx`, `src/components/home/` | Hero, Featured Categories, Popular Gifts, Offers, Best Sellers, Why Choose Us, Shop Preview, Testimonials, CTA |
| 13 | Product catalogue (100+ ready) + product cards | 2 | ✅ | `src/data/products.js`, `src/components/product/ProductCard.jsx` | 20 demo products now; data shape scales to 100+ without code changes |
| 14 | Smart search with ranked autocomplete | 2 | ✅ | `src/utils/search.js`, `src/components/search/SearchBar.jsx` | Ranking: exact name → starts-with → contains → category → tags/keywords → description, all computed live from product data |
| 15 | Category / offer / price filtering + sorting | 2 | ✅ | `src/pages/Products.jsx`, `src/components/product/ProductFilters.jsx` | |
| 16 | Genuinely relevant related products | 2 | ✅ | `src/utils/relatedProducts.js` | Scored by shared category/type/tags/keywords/gifting purpose; excludes zero-overlap products rather than padding |
| 17 | Wishlist (add/remove/view/move to cart) | 2 | ✅ | `src/context/WishlistContext.jsx`, `src/pages/Wishlist.jsx` | Intentionally still `localStorage`, per customer browser — see "Phase 8 architecture notes" for why this was deliberately not migrated to Firestore |
| 18 | Product details page | 2 | ✅ | `src/pages/ProductDetail.jsx` | |
| 19 | Customization (text + image upload, preview) | 3 | ✅ | `src/components/product/CustomizationModal.jsx`, `src/utils/validation.js` | Name/message/photo, client-side file validation (type + size), preview shown before adding to cart; uploaded image kept separate from product images |
| 20 | Cart (image, qty, price, customization, totals) | 3 | ✅ | `src/pages/Cart.jsx`, `src/components/cart/` | Intentionally still `localStorage`, per customer browser — see "Phase 8 architecture notes" |
| 21 | Pickup / Home delivery selection + address form | 3 | ✅ | `src/pages/Order.jsx`, `src/components/order/` | Full field set per Master Spec §18, validated in `src/utils/validation.js` |
| 22 | "Delivery charge to be confirmed by shop" (no auto fee) | 3 | ✅ | `src/config/delivery.js` | No numeric fee anywhere; `DELIVERY_CHARGE_TEXT` centralized so Admin (Phase 7+) can introduce a real fee later in one place |
| 23 | Unique Order ID generation (e.g. `MS-20260906-001`) | 4 | 🔶 | `src/utils/orderId.js` | **Still per-browser, not globally unique** — deliberately not moved to Firestore in Phase 8; see "Phase 8 architecture notes" for why |
| 24 | WhatsApp order message generation + manual send | 4 | ✅ | `src/utils/whatsappMessage.js`, `src/components/order/OrderConfirmation.jsx` | Full message built from every field in Master Spec §21; customer reviews it in a textarea and opens WhatsApp themselves — nothing is auto-sent |
| 25 | Our Shop page + gallery + Maps + Instagram | 5 | ✅ | `src/pages/Shop.jsx`, `src/components/shop/`, `src/data/shopGallery.js` | Filterable gallery with lightbox; Instagram now also linked from Contact and the homepage Shop Preview, not just the footer |
| 26 | Admin auth (real, hashed, protected routes) | 8 | ✅ | `src/context/AdminAuthContext.jsx`, `src/components/admin/ProtectedAdminRoute.jsx`, `firestore.rules`, `admin-scripts/setAdminClaim.js` | **Genuinely real as of Phase 8.** Firebase Auth (Google-managed password hashing/sessions) + an `admin` custom claim + Firestore Security Rules enforced server-side. See "Phase 8 verification checklist" below for exactly what was statically verified vs. what requires your live Firebase project to confirm |
| 27 | Admin product CRUD + image management | 6/8 | ✅ | `src/context/ProductsContext.jsx`, `ProductsManager.jsx`, `ProductForm.jsx`, `ImageManagerField.jsx`, `src/utils/cloudinaryUpload.js` | CRUD logic built in Phase 6, now backed by real Firestore (shared across every device, not per-browser) and Cloudinary image uploads (see disclosed limitation below) as of Phase 8 |
| 28 | Admin shop gallery management | 6/8 | ✅ | `src/context/ShopGalleryContext.jsx`, `ShopGalleryManager.jsx` | Same Firestore + Cloudinary upgrade as products |
| 29 | Offers/discounts (product/category/global, dated) | 7/8 | ✅ | `src/context/OffersContext.jsx`, `OffersManager.jsx`, `OfferForm.jsx`, `OfferTable.jsx` | CRUD built in Phase 7, now backed by real Firestore as of Phase 8 |
| 30 | Backend + database + production security | 8 | 🔶 | `src/lib/firebase.js`, `firestore.rules`, Firestore, Cloudinary | Core backend/database/auth is genuinely real (see row 26). **Not included**, by explicit scope decision: Cloud Functions/signed uploads (requires linking Firebase billing — see disclosed Cloudinary limitation below), a globally-unique order ID counter, and email/payment gateway integration (Master Spec §38 explicitly defers these to "later") |
| 31 | Deployment, SEO polish, performance pass | 9 | ✅ | `vercel.json`, `public/sitemap.xml`, `public/robots.txt`, `src/hooks/useDocumentHead.js`, `src/utils/cloudinaryImage.js`, `src/components/system/` | See "Phase 9 architecture notes" below for full detail — SPA rewrites + security headers, per-page SEO, route-level code splitting, Cloudinary image optimization, and a top-level error boundary |
| 32 | Full QA + bug fixing + final polish | 10 | ✅ | See "Phase 10 QA report" below | Multiple genuine bugs found and fixed via systematic code review — not a rubber-stamp pass. Full list below |

## Phase 2 architecture notes

- **Pricing is never hardcoded per product.** `src/utils/pricing.js` resolves the best currently-active offer from `src/data/offers.js` against each product at render time. This is what lets Phase 7's Admin offer management plug in later without touching product data or components.
- **Cart and Wishlist contexts were built now, not deferred to Phase 3**, because Wishlist's "move to cart" (required in Phase 2) needs somewhere to move an item to. Both persist to `localStorage` under DEMO MODE — this is expected to be swapped for backend-synced storage in Phase 8 behind the same `useCart()` / `useWishlist()` hook shape, so no consuming component should need to change.
- **Cart line items already carry a `customization` field (`null` for now).** Phase 3 fills this in via a customization step before `addItem()` is called for customizable products, rather than changing the cart's data shape.
- The `/cart` and `/order` **pages themselves** are still Phase 3 placeholders — items added via "Add to Cart" / "Order Now" / "Move to Cart" are stored correctly and will appear once those pages are built.

## Phase 3 architecture notes

- **Customization data lives entirely client-side (DEMO MODE).** The uploaded photo is read into a base64 data URL for on-page preview and is stored only in that cart line's `customization.imagePreviewUrl` — never merged into `product.images`. A production backend (Phase 8) would upload the file to real storage and store a URL instead; the data shape consumed by components would not need to change.
- **File upload validation is client-side only right now** (`src/utils/validation.js`: extension + MIME type + 5MB size ceiling). Master Specification §30–31 requires server-side re-validation in production — noted here so it isn't forgotten once a backend exists.
- **The Order page stops short of Phase 4 on purpose.** It validates the fulfillment form and shows a full read-only order review, but the "Send Order via WhatsApp" action is visibly disabled with a "coming in Phase 4" label rather than being faked — Order ID generation and the WhatsApp message/link are Phase 4 work.

## Phase 4 architecture notes

- **Order IDs are unique per browser, not yet globally unique.** `src/utils/orderId.js` keeps a per-day sequence counter in `localStorage`. Two different customers on two different devices could theoretically both generate `MS-20260906-001`. Phase 8 (backend) should issue IDs from a single server-side counter or UUID to close this gap — flagged here so it isn't forgotten.
- **The WhatsApp message is plain text only.** Per Master Spec §21, a `wa.me` link cannot attach the customer's uploaded customization photo automatically. The generated message says so explicitly and asks the customer to share the photo in the same WhatsApp chat right after sending — the photo itself is already visible in the on-page order review.
- **Nothing is sent automatically.** "Open WhatsApp to Send" opens `wa.me` with the message pre-filled; the customer still presses Send inside WhatsApp themselves, as the spec requires.
- **The Order ID is generated once per checkout session** — editing the form and re-reviewing keeps the same ID rather than minting a new one each time. A new ID is only generated after "Start a New Order" (which also clears the cart).

## Phase 5 architecture notes

- **Shop gallery photos live in `src/data/shopGallery.js`**, shaped as `{ id, url, alt, category }` — the exact shape Admin's shop-gallery management (Phase 6, requirement 28) will read and write, so swapping sample photos for real ones later won't require touching `ShopGallery.jsx`.
- **The image lightbox (`src/components/shop/ImageLightbox.jsx`) is generic**, not shop-specific — it takes any `{url, alt}` array, so it can be reused for product galleries or Admin image previews later without rebuilding it.
- **Instagram now appears in three places** as section 25 requires: the footer (Phase 1), the homepage's Shop Preview section, and the Contact page — all pulling the same link from `src/config/business.js`, never retyped.
- **Google Maps uses the exact provided short link** for both "View on Google Maps" and "Get Directions" (section 26) — no embed iframe was added, since the supplied link is a share link, not an embeddable maps URL; embedding a live map would need a separate Maps Embed API key, which is a production/API-key decision left for later if wanted.

## Phase 6 architecture notes

- **The single biggest decision this phase: Admin CRUD is real, not a mockup.** `src/context/ProductsContext.jsx` and `src/context/ShopGalleryContext.jsx` are now the one source of truth for products and shop photos — every customer-facing page (Home, Products, ProductDetail, Wishlist, search, Shop) reads from them instead of the static files in `src/data/`. Add, edit, or delete a product in Admin and it immediately changes what a customer browsing the site sees, in the same browser. This is what section 10 ("normal product management must NOT require source-code editing") actually asks for.
- **This is still DEMO MODE storage** — `localStorage`, per browser, not a shared database. Two different browsers/devices will see different catalogues until Phase 8 replaces these contexts' internals with real API calls. The `useProducts()` / `useShopGallery()` hook shape is written so that swap shouldn't require changing any consuming page again.
- **No fake authentication was built, on purpose.** `src/context/AdminAuthContext.jsx` has a long comment explaining why: there's no backend to safely check a password against, and hardcoding one in frontend JavaScript would be fake security (§45 explicitly forbids this — anyone can read it in the shipped bundle). `/admin` shows a visibly *disabled* username/password form as a placeholder for what Phase 8's real login will look like, plus a separate, clearly-labeled "Continue in Demo Mode" button that does no credential checking at all — it just sets a session flag so a developer/owner can preview the dashboard.
- **`/admin/dashboard` is route-guarded** (`ProtectedAdminRoute.jsx`) against that same demo flag, and every admin page shows a persistent DEMO MODE banner. None of this should be mistaken for production security.
- **Admin got its own route tree and shell** (`AdminShell.jsx`, mounted at `/admin/*` in `router.jsx`), separate from the customer-facing `Layout` — no public navbar/footer/floating WhatsApp button inside Admin, just a minimal branded top bar and a Craft Tech credit, as the original router comment from Phase 1 planned for.
- **Offers management stays read-only in Admin this phase** (`OffersPreview.jsx`), on purpose — full offer CRUD is explicitly Phase 7 in the master phase order, so only a preview table was built now, sourced from the same `src/data/offers.js` the storefront already uses.
- **Settings is read-only**, showing the live `src/config/business.js` values with an explanation that safely persisting edited business info needs a backend (Phase 8) — editing it from the UI without one would either silently do nothing or require another localStorage hack for data that arguably shouldn't live only in one browser.
- **Uploaded images (products and shop gallery) are stored as base64 data URLs**, same approach as the Phase 3 customization upload — fine for a handful of images in a demo, but will bloat `localStorage` quickly at real catalogue size. Phase 8 should upload to real file storage and store URLs instead.

## Phase 7 architecture notes

- **Offers followed the exact same pattern as Products and Shop Gallery** (Phase 6): `src/context/OffersContext.jsx` is the one source of truth, localStorage-backed, seeded from `src/data/offers.js`. Every page that showed offers before (Home's Offers section, the "On Offer" filter on Products, pricing everywhere via `getProductPricing`) now reads from this context — so creating, editing, or deleting an offer in Admin genuinely changes prices and badges customers see, immediately.
- **A new `getOfferStatus()` helper** was added to `src/utils/pricing.js` so the Admin offers table can show a meaningful lifecycle (`Active` / `Scheduled` / `Expired` / `Inactive`) instead of just echoing the raw `active` checkbox — an offer dated for next month with `active: true` is "Scheduled," not "Active," and that distinction matters for someone managing offers.
- **The form enforces the spec's three targeting modes** (§27): Specific Product, Entire Category, or All Products, with the target selector changing based on which is picked, so an offer can never end up with a dangling/invalid target.
- **Offers still never apply automatically or globally** — every offer requires an explicit `appliesTo` choice, matching §27's requirement, and the "Apply To" field defaults to nothing being silently selected.

## Phase 8 architecture notes

- **Products, Offers, and Shop Gallery are now backed by real Firestore**, not `localStorage`. `ProductsContext.jsx`, `OffersContext.jsx`, and `ShopGalleryContext.jsx` were rewritten internally (Firestore `onSnapshot` + async CRUD) while keeping the exact same hook names/shapes (`useProducts()`, `useOffers()`, `useShopGallery()`) that every consuming page already used — this is the "swap the internals, not the API" migration the Phase 6/7 notes planned for. A change made in Admin now appears for every customer, on every device, immediately — closing the single-browser limitation those phases explicitly flagged.
- **`resetToDemoData()` was removed** from all three contexts during this migration. It was never called from any UI component in Phases 6–7 (confirmed by search before removing it), and repurposing it against a live shared database — a one-click action that could bulk-overwrite real customer-facing data for everyone — would have been actively dangerous rather than a neutral carry-over. `admin-scripts/seedFirestore.js` covers the "populate a fresh database with the demo catalogue" need instead, as a deliberate, one-off, locally-run action.
- **Admin authentication and authorization are now genuinely real**, replacing the Phase 6/7 `sessionStorage` flag entirely: Firebase Auth (Google-managed password hashing and sessions) plus an `admin: true` custom claim, enforced server-side by `firestore.rules` — never trusted from anything the client says about itself. Full detail in the verification checklist below.
- **Cart and Wishlist were deliberately NOT migrated to Firestore.** They remain `localStorage`-backed, per customer browser. This wasn't an oversight: the approved Phase 8 design scoped the backend to the admin-managed catalog (products/offers/gallery) and real authentication, not customer-side order state — the site's order flow is WhatsApp-based, not a persisted checkout, so there's no "shared" cart/wishlist data that needs syncing across devices for a given customer. Migrating these would be a reasonable future enhancement (e.g. for customer accounts, a Master Spec stretch goal) but was out of scope for what was approved here.
- **Order ID generation was also deliberately left per-browser** (`src/utils/orderId.js`, unchanged). Making it globally unique would require a new Firestore collection with a counter document that anonymous customers (not just the admin) need to write to — which conflicts with `firestore.rules`' current "admin-only writes" model and would need either a public-but-abuse-resistant rule (hard to write correctly) or a Cloud Function (billing-dependent, ruled out — see below). Flagging this as a known, disclosed gap rather than silently expanding scope to fix it.
- **Business settings (`src/config/business.js`) were deliberately kept as static code**, not migrated to a `settings/business` Firestore document, even though `firestore.rules` already reserves that path for admin-only writes if this decision is revisited later. Rationale: this data changes far less often than a product catalog, and moving it would add a database round-trip to every single page for no real benefit at this scale.
- **Customization photo uploads (the customer-facing flow in `CustomizationModal.jsx`) were also deliberately left untouched** — still a base64 preview, not a Cloudinary upload. These images are ephemeral, per-order, and intended to reach the shop as a WhatsApp attachment, not to persist in a database or CDN. Only Admin's product and shop-gallery images (which genuinely need permanent, shared hosting) were moved to Cloudinary.
- **Image storage uses an unsigned, restricted Cloudinary upload preset — explicitly NOT described as fully hardened**, per your instruction. See `src/utils/cloudinaryUpload.js` for the in-code explanation and the verification checklist below for the full tradeoff and mitigation.
- **`admin-scripts/`** holds the two trusted, locally-run Node scripts this architecture requires (`setAdminClaim.js`, `seedFirestore.js`) plus its own `package.json` and `.gitignore`-protected space for `service-account-key.json`. Nothing in this folder is built by Vite or deployed — it's intentionally outside `src/`.

## Phase 8 verification checklist

Per your request, this section explicitly separates what I could verify by reading and statically checking the code in this sandbox, from what genuinely requires your live Firebase/Cloudinary/Vercel setup to confirm — I'm not claiming to have tested things I couldn't actually run.

**✅ Statically verified in this sandbox:**
- All 86 files under `src/` (plus `admin-scripts/*.js` and root config JSON) balance-check clean (braces/parens/brackets) and every relative import resolves to a real file — same automated check run after every prior phase.
- No dangling references to anything removed this phase (`DemoModeBanner`, `resetToDemoData`, `isDemoAuthenticated`, `enterDemoMode`, `exitDemoMode`) — confirmed via full-codebase search, all clean.
- `firestore.rules` is structurally balanced and follows correct Firestore Rules Language v2 syntax (I'm confident in this syntax from training, but see the "requires your setup" list below for why I can't call this a substitute for actually testing it).
- `firebase.json`, `firestore.indexes.json`, `package.json`, and `admin-scripts/package.json` are all valid JSON.
- Code-review confirmed: `isAdmin()` in `firestore.rules` checks `request.auth.token.admin == true` (a server-verified custom claim), not `request.auth != null` alone (mere sign-in) or any client-suppliable value — this is what makes authorization, not just authentication, the actual gate.
- Code-review confirmed: `AdminAuthContext.jsx` never stores or checks a password itself; `login()` only forwards credentials to Firebase's `signInWithEmailAndPassword`, and `isAdmin` is derived from `getIdTokenResult()`, not a boolean the client sets.
- Code-review confirmed: `ProtectedAdminRoute.jsx` waits for `initializing` to resolve before redirecting, prized specifically to avoid a genuinely-signed-in admin flashing a redirect on page load — and confirmed this is a UX nicety, not something Firestore itself trusts (rules are re-evaluated independently on every request regardless of what this component decides to render).
- Code-review confirmed: no secret value (Cloudinary API secret, Firebase service account key, or any password) appears anywhere under `src/` or in any file that Vite would bundle. The only place a real secret is ever expected (`admin-scripts/service-account-key.json`) is `.gitignore`d and structurally outside the deployed app.
- Code-review confirmed: `.env.example` contains no real values, only placeholder keys with explanatory comments distinguishing client-safe values (Firebase config, Cloudinary cloud name/preset) from what must never be added (Cloudinary API secret, service account keys).
- Code-review confirmed: every admin mutation (`ProductsManager`, `OffersManager`, `ShopGalleryManager`) now wraps its Firestore calls in `try/catch` and surfaces a real error message on failure (e.g., permission-denied) instead of silently pretending success — matches the "no broken placeholder functionality" requirement.

**⚠️ Requires YOUR live Firebase/Cloudinary/Vercel setup — I cannot verify these from this sandbox (no network access, no real project credentials exist here):**
- **Deploying and testing `firestore.rules` against a real database.** I cannot run `firebase emulators:start` or `firebase deploy --only firestore:rules` here. Please run the emulator (or the Firestore Rules Playground in the Firebase Console) and confirm: (a) an unauthenticated request can read `/products` but not write it, (b) a signed-in user WITHOUT the admin claim can read but still cannot write, (c) a signed-in user WITH the admin claim can write.
- **Actually running `admin-scripts/setAdminClaim.js`** against your project, and confirming the claim takes effect after sign-out/sign-in (or the ~1 hour token refresh window).
- **Actually running `admin-scripts/seedFirestore.js`** and confirming the 20 demo products, 3 offers, and 8 gallery photos appear correctly in your Firestore console.
- **Creating the Cloudinary unsigned upload preset** with the restrictions this design assumes (allowed formats, max file size, fixed folder) — I described the settings to use in `admin-scripts/README.md`/`.env.example`, but cannot create them for you.
- **Confirming `npm install` succeeds** and pulls in the `firebase` package correctly, and that `npm run build` produces a clean production bundle — this sandbox has no network access to the npm registry (same limitation noted in every prior phase).
- **End-to-end sign-in test**: visiting `/admin`, signing in with real credentials, confirming redirect to `/admin/dashboard`, confirming sign-out actually clears the session (revisit `/admin/dashboard` afterward and confirm it redirects back to `/admin`).
- **Setting the real environment variables** in Vercel's project settings (not just locally) and confirming a deployed build can actually reach your Firebase project and Cloudinary account.

**🔓 Disclosed, permanent limitations (not fixable without a billing-dependent service — stated plainly, not glossed over):**
- **Cloudinary's unsigned upload preset is a genuine, permanent quota-abuse risk, not "fully hardened."** Anyone who extracts the preset name from the deployed JS bundle can POST arbitrary images to your Cloudinary account from outside this app, consuming free-tier storage/bandwidth credits. This does **not** allow them to alter the live site — that still requires a Firestore write, which remains genuinely protected by the admin-only rule — but it can waste your Cloudinary quota or clutter your media library. The only fix is signed uploads via a Firebase Cloud Function, which requires linking a billing account (Blaze plan) to Firebase. This was explicitly ruled out per your approved ₹0/no-card design. Mitigate by keeping the preset's format/size/folder restrictions tight and occasionally checking Cloudinary's usage dashboard.
- **Order IDs are unique per browser, not globally**, as noted above — a disclosed, unfixed gap, not an oversight.
- **No email or payment gateway integration** — Master Spec §38 explicitly defers both to "later," and Phase 8 didn't touch either.

## Phase 9 architecture notes

- **Nothing from Phase 8 was modified.** Firebase Auth, `firestore.rules`, all three Firestore contexts (`ProductsContext`, `OffersContext`, `ShopGalleryContext`), `AdminAuthContext`, `cloudinaryUpload.js`, and everything under `admin-scripts/` are byte-for-byte what Phase 8 left them (confirmed by file timestamp before starting this phase). Phase 9 only added new files and made additive integration changes (calling a new SEO hook, wrapping images in a new optimization helper, changing *how* Admin's code is loaded via `router.jsx`) — never touching auth, security rules, or data logic itself.

- **Route-level code splitting (the main performance change).** The entire Admin surface — `AdminShell`, `AdminLogin`, `AdminDashboard`, and `ProtectedAdminRoute` — is now `React.lazy()`-loaded in `router.jsx`, wrapped in `<Suspense>` with a lightweight loading fallback. A customer who never visits `/admin` never downloads any of that code (which includes every Firestore-write call, every admin form, and the image manager). This is worth calling out because it also has a *security-adjacent* benefit: less of the admin-side code surface sits in the public bundle for someone to casually read, even though the real protection remains Firestore Security Rules, not obscurity.

- **Per-page SEO without adding a dependency.** `src/hooks/useDocumentHead.js` sets `document.title`, meta description, Open Graph title/description, canonical URL, and a `robots` directive directly via DOM APIs — no `react-helmet` or similar. Every customer-facing page now has a distinct, accurate title and description; `ProductDetail` sets these dynamically per product. Honest caveat: this is a client-rendered SPA with no server-side rendering, so a crawler that doesn't execute JavaScript still only sees `index.html`'s default tags. Google and Bing do execute JS and will see the real per-page values; this doesn't fix indexing for crawlers that don't.

- **`noindex` applied to session-specific pages** (`Wishlist`, `Cart`, `Order`) and both admin routes — none of these have unique content worth ranking, and indexing them risks thin/duplicate-content signals. `robots.txt` also explicitly disallows `/admin`.

- **Cloudinary image optimization** (`src/utils/cloudinaryImage.js`) inserts `f_auto,q_auto` (and an optional `w_<n>` resize) into any Cloudinary-hosted image URL, so browsers automatically receive a smaller, well-supported format at an appropriate size — applied everywhere a product or shop-gallery image renders on the customer-facing site (`ProductCard`, `ProductGallery`, `ShopGallery`, `ImageLightbox`, `FeaturedCategories`, cart/order line images, wishlist). It's a safe no-op for the demo catalogue's `picsum.photos` placeholder images and for customer-uploaded customization photos (which are intentionally never Cloudinary-hosted — see Phase 8 notes). This required zero new dependencies since it's plain URL string manipulation.

- **A top-level `ErrorBoundary`** (`src/components/system/ErrorBoundary.jsx`) now wraps the whole app. Previously, any unexpected render error anywhere would produce a blank white screen with no way back for a customer; now they get a page with a "Back to Home" button and a direct WhatsApp link. This satisfies Master Spec §32/§37's error-handling requirements at the top level, complementing (not replacing) the page-specific empty/error states already built in earlier phases.

- **`vercel.json`** adds the SPA rewrite rule Vercel requires for client-side routing (without it, refreshing or directly visiting any non-root URL like `/products` returns a 404 from Vercel's static host — a real, common deployment bug for SPAs, not a hypothetical one) plus baseline production security headers (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`) and long-lived caching for hashed asset files.

- **`public/sitemap.xml`** lists the fixed top-level routes only (Home, Products, Shop, About, Contact). Individual product URLs are deliberately excluded — they come from Firestore at runtime with no build-time list to generate a sitemap entry from in this client-rendered SPA, and there's no static-site-generation step in this project. Crawlers that execute JavaScript will still discover product pages by following links from `/products`. The domain placeholder (`REPLACE-WITH-YOUR-DOMAIN`) needs a manual edit once the production URL is known — flagged here rather than guessed at.

- **No new npm dependencies were added this phase.** Code splitting uses React's built-in `lazy`/`Suspense`; SEO uses direct DOM APIs; image optimization is string manipulation. This matches Master Spec §34's caution against "unnecessary animation libraries or excessive dependencies," applied here to tooling generally.

## Phase 9 verification checklist

**✅ Statically verified in this sandbox:**
- All 90 files under `src/` balance-check clean and every relative import resolves — same automated suite run after every prior phase.
- Every component `.css` file added or touched this phase is actually imported by its component.
- `vercel.json` is valid JSON; `public/sitemap.xml` is well-formed XML.
- Confirmed via file-timestamp comparison that every Phase 8 file (`AdminAuthContext.jsx`, `ProductsContext.jsx`, `firestore.rules`, `cloudinaryUpload.js`, `admin-scripts/setAdminClaim.js`) was NOT modified during this phase.
- Code-review confirmed `useDocumentHead()` is called unconditionally before any early return in every page that has one (`ProductDetail`, `AdminLogin`) — required because React hooks cannot follow a conditional return.
- Code-review confirmed `getOptimizedImageUrl()` only rewrites URLs containing `res.cloudinary.com/.../upload/` and returns every other URL completely unchanged — verified this can't corrupt a `picsum.photos` demo URL or a customer's base64 customization image.

**⚠️ Requires YOUR live setup to fully confirm — same sandbox limitation as every prior phase (no network access here):**
- `npm run build` producing a real, working production bundle, and confirming Vite actually emits separate chunks for the lazy-loaded admin routes (check the build output file list, or the Network tab: visiting `/` should never trigger a request for an admin-named chunk).
- Deploying to Vercel and confirming: (a) directly visiting a deep link like `yoursite.com/products` works instead of 404ing, (b) the security headers actually appear in the response (check via browser devtools → Network → any request → Response Headers).
- Editing `public/sitemap.xml` and `public/robots.txt` to replace `REPLACE-WITH-YOUR-DOMAIN` with the real production domain once it's known, then submitting the sitemap in Google Search Console.
- Running a Lighthouse/PageSpeed Insights pass against the real deployed site to confirm the code-splitting and image-optimization changes actually move the needle on load performance — I can reason about why these changes should help, but only a real deployed build produces real Core Web Vitals numbers.

**🔓 Disclosed, not fixed this phase (unchanged from Phase 8, still accurate):**
- Cloudinary's unsigned upload preset remains a quota-abuse risk, not a site-security risk — unchanged from Phase 8, not revisited here.
- Order IDs remain per-browser, not globally unique — unchanged, not revisited here.
- This remains a client-rendered SPA with no server-side rendering or static-site generation — search engines that don't execute JavaScript will only ever see `index.html`'s default meta tags, regardless of `useDocumentHead()`. A future move to a pre-rendering approach (e.g. Vite's SSG plugins, or a framework migration) would close this gap, but is a larger architectural change outside Phase 9's scope.

## Phase 10 QA report

This was a genuine code-review pass across the full Phase 1–9 codebase, not a rubber-stamp confirmation. Given this sandbox has no way to run a live browser, "testing" here means systematic static analysis: automated scripts (balance/import/CSS-coverage checks, hook-ordering checks, icon-label checks, htmlFor/id checks, CSS class-collision checks) plus manual reasoning through component logic and timing. Genuine bugs were found. They're listed here rather than glossed over.

**Bugs found and fixed:**

1. **Loader fade-out never actually played (bug since Phase 1).** `Loader.jsx` unmounted the component via React state at exactly `minDurationMs` (900ms) — the same moment `Loader.css`'s `animation-delay: 900ms` was supposed to *begin* the fade-out. React was removing the DOM node before the animation had a chance to run, so the loading screen cut out abruptly instead of fading smoothly as designed. Fixed by making the unmount timer wait for delay + fade duration, with comments in both files cross-referencing the other's timing values so they can't silently drift apart again.

2. **Admin delete-confirmations had no Escape-to-close and duplicated code.** `ProductsManager.jsx` and `OffersManager.jsx` each had their own hand-rolled confirm overlay; neither supported closing with Escape (inconsistent with the customer-facing `CustomizationModal`, which does), and the near-identical markup was duplicated across both files. Extracted a shared `ConfirmDialog.jsx` component with proper `role="alertdialog"`, `aria-modal`, and Escape handling, and refactored both managers to use it — fixing the accessibility gap and the duplication in one pass.

3. **Customer-facing pages never surfaced a genuine Firestore connection failure (real gap in Master Spec §37 "network errors" coverage).** Since Phase 8, `ProductsContext`/`OffersContext`/`ShopGalleryContext` have all exposed an `error` state, but only the Admin dashboard ever read it. A real outage (bad Firebase config, network failure, misconfigured security rules) would have rendered to a customer as an empty catalogue with zero explanation — indistinguishable from "this shop genuinely has no products." Built a reusable `DataLoadError` banner and wired it into every customer-facing page that reads live Firestore data:
   - `Home.jsx` — shows the banner above Featured Categories without hiding the rest of the page (Hero, Why Choose Us, Shop Preview, Testimonials don't depend on this data and keep working)
   - `Products.jsx` — shows the banner, and suppresses the now-misleading "no results, clear your filters" empty state when the real cause is a connection failure, not a bad search
   - `ProductDetail.jsx` — previously, a connection failure looked identical to "this product doesn't exist"; now distinguished, and also no longer flashes a false "not found" state while Firestore's first snapshot is still loading on a slow connection
   - `Shop.jsx` — banner for gallery load failures
   - `Wishlist.jsx` — the trickiest case: previously, a customer with genuinely saved wishlist items would see "your wishlist is empty" if the catalogue failed to load, since the lookup by id silently returned nothing. Fixed by checking `wishlistIds.length` (what the customer actually saved) separately from whether the products needed to display them successfully loaded.

4. **Design-system consistency: hardcoded colors instead of tokens.** Found ad-hoc hex values (`#fff`, one-off success/danger greens and reds) scattered across `SecurityNote.css`, `ProductsManager.css`, `OffersManager.css`, `OrderConfirmation.css`, `FloatingWhatsApp.css`, `ImageLightbox.css`, and `OfferTable.css` instead of the design token system established in Phase 1. Added proper `--color-success-tint-bg`/`--color-success-tint-border`/`--color-danger-tint-bg` tokens to `tokens.css` and replaced every ad-hoc instance. Craft Tech's own brand gradient in the footer was deliberately left hardcoded exactly as specified (it's a different brand's colors, not MeShape's system) — added a comment explaining why, rather than "fixing" something that wasn't broken.

5. **Admin topbar had no mobile wrap protection.** `AdminShell.css`'s topbar used `justify-content: space-between` with no `flex-wrap`, and the signed-in admin's email had no length constraint — a long email address on a narrow phone screen could have overflowed the layout. Added `flex-wrap: wrap` and `text-overflow: ellipsis` with a `max-width` on the email display.

6. **Dangling `og:image` reference since Phase 1.** `index.html` referenced `/og-image.jpg`, which was never created — every WhatsApp/social link share of this site would have shown a broken image. Created a real, branded placeholder (`public/og-image.svg`) and updated the reference. Documented honestly: SVG `og:image` support is inconsistent across platforms (older WhatsApp/Facebook crawlers in particular), so replacing this with a real 1200×630 JPG/PNG photo is recommended before serious social-sharing use — flagged as a pre-launch item below, not silently left as a permanent fix.

**Checks run that found no issues (stated for completeness, not padding):**
- Every `.map()` call rendering JSX has a `key` prop
- No `htmlFor`/`id` mismatches in any form
- No `<button>` inside a `<form>` missing an explicit `type=` (which would default to `submit` and could cause accidental form submission)
- No icon-only buttons missing an `aria-label`
- No hook called after an early `return` (verified by targeted review of every page with a conditional return, given React's rules-of-hooks)
- No stray `console.log`/`console.debug` debug statements (the one `console.error` in `ErrorBoundary.jsx` is intentional)
- No genuine CSS class-name collisions across the global stylesheet (one false positive investigated: `.btn--secondary` is safely scoped via `.hero__actions .btn--secondary`, not redefined)
- `Cart.jsx`/`Order.jsx` don't read live Firestore data directly (they use `CartContext`'s own snapshot), so they don't share the network-error gap fixed in item 3 above

**Confirmed throughout: nothing from Phase 8 was touched.** `AdminAuthContext.jsx`, `firestore.rules`, all three Firestore contexts, `cloudinaryUpload.js`, and everything in `admin-scripts/` were checked by file timestamp before, during, and after this QA pass — all unchanged from their original Phase 8 session.

**Pre-launch items flagged, not silently fixed (require your input or a live environment):**
- Replace `public/og-image.svg` with a real 1200×630 JPG/PNG photo before relying on social link previews looking their best.
- Replace `REPLACE-WITH-YOUR-DOMAIN` in `public/sitemap.xml` and `public/robots.txt` (flagged since Phase 9, still outstanding — this requires knowing the real production domain).
- A genuine visual/responsive QA pass in a real browser across real device sizes is something I cannot substitute for with code review alone — the fixes above address concrete, reasoned-through issues (e.g. the topbar wrap fix), but a live look-over is still worth doing before launch, especially on very small phone screens and very large desktop monitors.
- Everything listed as "requires your live setup" in the Phase 8 and Phase 9 verification checklists above still applies — Phase 10 didn't change any of those.

## Security & honesty notes (Master Spec §29–31, §45)

- No password, API secret, or credential of any kind exists anywhere in this codebase — and as of Phase 8, that's because real authentication now exists via Firebase Auth, not because auth is still unbuilt.
- `.env.example` documents every environment variable this app reads, with explicit comments distinguishing client-safe values (Firebase config, Cloudinary cloud name/preset) from what must never appear there (Cloudinary API secret, any service account key).
- Real authentication, server-verified sessions, and Firestore-enforced authorization are implemented and described in full in "Phase 8 architecture notes" and the verification checklist above. Nothing admin-related in this codebase is a placeholder anymore — the one remaining disclosed gap (Cloudinary's unsigned upload preset) is called out explicitly above rather than glossed over.

## Known limitation in this development environment

This sandbox has no outbound network access, so `npm install` / `npm run build` could not be executed here to produce a verified `dist/` build or a lockfile, and the Firebase CLI (`firebase emulators:start`, `firebase deploy`) could not be installed or run either. The project structure, imports, and JSX have been written and manually reviewed for correctness — see the "Phase 8 verification checklist" and "Phase 9 verification checklist" above for the precise line between what was statically checked and what requires your live setup. **Before deploying, run locally:**

```bash
npm install
npm run dev     # verify in browser
npm run build   # produce production build

npm install -g firebase-tools
firebase login
firebase deploy --only firestore:rules   # from the project root
```

Please report back any install/build/deploy errors so they can be fixed promptly.

