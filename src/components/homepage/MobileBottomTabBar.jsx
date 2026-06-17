/**
 * @file MobileBottomTabBar.jsx
 * @description Mobile bottom navigation bar (lg:hidden) only on HomePage.
 *   Tabs: TravioAfrica logo, Wishlist, Cart, Profile, Hamburger (Vaul drawer).
 */
import { useState, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Globe,
  Headset,
  Heart,
  LoaderCircle,
  Menu,
  Settings,
  ShoppingCart,
  Store,
  UserCircle2,
  X,
} from 'lucide-react';

import { useAuth } from '@/components/auth/AuthProvider';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useNavigationLoader } from '@/contexts/NavigationContext';
import { Drawer, DrawerContent, DrawerClose } from '@/components/ui/drawer';

import travioLogo from '@/assets/images/travio_logo.jpg';

const languages = [
  { code: 'en', name: 'English (United States)' },
  { code: 'es', name: 'Espa\u00f1ol (Espa\u00f1a)' },
  { code: 'fr', name: 'Fran\u00e7ais' },
  { code: 'de', name: 'Deutsch (Deutschland)' },
  { code: 'nl', name: 'Nederlands' },
];

export function MobileBottomTabBar() {
  const { t, i18n } = useTranslation();
  const { user, loading: authLoading, signOut } = useAuth();
  const { wishlist } = useWishlist();
  const { cart } = useCart();
  const { currency, setCurrency, availableCurrencies } = useCurrency();
  const { navigateWithLoader } = useNavigationLoader();
  const location = useLocation();
  const navigate = useNavigate();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [langModalOpen, setLangModalOpen] = useState(false);
  const [langModalTab, setLangModalTab] = useState('language');
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isNavigatingToAuth, setIsNavigatingToAuth] = useState(false);
  const [photoLoaded, setPhotoLoaded] = useState(false);

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSignOut = useCallback(async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);
    try {
      await signOut();
      setDrawerOpen(false);
      navigate('/', { replace: true, state: { showLogoutToast: true } });
    } catch {
      setIsSigningOut(false);
    }
  }, [isSigningOut, signOut, navigate]);

  const handleAuthLinkClick = useCallback(
    (event) => {
      event.preventDefault();
      if (isNavigatingToAuth) return;
      setIsNavigatingToAuth(true);
      setDrawerOpen(false);
      navigateWithLoader('/signin');
    },
    [isNavigatingToAuth, navigateWithLoader]
  );

  const handleLanguageChange = (langCode) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem('language', langCode);
    setLangModalOpen(false);
  };

  const handleCurrencyChangeModal = (currencyCode) => {
    setCurrency(currencyCode);
    setLangModalOpen(false);
  };

  const currentLanguage = languages.find((l) => l.code === i18n.language)?.name ?? 'English';

  const tabs = [
    {
      key: 'home',
      icon: <img src={travioLogo} alt="TravioAfrica" className="w-7 h-7 rounded-full object-cover" />,
    },
    { key: 'wishlist', icon: <Heart className="w-5 h-5" strokeWidth={1.8} /> },
    { key: 'cart', icon: <ShoppingCart className="w-5 h-5" strokeWidth={1.8} /> },
    { key: 'profile', icon: <UserCircle2 className="w-5 h-5" strokeWidth={1.8} /> },
    { key: 'menu', icon: <Menu className="w-5 h-5" strokeWidth={1.8} /> },
  ];

  const isActive = (key) => {
    switch (key) {
      case 'home': return location.pathname === '/';
      case 'wishlist': return location.pathname === '/wishlist';
      case 'cart': return location.pathname === '/cart';
      case 'profile': return ['/settings', '/signin', '/register'].includes(location.pathname);
      default: return false;
    }
  };

  const handleTabClick = (key, e) => {
    if (key === 'home') {
      e.preventDefault();
      if (location.pathname === '/') {
        handleScrollToTop();
      } else {
        navigate('/');
      }
      return;
    }
    if (key === 'menu') {
      e.preventDefault();
      setDrawerOpen(true);
      return;
    }
  };

  const wishlistCount = wishlist?.length ?? 0;
  const cartCount = cart?.length ?? 0;

  return (
    <>
      {/* Bottom Tab Bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-slate-200 bg-white/95 backdrop-blur-xl pb-[env(safe-area-inset-bottom,0px)] lg:hidden"
        style={{ height: 'calc(3.5rem + env(safe-area-inset-bottom, 0px))' }}
      >
        {tabs.map((tab) => (
          <div key={tab.key} className="relative flex flex-col items-center justify-center gap-0.5">
            {tab.key === 'home' ? (
              <button
                type="button"
                onClick={(e) => handleTabClick('home', e)}
                className="flex flex-col items-center justify-center gap-0.5"
                aria-label="Home"
              >
                {tab.icon}
              </button>
            ) : tab.key === 'wishlist' ? (
              <Link
                to="/wishlist"
                className="flex flex-col items-center justify-center gap-0.5"
                onClick={() => setDrawerOpen(false)}
              >
                {tab.icon}
                <span className={`text-[10px] font-medium ${isActive('wishlist') ? 'text-[color:var(--brand-green)]' : 'text-slate-500'}`}>
                  {t('nav.wishlist')}
                </span>
                {wishlistCount > 0 && (
                  <span className="absolute -right-1 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[color:var(--brand-green)] px-1 text-[9px] font-bold text-white">
                    {wishlistCount}
                  </span>
                )}
              </Link>
            ) : tab.key === 'cart' ? (
              <Link
                to="/cart"
                className="flex flex-col items-center justify-center gap-0.5"
                onClick={() => setDrawerOpen(false)}
              >
                {tab.icon}
                <span className={`text-[10px] font-medium ${isActive('cart') ? 'text-[color:var(--brand-green)]' : 'text-slate-500'}`}>
                  {t('nav.cart')}
                </span>
                {cartCount > 0 && (
                  <span className="absolute -right-1 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[color:var(--brand-green)] px-1 text-[9px] font-bold text-white">
                    {cartCount}
                  </span>
                )}
              </Link>
            ) : tab.key === 'profile' ? (
              <Link
                to={user ? '/settings' : '/signin'}
                className="flex flex-col items-center justify-center gap-0.5"
                onClick={() => setDrawerOpen(false)}
              >
                {tab.icon}
                <span className={`text-[10px] font-medium ${isActive('profile') ? 'text-[color:var(--brand-green)]' : 'text-slate-500'}`}>
                  {t('nav.account', 'Account')}
                </span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={(e) => handleTabClick('menu', e)}
                className="flex flex-col items-center justify-center gap-0.5"
                aria-label="Menu"
              >
                {tab.icon}
                <span className="text-[10px] font-medium text-slate-500">Menu</span>
              </button>
            )}
          </div>
        ))}
      </nav>

      {/* Vaul Drawer — Hamburger Menu */}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent className="bg-white border-slate-200 shadow-xl text-slate-900 max-h-[85vh]">
          <div className="px-4 py-2 pb-6 space-y-1 overflow-y-auto">
            {/* User Section */}
            {!authLoading && (
              user ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 mb-2">
                  <div className="flex items-center gap-3">
                    <div className="relative size-14">
                      <div className={`absolute inset-0 grid place-items-center rounded-full border-2 border-slate-300 bg-white transition-opacity duration-300 ${photoLoaded ? 'opacity-0' : 'opacity-100'}`}>
                        <UserCircle2 className="size-9 text-black" strokeWidth={1.5} />
                      </div>
                      {user.photoURL && (
                        <img
                          src={user.photoURL}
                          alt={user.name}
                          onLoad={() => setPhotoLoaded(true)}
                          className={`absolute inset-0 size-14 rounded-full border-2 border-[color:var(--brand-green)] object-cover transition-opacity duration-300 ${photoLoaded ? 'opacity-100' : 'opacity-0'}`}
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    disabled={isSigningOut}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-950 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 disabled:cursor-wait"
                  >
                    {isSigningOut ? (
                      <>
                        <LoaderCircle className="size-4 shrink-0 animate-spin text-rose-600" />
                        {t('nav.signingOut')}
                      </>
                    ) : (
                      <>
                        <X className="size-4 shrink-0" />
                        {t('nav.signOut')}
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <Link
                  to="/signin"
                  onClick={handleAuthLinkClick}
                  className="mb-2 flex w-full items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-950 transition hover:border-[color:var(--brand-green)] hover:bg-[color:var(--brand-mist)] hover:text-[color:var(--brand-green)]"
                >
                  {isNavigatingToAuth ? (
                    <LoaderCircle className="size-4 shrink-0 animate-spin text-[color:var(--brand-green)]" />
                  ) : (
                    <UserCircle2 className="size-4 shrink-0" />
                  )}
                  {isNavigatingToAuth ? t('auth.loadingSignIn') : t('nav.signInSignUp')}
                </Link>
              )
            )}

            {/* Language & Currency */}
            <button
              type="button"
              onClick={() => {
                setDrawerOpen(false);
                setTimeout(() => setLangModalOpen(true), 200);
              }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <Globe className="size-4 shrink-0" />
              <span>
                {currentLanguage} &middot; {currency}
                {availableCurrencies.find((c) => c.code === currency)?.symbol
                  ? ` (${availableCurrencies.find((c) => c.code === currency).symbol})`
                  : ''}
              </span>
            </button>

            {/* Settings */}
            {!authLoading && user && (
              <DrawerClose asChild>
                <Link
                  to="/settings"
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  <Settings className="size-4 shrink-0" />
                  {t('nav.settings')}
                </Link>
              </DrawerClose>
            )}

            {/* Support */}
            <DrawerClose asChild>
              <Link
                to="/support"
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                <Headset className="size-4 shrink-0" />
                {t('nav.support')}
              </Link>
            </DrawerClose>

            {/* Supplier Portal */}
            <DrawerClose asChild>
              <Link
                to="/supplier/portal"
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                <Store className="size-4 shrink-0" />
                {t('nav.listAnExperience', 'List an experience')}
              </Link>
            </DrawerClose>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Language & Currency Modal */}
      {langModalOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={() => setLangModalOpen(false)}
            aria-hidden
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Language and currency"
            className="fixed bottom-0 left-0 right-0 z-50 max-h-[70vh] overflow-hidden rounded-t-3xl border border-slate-200 bg-white shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-slate-200 p-4">
              <div className="flex gap-6">
                <button
                  type="button"
                  onClick={() => setLangModalTab('language')}
                  className={`flex items-center gap-2 pb-2 text-sm font-semibold transition ${
                    langModalTab === 'language'
                      ? 'border-b-2 border-[color:var(--brand-green)] text-[color:var(--brand-green)]'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Globe className="size-4" />
                  Language
                </button>
                <button
                  type="button"
                  onClick={() => setLangModalTab('currency')}
                  className={`flex items-center gap-2 pb-2 text-sm font-semibold transition ${
                    langModalTab === 'currency'
                      ? 'border-b-2 border-[color:var(--brand-green)] text-[color:var(--brand-green)]'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Currency
                </button>
              </div>
              <button
                type="button"
                onClick={() => setLangModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="max-h-[55vh] overflow-y-auto p-4">
              {langModalTab === 'language' ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => handleLanguageChange(lang.code)}
                      className={`flex items-center justify-between rounded-lg px-4 py-3 text-left text-sm transition ${
                        i18n.language === lang.code
                          ? 'bg-[color:var(--brand-mist)] text-[color:var(--brand-green)] font-semibold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{lang.name}</span>
                      {i18n.language === lang.code && (
                        <svg className="size-5 shrink-0 text-[color:var(--brand-green)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {availableCurrencies.map((curr) => (
                    <button
                      key={curr.code}
                      type="button"
                      onClick={() => handleCurrencyChangeModal(curr.code)}
                      className={`flex items-center justify-between rounded-lg px-4 py-3 text-left text-sm transition ${
                        currency === curr.code
                          ? 'bg-[color:var(--brand-mist)] text-[color:var(--brand-green)] font-semibold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div>
                        <div className="font-medium">{curr.code}</div>
                        <div className="text-xs text-slate-500">{curr.name}</div>
                      </div>
                      {currency === curr.code && (
                        <svg className="size-5 shrink-0 text-[color:var(--brand-green)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
