/**
 * Centralized route paths. Import these constants instead of typing raw
 * path strings in components, so a path only ever needs to change in one
 * place.
 */
export const ROUTES = {
  home: '/',
  products: '/products',
  productDetail: '/product/:id',
  productDetailPath: (id) => `/product/${id}`,
  wishlist: '/wishlist',
  cart: '/cart',
  order: '/order',
  shop: '/shop',
  about: '/about',
  contact: '/contact',
  adminLogin: '/admin',
  adminDashboard: '/admin/dashboard',
};

/** Primary customer-facing nav links, in display order. */
export const PRIMARY_NAV_LINKS = [
  { label: 'Home', to: ROUTES.home },
  { label: 'Shop All Gifts', to: ROUTES.products },
  { label: 'Our Shop', to: ROUTES.shop },
  { label: 'About', to: ROUTES.about },
  { label: 'Contact', to: ROUTES.contact },
];
