import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";

import { AuthProvider } from "@/components/auth/AuthProvider";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { CartProvider } from "@/contexts/CartContext";
import HomePage from "@/pages/HomePage";
import AllToursPage from "@/pages/AllToursPage";
import WishlistPage from "@/pages/WishlistPage";
import CartPage from "@/pages/CartPage";
import TourDetailPage from "@/pages/TourDetailPage";
import RegisterPage from "@/pages/RegisterPage";
import SignInPage from "@/pages/SignInPage";
import SignOutPage from "@/pages/SignOutPage";
import SupportPage from "@/pages/SupportPage";
import SettingsPage from "@/pages/SettingsPage";
import AdminRoutes from "@/routes/AdminRoutes";

function App() {
  useEffect(() => {
    // #region agent log: mobile scroll freeze investigation
    const ENDPOINT = "http://127.0.0.1:7510/ingest/1c0cbdc1-3a47-4026-a86c-f81a5ffc7658";
    const sessionId = "c1db3f";
    const runId = "pre-fix";
    const send = (payload) =>
      fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Debug-Session-Id": sessionId },
        body: JSON.stringify({ sessionId, runId, timestamp: Date.now(), ...payload }),
      }).catch(() => {});

    send({
      hypothesisId: "M",
      location: "src/App.jsx:useEffect",
      message: "instrumentation mounted",
      data: { userAgent: navigator.userAgent },
    });

    const closestCarousel = (el) => {
      if (!(el instanceof Element)) return null;
      return (
        el.closest?.(".overflow-x-auto") ||
        el.closest?.("[data-carousel]") ||
        el.closest?.(".touch-pan-x") ||
        null
      );
    };

    const styleSummary = (el) => {
      if (!(el instanceof Element)) return null;
      const cs = window.getComputedStyle(el);
      return {
        tag: el.tagName,
        className: (el.getAttribute("class") || "").slice(0, 240),
        touchAction: cs.touchAction,
        overflowX: cs.overflowX,
        overflowY: cs.overflowY,
        scrollSnapType: cs.scrollSnapType,
        position: cs.position,
      };
    };

    let active = null; // { startedAt, startScrollY, target, carousel, movesLogged }

    const onTouchStart = (e) => {
      const target = e.target;
      const carousel = closestCarousel(target);
      active = {
        startedAt: Date.now(),
        startScrollY: window.scrollY,
        target,
        carousel,
        movesLogged: 0,
      };

      send({
        hypothesisId: "A",
        location: "src/App.jsx:onTouchStart",
        message: "touchstart",
        data: {
          windowScrollY: window.scrollY,
          target: styleSummary(target),
          carousel: styleSummary(carousel),
        },
      });
    };

    const onTouchMove = (e) => {
      if (!active) return;
      if (active.movesLogged >= 6) return;
      active.movesLogged += 1;

      const t = e.touches?.[0];
      send({
        hypothesisId: "B",
        location: "src/App.jsx:onTouchMove",
        message: "touchmove",
        data: {
          moveIndex: active.movesLogged,
          windowScrollY: window.scrollY,
          deltaScrollY: window.scrollY - active.startScrollY,
          cancelable: !!e.cancelable,
          defaultPrevented: !!e.defaultPrevented,
          touch: t ? { clientX: t.clientX, clientY: t.clientY } : null,
          withinCarousel: !!active.carousel,
        },
      });
    };

    const onScroll = () => {
      // Log only while finger interaction is active (helps correlate “stiff” feel to actual scrollY changes)
      if (!active) return;
      send({
        hypothesisId: "C",
        location: "src/App.jsx:onScroll",
        message: "window scroll",
        data: {
          windowScrollY: window.scrollY,
          sinceTouchStartMs: Date.now() - active.startedAt,
          withinCarousel: !!active.carousel,
        },
      });
    };

    const onTouchEnd = () => {
      if (!active) return;
      send({
        hypothesisId: "D",
        location: "src/App.jsx:onTouchEnd",
        message: "touchend",
        data: {
          endScrollY: window.scrollY,
          totalDeltaScrollY: window.scrollY - active.startScrollY,
          withinCarousel: !!active.carousel,
          touchDurationMs: Date.now() - active.startedAt,
        },
      });
      active = null;
    };

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("scroll", onScroll);
    };
    // #endregion agent log: mobile scroll freeze investigation
  }, []);

  return (
    <AuthProvider>
      <CurrencyProvider>
        <WishlistProvider>
          <CartProvider>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 1400,
                style: {
                  background: "var(--brand-mist)",
                  color: "var(--brand-green)",
                  border: "1px solid rgba(9, 106, 79, 0.18)",
                },
              }}
            />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/tours" element={<AllToursPage />} />
              <Route path="/tour/:id" element={<TourDetailPage />} />
              <Route path="/wishlist" element={<WishlistPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/signin" element={<SignInPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/signout" element={<SignOutPage />} />
              <Route path="/support" element={<SupportPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/admin/*" element={<AdminRoutes />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </CartProvider>
        </WishlistProvider>
      </CurrencyProvider>
    </AuthProvider>
  );
}

export default App;
