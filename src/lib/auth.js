import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';

// Authentication provider configuration
const AUTH_PROVIDER = import.meta.env.VITE_AUTH_PROVIDER || 'mock';

// Local storage key for user data
const AUTH_USER_KEY = 'expedition_go_auth_user';

// Backend API base: prefer specific auth API env, then generic, then relative
const rawBase = (
  import.meta.env.VITE_AUTH_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  '/api/v1'
);

let API_BASE = rawBase.replace(/\/+$/, '');

// If the base is an absolute host-only URL (e.g. https://host.com),
// append the expected API prefix so calls target /api/v1 endpoints.
if (/^https?:\/\/[^\/]+$/.test(API_BASE)) {
  API_BASE = `${API_BASE}/api/v1`;
}
console.log('API_BASE:', API_BASE);

// On localhost, route auth API calls through Vite proxy to avoid browser CORS
// while still using the hosted backend target configured in vite.config.js.
const isLocalhost =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');


// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
};

// Initialize Firebase
let app = null;
let auth = null;
let googleProvider = null;

if (AUTH_PROVIDER === 'firebase') {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: 'select_account' });
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
}

export function getAuthProvider() {
  return AUTH_PROVIDER;
}

/**
 * Returns the API base URL used by the authenticated app code.
 */
export function getApiBaseUrl() {
  return API_BASE;
}

/**
 * Returns a usable bearer token for API requests, or null when unavailable.
 * Prefers a fresh Firebase ID token when running with the firebase provider,
 * and falls back to the stored mock-user identifier so requests still carry
 * an Authorization header during local development.
 */
export async function getAuthToken({ forceRefresh = false } = {}) {
  if (AUTH_PROVIDER === "firebase" && auth?.currentUser) {
    try {
      return await auth.currentUser.getIdToken(forceRefresh);
    } catch (error) {
      console.error("Failed to retrieve auth token:", error);
      return null;
    }
  }

  const stored = getStoredAuthUser();
  return stored?.token || stored?.firebaseUid || stored?._id || null;
}

function storeAuthUser(user) {
  try {
    if (user) localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(AUTH_USER_KEY);
  } catch (error) {
    console.error('Failed to store user:', error);
  }
}

export function getStoredAuthUser() {
  try {
    const stored = localStorage.getItem(AUTH_USER_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Failed to get stored user:', error);
    return null;
  }
}

function removeAuthUser() {
  try {
    localStorage.removeItem(AUTH_USER_KEY);
  } catch (error) {
    console.error('Failed to remove user:', error);
  }
}

let authStateListeners = [];
function notifyAuthStateChange(user) {
  authStateListeners.forEach((l) => l(user));
}

function extractBackendUser(payload) {
  if (!payload || typeof payload !== 'object') return null;
  return payload?.data?.user || payload?.user || payload?.data || null;
}

async function callBackendUserOnboarding(idToken, attempts) {
  let lastError = null;

  for (const attempt of attempts) {
    const res = await fetch(`${API_BASE}${attempt.path}`, {
      method: attempt.method,
      headers: {
        Authorization: `Bearer ${idToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const text = await res.text();
      lastError = new Error(`Backend ${attempt.label} failed: ${res.status} ${text}`);

      // Keep trying fallback routes/methods on 404.
      if (res.status === 404) continue;
      throw lastError;
    }

    const payload = await res.json();
    const user = extractBackendUser(payload);
    if (user) return user;

    lastError = new Error(`Backend ${attempt.label} returned no user payload`);
  }

  throw lastError || new Error('Backend onboarding failed: no valid endpoint response');
}

async function callBackendCreateMe(idToken) {
  return callBackendUserOnboarding(idToken, [
    { method: 'POST', path: '/users/create-me', label: 'create-me' },
    { method: 'PATCH', path: '/users/sync-me', label: 'sync-me (fallback)' },
  ]);
}

async function callBackendSyncMe(idToken) {
  return callBackendUserOnboarding(idToken, [
    { method: 'PATCH', path: '/users/sync-me', label: 'sync-me' },
    { method: 'POST', path: '/users/create-me', label: 'create-me (fallback)' },
  ]);
}

function normalizeFirebaseClientUser(firebaseUser) {
  if (!firebaseUser) return null;
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    emailVerified: firebaseUser.emailVerified,
    name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
    photoURL: firebaseUser.photoURL || null,
    provider: firebaseUser.providerData?.[0]?.providerId || 'email',
  };
}

async function resolveBackendUserOrFallback(firebaseUser, idToken) {
  try {
    return await callBackendCreateMe(idToken);
  } catch (createError) {
    try {
      return await callBackendSyncMe(idToken);
    } catch (syncError) {
      console.error('Backend onboarding failed:', createError, syncError);
      return normalizeFirebaseClientUser(firebaseUser);
    }
  }
}

/**
 * Subscribe to authentication state changes
 * callback receives the backend user (or null)
 * returns unsubscribe function
 */
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

        const idToken = await firebaseUser.getIdToken(/* forceRefresh= */ false);

        // Ensure backend user exists and return backend user object
        const backendUser = await resolveBackendUserOrFallback(firebaseUser, idToken);

        storeAuthUser(backendUser);
        notifyAuthStateChange(backendUser);
        callback(backendUser);
      } catch (err) {
        console.error('Auth state handling error:', err);
        removeAuthUser();
        notifyAuthStateChange(null);
        callback(null);
      }
    });

    return () => {
      authStateListeners = authStateListeners.filter((l) => l !== callback);
      unsubscribe();
    };
  } else {
    // Mock mode: immediately call with stored user
    const current = getStoredAuthUser();
    callback(current);
    return () => {
      authStateListeners = authStateListeners.filter((l) => l !== callback);
    };
  }
}

/**
 * Sign in with email and password
 */
export async function signInWithEmail(email, password) {
  if (AUTH_PROVIDER === 'firebase' && auth) {
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = credential.user;
      const idToken = await firebaseUser.getIdToken();

      // Keep sign-in resilient locally: fallback if backend onboarding is unavailable.
      const backendUser = await resolveBackendUserOrFallback(firebaseUser, idToken);
      storeAuthUser(backendUser);
      notifyAuthStateChange(backendUser);
      return backendUser;
    } catch (error) {
      console.error('Firebase sign in error:', error);
      let message = 'Failed to sign in. Please try again.';
      if (error.code === 'auth/user-not-found') message = 'No account found with this email address.';
      else if (error.code === 'auth/wrong-password') message = 'Incorrect password. Please try again.';
      else if (error.code === 'auth/invalid-email') message = 'Invalid email address format.';
      else if (error.code === 'auth/user-disabled') message = 'This account has been disabled.';
      else if (error.code === 'auth/too-many-requests') message = 'Too many failed attempts. Please try again later.';
      throw new Error(message);
    }
  }

  // Mock sign-in
  await new Promise((r) => setTimeout(r, 800));
  const user = {
    _id: 'mock-' + Date.now(),
    firebaseUid: 'mock-' + Date.now(),
    email,
    emailVerified: true,
    name: email.split('@')[0],
    provider: 'email',
  };
  storeAuthUser(user);
  notifyAuthStateChange(user);
  return user;
}

/**
 * Register new user with email and password
 */
export async function registerWithEmail(name, email, password) {
  if (AUTH_PROVIDER === 'firebase' && auth) {
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);

      if (name) {
        await updateProfile(credential.user, { displayName: name });
      }

      const idToken = await credential.user.getIdToken();

      const backendUser = await resolveBackendUserOrFallback(credential.user, idToken);
      // Ensure name is the one provided (backend create may have taken displayName)
      backendUser.name = backendUser.name || name;
      storeAuthUser(backendUser);
      notifyAuthStateChange(backendUser);
      return backendUser;
    } catch (error) {
      console.error('Firebase registration error:', error);
      let message = 'Failed to create account. Please try again.';
      if (error.code === 'auth/email-already-in-use') message = 'An account with this email already exists.';
      else if (error.code === 'auth/invalid-email') message = 'Invalid email address format.';
      else if (error.code === 'auth/weak-password') message = 'Password is too weak. Please use at least 6 characters.';
      else if (error.code === 'auth/operation-not-allowed') message = 'Email/password accounts are not enabled.';
      throw new Error(message);
    }
  }

  // Mock registration
  await new Promise((r) => setTimeout(r, 1000));
  const user = {
    _id: 'mock-' + Date.now(),
    firebaseUid: 'mock-' + Date.now(),
    email,
    emailVerified: false,
    name,
    provider: 'email',
  };
  storeAuthUser(user);
  notifyAuthStateChange(user);
  return user;
}

/**
 * Sign in with Google
 */
export async function signInWithGoogle() {
  if (AUTH_PROVIDER === 'firebase' && auth && googleProvider) {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;
      const idToken = await firebaseUser.getIdToken();

      const backendUser = await resolveBackendUserOrFallback(firebaseUser, idToken);
      storeAuthUser(backendUser);
      notifyAuthStateChange(backendUser);
      return backendUser;
    } catch (error) {
      const popupFallbackCodes = new Set([
        'auth/popup-blocked',
        'auth/popup-closed-by-user',
        'auth/cancelled-popup-request',
      ]);

      if (popupFallbackCodes.has(error?.code)) {
        try {
          await signInWithRedirect(auth, googleProvider);
          return null;
        } catch (redirectError) {
          console.error('Google redirect sign in error:', redirectError);
          throw new Error('Google sign-in could not start. Please try again.');
        }
      }

      console.error('Google sign in error:', error);
      let message = 'Failed to sign in with Google. Please try again.';
      if (error.code === 'auth/account-exists-with-different-credential') message = 'An account already exists with the same email but different sign-in method.';
      else if (error.code === 'auth/operation-not-allowed') message = 'Google sign-in is not enabled.';
      else if (error.code === 'auth/unauthorized-domain') message = 'This localhost domain is not authorized in Firebase. Add localhost in Firebase Authentication > Settings > Authorized domains.';
      throw new Error(message);
    }
  }

  // Mock Google sign-in
  await new Promise((r) => setTimeout(r, 1200));
  const user = {
    _id: 'mock-google-' + Date.now(),
    firebaseUid: 'mock-google-' + Date.now(),
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

/**
 * Sign out current user
 */
export async function signOutUser() {
  if (AUTH_PROVIDER === 'firebase' && auth) {
    try {
      await firebaseSignOut(auth);
      removeAuthUser();
      notifyAuthStateChange(null);
      return;
    } catch (error) {
      console.error('Firebase sign out error:', error);
      throw new Error('Failed to sign out. Please try again.');
    }
  }

  // Mock sign out
  await new Promise((r) => setTimeout(r, 300));
  removeAuthUser();
  notifyAuthStateChange(null);
}
