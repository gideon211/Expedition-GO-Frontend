import { apiRequest, unwrap } from './client';

export async function fetchTours(params = {}) {
  const data = await apiRequest('/tours', { params, auth: false });
  return unwrap(data);
}

export async function fetchPopularByCategory(params = {}) {
  const data = await apiRequest('/tours/popular/by-category', {
    params,
    auth: false,
  });
  return unwrap(data);
}

export async function fetchFilterOptions() {
  const data = await apiRequest('/tours/filters/options', { auth: false });
  return unwrap(data);
}

export async function fetchTourById(id) {
  const data = await apiRequest(`/tours/${id}`, { auth: false });
  return unwrap(data);
}

export async function fetchTourAvailability(tourId, startDate, endDate) {
  const data = await apiRequest(`/tours/availability/public/${tourId}`, {
    params: { startDate, endDate },
    auth: false,
  });
  return unwrap(data);
}

export async function fetchTourOffers(params = {}) {
  const data = await apiRequest('/tours/offers', {
    params,
    auth: false,
  });
  return unwrap(data);
}
