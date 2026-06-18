import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { getAuthUserId } from '@/lib/auth';

const MAX_ITEMS = 12;

function getStorageKey(user) {
  const uid = getAuthUserId(user);
  return uid ? `recentlyViewed_${uid}` : 'recentlyViewed_guest';
}

function loadFromStorage(key) {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed.filter((item) => item.slug) : [];
  } catch {
    return [];
  }
}

export function useRecentlyViewedStorage() {
  const { user } = useAuth();
  const storageKey = useRef(getStorageKey(user));
  const [recentlyViewed, setRecentlyViewed] = useState(() =>
    loadFromStorage(storageKey.current)
  );

  useEffect(() => {
    storageKey.current = getStorageKey(user);
    setRecentlyViewed(loadFromStorage(storageKey.current));
  }, [user]);

  useEffect(() => {
    const key = storageKey.current;
    if (recentlyViewed.length > 0) {
      localStorage.setItem(key, JSON.stringify(recentlyViewed));
    }
  }, [recentlyViewed]);

  const addToRecentlyViewed = useCallback((item) => {
    if (!item?.slug || !item?.title) return;
    setRecentlyViewed((prev) => {
      const filtered = prev.filter((i) => i.title !== item.title);
      return [item, ...filtered].slice(0, MAX_ITEMS);
    });
  }, []);

  const clearRecentlyViewed = useCallback(() => {
    setRecentlyViewed([]);
    localStorage.removeItem(storageKey.current);
  }, []);

  return { recentlyViewed, addToRecentlyViewed, clearRecentlyViewed };
}
