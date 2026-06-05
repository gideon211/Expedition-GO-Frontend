import mapboxgl from "mapbox-gl";
import MapboxWorker from "mapbox-gl/dist/mapbox-gl-csp-worker.js?worker";

if (typeof window !== "undefined") {
  mapboxgl.workerClass = MapboxWorker;
}

export function getMapboxAccessToken() {
  const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
  if (typeof token !== "string") return "";
  return token.trim();
}

export { mapboxgl };
