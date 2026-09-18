import { RouterProvider } from 'react-router-dom';
import Loader from './components/ui/Loader';
import ErrorBoundary from './components/system/ErrorBoundary';
import { WishlistProvider } from './context/WishlistContext';
import { CartProvider } from './context/CartContext';
import { ProductsProvider } from './context/ProductsContext';
import { ShopGalleryProvider } from './context/ShopGalleryContext';
import { OffersProvider } from './context/OffersContext';
import router from './router';


export default function App() {
  return (
    <ErrorBoundary>
      <ProductsProvider>
        <OffersProvider>
          <ShopGalleryProvider>
            <WishlistProvider>
              <CartProvider>
                {/* AdminAuthProvider deliberately lives inside the admin
                    route tree (see components/admin/AdminRoot.jsx), so
                    customers never bootstrap Firebase Auth (NEW-23). */}
                <Loader />
                <RouterProvider router={router} />
              </CartProvider>
            </WishlistProvider>
          </ShopGalleryProvider>
        </OffersProvider>
      </ProductsProvider>
    </ErrorBoundary>
  );
}
