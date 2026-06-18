const AUTH_STORAGE_KEY = 'expedition_go_auth';
const AUTH_PROVIDER = import.meta.env.VITE_AUTH_PROVIDER || 'mock';
const isBackend = AUTH_PROVIDER === 'backend';

const rawBase = import.meta.env.VITE_AUTH_API_BASE_URL || import.meta.env.VITE_API_URL || '/api';

let API_BASE = rawBase.replace(/\/+$/, '');

if (/^https?:\/\/[^/]+$/.test(API_BASE)) {
  API_BASE = `${API_BASE}/api`;
}

function getStoredAuth() {
  try {
    const d = localStorage.getItem(AUTH_STORAGE_KEY);
    return d ? JSON.parse(d) : { accessToken: null, refreshToken: null, user: null };
  } catch {
    return { accessToken: null, refreshToken: null, user: null };
  }
}

function storeAuth(data) {
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to store auth:', e);
  }
}

function clearAuth() {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch {
    // Ignore storage failures.
  }
}

export function getAuthUserId(user) {
  return user?.id || user?._id || user?.uid || user?.firebaseUid || null;
}

let authStateListeners = [];

function notifyAuthStateChange(user) {
  authStateListeners.forEach((l) => l(user));
}

export function getAuthProvider() {
  return AUTH_PROVIDER;
}

export function getApiBaseUrl() {
  return API_BASE;
}

export function getStoredAuthUser() {
  const { user } = getStoredAuth();
  return user;
}

export async function getAuthToken() {
  const { accessToken } = getStoredAuth();
  return accessToken || null;
}

export async function waitForAuthToken(_maxMs = 5000) {
  const { accessToken } = getStoredAuth();
  return accessToken || null;
}

export async function subscribeToAuthState(callback) {
  authStateListeners.push(callback);

  const { user } = getStoredAuth();
  callback(user);

  return () => {
    authStateListeners = authStateListeners.filter((l) => l !== callback);
  };
}

async function authFetch(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const payload = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(payload.message || `Request failed with status ${res.status}`);
  }

  return payload;
}

export async function signInWithEmail(email, password) {
  if (isBackend) {
    const payload = await authFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    const user = payload.data?.user || payload.user || payload;
    const accessToken = payload.data?.accessToken || payload.accessToken;
    const refreshToken = payload.data?.refreshToken || payload.refreshToken;

    storeAuth({ accessToken, refreshToken, user });
    notifyAuthStateChange(user);
    return user;
  }

  await new Promise((r) => setTimeout(r, 800));
  const user = {
    _id: 'mock-' + Date.now(),
    id: 'mock-' + Date.now(),
    email,
    emailVerified: true,
    name: email.split('@')[0],
  };
  storeAuth({ accessToken: null, refreshToken: null, user });
  notifyAuthStateChange(user);
  return user;
}

export async function registerWithEmail(name, email, password) {
  if (isBackend) {
    const payload = await authFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });

    const user = payload.data?.user || payload.user || payload;
    const accessToken = payload.data?.accessToken || payload.accessToken;
    const refreshToken = payload.data?.refreshToken || payload.refreshToken;

    storeAuth({ accessToken, refreshToken, user });
    notifyAuthStateChange(user);
    return user;
  }

  await new Promise((r) => setTimeout(r, 1000));
  const user = {
    _id: 'mock-' + Date.now(),
    id: 'mock-' + Date.now(),
    email,
    emailVerified: false,
    name,
  };
  storeAuth({ accessToken: null, refreshToken: null, user });
  notifyAuthStateChange(user);
  return user;
}

export async function signInWithGoogle() {
  if (isBackend) {
    const origin = window.location.origin;
    window.location.href = `${API_BASE}/auth/google?state=${encodeURIComponent(origin)}`;
    return { redirected: true };
  }

  await new Promise((r) => setTimeout(r, 1200));
  const user = {
    _id: 'mock-google-' + Date.now(),
    id: 'mock-google-' + Date.now(),
    email: 'user@gmail.com',
    emailVerified: true,
    name: 'Google User',
    photoURL: 'https://via.placeholder.com/150',
  };
  storeAuth({ accessToken: null, refreshToken: null, user });
  notifyAuthStateChange(user);
  return user;
}

export async function signOutUser() {
  if (isBackend) {
    try {
      const token = await getAuthToken();
      if (token) {
        const { refreshToken } = getStoredAuth();
        await fetch(`${API_BASE}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ refreshToken }),
        });
      }
    } catch {
      /* ignore network errors on logout */
    }
  }

  clearAuth();
  notifyAuthStateChange(null);
}

let refreshPromise = null;

export async function refreshAuthToken() {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const { refreshToken } = getStoredAuth();
    if (!refreshToken) {
      clearAuth();
      notifyAuthStateChange(null);
      throw new Error('No refresh token available');
    }

    try {
      const payload = await authFetch('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      });

      const newAccessToken = payload.data?.accessToken || payload.accessToken;
      const newRefreshToken = payload.data?.refreshToken || payload.refreshToken;
      const auth = getStoredAuth();

      storeAuth({ accessToken: newAccessToken, refreshToken: newRefreshToken, user: auth.user });

      return newAccessToken;
    } catch (error) {
      clearAuth();
      notifyAuthStateChange(null);
      throw error;
    }
  })();

  refreshPromise.finally(() => { refreshPromise = null; });
  return refreshPromise;
}

export async function fetchCurrentUser(token) {
  const res = await fetch(`${API_BASE}/users/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch user profile');
  }

  const payload = await res.json();
  return payload.data?.user || payload.user || payload;
}

export async function refreshStoredUserFromBackend() {
  try {
    const token = await getAuthToken();
    if (!token) return null;

    const payload = await authFetch('/users/me', {
      headers: { Authorization: `Bearer ${token}` },
    });

    const user = payload?.data?.user ?? payload?.data ?? null;
    if (user) {
      const auth = getStoredAuth();
      storeAuth({ ...auth, user });
      notifyAuthStateChange(user);
      return user;
    }
  } catch {
    return null;
  }

  return null;
}
