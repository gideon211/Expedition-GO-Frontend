import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { LoaderCircle, MapPin } from "lucide-react";
import { extractStopCoordinates, getTourMapCenter, resolveItineraryMapPoints } from "@/lib/itineraryMap";
import { getMapboxAccessToken, mapboxgl } from "@/lib/mapbox";

const ROUTE_SOURCE_ID = "itinerary-route";
const ROUTE_LAYER_ID = "itinerary-route-line";
const MAP_READY_TIMEOUT_MS = 4000;

function createMarkerElement(label, isActive = false) {
  const el = document.createElement("div");
  el.className = `itinerary-map-marker${isActive ? " itinerary-map-marker--active" : ""}`;
  el.textContent = label;
  return el;
}

function buildCenterKey(tour) {
  const center = getTourMapCenter(tour);
  return `${center.lat.toFixed(5)},${center.lng.toFixed(5)}`;
}

export function ItineraryMap({ stops, tour, focusStopIndex = null }) {
  const accessToken = getMapboxAccessToken();
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const focusStopIndexRef = useRef(focusStopIndex);
  focusStopIndexRef.current = focusStopIndex;
  const tourRef = useRef(tour);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState(null);
  const [pointsLoading, setPointsLoading] = useState(false);
  const [mapPoints, setMapPoints] = useState([]);
  const [resolveError, setResolveError] = useState(null);

  tourRef.current = tour;

  const centerKey = useMemo(() => buildCenterKey(tour), [
    tour?.id,
    tour?.latitude,
    tour?.longitude,
    tour?.city,
    tour?.bookingAndTickets?.meetingPoint?.latitude,
    tour?.bookingAndTickets?.meetingPoint?.longitude,
  ]);

  const stopsKey = useMemo(
    () => (stops?.length ? stops.map((s) => `${s.title}|${s.description}|${s.latitude}|${s.longitude}`).join("::") : ""),
    [stops],
  );

  useEffect(() => {
    if (!stops?.length) {
      setMapPoints([]);
      setPointsLoading(false);
      return undefined;
    }

    const controller = new AbortController();
    setPointsLoading(true);
    setResolveError(null);

    resolveItineraryMapPoints(stops, tourRef.current, controller.signal)
      .then((points) => {
        if (!controller.signal.aborted) setMapPoints(points);
      })
      .catch((err) => {
        if (err.name !== "AbortError" && !controller.signal.aborted) {
          setResolveError(err.message || "Could not resolve stop locations");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setPointsLoading(false);
      });

    return () => controller.abort();
  }, [stopsKey, stops?.length]);

  useLayoutEffect(() => {
    if (!accessToken || !mapContainerRef.current) return undefined;

    let cancelled = false;
    setMapError(null);
    setMapReady(false);
    mapboxgl.accessToken = accessToken;

    const center = getTourMapCenter(tourRef.current);
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [center.lng, center.lat],
      zoom: 11,
      attributionControl: true,
      antialias: true,
    });

    map.addControl(new mapboxgl.NavigationControl(), "top-right");
    mapRef.current = map;

    const markReady = () => {
      if (cancelled) return;
      requestAnimationFrame(() => {
        if (cancelled || !mapRef.current) return;
        map.resize();
        setMapReady(true);
      });
    };

    const handleError = (event) => {
      if (cancelled) return;
      const message = event?.error?.message || "Map failed to load";
      setMapError(message);
    };

    map.on("load", markReady);
    map.on("idle", markReady);
    map.on("error", handleError);

    if (map.loaded()) markReady();

    const readyTimeout = window.setTimeout(markReady, MAP_READY_TIMEOUT_MS);

    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => {
            if (!cancelled && mapRef.current) map.resize();
          })
        : null;
    resizeObserver?.observe(mapContainerRef.current);

    return () => {
      cancelled = true;
      window.clearTimeout(readyTimeout);
      resizeObserver?.disconnect();
      map.off("load", markReady);
      map.off("idle", markReady);
      map.off("error", handleError);
      markersRef.current.forEach((entry) => entry.marker.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
      setMapReady(false);
    };
  }, [accessToken, centerKey]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    const applyMarkers = () => {
      markersRef.current.forEach((entry) => entry.marker.remove());
      markersRef.current = [];

      if (map.getLayer(ROUTE_LAYER_ID)) map.removeLayer(ROUTE_LAYER_ID);
      if (map.getSource(ROUTE_SOURCE_ID)) map.removeSource(ROUTE_SOURCE_ID);

      if (!mapPoints.length) {
        const center = getTourMapCenter(tourRef.current);
        map.jumpTo({ center: [center.lng, center.lat], zoom: 11 });
        return;
      }

      const bounds = new mapboxgl.LngLatBounds();
      const activeIndex = focusStopIndexRef.current;

      mapPoints.forEach((point) => {
        bounds.extend([point.lng, point.lat]);
        const element = createMarkerElement(point.label, point.index === activeIndex);
        const marker = new mapboxgl.Marker({
          element,
          anchor: "center",
        })
          .setLngLat([point.lng, point.lat])
          .setPopup(
            new mapboxgl.Popup({ offset: 16, closeButton: false }).setText(point.title),
          )
          .addTo(map);
        markersRef.current.push({ index: point.index, marker, element });
      });

      if (mapPoints.length > 1) {
        const coordinates = mapPoints.map((point) => [point.lng, point.lat]);
        map.addSource(ROUTE_SOURCE_ID, {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: {
              type: "LineString",
              coordinates,
            },
          },
        });
        map.addLayer({
          id: ROUTE_LAYER_ID,
          type: "line",
          source: ROUTE_SOURCE_ID,
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": "#1a4530",
            "line-width": 3,
            "line-opacity": 0.75,
          },
        });
      }

      if (mapPoints.length === 1) {
        map.flyTo({ center: [mapPoints[0].lng, mapPoints[0].lat], zoom: 13, duration: 800 });
      } else {
        map.fitBounds(bounds, { padding: 48, maxZoom: 14, duration: 800 });
      }
    };

    if (map.isStyleLoaded()) {
      applyMarkers();
    } else {
      map.once("load", applyMarkers);
    }
  }, [mapPoints, mapReady]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady || focusStopIndex == null) return;

    const point = mapPoints.find((entry) => entry.index === focusStopIndex);
    const coords = point
      ? { lat: point.lat, lng: point.lng }
      : extractStopCoordinates(stops?.[focusStopIndex]);
    if (!coords) return;

    markersRef.current.forEach(({ index, element, marker }) => {
      element.classList.toggle("itinerary-map-marker--active", index === focusStopIndex);
      if (index !== focusStopIndex && marker.getPopup()?.isOpen()) marker.togglePopup();
    });

    map.flyTo({
      center: [coords.lng, coords.lat],
      zoom: 14,
      duration: 700,
      essential: true,
    });

    const activeEntry = markersRef.current.find((entry) => entry.index === focusStopIndex);
    if (activeEntry && !activeEntry.marker.getPopup()?.isOpen()) {
      activeEntry.marker.togglePopup();
    }
  }, [focusStopIndex, mapPoints, mapReady, stops]);

  if (!accessToken) {
    return (
      <div className="flex min-h-[280px] flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 text-center lg:min-h-[360px]">
        <MapPin className="size-5 text-slate-400" />
        <p className="text-sm text-slate-500">
          Map unavailable — set <code className="text-xs">VITE_MAPBOX_ACCESS_TOKEN</code> in{" "}
          <code className="text-xs">.env</code> and restart the dev server.
        </p>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_4px_rgba(15,23,42,0.06)]">
      <div ref={mapContainerRef} className="itinerary-map-container h-[280px] w-full lg:h-[360px]" />
      {!mapReady && !mapError && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center gap-2 bg-white/80 text-sm text-slate-500">
          <LoaderCircle className="size-4 animate-spin text-[color:var(--brand-green)]" />
          Loading map...
        </div>
      )}
      {mapError && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/90 px-4 text-center text-sm text-red-600">
          {mapError}
        </div>
      )}
      <div className="border-t border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
        {pointsLoading && "Placing stops on map..."}
        {!pointsLoading && mapPoints.length > 0 && (
          <>
            {mapPoints.length} stop{mapPoints.length === 1 ? "" : "s"} on route
          </>
        )}
        {!pointsLoading && mapPoints.length === 0 && !mapError && (
          <>{resolveError || "Showing tour area — add stop coordinates for a full route."}</>
        )}
      </div>
    </div>
  );
}
