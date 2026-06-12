/**
 * @file BrandLoader.jsx
 * @description Branded loading spinner / splash screen.
 *
 * Props:
 *   - fullScreen — fixed overlay (App auth gate, post-sign-in splash)
 *   - splash — shorter animation for auth handoff (~700ms)
 *   - once — single full TravioAfrica wipe; calls onComplete when done
 *   - onComplete — fired after `once` animation (+ brief hold)
 *   - label — accessible loading text
 */
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/** Wipe duration in CSS (`brandLoaderWipeOnce`) plus hold before onComplete. */
export const BRAND_LOADER_ONCE_MS = 1650;
const BRAND_LOADER_ONCE_HOLD_MS = 350;
const BRAND_LOADER_ONCE_FALLBACK_MS = BRAND_LOADER_ONCE_MS + BRAND_LOADER_ONCE_HOLD_MS + 400;

/**
 * Brand loading / splash visuals.
 * @param {{ fullScreen?: boolean; label?: string; splash?: boolean; once?: boolean; initial?: boolean; onComplete?: () => void }} props
 * - `splash`: shorter wipe animation (~1s) for post–sign-in handoff (pair with ~1200ms timers).
 * - `once`: full brand reveal once; use `onComplete` to continue (e.g. show auth form).
 * - `initial`: dramatic single-play splash for first-ever page load.
 */
export function BrandLoader({
  fullScreen = false,
  label = "Loading...",
  splash = false,
  once = false,
  initial = false,
  onComplete,
}) {
  const fillWrapRef = useRef(null);

  useEffect(() => {
    if (!once || !onComplete) return;

    let finished = false;
    let holdTimer;
    let fallbackTimer;

    const finish = () => {
      if (finished) return;
      finished = true;
      if (holdTimer) clearTimeout(holdTimer);
      if (fallbackTimer) clearTimeout(fallbackTimer);
      onComplete();
    };

    const node = fillWrapRef.current;
    const onAnimationEnd = (event) => {
      if (event.target !== node) return;
      if (!event.animationName.includes("brandLoaderWipeOnce")) return;
      holdTimer = setTimeout(finish, BRAND_LOADER_ONCE_HOLD_MS);
    };

    if (node) {
      node.addEventListener("animationend", onAnimationEnd);
    }

    fallbackTimer = setTimeout(finish, BRAND_LOADER_ONCE_FALLBACK_MS);

    return () => {
      if (node) {
        node.removeEventListener("animationend", onAnimationEnd);
      }
      if (holdTimer) clearTimeout(holdTimer);
      if (fallbackTimer) clearTimeout(fallbackTimer);
    };
  }, [once, onComplete]);

  const isFullScreen = initial || fullScreen;

  const wrapperClass = isFullScreen
    ? cn(
        "fixed inset-0 z-[120] flex items-center justify-center bg-white px-4 sm:px-6 min-h-[100dvh] min-h-[100svh]",
        "pt-[env(safe-area-inset-top,0)] pb-[env(safe-area-inset-bottom,0)]",
      )
    : "flex items-center justify-center px-4 sm:px-6";

  return (
    <div className={wrapperClass} role="status" aria-live="polite" aria-label={label}>
      <div className={cn("brand-loader", splash && "brand-loader--splash", once && "brand-loader--once", initial && "brand-loader--initial")}>
        <div ref={fillWrapRef} className="brand-loader__fill-wrap">
          <div className="brand-loader__fill">
            <span className="brand-loader__travio">Travio</span><span className="brand-loader__africa">Africa</span>
            <span className="brand-loader__byline">by Expedition-Go Tours</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BrandLoader;
