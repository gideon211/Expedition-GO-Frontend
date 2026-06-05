/**
 * @file itineraryMap.js
 * @description Helpers for itinerary Mapbox display (coords + geocoding fallback).
 */

const DEFAULT_CENTER = { lat: 5.6037, lng: -0.187 };

export function stopHasLocation(stop) {
  return extractStopCoordinates(stop) != null;
}

export function extractStopCoordinates(item) {
  if (!item || typeof item !== "object") return null;

  if (Array.isArray(item.coordinates) && item.coordinates.length >= 2) {
    const lng = Number(item.coordinates[0]);
    const lat = Number(item.coordinates[1]);
    if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
  }

  const lat = item.latitude ?? item.lat;
  const lng = item.longitude ?? item.lng ?? item.lon;
  if (lat != null && lng != null) {
    const nLat = Number(lat);
    const nLng = Number(lng);
    if (Number.isFinite(nLat) && Number.isFinite(nLng)) return { lat: nLat, lng: nLng };
  }

  if (item.location?.latitude != null && item.location?.longitude != null) {
    const nLat = Number(item.location.latitude);
    const nLng = Number(item.location.longitude);
    if (Number.isFinite(nLat) && Number.isFinite(nLng)) return { lat: nLat, lng: nLng };
  }

  return null;
}

export function getTourMapCenter(tour) {
  const lat = Number(tour?.latitude);
  const lng = Number(tour?.longitude);
  if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };

  const meeting = tour?.bookingAndTickets?.meetingPoint;
  const mLat = Number(meeting?.latitude ?? meeting?.lat);
  const mLng = Number(meeting?.longitude ?? meeting?.lng ?? meeting?.lon);
  if (Number.isFinite(mLat) && Number.isFinite(mLng)) return { lat: mLat, lng: mLng };

  return DEFAULT_CENTER;
}

export function buildStopMarkerLabel(index, total) {
  return index === total - 1 ? "End" : String(index + 1);
}

export function buildGeocodeQuery(stop, tour) {
  const city = tour?.city || tour?.productContent?.location?.city || "";
  const country = tour?.country || tour?.productContent?.location?.country || "";
  return [stop.title, stop.description, city, country]
    .filter((part) => part && String(part).trim())
    .join(", ");
}

export async function geocodeQuery(query, signal) {
  if (!query?.trim()) return null;
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;
  const res = await fetch(url, { signal, headers: { "Accept-Language": "en" } });
  if (!res.ok) return null;
  const data = await res.json();
  const hit = data?.[0];
  if (!hit) return null;
  const lat = Number(hit.lat);
  const lng = Number(hit.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng };
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Resolves map-ready points for each itinerary stop.
 * Uses embedded coordinates when present; otherwise geocodes via Nominatim.
 */
export async function resolveItineraryMapPoints(stops, tour, signal) {
  if (!stops?.length) return [];

  const center = getTourMapCenter(tour);
  const points = [];

  for (let index = 0; index < stops.length; index += 1) {
    if (signal?.aborted) return points;

    const stop = stops[index];
    let coords = extractStopCoordinates(stop);

    if (!coords) {
      const query = buildGeocodeQuery(stop, tour);
      if (query) {
        coords = await geocodeQuery(query, signal);
        if (index < stops.length - 1) await wait(400);
      }
    }

    if (!coords && index === 0) coords = center;

    if (!coords) continue;

    points.push({
      index,
      label: buildStopMarkerLabel(index, stops.length),
      title: stop.title || stop.description || `Stop ${index + 1}`,
      lat: coords.lat,
      lng: coords.lng,
    });
  }

  return points;
}
