/**
 * Demo product catalogue.
 *
 * These are SAMPLE products with sample (placeholder) images, as required
 * by the Master Specification section 9 & 39. The owner will add real
 * products/images through Admin in Phase 6 without touching this file's
 * shape — only its content changes (or it is replaced by an API call).
 *
 * Pricing note: `price` is the base price only. Discounts are NEVER
 * hardcoded per product — they are computed dynamically from
 * `src/data/offers.js` via `src/utils/pricing.js`, so Admin-managed offers
 * (Phase 7) can change without editing this file.
 *
 * Placeholder images use a deterministic picsum.photos seed per product so
 * every product gets a distinct, stable-looking image without shipping
 * binary assets in this demo.
 */

const img = (seed, n = 1) =>
  Array.from({ length: n }, (_, i) => `https://picsum.photos/seed/meshape-${seed}-${i}/900/900`);

export const products = [
  {
    id: 'personalized-photo-mug',
    name: 'Personalized Photo Mug',
    category: 'Mugs',
    description:
      'A ceramic mug printed with your favourite photo — a warm, everyday reminder of a special memory. Dishwasher-safe print, single high-resolution photo upload.',
    price: 399,
    images: img('mug', 3),
    tags: ['photo', 'mug', 'personalized', 'coffee', 'gift for her', 'gift for him'],
    keywords: ['photo mug', 'coffee mug', 'custom mug'],
    productType: 'Drinkware',
    giftingPurpose: ['Birthday', 'Anniversary', 'Just Because'],
    customizable: true,
    available: true,
  },
  {
    id: '3d-moon-lamp',
    name: '3D Moon Lamp',
    category: 'Lamps',
    description:
      'A textured 3D-printed lunar lamp that glows warm white or RGB at the touch of a button — a calming night light and a striking décor piece.',
    price: 699,
    images: img('moonlamp', 3),
    tags: ['moon', 'lamp', 'led', 'night light', 'home decor', 'romantic'],
    keywords: ['moon lamp', 'led lamp', 'night lamp'],
    productType: 'Home Decor',
    giftingPurpose: ['Birthday', 'Romantic', 'Anniversary', 'Housewarming'],
    customizable: false,
    available: true,
  },
  {
    id: 'custom-name-keychain',
    name: 'Custom Name Keychain',
    category: 'Keychains',
    description:
      'A durable engraved keychain with a name, initials, or short message of your choice. Compact and thoughtful — a favourite quick gift.',
    price: 199,
    images: img('keychain', 2),
    tags: ['keychain', 'name', 'engraved', 'personalized', 'small gift'],
    keywords: ['custom keychain', 'name keychain', 'engraved keychain'],
    productType: 'Accessories',
    giftingPurpose: ['Birthday', 'Just Because', 'Congratulations'],
    customizable: true,
    available: true,
  },
  {
    id: 'personalized-photo-frame',
    name: 'Personalized Photo Frame',
    category: 'Frames',
    description:
      'A elegant wooden-finish photo frame customized with your chosen picture and an optional short caption — a timeless keepsake for any room.',
    price: 549,
    images: img('frame', 3),
    tags: ['photo', 'frame', 'personalized', 'wall decor', 'keepsake'],
    keywords: ['photo frame', 'custom frame', 'personalized frame'],
    productType: 'Wall Decor',
    giftingPurpose: ['Anniversary', 'Wedding', 'Housewarming'],
    customizable: true,
    available: true,
  },
  {
    id: 'teddy-bear-gift',
    name: 'Teddy Bear Gift',
    category: 'Soft Toys',
    description:
      'A soft, huggable teddy bear in premium plush fabric — a classic gift that never goes out of style, for a partner, child, or friend.',
    price: 799,
    images: img('teddy', 3),
    tags: ['teddy', 'soft toy', 'plush', 'romantic', 'kids'],
    keywords: ['teddy bear', 'soft toy', 'plush toy'],
    productType: 'Soft Toy',
    giftingPurpose: ['Romantic', 'Birthday', 'Valentine'],
    customizable: false,
    available: true,
  },
  {
    id: 'love-cushion',
    name: 'Love Cushion',
    category: 'Cushions',
    description:
      'A soft square cushion printed with a heart motif and space for a personalized photo or message — a cosy accent for any couch or bed.',
    price: 499,
    images: img('lovecushion', 2),
    tags: ['cushion', 'love', 'photo', 'personalized', 'romantic', 'home textile'],
    keywords: ['love cushion', 'photo cushion', 'heart cushion'],
    productType: 'Home Textile',
    giftingPurpose: ['Romantic', 'Anniversary', 'Valentine'],
    customizable: true,
    available: true,
  },
  {
    id: 'anniversary-gift-combo',
    name: 'Anniversary Gift Combo',
    category: 'Combos',
    description:
      'A curated anniversary combo — photo frame, mug, and a greeting card — bundled together to celebrate years shared with someone special.',
    price: 1499,
    images: img('annivcombo', 3),
    tags: ['combo', 'anniversary', 'photo', 'personalized', 'gift set'],
    keywords: ['anniversary combo', 'anniversary gift set'],
    productType: 'Gift Combo',
    giftingPurpose: ['Anniversary', 'Wedding'],
    customizable: true,
    available: true,
  },
  {
    id: 'led-love-lamp',
    name: 'LED Love Lamp',
    category: 'Lamps',
    description:
      'A heart-shaped acrylic LED lamp that casts a soft romantic glow — a lovely bedside or shelf accent for couples and romantics alike.',
    price: 599,
    images: img('ledlovelamp', 2),
    tags: ['lamp', 'led', 'love', 'heart', 'romantic', 'home decor'],
    keywords: ['love lamp', 'heart lamp', 'led lamp'],
    productType: 'Home Decor',
    giftingPurpose: ['Romantic', 'Valentine', 'Anniversary'],
    customizable: false,
    available: true,
  },
  {
    id: 'photo-collage-frame',
    name: 'Photo Collage Frame',
    category: 'Frames',
    description:
      'A multi-opening collage frame that brings together several favourite photos in one elegant display — perfect for family memories.',
    price: 699,
    images: img('collageframe', 3),
    tags: ['photo', 'collage', 'frame', 'personalized', 'family', 'wall decor'],
    keywords: ['collage frame', 'photo collage', 'multi photo frame'],
    productType: 'Wall Decor',
    giftingPurpose: ['Anniversary', 'Housewarming', 'Just Because'],
    customizable: true,
    available: true,
  },
  {
    id: 'birthday-gift-combo',
    name: 'Birthday Gift Combo',
    category: 'Combos',
    description:
      'A festive birthday combo with a personalized mug, a small cake topper, and a greeting card — a complete celebration gift, ready to go.',
    price: 999,
    images: img('bdaycombo', 3),
    tags: ['combo', 'birthday', 'photo', 'personalized', 'gift set'],
    keywords: ['birthday combo', 'birthday gift set'],
    productType: 'Gift Combo',
    giftingPurpose: ['Birthday'],
    customizable: true,
    available: true,
  },
  {
    id: 'custom-photo-cushion',
    name: 'Custom Photo Cushion',
    category: 'Cushions',
    description:
      'A plush cushion printed edge-to-edge with a photo of your choice — soft, functional, and a genuinely personal home accent.',
    price: 449,
    images: img('photocushion', 2),
    tags: ['cushion', 'photo', 'personalized', 'home textile'],
    keywords: ['photo cushion', 'custom cushion'],
    productType: 'Home Textile',
    giftingPurpose: ['Birthday', 'Anniversary', 'Housewarming'],
    customizable: true,
    available: true,
  },
  {
    id: 'mini-gift-hamper',
    name: 'Mini Gift Hamper',
    category: 'Hampers',
    description:
      'A compact hamper of curated treats and small gift items, wrapped and ready to hand over — a thoughtful gesture without the fuss.',
    price: 599,
    images: img('minihamper', 2),
    tags: ['hamper', 'gift set', 'combo'],
    keywords: ['gift hamper', 'mini hamper'],
    productType: 'Hamper',
    giftingPurpose: ['Just Because', 'Congratulations', 'Festival'],
    customizable: false,
    available: true,
  },
  {
    id: 'personalized-bottle',
    name: 'Personalized Bottle',
    category: 'Bottles',
    description:
      'A stainless-steel water bottle engraved or printed with a name or short message — practical, everyday, and a little bit special.',
    price: 499,
    images: img('bottle', 2),
    tags: ['bottle', 'personalized', 'name', 'engraved', 'office'],
    keywords: ['personalized bottle', 'custom bottle', 'name bottle'],
    productType: 'Bottle',
    giftingPurpose: ['Birthday', 'Office', 'Congratulations'],
    customizable: true,
    available: true,
  },
  {
    id: 'couple-gift-set',
    name: 'Couple Gift Set',
    category: 'Combos',
    description:
      'A matching gift set for two — mugs or keychains personalized with both names — a warm way to celebrate a relationship milestone.',
    price: 899,
    images: img('couplegift', 3),
    tags: ['combo', 'couple', 'personalized', 'romantic', 'gift set'],
    keywords: ['couple gift set', 'his and hers'],
    productType: 'Gift Combo',
    giftingPurpose: ['Romantic', 'Anniversary', 'Wedding', 'Valentine'],
    customizable: true,
    available: true,
  },
  {
    id: 'chocolate-gift-hamper',
    name: 'Chocolate Gift Hamper',
    category: 'Hampers',
    description:
      'An assortment of chocolates arranged in a decorative hamper — a universally loved gift for festivals, celebrations, or a sweet surprise.',
    price: 699,
    images: img('chocohamper', 2),
    tags: ['hamper', 'chocolate', 'festival', 'gift set'],
    keywords: ['chocolate hamper', 'chocolate gift box'],
    productType: 'Hamper',
    giftingPurpose: ['Festival', 'Congratulations', 'Just Because'],
    customizable: false,
    available: true,
  },
  {
    id: 'customized-pen',
    name: 'Customized Pen',
    category: 'Pens',
    description:
      'A smooth-writing pen printed or engraved with a name or short message — a simple, professional gift that gets used every day.',
    price: 199,
    images: img('custompen', 2),
    tags: ['pen', 'personalized', 'office', 'name'],
    keywords: ['customized pen', 'name pen'],
    productType: 'Stationery',
    giftingPurpose: ['Office', 'Congratulations', 'Just Because'],
    customizable: true,
    available: true,
  },
  {
    id: 'name-engraved-pen',
    name: 'Name Engraved Pen',
    category: 'Pens',
    description:
      'A metal-body pen with a name laser-engraved along the barrel — understated, premium, and a favourite for office gifting.',
    price: 249,
    images: img('engravedpen', 2),
    tags: ['pen', 'engraved', 'name', 'office', 'premium'],
    keywords: ['engraved pen', 'name engraved pen'],
    productType: 'Stationery',
    giftingPurpose: ['Office', 'Congratulations'],
    customizable: true,
    available: true,
  },
  {
    id: 'premium-pen-gift-set',
    name: 'Premium Pen Gift Set',
    category: 'Pens',
    description:
      'A boxed pair of premium pens presented in a gift case — a polished choice for retirements, promotions, and formal occasions.',
    price: 399,
    images: img('penset', 3),
    tags: ['pen', 'gift set', 'office', 'premium'],
    keywords: ['pen gift set', 'premium pens'],
    productType: 'Stationery',
    giftingPurpose: ['Office', 'Congratulations'],
    customizable: true,
    available: true,
  },
  {
    id: 'customized-diary-pen',
    name: 'Customized Diary + Pen',
    category: 'Stationery',
    description:
      'A name-embossed diary paired with a matching pen — a practical, everyday-use combo that suits colleagues, mentors, and students alike.',
    price: 499,
    images: img('diarypen', 2),
    tags: ['diary', 'pen', 'combo', 'personalized', 'office'],
    keywords: ['diary and pen set', 'customized diary'],
    productType: 'Stationery',
    giftingPurpose: ['Office', 'Congratulations', 'Just Because'],
    customizable: true,
    available: true,
  },
  {
    id: 'office-gift-set',
    name: 'Office Gift Set',
    category: 'Combos',
    description:
      'A well-rounded desk gift set — pen, small diary, and a name plate — put together for colleagues, bosses, or a new hire.',
    price: 699,
    images: img('officeset', 3),
    tags: ['combo', 'office', 'gift set', 'desk'],
    keywords: ['office gift set', 'desk gift set'],
    productType: 'Gift Combo',
    giftingPurpose: ['Office', 'Congratulations'],
    customizable: false,
    available: true,
  },
];

export default products;
