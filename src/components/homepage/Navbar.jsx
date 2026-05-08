import { Globe, Heart, Headset, Menu, ShoppingCart, UserCircle2, X, ChevronDown, Search, CalendarDays } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import companyPic from "@/assets/images/new_logo.png";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { useAuth } from "@/components/auth/AuthProvider";
import { useCurrency } from "@/contexts/CurrencyContext";
import { navItems } from "./data";

export function Navbar({
  sharedDateRange,
  onSharedDateRangeChange,
  forceShowCompactSearch = false,
  externalSearchQuery,
  onExternalSearchChange,
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLanguageCurrencyOpen, setIsLanguageCurrencyOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("language");
  const [showCompactSearch, setShowCompactSearch] = useState(false);
  const [compactSearchQuery, setCompactSearchQuery] = useState("");
  const [mobileDateRange, setMobileDateRange] = useState({ from: null, to: null });
  const [showMobileCalendar, setShowMobileCalendar] = useState(false);
  const mobileCalendarRef = useRef(null);
  const mobileDateButtonRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { t, i18n } = useTranslation();
  const { currency, setCurrency, availableCurrencies } = useCurrency();
  const activeMobileDateRange = sharedDateRange ?? mobileDateRange;
  const setActiveMobileDateRange = onSharedDateRangeChange ?? setMobileDateRange;

  const handleBrandClick = (e) => {
    e.preventDefault();
    navigate('/');
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleLanguageChange = (langCode) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem('language', langCode);
    setIsLanguageCurrencyOpen(false);
  };

  const handleCurrencyChange = (currencyCode) => {
    setCurrency(currencyCode);
    setIsLanguageCurrencyOpen(false);
  };
  const handleCompactSearchSubmit = (e) => {
    e.preventDefault();
    if (onExternalSearchChange) return;
    const query = compactSearchQuery.trim();
    if (!query) {
      navigate("/tours");
      return;
    }
    navigate(`/tours?search=${encodeURIComponent(query)}`);
  };

  const getCurrentLanguageLabel = () => {
    const langMap = {
      en: "EN",
      es: "ES",
      fr: "FR",
      de: "DE",
      nl: "NL"
    };
    return langMap[i18n.language] || "EN";
  };

  const languages = [
    { code: "en", name: "English (United States)" },
    { code: "es", name: "Español (España)" },
    { code: "fr", name: "Français" },
    { code: "de", name: "Deutsch (Deutschland)" },
    { code: "nl", name: "Nederlands" }
  ];

  const formatDate = (date) => {
    if (!date) return "";
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const mobileDateLabel = activeMobileDateRange?.from
    ? activeMobileDateRange?.to
      ? `${formatDate(activeMobileDateRange.from)} - ${formatDate(activeMobileDateRange.to)}`
      : `${formatDate(activeMobileDateRange.from)}`
    : "";
  const isExternalSearchMode = typeof onExternalSearchChange === "function";
  const compactSearchValue = isExternalSearchMode ? (externalSearchQuery ?? "") : compactSearchQuery;
  const compactSearchMaxWidthClass = forceShowCompactSearch ? "max-w-[460px]" : "max-w-[360px]";

  useEffect(() => {
    const handleScroll = () => {
      // If forceShowCompactSearch is true, don't hide the search bar
      if (forceShowCompactSearch) {
        return;
      }
      
      if (location.pathname !== "/") {
        setShowCompactSearch((prev) => (prev ? false : prev));
        return;
      }

      const heroSearch = document.getElementById("hero-search-bar");
      if (!heroSearch) {
        setShowCompactSearch((prev) => (prev ? false : prev));
        return;
      }

      const heroSearchBottom = heroSearch.getBoundingClientRect().bottom + window.scrollY;
      setShowCompactSearch((prev) => { const next = window.scrollY > heroSearchBottom; return prev === next ? prev : next; });
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [location.pathname, forceShowCompactSearch]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      const clickedDateButton = mobileDateButtonRef.current?.contains(event.target);
      const clickedCalendar = mobileCalendarRef.current?.contains(event.target);

      if (!clickedDateButton && !clickedCalendar) {
        setShowMobileCalendar(false);
      }
    };

    if (showMobileCalendar) {
      document.addEventListener("mousedown", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [showMobileCalendar]);

  return (
    <header className="fixed top-0 z-50 w-full border-b border-slate-200/80 shadow-sm backdrop-blur-md bg-white transition-all duration-300">
      <div className="mx-auto flex max-w-[1520px] items-center justify-between gap-2 px-3 py-1.5 text-slate-950 sm:gap-4 sm:px-4 sm:py-2 lg:px-6 dark:text-slate-950">
<button
  onClick={handleBrandClick}
  className="flex shrink-0 items-center cursor-pointer transition-opacity hover:opacity-80"
>
<img
  src={companyPic}
  alt="Expedition-Go Group Limited"
  className="block w-auto object-contain leading-none h-14 sm:h-20 md:h-24 lg:h-24"
/>
</button>

        {(showCompactSearch || forceShowCompactSearch) && (
          <div className="flex-1 justify-center hidden lg:flex">
            <form
              onSubmit={handleCompactSearchSubmit}
              className="flex w-full max-w-[600px] items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm hover:shadow-md"
            >
              <Search className="size-4 text-(--brand-green)" />
              <input
                value={compactSearchValue}
                onChange={(e) => {
                  if (isExternalSearchMode) {
                    onExternalSearchChange(e.target.value);
                  } else {
                    setCompactSearchQuery(e.target.value);
                  }
                }}
                placeholder="Where are you going?"
                className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                style={{ caretColor: '#01311a' }}
              />
              <button
                type="submit"
                className="rounded-md bg-(--brand-green) px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-(--brand-green-2)"
              >
                Search
              </button>
            </form>
          </div>
        )}

        <div className="hidden items-center gap-6 lg:flex">
          <Link to="/wishlist" className="group flex flex-col items-center gap-1 text-slate-700 transition hover:text-slate-950 cursor-pointer">
            <Heart className="size-5 transition group-hover:text-[color:var(--brand-green)]" />
            <span className="text-xs font-semibold relative">
              {t('nav.wishlist')}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-(--brand-green) transition-[width] duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:w-full"></span>
            </span>
          </Link>
          <Link to="/cart" className="group flex flex-col items-center gap-1 text-slate-700 transition hover:text-slate-950 cursor-pointer">
            <ShoppingCart className="size-5 transition group-hover:text-[color:var(--brand-green)]" />
            <span className="text-xs font-semibold  relative">
              {t('nav.cart')}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-(--brand-green) transition-[width] duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:w-full"></span>
            </span>
          </Link>
          <button className="group flex flex-col items-center gap-1 text-slate-700 transition hover:text-slate-950 cursor-pointer">
            <svg className="size-5 transition group-hover:text-[color:var(--brand-green)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-xs relative font-semibold ">
              {t('nav.bookings')}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-(--brand-green) transition-[width] duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:w-full"></span>
            </span>
          </button>
          <div className="relative">
            <button 
              onClick={() => setIsLanguageCurrencyOpen(!isLanguageCurrencyOpen)}
              className="group font-semibold  flex flex-col items-center gap-1 text-slate-700 transition hover:text-slate-950 cursor-pointer"
            >
              <Globe className="size-5 transition group-hover:text-[color:var(--brand-green)]" />
              <span className="text-xs relative font-semibold ">
                {getCurrentLanguageLabel()}/{currency} {availableCurrencies.find(c => c.code === currency)?.symbol}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-(--brand-green) transition-[width] duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:w-full"></span>
              </span>
            </button>
            {isLanguageCurrencyOpen && (
              <>
                {/* Backdrop */}
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsLanguageCurrencyOpen(false)}
                />
                {/* Popup */}
                <div className="fixed lg:absolute left-4 right-4 top-20 lg:left-auto lg:right-0 lg:top-full mt-2 z-[60] w-auto lg:w-[500px] max-h-[600px] rounded-lg border border-slate-200 bg-white shadow-xl dark:!bg-white">
                  {/* Header with close button */}
                  <div className="flex items-center justify-between border-b border-slate-200 p-4">
                    <div className="flex gap-6">
                      <button
                        onClick={() => setActiveTab("language")}
                        className={`flex items-center gap-2 pb-2 text-sm font-semibold transition ${
                          activeTab === "language"
                            ? "border-b-2 border-[color:var(--brand-green)] text-[color:var(--brand-green)]"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        <Globe className="size-4" />
                        Language
                      </button>
                      <button
                        onClick={() => setActiveTab("currency")}
                        className={`flex items-center gap-2 pb-2 text-sm font-semibold transition ${
                          activeTab === "currency"
                            ? "border-b-2 border-[color:var(--brand-green)] text-[color:var(--brand-green)]"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Currency
                      </button>
                    </div>
                    <button
                      onClick={() => setIsLanguageCurrencyOpen(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="size-5" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="max-h-[500px] overflow-y-auto p-4">
                    {activeTab === "language" ? (
                      <div className="grid grid-cols-2 gap-3">
                        {languages.map((lang) => (
                          <button
                            key={lang.code}
                            onClick={() => handleLanguageChange(lang.code)}
                            className={`flex items-center justify-between rounded-lg px-4 py-3 text-left text-sm transition ${
                              i18n.language === lang.code
                                ? "bg-[color:var(--brand-mist)] text-[color:var(--brand-green)] font-semibold"
                                : "text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            <span>{lang.name}</span>
                            {i18n.language === lang.code && (
                              <svg className="size-5 text-[color:var(--brand-green)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        {availableCurrencies.map((curr) => (
                          <button
                            key={curr.code}
                            onClick={() => handleCurrencyChange(curr.code)}
                            className={`flex items-center justify-between rounded-lg px-4 py-3 text-left text-sm transition ${
                              currency === curr.code
                                ? "bg-[color:var(--brand-mist)] text-[color:var(--brand-green)] font-semibold"
                                : "text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            <div>
                              <div className="font-medium">{curr.code}</div>
                              <div className="text-xs text-slate-500">{curr.name}</div>
                            </div>
                            {currency === curr.code && (
                              <svg className="size-5 text-[color:var(--brand-green)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          </div>
          {!loading && (
            user ? (
              <div className="relative">
                <button 
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="group"
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.name}
                      className="size-10 rounded-full border-2 border-slate-200 object-cover transition hover:border-[color:var(--brand-green)]"
                    />
                  ) : (
                    <div className="grid size-10 place-items-center rounded-full border-2 border-slate-200 bg-[color:var(--brand-mist)] text-sm font-semibold text-[color:var(--brand-green)] transition hover:border-[color:var(--brand-green)]">
                      {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </button>
                {isUserMenuOpen && (
                  <>
                    {/* Backdrop to close menu when clicking outside */}
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setIsUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 z-50 w-56 rounded-lg border border-slate-200 bg-white shadow-lg dark:!bg-white">
                      <div className="border-b border-slate-100 p-3">
                        <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                      <div className="py-2">
                        <Link 
                          to="/settings"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex w-full items-center gap-3 px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
                        >
                          <UserCircle2 className="size-4" />
                          <span>{t('nav.settings')}</span>
                        </Link>
                        <Link 
                          to="/support"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex w-full items-center gap-3 px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
                        >
                          <Headset className="size-4" />
                          <span>{t('nav.support')}</span>
                        </Link>
                        <button 
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex w-full items-center gap-3 px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
                        >
                          <Globe className="size-4" />
                          <span>{t('nav.updates')}</span>
                        </button>
                      </div>
                      <div className="border-t border-slate-100 p-2">
                        <Link 
                          to="/signout" 
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
                        >
                          <X className="size-4" />
                          <span>{t('nav.signOut')}</span>
                        </Link>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="relative">
                <button 
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:border-[color:var(--brand-green)] hover:bg-[color:var(--brand-mist)] hover:text-[color:var(--brand-green)]"
                >
                  <UserCircle2 className="size-4 " />
                  {t('nav.profile')}
                  <ChevronDown className="size-4" />
                </button>
                {isUserMenuOpen && (
                  <>
                    {/* Backdrop to close menu when clicking outside */}
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setIsUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 z-50 w-56 rounded-lg border border-slate-200 bg-white shadow-lg dark:!bg-white">
                      <div className="py-2">
                        <Link 
                          to="/support"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex w-full items-center gap-3 px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
                        >
                          <Headset className="size-4" />
                          <span>{t('nav.support')}</span>
                        </Link>
                        <button 
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex w-full items-center gap-3 px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
                        >
                          <Globe className="size-4" />
                          <span>{t('nav.updates')}</span>
                        </button>
                      </div>
                      <div className="border-t border-slate-100 p-2">
                        <Link 
                          to="/signin" 
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-[color:var(--brand-green)] transition hover:bg-[color:var(--brand-mist)]"
                        >
                          <UserCircle2 className="size-4" />
                          <span>Sign In / Sign Up</span>
                        </Link>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )
          )}
        </div>

        <button 
          onClick={toggleMobileMenu}
          className="grid size-9 shrink-0 place-items-center rounded-full border border-slate-300 text-slate-950 sm:size-10 xl:hidden"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X className="size-4 sm:size-5" /> : <Menu className="size-4 sm:size-5" />}
        </button>
      </div>

      {/* Mobile Search Bar - Removed, using hero search bar on mobile instead */}

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="border-t border-slate-200 !bg-white xl:hidden dark:!bg-white dark:border-slate-200">
          <div className="mx-auto max-w-[1520px] px-4 py-4 sm:px-6 dark:text-slate-950">
            {/* Actions */}
            <div className="flex flex-col gap-3">
              <button className="inline-flex items-center gap-2 py-2 text-slate-700 transition hover:text-slate-950">
                <Globe className="size-4" />
                <span className="text-sm">English (US) • USD</span>
              </button>
              <Link
                to="/wishlist"
                onClick={closeMobileMenu}
                className="inline-flex items-center gap-2 py-2 text-slate-700 transition hover:text-slate-950"
              >
                <Heart className="size-4" />
                <span className="text-sm">{t('nav.wishlist')}</span>
              </Link>
              <Link to="/cart" onClick={closeMobileMenu} className="inline-flex items-center gap-2 py-2 text-slate-700 transition hover:text-slate-950">
                <ShoppingCart className="size-4" />
                <span className="text-sm">{t('nav.cart')}</span>
              </Link>
              <Link to="/support" onClick={closeMobileMenu} className="inline-flex items-center gap-2 py-2 text-slate-700 transition hover:text-slate-950">
                <Headset className="size-4" />
                <span className="text-sm">{t('nav.support')}</span>
              </Link>
              
              {!loading && (
                user ? (
                  <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center gap-3">
                      {user.photoURL ? (
                        <img
                          src={user.photoURL}
                          alt={user.name}
                          className="size-12 rounded-full border-2 border-[color:var(--brand-green)] object-cover"
                        />
                      ) : (
                        <div className="grid size-12 place-items-center rounded-full border-2 border-[color:var(--brand-green)] bg-[color:var(--brand-mist)] text-lg font-semibold text-[color:var(--brand-green)]">
                          {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </div>
                    <Button 
                      asChild 
                      variant="outline" 
                      className="mt-3 w-full justify-start border-slate-300 bg-white text-slate-950 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700"
                    >
                      <Link to="/signout" onClick={closeMobileMenu}>
                        <UserCircle2 className="size-4" />
                        {t('nav.signOut')}
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <Button 
                    asChild 
                    variant="outline" 
                    className="mt-2 w-full justify-start border-slate-300 bg-white text-slate-950 hover:border-[color:var(--brand-green)] hover:bg-[color:var(--brand-mist)] hover:text-[color:var(--brand-green)]"
                  >
                    <Link to="/signin" onClick={closeMobileMenu}>
                      <UserCircle2 className="size-4" />
                      Sign In / Sign Up
                    </Link>
                  </Button>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
