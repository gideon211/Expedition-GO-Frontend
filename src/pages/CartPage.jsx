/**
 * @file CartPage.jsx
 * @description Shopping cart page (/cart). Reads items from CartContext (localStorage).
 *   Items expire after 25 minutes. Links to BookingPage for checkout.
 *
 * @see contexts/CartContext.jsx
 */
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ShoppingCart,
  Trash2,
  Lock,
  CheckCircle2,
  MessageCircle,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

import { Navbar } from '@/components/homepage/Navbar';
import { Footer } from '@/components/homepage/Footer';
import { CartEmptyState } from '@/components/cart/CartEmptyState';
import { CartItemCard } from '@/components/cart/CartItemCard';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useNavigationLoader } from '@/contexts/NavigationContext';


const formatRemainingTime = (ms) => {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
};

const groupByDate = (items) => {
  return items.reduce((groups, item) => {
    const date = new Date(item.selectedDate);
    const key = date.toDateString();
    if (!groups[key]) {
      groups[key] = { date, items: [] };
    }
    groups[key].items.push(item);
    return groups;
  }, {});
};

const formatGroupDate = (date) =>
  date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

const emptyContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.14,
      delayChildren: 0.35,
    },
  },
};

const emptyItem = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 110, damping: 14 },
  },
};

function CartPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { navigateWithLoader } = useNavigationLoader();
  const { cart, removeFromCart, clearCart } = useCart();
  const { convertPrice } = useCurrency();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const intervalId = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(intervalId);
  }, []);

  const handleRemove = (key) => {
    removeFromCart(key);
    toast.error('Tour removed', {
      style: {
        background: '#FEF2F2',
        color: '#B91C1C',
        border: '1px solid rgba(185, 28, 28, 0.25)',
      },
      duration: 2500,
    });
  };

  const { total, finalTotal, hasDiscount, savings, minRemainingMs } = useMemo(() => {
    const parsePrice = (value) =>
      typeof value === 'number'
        ? value
        : Number.parseFloat(String(value).replace(/[^\d.]/g, '')) || 0;

    const original = cart.reduce((acc, item) => acc + parsePrice(item.price), 0);
    const discounted = cart.reduce(
      (acc, item) => acc + (item.finalPrice != null ? parsePrice(item.finalPrice) : parsePrice(item.price)),
      0
    );
    const savings = original - discounted;
    const minRemainingMs = cart.length > 0
      ? Math.max(0, Math.min(...cart.map((item) => Number(item.expiresAt) - now)))
      : 0;

    return {
      total: original,
      finalTotal: discounted,
      hasDiscount: discounted < original,
      savings,
      minRemainingMs,
    };
  }, [cart, now]);

  return (
    <div className="flex min-h-screen flex-col bg-[color:var(--page-bg)] text-slate-900">
      <Navbar />
      <div className="h-[var(--navbar-offset)] shrink-0" aria-hidden />

      <main className="mx-auto w-full flex-1 max-w-[1520px] px-3 py-5 sm:px-5 sm:py-7 lg:px-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <button
            onClick={() => navigateWithLoader(-1)}
            className="group mb-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-base font-semibold text-slate-600 shadow-sm transition hover:border-[color:var(--brand-green)]/30 hover:bg-[color:var(--brand-mist)] hover:text-[color:var(--brand-green)] hover:shadow-md sm:text-sm"
          >
            <ArrowLeft className="size-4 text-[color:var(--brand-green)] transition group-hover:-translate-x-0.5" />
            Back
          </button>

          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-4">
              <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[color:var(--brand-mist)] text-[color:var(--brand-green)] shadow-sm sm:size-14">
                <ShoppingCart className="size-6 sm:size-7" />
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  {t('nav.cart')}
                </h1>
                <p className="mt-0.5 text-base font-medium text-slate-500 sm:text-sm">
                  {cart.length} {cart.length === 1 ? 'item' : 'items'} in your cart
                </p>
              </div>
            </div>

            {cart.length > 0 && (
              <Button
                variant="ghost"
                onClick={clearCart}
                className="shrink-0 gap-2 text-base text-slate-500 hover:bg-rose-50 hover:text-rose-600 sm:text-sm"
              >
                <Trash2 className="size-4" />
                <span className="hidden sm:inline">Clear cart</span>
                <span className="sm:hidden">Clear</span>
              </Button>
            )}
          </div>
        </div>

        {cart.length === 0 ? (
          <motion.div
            className="flex flex-col items-center justify-center py-16 text-center sm:py-24"
            variants={emptyContainer}
            initial="hidden"
            animate="visible"
          >
            <div className="mb-6 flex w-full justify-center">
              <CartEmptyState className="h-48 w-48 sm:h-56 sm:w-56" />
            </div>
            <motion.h2
              className="mb-2 text-xl font-bold text-slate-900 sm:text-2xl"
              variants={emptyItem}
            >
              Your cart is empty
            </motion.h2>
            <motion.p
              className="mb-8 max-w-xs text-base leading-relaxed text-slate-500"
              variants={emptyItem}
            >
              Activities you add will appear here. You have up to 25 minutes to complete your
              booking.
            </motion.p>
            <motion.div variants={emptyItem}>
              <Link
                to="/tours"
                className="inline-flex items-center justify-center rounded-full bg-[color:var(--brand-green)] px-8 py-3 text-base font-semibold !text-white shadow-lg shadow-[color:var(--brand-green)]/25 transition hover:bg-[color:var(--brand-green)]/90 hover:shadow-xl hover:shadow-[color:var(--brand-green)]/30 hover:scale-[1.03] active:scale-[0.98] sm:text-sm"
              >
                Explore activities
              </Link>
            </motion.div>
          </motion.div>
        ) : (
          <>
            {/* Reservation countdown banner */}
            <div className="mb-5 inline-flex items-center gap-2 rounded-lg bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700">
              <Clock className="size-4" />
              We'll hold your spot for {formatRemainingTime(minRemainingMs)} minutes.
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
              {/* Items grouped by date */}
              <div className="space-y-8">
              {Object.values(groupByDate(cart)).map(({ date, items }) => (
                <section key={date.toDateString()}>
                  <h3 className="mb-3 text-lg font-bold text-slate-900 sm:text-xl">
                    {formatGroupDate(date)}
                  </h3>
                  <div className="space-y-4">
                    {items.map((item) => (
                      <CartItemCard
                        key={item.key}
                        item={item}
                        now={now}
                        onRemove={handleRemove}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>

            {/* Summary */}
            <aside className="h-fit space-y-4 lg:sticky lg:top-28">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex items-start justify-between">
                  <span className="text-lg font-bold text-slate-900 sm:text-xl">
                    Subtotal ({cart.length} {cart.length === 1 ? 'item' : 'items'})
                  </span>
                  <div className="text-right">
                    {hasDiscount && (
                      <p className="text-sm text-slate-400 line-through">
                        {convertPrice(total).formatted}
                      </p>
                    )}
                    <p className="text-xl font-bold text-rose-600 sm:text-2xl">
                      {convertPrice(finalTotal).formatted}
                    </p>
                  </div>
                </div>

                <p className="mt-1 text-right text-sm font-medium text-[color:var(--brand-green)]">
                  All taxes and fees included
                </p>

                {hasDiscount && savings > 0 && (
                  <div className="mt-4 flex items-start gap-2 rounded-lg bg-green-50 p-3">
                    <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-green-600" />
                    <p className="text-sm font-semibold text-green-700">
                      Save {convertPrice(savings).formatted} with the activity provider's special
                      offer
                    </p>
                  </div>
                )}

                <Button
                  onClick={() => navigate('/checkout')}
                  className="mt-6 w-full bg-blue-600 py-6 text-base font-semibold !text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/30"
                >
                  Go to checkout
                </Button>
              </div>

              {/* Why book with us? */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <h4 className="mb-4 text-base font-semibold text-slate-900 sm:text-lg">
                  Why book with us?
                </h4>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-sm text-slate-600">
                    <Lock className="size-4 text-slate-400" />
                    Secure payment
                  </li>
                  <li className="flex items-center gap-3 text-sm text-slate-600">
                    <CheckCircle2 className="size-4 text-slate-400" />
                    No hidden costs
                  </li>
                  <li className="flex items-center gap-3 text-sm text-slate-600">
                    <MessageCircle className="size-4 text-slate-400" />
                    24/7 customer support worldwide
                  </li>
                </ul>
              </div>
            </aside>
          </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default CartPage;
