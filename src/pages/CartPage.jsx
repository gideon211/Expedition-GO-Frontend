import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, Clock3, ShoppingCart, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Navbar } from "@/components/homepage/Navbar";
import { Footer } from "@/components/homepage/Footer";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useCurrency } from "@/contexts/CurrencyContext";

const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const formatRemainingTime = (ms) => {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
};

function CartPage() {
  const { t } = useTranslation();
  const { cart, removeFromCart, clearCart } = useCart();
  const { convertPrice } = useCurrency();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const intervalId = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(intervalId);
  }, []);

  const total = useMemo(() => {
    return cart.reduce((acc, item) => {
      const raw = typeof item.price === "number" ? item.price : Number.parseFloat(String(item.price).replace(/[^\d.]/g, "")) || 0;
      return acc + raw;
    }, 0);
  }, [cart]);

  return (
    <div className="min-h-screen bg-[color:var(--page-bg)] text-slate-900">
      <Navbar />

      <main className="mx-auto w-full max-w-[1520px] px-3 py-5 sm:px-5 sm:py-7 lg:px-6 lg:py-8">
        <div className="mb-6 flex items-center justify-between gap-3 sm:mb-8">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-full bg-[color:var(--brand-mist)] text-[color:var(--brand-green)] sm:size-12">
              <ShoppingCart className="size-5 sm:size-6" />
            </div>
            <div className="min-w-0">
              <h1 className="leading-tight text-slate-900" style={{ fontSize: "clamp(1.4rem, 2.2vw + 0.4rem, 2rem)" }}>
                {t("nav.cart")}
              </h1>
              <p className="text-sm text-slate-600 sm:text-base">{cart.length} item(s)</p>
            </div>
          </div>
          {cart.length > 0 && (
            <Button
              variant="outline"
              onClick={clearCart}
              className="border-slate-300 text-slate-700 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600"
            >
              Clear cart
            </Button>
          )}
        </div>

        {cart.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-12 text-center shadow-sm sm:px-8 sm:py-16">
            <ShoppingCart className="mx-auto mb-4 size-12 text-slate-300 sm:size-14" />
            <h2 className="mb-2 text-xl font-semibold text-slate-900 sm:text-2xl">No activities in your cart</h2>
            <p className="mx-auto mb-6 max-w-xl text-sm text-slate-600 sm:text-base">
              Activities you add to your cart stay here for up to 25 minutes.
            </p>
            <Link
              to="/tours"
              className="inline-flex items-center justify-center rounded-full border border-[color:var(--brand-green)] px-6 py-2.5 text-sm font-semibold text-[color:var(--brand-green)] transition hover:bg-[color:var(--brand-mist)]"
            >
              Find things to do
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
            <div className="space-y-3 sm:space-y-4">
              {cart.map((item) => {
                const remainingMs = Math.max(0, Number(item.expiresAt) - now);
                const converted = convertPrice(item.price);

                return (
                  <article key={item.key} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-start gap-3 p-3 sm:gap-4 sm:p-4">
                      <img src={item.image} alt={item.title} className="h-24 w-28 shrink-0 rounded-xl object-cover sm:h-28 sm:w-44" />
                      <div className="flex min-w-0 flex-1 flex-col">
                        <h2 className="line-clamp-2 text-base font-semibold text-slate-900 sm:text-lg">{item.title}</h2>
                        <p className="mt-1 text-sm text-slate-600">{item.duration}</p>

                        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-600">
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1">
                            <CalendarDays className="size-4" />
                            {formatDate(item.selectedDate)}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-amber-700">
                            <Clock3 className="size-4" />
                            Expires in {formatRemainingTime(remainingMs)}
                          </span>
                        </div>

                        <div className="mt-4 flex items-center justify-between gap-3">
                          <p className="text-base font-semibold text-slate-900 sm:text-lg">{converted.formatted}</p>
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.key)}
                            className="inline-flex items-center gap-1 text-sm font-medium text-rose-600 transition hover:text-rose-700"
                          >
                            <Trash2 className="size-4" />
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:sticky lg:top-24">
              <h3 className="text-lg font-semibold text-slate-900">Cart summary</h3>
              <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
                <span>Items</span>
                <span>{cart.length}</span>
              </div>
              <div className="mt-2 flex items-center justify-between font-semibold text-slate-900">
                <span>Total</span>
                <span>{convertPrice(total).formatted}</span>
              </div>
              <Button className="mt-5 w-full bg-[color:var(--brand-green)] !text-white hover:bg-[color:var(--brand-green)]/90">
                Continue
              </Button>
            </aside>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default CartPage;
