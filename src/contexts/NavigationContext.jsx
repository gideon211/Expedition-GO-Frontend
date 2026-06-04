import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Loader from "@/components/ui/Loader";

const NavigationContext = createContext(null);

const AUTO_HIDE_MS = 2000;

export function NavigationProvider({ children }) {
  const [isNavigating, setIsNavigating] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const safetyRef = useRef(null);

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
    }
  }, [location.pathname, location.key, isNavigating]);

  const hideLoader = useCallback(() => {
    if (safetyRef.current) clearTimeout(safetyRef.current);
    setIsNavigating(false);
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
      {isNavigating && <Loader />}
    </NavigationContext.Provider>
  );
}

export function useNavigationLoader() {
  const ctx = useContext(NavigationContext);
  if (!ctx) throw new Error("useNavigationLoader must be used within NavigationProvider");
  return ctx;
}
