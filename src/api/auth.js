import { getApiBaseUrl, getStoredAuth } from '@/lib/auth';

export async function logoutFromBackend() {
  const { accessToken, refreshToken } = getStoredAuth();
  return fetch(`${getApiBaseUrl()}/auth/logout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: JSON.stringify({ refreshToken }),
  }).catch(() => null);
}
