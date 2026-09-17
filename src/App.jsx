import { RouterProvider } from 'react-router-dom';
import Loader from './components/ui/Loader';
import ErrorBoundary from './components/system/ErrorBoundary';
import { WishlistProvider } from './context/WishlistContext';
import { CartProvider } from './context/CartContext';
import { ProductsProvider } from './context/ProductsContext';
import { ShopGalleryProvider } from './context/ShopGalleryContext';
import { OffersProvider } from './context/OffersContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import router from './router';

export default function App() {
  return (
    <ErrorBoundary>
      <ProductsProvider>
        <OffersProvider>
          <ShopGalleryProvider>
            <WishlistProvider>
              <CartProvider>
                <AdminAuthProvider>
                  <Loader />
                  <RouterProvider router={router} />
                </AdminAuthProvider>
              </CartProvider>
            </WishlistProvider>
          </ShopGalleryProvider>
        </OffersProvider>
      </ProductsProvider>
    </ErrorBoundary>
  );
}
