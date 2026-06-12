import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Loader from "@/components/ui/Loader";
import { TourDetailSkeleton } from "@/components/tour-detail/TourDetailSkeleton";

function resolveNavigationPath(to) {
  if (typeof to === "number") return null;
  if (typeof to === "string") {
    const path = to.split("?")[0].split("#")[0];
    return path.startsWith("/") ? path : null;
  }
  if (to?.pathname) return to.pathname;
  return null;
}

function isTourDetailPath(path) {
  return typeof path === "string" && path.startsWith("/tour/");
}

const NavigationContext = createContext(null);

const AUTO_HIDE_MS = 2000;

export function NavigationProvider({ children }) {
  const [isNavigating, setIsNavigating] = useState(false);
  const [navigationTarget, setNavigationTarget] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const safetyRef = useRef(null);
  const showTourDetailSkeleton =
    isNavigating &&
    (isTourDetailPath(navigationTarget) || isTourDetailPath(location.pathname));

  useEffect(() => {
    return () => {
      if (safetyRef.current) clearTimeout(safetyRef.current);
    };
  }, []);

  useEffect(() => {
    if (!isNavigating) return;
    if (location.pathname === "/signin" || location.pathname === "/register") {
      if (safetyRef.current) clearTimeout(safetyRef.current);
      setIsNavigating(false);
      setNavigationTarget(null);
    }
  }, [location.pathname, location.key, isNavigating]);

  const hideLoader = useCallback(() => {
    if (safetyRef.current) clearTimeout(safetyRef.current);
    setIsNavigating(false);
    setNavigationTarget(null);
  }, []);

  const navigateWithLoader = useCallback(
    (to) => {
      setIsNavigating(true);
      navigate(to);

      if (safetyRef.current) clearTimeout(safetyRef.current);
      safetyRef.current = setTimeout(() => {
        setIsNavigating(false);
      }, AUTO_HIDE_MS);
    },
    [navigate]
  );

  return (
    <NavigationContext.Provider value={{ isNavigating, navigateWithLoader, hideLoader }}>
      {children}
      {showTourDetailSkeleton && (
        <div className="fixed inset-0 z-[200] overflow-y-auto bg-[color:var(--page-bg)]">
          <TourDetailSkeleton />
        </div>
      )}
      {isNavigating && !showTourDetailSkeleton && <Loader />}
    </NavigationContext.Provider>
  );
}

export function useNavigationLoader() {
  const ctx = useContext(NavigationContext);
  if (!ctx) {
    if (typeof window !== "undefined") {
      console.warn("[Navigation] useNavigationLoader used outside NavigationProvider — using no-op fallback");
    }
    return { navigateWithLoader: (to) => { window.location.href = to; }, hideLoader: () => {}, isNavigating: false };
  }
  return ctx;
}
