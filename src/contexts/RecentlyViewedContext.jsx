import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "@/components/auth/AuthProvider";

const RecentlyViewedContext = createContext({
  recentlyViewed: [],
  addToRecentlyViewed: () => {},
  clearRecentlyViewed: () => {},
});

const MAX_RECENT_ITEMS = 12;

export function RecentlyViewedProvider({ children }) {
  const { user } = useAuth();
  const [recentlyViewed, setRecentlyViewed] = useState(() => {
    // Initialize from localStorage immediately
    const storageKey = user ? `recentlyViewed_${user.uid}` : 'recentlyViewed_guest';
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        console.log('RecentlyViewedContext: Initial load from localStorage:', parsed);
        return parsed;
      } catch (e) {
        console.error('Failed to parse recently viewed:', e);
        return [];
      }
    }
    return [];
  });

  // Save to localStorage whenever it changes
  useEffect(() => {
    const storageKey = user ? `recentlyViewed_${user.uid}` : 'recentlyViewed_guest';
    if (recentlyViewed.length > 0) {
      localStorage.setItem(storageKey, JSON.stringify(recentlyViewed));
    }
  }, [recentlyViewed, user?.uid]);

  const addToRecentlyViewed = useCallback((item) => {
    console.log('RecentlyViewedContext: Adding item:', item);
    setRecentlyViewed((prev) => {
      console.log('RecentlyViewedContext: Previous items:', prev);
      // Remove if already exists
      const filtered = prev.filter((i) => i.title !== item.title);
      console.log('RecentlyViewedContext: After filtering:', filtered);
      // Add to beginning
      const updated = [item, ...filtered];
      console.log('RecentlyViewedContext: Updated list:', updated);
      // Keep only MAX_RECENT_ITEMS
      return updated.slice(0, MAX_RECENT_ITEMS);
    });
  }, []);

  const clearRecentlyViewed = useCallback(() => {
    setRecentlyViewed([]);
    const storageKey = user ? `recentlyViewed_${user.uid}` : 'recentlyViewed_guest';
    localStorage.removeItem(storageKey);
  }, [user?.uid]);

  const value = useMemo(
    () => ({
      recentlyViewed,
      addToRecentlyViewed,
      clearRecentlyViewed,
    }),
    [recentlyViewed, addToRecentlyViewed, clearRecentlyViewed]
  );

  return (
    <RecentlyViewedContext.Provider value={value}>
      {children}
    </RecentlyViewedContext.Provider>
  );
}

export function useRecentlyViewed() {
  return useContext(RecentlyViewedContext);
}
