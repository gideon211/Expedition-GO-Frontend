/**
 * @file api/client.js
 * @description HTTP client for all backend requests. Used by React Query hooks and
 *   domain modules (api/supplier.js, api/payout.js).
 *
 * Key exports:
 *   - apiRequest(path, options) — fetch wrapper with auth headers and JSON parsing
 *   - ApiError — normalized error shape (status, data, url) for UI handling
 *
 * Auth: When `auth: true` (default), attaches Bearer token from lib/auth.js.
 * Base URL: Resolved via getApiBaseUrl() — see VITE_API_URL / VITE_AUTH_API_BASE_URL.
 *
 * @see lib/auth.js for token lifecycle
 */
import { getApiBaseUrl, getStoredAuthUser, getAuthToken, refreshAuthToken } from '@/lib/auth';

/**
 * Normalized API error for React Query/UI handling.
 */
export class ApiError extends Error {
  constructor({ message, status = 0, data = null, url = null }) {
    super(message || 'Request failed');
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    this.url = url;
  }
}

function joinUrl(base, path) {
  if (!path) return base;
  if (/^https?:\/\//i.test(path)) return path;

  const cleanedBase = base.replace(/\/+$/, '');
  const cleanedPath = path.startsWith('/') ? path : `/${path}`;
  return `${cleanedBase}${cleanedPath}`;
}

function buildQuery(params) {
  if (!params) return '';

  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;

    if (Array.isArray(value)) {
      for (const entry of value) {
        if (entry === undefined || entry === null || entry === '') continue;
        search.append(key, String(entry));
      }
      continue;
    }

    search.append(key, String(value));
  }

  const query = search.toString();
  return query ? `?${query}` : '';
}

async function parseResponse(response) {
  if (response.status === 204) return null;

  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }

  try {
    return await response.text();
  } catch {
    return null;
  }
}

function getErrorMessage(data, response) {
  return (
    (data && typeof data === 'object' && (data.message || data.error)) ||
    response.statusText ||
    `Request failed with status ${response.status}`
  );
}

/**
 * Lightweight fetch wrapper used by React Query hooks.
 */
export async function apiRequest(path, options = {}) {
  const { method = 'GET', params, body, signal, auth = true, headers = {} } = options;

  const url = `${joinUrl(getApiBaseUrl(), path)}${buildQuery(params)}`;

  const finalHeaders = {
    Accept: 'application/json',
    ...headers,
  };

  let payload;

  if (body !== undefined && body !== null) {
    if (body instanceof FormData) {
      payload = body;
    } else {
      finalHeaders['Content-Type'] = finalHeaders['Content-Type'] || 'application/json';
      payload = typeof body === 'string' ? body : JSON.stringify(body);
    }
  }

  if (auth) {
    const token = await getAuthToken();
    if (token) {
      finalHeaders.Authorization = `Bearer ${token}`;
    } else if (getStoredAuthUser()) {
      throw new ApiError({
        message: 'You are not logged in! Please log in to get access.',
        status: 401,
        url,
      });
    }
  }

  let response;
  try {
    response = await fetch(url, {
      method,
      headers: finalHeaders,
      body: payload,
      signal,
    });
  } catch (error) {
    if (error?.name === 'AbortError') throw error;

    throw new ApiError({
      message: error?.message || 'Network request failed',
      url,
    });
  }

  // 401 token refresh interceptor
  if (response.status === 401 && auth) {
    try {
      const newToken = await refreshAuthToken();
      if (newToken) {
        finalHeaders.Authorization = `Bearer ${newToken}`;
        response = await fetch(url, {
          method,
          headers: finalHeaders,
          body: payload,
          signal,
        });
        if (response.status === 401) {
          window.location.href = '/signin';
          throw new ApiError({
            message: 'Session expired. Please sign in again.',
            status: 401,
            url,
          });
        }
      } else {
        window.location.href = '/signin';
        throw new ApiError({
          message: 'Session expired. Please sign in again.',
          status: 401,
          url,
        });
      }
    } catch {
      window.location.href = '/signin';
      throw new ApiError({
        message: 'Session expired. Please sign in again.',
        status: 401,
        url,
      });
    }
  }

  const data = await parseResponse(response);

  if (!response.ok) {
    throw new ApiError({
      message: getErrorMessage(data, response),
      status: response.status,
      data,
      url,
    });
  }

  return data;
}

/**
 * Returns the inner `data` payload when the backend wraps responses.
 */
export function unwrap(payload, key) {
  if (!payload || typeof payload !== 'object') return payload;
  if (key && payload?.data && payload.data[key] !== undefined) return payload.data[key];
  if (payload?.data !== undefined) return payload.data;
  return payload;
}
