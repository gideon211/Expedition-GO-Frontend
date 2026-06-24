/**
 * @file AuthModalContext.jsx
 * @description Controls the global auth modal (sign-in prompt without leaving page).
 *
 * Scoped to HomePage and AllToursPage via AuthModalProvider — not app-wide.
 * Use openAuthModal() when an action requires login (e.g. wishlist while guest).
 *
 * @see components/ui/auth-modal.jsx — modal UI
 */
import { createContext, useContext, useState } from 'react';
import { setAuthReturnTo } from '@/lib/auth';

const AuthModalContext = createContext();

export function AuthModalProvider({ children }) {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const openAuthModal = () => {
    setAuthReturnTo(window.location.pathname + window.location.search);
    setIsAuthModalOpen(true);
  };
  const closeAuthModal = () => setIsAuthModalOpen(false);

  return (
    <AuthModalContext.Provider value={{ isAuthModalOpen, openAuthModal, closeAuthModal }}>
      {children}
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const context = useContext(AuthModalContext);
  if (!context) {
    throw new Error('useAuthModal must be used within AuthModalProvider');
  }
  return context;
}
