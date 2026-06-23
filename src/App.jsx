/**
 * @file App.jsx
 * @description Root component and single source of truth for client-side routing.
 *
 * Provider tree:
 *   ErrorBoundary → CurrencyProvider → NavigationProvider → AuthProvider → Toaster + AppContent
 *     AppContent → WishlistProvider → CartProvider → Routes
 *
 * Route map:
 *   /                    HomePage
 *   /tours               AllToursPage
 *   /tour/:id            TourDetailPage (id is URL-encoded tour title)
 *   /wishlist, /cart     Saved items (localStorage via contexts)
 *   /signin, /register   Consumer auth
 *   /supplier/*          Supplier auth, payout, and external dashboard redirects
 *   /booking             Checkout flow (state passed via react-router location)
 *   /review/:tourTitle   Review submission page for completed tour experiences
 *   /reviews/all          All traveller reviews page with similar experiences
 *   /support, /settings  Account & help pages
 *
 * Note: `/supplier/dashboard` and `/supplier/earnings` redirect to the external
 *   supplier portal login (https://supplier.travioafrica.com/login). Approved
 *   suppliers sign in with Google there to create and manage tours.
 *
 * @see hooks/useScrollRestoration.js — scroll behavior on route changes
 */
import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';

import { AuthProvider, useAuth } from '@/components/auth/AuthProvider';
import BrandLoader from '@/components/ui/BrandLoader';
import ErrorBoundary from '@/components/ErrorBoundary';
import { NavigationProvider } from '@/contexts/NavigationContext';
import { WishlistProvider } from '@/contexts/WishlistContext';
import { CurrencyProvider } from '@/contexts/CurrencyContext';
import { CartProvider } from '@/contexts/CartContext';
import { useScrollRestoration } from '@/hooks/useScrollRestoration';
import HomePage from '@/pages/HomePage';
import AllToursPage from '@/pages/AllToursPage';
import WishlistPage from '@/pages/WishlistPage';
import CartPage from '@/pages/CartPage';
import TourDetailPage from '@/pages/TourDetailPage';
import RegisterPage from '@/pages/RegisterPage';
import SignInPage from '@/pages/SignInPage';
import SupplierSignInPage from '@/pages/SupplierSignInPage';
import SupplierRegisterPage from '@/pages/SupplierRegisterPage';
import SupplierPayoutPage from '@/pages/SupplierPayoutPage';
import SupplierPortalRedirectPage from '@/pages/SupplierPortalRedirectPage';
import SupplierPage from '@/pages/SupplierPage';
import { SUPPLIER_PORTAL_LOGIN_URL } from '@/lib/supplierPortal';

import AuthCallback from '@/pages/AuthCallback';
import SignOutPage from '@/pages/SignOutPage';
import SupportPage from '@/pages/SupportPage';
import SettingsPage from '@/pages/SettingsPage';
import BookingPage from '@/pages/BookingPage';
import CheckoutPage from '@/pages/CheckoutPage';
import { BlogPage } from '@/pages/BlogPage';
import { ArticleDetailPage } from '@/pages/ArticleDetailPage';
import ReviewExperiencePage from '@/pages/ReviewExperiencePage';
import AllReviewsPage from '@/pages/AllReviewsPage';
import MyBookingsPage from '@/pages/MyBookingsPage';

function AppContent() {
  useScrollRestoration();
  const { loading } = useAuth();
  const [splashShown, setSplashShown] = useState(() =>
    sessionStorage.getItem('eg_splash_shown') === 'true'
  );

  const routes = (
    <WishlistProvider>
      <CartProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/tours" element={<AllToursPage />} />
          <Route path="/tour/:id" element={<TourDetailPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/supplier/signin" element={<SupplierSignInPage />} />
          <Route path="/supplier/register" element={<SupplierRegisterPage />} />
          <Route path="/supplier/payout" element={<SupplierPayoutPage />} />
          <Route path="/supplier/portal" element={<SupplierPortalRedirectPage />} />
          <Route path="/supplier/dashboard" element={<Navigate to="/supplier/portal" replace />} />
          <Route
            path="/supplier/earnings"
            element={<Navigate to={SUPPLIER_PORTAL_LOGIN_URL} replace />}
          />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/signout" element={<SignOutPage />} />
          <Route path="/support" element={<SupportPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/supplier/profile/:tourTitle" element={<SupplierPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<ArticleDetailPage />} />
          <Route path="/review/:tourTitle" element={<ReviewExperiencePage />} />
          <Route path="/reviews/all" element={<AllReviewsPage />} />
          <Route path="/bookings" element={<MyBookingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </CartProvider>
    </WishlistProvider>
  );

  const showSplash = loading && !splashShown;

  useEffect(() => {
    if (!showSplash && !splashShown) {
      sessionStorage.setItem('eg_splash_shown', 'true');
      setSplashShown(true);
    }
  }, [showSplash, splashShown]);

  return (
    <>
      {showSplash && <BrandLoader fullScreen initial />}
      <div style={{ display: showSplash ? 'none' : undefined }}>{routes}</div>
    </>
  );
}

function App() {
  return (
    <ErrorBoundary goHomeLink="/" goHomeLabel="Go Home">
      <CurrencyProvider>
        <NavigationProvider>
          <AuthProvider>
            <Toaster
              position="top-right"
              richColors
              closeButton
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'var(--brand-mist)',
                  color: 'var(--brand-green)',
                  border: '1px solid rgba(9, 106, 79, 0.18)',
                },
              }}
            />
            <AppContent />
          </AuthProvider>
        </NavigationProvider>
      </CurrencyProvider>
    </ErrorBoundary>
  );
}

export default App;
