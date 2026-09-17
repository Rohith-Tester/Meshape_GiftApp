import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import Layout from './components/layout/Layout';
import RouteLoadingFallback from './components/system/RouteLoadingFallback';
import { ROUTES } from './config/routes';

import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Wishlist from './pages/Wishlist';
import Cart from './pages/Cart';
import Order from './pages/Order';
import Shop from './pages/Shop';
import About from './pages/About';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';

/**
 * The entire Admin surface — dashboard, product/offer/gallery forms,
 * image manager, and everything that talks to Firestore for writes — is
 * lazy-loaded as its own bundle chunk. A customer just browsing the
 * storefront never downloads any of this code; it's fetched only when
 * someone actually navigates to /admin. This is Phase 9 performance
 * work, not a Phase 8 change: nothing about how these components work
 * or how auth/Firestore/Cloudinary behave was touched, only how (and
 * when) their code is loaded.
 */
const AdminShell = lazy(() => import('./components/admin/AdminShell'));
const ProtectedAdminRoute = lazy(() => import('./components/admin/ProtectedAdminRoute'));
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));

function withSuspense(element) {
  return <Suspense fallback={<RouteLoadingFallback />}>{element}</Suspense>;
}

const router = createBrowserRouter([
  {
    path: ROUTES.home,
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: ROUTES.products.slice(1), element: <Products /> },
      { path: ROUTES.productDetail.slice(1), element: <ProductDetail /> },
      { path: ROUTES.wishlist.slice(1), element: <Wishlist /> },
      { path: ROUTES.cart.slice(1), element: <Cart /> },
      { path: ROUTES.order.slice(1), element: <Order /> },
      { path: ROUTES.shop.slice(1), element: <Shop /> },
      { path: ROUTES.about.slice(1), element: <About /> },
      { path: ROUTES.contact.slice(1), element: <Contact /> },
      { path: '*', element: <NotFound /> },
    ],
  },
  {
    // Dedicated admin shell — no public navbar/footer, its own minimal
    // top bar instead. Kept as its own route tree, separate from the
    // customer Layout above, and lazy-loaded as its own chunk (see above).
    path: 'admin',
    element: withSuspense(<AdminShell />),
    children: [
      { index: true, element: withSuspense(<AdminLogin />) },
      {
        path: 'dashboard',
        element: withSuspense(
          <ProtectedAdminRoute>
            <AdminDashboard />
          </ProtectedAdminRoute>
        ),
      },
    ],
  },
]);

export default router;
