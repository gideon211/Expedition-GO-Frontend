/**
 * @file lib/auth.js
 * @description Authentication service — Firebase (production) or mock (local dev).
 *
 * Provider selection: VITE_AUTH_PROVIDER = 'firebase' | 'mock' (default: mock)
 *
 * Flow (firebase mode):
 *   1. User signs in via Firebase (email/password or Google popup)
 *   2. ID token POSTed to /auth/verify-token for httpOnly session cookies
 *   3. User profile cached in localStorage (AUTH_USER_KEY) for instant UI hydration
 *
 * Key exports:
 *   signInWithEmail, registerWithEmail, signInWithGoogle, signOutUser
 *   subscribeToAuthState, getStoredAuthUser, getAuthToken, getApiBaseUrl
 *
 * Env vars: VITE_FIREBASE_*, VITE_AUTH_API_BASE_URL, VITE_API_URL
 *
 * @see components/auth/AuthProvider.jsx — React context wrapper
 * @see api/client.js — attaches getAuthToken() to API requests
 * @see api/auth.js — verify-token session exchange
 */
// ============================================================================
// EXPEDITION GO - AUTHENTICATION SERVICE
// Handles Firebase auth + backend session cookie syncing
// ============================================================================

import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';

// ============================================================================
// CONFIGURATION
// ============================================================================

const AUTH_PROVIDER = import.meta.env.VITE_AUTH_PROVIDER || 'mock';
const AUTH_USER_KEY = 'expedition_go_auth_user';

const rawBase =
  import.meta.env.VITE_AUTH_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  '/api';

let API_BASE = rawBase.replace(/\/+$/, '');

if (/^https?:\/\/[^/]+$/.test(API_BASE)) {
  API_BASE = `${API_BASE}/api`;
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
};

// ============================================================================
// FIREBASE INIT
// ============================================================================

let app = null;
let auth = null;
let googleProvider = null;

if (AUTH_PROVIDER === 'firebase') {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({ prompt: 'select_account' });
}

// ============================================================================
// STORAGE HELPERS
// ============================================================================

function storeAuthUser(user) {
  try {
    if (user) {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_USER_KEY);
    }
  } catch {
    // Ignore storage failures to avoid breaking auth flow.
  }
}

export function getStoredAuthUser() {
  try {
    const stored = localStorage.getItem(AUTH_USER_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function removeAuthUser() {
  try {
    localStorage.removeItem(AUTH_USER_KEY);
  } catch {
    // Ignore storage failures.
  }
}

// ============================================================================
// EVENT SUBSCRIPTION
// ============================================================================

let authStateListeners = [];

function notifyAuthStateChange(user) {
  authStateListeners.forEach((listener) => listener(user));
}

export function getAuthProvider() {
  return AUTH_PROVIDER;
}

// ============================================================================
// HTTP HELPERS
// ============================================================================

async function requestJson(endpoint, options = {}) {
  const response = await fetch(endpoint, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(
      text || `Request failed with status ${response.status}`
    );
  }

  const payload = await response.json().catch(() => null);
  return payload;
}

function normalizeFirebaseClientUser(firebaseUser) {
  if (!firebaseUser) return null;

  return {
    uid: firebaseUser.uid,
    firebaseUid: firebaseUser.uid,
    email: firebaseUser.email,
    emailVerified: firebaseUser.emailVerified,
    name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
    photoURL: firebaseUser.photoURL || null,
    provider: firebaseUser.providerData?.[0]?.providerId || 'email',
  };
}

function normalizeBackendUser(user, firebaseUser) {
  if (!user) return null;

  const firebaseUid = user.firebaseUid ?? user.uid ?? firebaseUser?.uid ?? null;

  return {
    ...user,
    firebaseUid,
    uid: firebaseUid,
    email: user.email ?? firebaseUser?.email ?? null,
    name:
      user.name ??
      firebaseUser?.displayName ??
      user.email?.split('@')[0] ??
      'User',
    photoURL: user.photoURL ?? firebaseUser?.photoURL ?? null,
  };
}

function getStoredFirebaseUid(storedUser) {
  return storedUser?.firebaseUid ?? storedUser?.uid ?? null;
}

// ============================================================================
// BACKEND SYNC
// ============================================================================

async function callBackendVerifyToken(idToken) {
  const { verifyToken } = await import('@/api/auth');
  return verifyToken(idToken);
}

async function callBackendSignup(idToken, firebaseUser) {
  const endpoint = `${API_BASE}/users/signup`;

  const payload = await requestJson(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({
      name: firebaseUser.displayName || firebaseUser.email?.split('@')[0],
      email: firebaseUser.email,
    }),
  });

  return payload?.data?.user ?? null;
}

async function callBackendSyncMe(idToken, firebaseUser) {
  const payload = await requestJson(`${API_BASE}/users/sync-me`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({
      name: firebaseUser.displayName,
      email: firebaseUser.email,
      photoURL: firebaseUser.photoURL,
    }),
  });

  return payload?.data?.user ?? null;
}

async function syncUserWithBackend(idToken, firebaseUser) {
  try {
    const user = await callBackendVerifyToken(idToken);
    return normalizeBackendUser(user, firebaseUser);
  } catch {
    try {
      const user = await callBackendSignup(idToken, firebaseUser);
      return normalizeBackendUser(user, firebaseUser);
    } catch {
      return normalizeFirebaseClientUser(firebaseUser);
    }
  }
}

// ============================================================================
// AUTH STATE
// ============================================================================

export async function subscribeToAuthState(callback) {
  authStateListeners.push(callback);

  if (AUTH_PROVIDER === 'firebase' && auth) {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (!firebaseUser) {
          removeAuthUser();
          notifyAuthStateChange(null);
          callback(null);
          return;
        }

        const storedUser = getStoredAuthUser();
        if (storedUser && getStoredFirebaseUid(storedUser) === firebaseUser.uid) {
          try {
            await firebaseUser.getIdToken(false);
          } catch {
            // Token refresh failed; fall through to full sync.
          }
          callback(storedUser);
          return;
        }

        const idToken = await firebaseUser.getIdToken(false);

        let backendUser = null;
        try {
          backendUser = await syncUserWithBackend(idToken, firebaseUser);
        } catch {
          backendUser = normalizeFirebaseClientUser(firebaseUser);
        }

        storeAuthUser(backendUser);
        notifyAuthStateChange(backendUser);
        callback(backendUser);
      } catch {
        removeAuthUser();
        notifyAuthStateChange(null);
        callback(null);
      }
    });

    return () => {
      authStateListeners = authStateListeners.filter((listener) => listener !== callback);
      unsubscribe();
    };
  }

  const current = getStoredAuthUser();
  callback(current);

  return () => {
    authStateListeners = authStateListeners.filter((listener) => listener !== callback);
  };
}

// ============================================================================
// AUTH METHODS
// ============================================================================

export async function signInWithEmail(email, password) {
  if (AUTH_PROVIDER === 'firebase' && auth) {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = credential.user;
    const idToken = await firebaseUser.getIdToken();

    let backendUser;
    try {
      backendUser = await syncUserWithBackend(idToken, firebaseUser);
    } catch {
      backendUser = normalizeFirebaseClientUser(firebaseUser);
    }

    storeAuthUser(backendUser);
    notifyAuthStateChange(backendUser);
    return backendUser;
  }

  await new Promise((resolve) => setTimeout(resolve, 800));

  const user = {
    id: `mock-${Date.now()}`,
    firebaseUid: `mock-${Date.now()}`,
    email,
    emailVerified: true,
    name: (email || "").split('@')[0],
    provider: 'email',
  };

  storeAuthUser(user);
  notifyAuthStateChange(user);
  return user;
}

export async function registerWithEmail(name, email, password) {
  if (AUTH_PROVIDER === 'firebase' && auth) {
    const credential = await createUserWithEmailAndPassword(auth, email, password);

    if (name) {
      await updateProfile(credential.user, { displayName: name });
      await credential.user.reload();
    }

    const firebaseUser = auth.currentUser || credential.user;
    const idToken = await firebaseUser.getIdToken();

    let backendUser;
    try {
      backendUser = await syncUserWithBackend(idToken, firebaseUser);
    } catch {
      backendUser = normalizeFirebaseClientUser(firebaseUser);
    }

    storeAuthUser(backendUser);
    notifyAuthStateChange(backendUser);
    return backendUser;
  }

  await new Promise((resolve) => setTimeout(resolve, 1000));

  const user = {
    id: `mock-${Date.now()}`,
    firebaseUid: `mock-${Date.now()}`,
    email,
    emailVerified: false,
    name,
    provider: 'email',
  };

  storeAuthUser(user);
  notifyAuthStateChange(user);
  return user;
}

export async function signInWithGoogle() {
  if (AUTH_PROVIDER === 'firebase' && auth && googleProvider) {
    const result = await signInWithPopup(auth, googleProvider);
    const firebaseUser = result.user;
    const idToken = await firebaseUser.getIdToken();

    let backendUser;
    try {
      backendUser = await syncUserWithBackend(idToken, firebaseUser);
    } catch {
      backendUser = normalizeFirebaseClientUser(firebaseUser);
    }

    storeAuthUser(backendUser);
    notifyAuthStateChange(backendUser);
    return backendUser;
  }

  await new Promise((resolve) => setTimeout(resolve, 1200));

  const user = {
    id: `mock-google-${Date.now()}`,
    firebaseUid: `mock-google-${Date.now()}`,
    email: 'user@gmail.com',
    emailVerified: true,
    name: 'Google User',
    photoURL: 'https://via.placeholder.com/150',
    provider: 'google.com',
  };

  storeAuthUser(user);
  notifyAuthStateChange(user);
  return user;
}

export async function signOutUser() {
  const tasks = [];

  tasks.push(
    import('@/api/auth').then(({ logoutFromBackend }) => logoutFromBackend()).catch(() => null)
  );

  if (AUTH_PROVIDER === 'firebase' && auth) {
    tasks.push(firebaseSignOut(auth).catch(() => null));
  }

  await Promise.allSettled(tasks);

  removeAuthUser();
  notifyAuthStateChange(null);
}

// ============================================================================
// UTILITY METHODS
// ============================================================================

export async function getCurrentUserToken() {
  if (AUTH_PROVIDER === 'firebase' && auth) {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) return null;

    try {
      return await firebaseUser.getIdToken();
    } catch {
      return null;
    }
  }

  if (AUTH_PROVIDER === 'mock' && getStoredAuthUser()) {
    return import.meta.env.DEV ? 'test-token' : null;
  }

  return null;
}

export function getApiBaseUrl() {
  return API_BASE;
}

export async function getAuthToken() {
  return await getCurrentUserToken();
}

/** Wait for Firebase to restore the session after a full page reload. */
export async function waitForAuthToken(maxMs = 5000) {
  const deadline = Date.now() + maxMs;
  while (Date.now() < deadline) {
    const token = await getCurrentUserToken();
    if (token) return token;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  return null;
}

/** Refresh cached user from GET /users/me (roles, profile fields). */
export async function refreshStoredUserFromBackend() {
  try {
    const token = await waitForAuthToken();
    if (!token) return null;

    const payload = await requestJson(`${API_BASE}/users/me`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });

    const user = payload?.data?.user ?? payload?.data ?? null;
    if (user) {
      const normalized = {
        ...user,
        firebaseUid: user.firebaseUid ?? user.uid,
        uid: user.firebaseUid ?? user.uid,
      };
      storeAuthUser(normalized);
      notifyAuthStateChange(normalized);
      return normalized;
    }
  } catch {
    return null;
  }
  return null;
}

export async function updateUserProfile(updates) {
  if (AUTH_PROVIDER === 'firebase' && auth && auth.currentUser) {
    if (updates.name || updates.photoURL) {
      await updateProfile(auth.currentUser, {
        displayName: updates.name,
        photoURL: updates.photoURL,
      });
    }

    const idToken = await auth.currentUser.getIdToken();
    const backendUser = await callBackendSyncMe(idToken, auth.currentUser);

    storeAuthUser(backendUser);
    notifyAuthStateChange(backendUser);
    return backendUser;
  }

  throw new Error('No authenticated user');
}

export { auth };
