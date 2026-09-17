/**
 * Dynamic pricing. Nothing here hardcodes a discount on a product — it
 * always looks up currently-active offers and computes the best one that
 * applies, so Admin-managed offers (Phase 7) can change without touching
 * product data or component code.
 */

function isOfferLive(offer, now) {
  if (!offer.active) return false;
  const start = offer.startDate ? new Date(`${offer.startDate}T00:00:00`) : null;
  // End date is inclusive through the end of that calendar day.
  const end = offer.endDate ? new Date(`${offer.endDate}T23:59:59`) : null;
  if (start && now < start) return false;
  if (end && now > end) return false;
  return true;
}

/**
 * Human-readable lifecycle status for an offer, used by the Admin offers
 * table so "active: true" doesn't misleadingly read as live when its date
 * range hasn't started yet or has already passed.
 * Returns one of: 'active' | 'scheduled' | 'expired' | 'inactive'.
 */
export function getOfferStatus(offer, now = new Date()) {
  if (!offer.active) return 'inactive';
  const start = offer.startDate ? new Date(`${offer.startDate}T00:00:00`) : null;
  const end = offer.endDate ? new Date(`${offer.endDate}T23:59:59`) : null;
  if (start && now < start) return 'scheduled';
  if (end && now > end) return 'expired';
  return 'active';
}

function offerAppliesToProduct(offer, product) {
  if (offer.appliesTo === 'all') return true;
  if (offer.appliesTo === 'category') return offer.targetId === product.category;
  if (offer.appliesTo === 'product') return offer.targetId === product.id;
  return false;
}

/**
 * Returns the single best (highest discount) currently-active offer that
 * applies to a product, or null if none apply.
 */
export function getActiveOfferForProduct(product, offers, now = new Date()) {
  const applicable = offers.filter((offer) => isOfferLive(offer, now) && offerAppliesToProduct(offer, product));
  if (applicable.length === 0) return null;
  return applicable.reduce((best, current) => (current.discountPercent > best.discountPercent ? current : best));
}

/**
 * Returns the full pricing picture for a product: original price, whether
 * an offer applies, the offer's name/percent, and the final price a
 * customer pays — rounded to the nearest rupee.
 */
export function getProductPricing(product, offers, now = new Date()) {
  const offer = getActiveOfferForProduct(product, offers, now);
  const price = product.price;

  if (!offer) {
    return { price, hasOffer: false, offerName: null, discountPercent: 0, finalPrice: price };
  }

  const finalPrice = Math.round(price - (price * offer.discountPercent) / 100);

  return {
    price,
    hasOffer: true,
    offerName: offer.name,
    discountPercent: offer.discountPercent,
    finalPrice,
  };
}
