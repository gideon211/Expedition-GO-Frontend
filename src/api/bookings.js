/**
 * @file api/bookings.js
 * @description Booking and cart API functions. These call the backend endpoints
 *   that apply special offers, validate promo codes, and create bookings.
 *
 * Endpoints:
 *   POST /bookings/cart              — add to backend cart (applies special offers)
 *   GET  /bookings/cart              — get backend cart
 *   DELETE /bookings/cart/:id        — remove from backend cart
 *   POST /bookings                   — create booking
 *   POST /tours/offers/validate-promo — validate promo code
 */
import { apiRequest, unwrap } from './client';

export async function addToCartBackend(payload) {
  const data = await apiRequest('/bookings/cart', {
    method: 'POST',
    body: payload,
    auth: true,
  });
  return unwrap(data);
}

export async function getCartBackend() {
  const data = await apiRequest('/bookings/cart', { auth: true });
  return unwrap(data);
}

export async function removeFromCartBackend(cartItemId) {
  const data = await apiRequest(`/bookings/cart/${cartItemId}`, {
    method: 'DELETE',
    auth: true,
  });
  return data;
}

export async function createBooking(payload) {
  const data = await apiRequest('/bookings', {
    method: 'POST',
    body: payload,
    auth: true,
  });
  return unwrap(data);
}

export async function getMyBookings(params = {}) {
  const query = new URLSearchParams(params).toString();
  const data = await apiRequest(`/bookings/my-bookings${query ? `?${query}` : ''}`, {
    auth: true,
  });
  return unwrap(data);
}

export async function validatePromoCode(payload) {
  const data = await apiRequest('/tours/offers/validate-promo', {
    method: 'POST',
    body: payload,
    auth: false,
  });
  return unwrap(data);
}
