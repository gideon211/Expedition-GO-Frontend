import { useEffect, useState } from "react";

const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
};

function resolveClipEnabled(clipAt, width) {
  if (clipAt === false) return false;
  const minWidth = typeof clipAt === "number" ? clipAt : BREAKPOINTS[clipAt] ?? BREAKPOINTS.xl;
  return width >= minWidth;
}

/**
 * Measures how many full carousel cards fit in a container and the clip width
 * so partial cards do not peek at the right edge (when clipping is enabled).
 */
export function useCarouselLayout(
  containerRef,
  { cardWidth = 280, gap = 12, minCards = 1, maxCards = 12, clipAt = "xl" } = {},
) {
  const [layout, setLayout] = useState({ count: minCards, clipWidth: null });
  const [shouldClip, setShouldClip] = useState(() =>
    typeof window !== "undefined" ? resolveClipEnabled(clipAt, window.innerWidth) : clipAt !== false,
  );

  useEffect(() => {
    if (clipAt === false) {
      setShouldClip(false);
      return undefined;
    }

    const minWidth = typeof clipAt === "number" ? clipAt : BREAKPOINTS[clipAt] ?? BREAKPOINTS.xl;
    const mq = window.matchMedia(`(min-width: ${minWidth}px)`);
    const updateClip = () => setShouldClip(mq.matches);
    updateClip();
    mq.addEventListener("change", updateClip);
    return () => mq.removeEventListener("change", updateClip);
  }, [clipAt]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const update = () => {
      const available = container.clientWidth;
      if (!available) return;

      const step = cardWidth + gap;
      const count = Math.max(minCards, Math.min(maxCards, Math.floor((available + gap) / step)));
      const clipWidth = shouldClip ? Math.min(available, count * step - gap) : null;

      setLayout((prev) =>
        prev.count === count && prev.clipWidth === clipWidth ? prev : { count, clipWidth },
      );
    };

    update();
    const resizeObserver =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(update) : null;
    resizeObserver?.observe(container);
    window.addEventListener("resize", update);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [containerRef, cardWidth, gap, minCards, maxCards, shouldClip]);

  return layout;
}
