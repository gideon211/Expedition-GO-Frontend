import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { sharedQueryClient } from '@/api/queryClient';
import { prefetchSupplierAccess } from '@/api/supplierAccessQuery';
import {
  getAuthProvider,
  getStoredAuthUser,
  getAuthUserId,
  signOutUser,
  subscribeToAuthState,
  waitForAuthToken,
} from '@/lib/auth';
import { clearSupplierNavCache } from '@/lib/supplierPortal';

const AuthContext = createContext({
  loading: true,
  signOut: async () => {},
  user: null,
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredAuthUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    let cleanup = () => {};

    subscribeToAuthState((nextUser) => {
      if (!mounted) return;
      setUser(nextUser);
      setLoading(false);
    }).then((unsubscribe) => {
      if (!mounted) {
        unsubscribe?.();
        return;
      }
      cleanup = unsubscribe ?? (() => {});
    });

    function handleAuthStorageChanged() {
      setUser(getStoredAuthUser());
    }

    window.addEventListener('auth-storage-changed', handleAuthStorageChanged);

    return () => {
      mounted = false;
      cleanup();
      window.removeEventListener('auth-storage-changed', handleAuthStorageChanged);
    };
  }, []);

  useEffect(() => {
    if (!user || !sharedQueryClient || loading) return;
    const uid = getAuthUserId(user);
    if (uid) {
      prefetchSupplierAccess(sharedQueryClient, user);
    }
  }, [user?.id, user?.uid, user?._id, loading]);

  const handleSignOut = useCallback(async () => {
    clearSupplierNavCache(user);
    await signOutUser();
    setUser(null);
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        loading,
        signOut: handleSignOut,
        user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
