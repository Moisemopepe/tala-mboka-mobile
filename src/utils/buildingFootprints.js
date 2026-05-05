const OVERPASS_ENDPOINTS = [
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass-api.de/api/interpreter"
];

function closeRing(coordinates) {
  if (coordinates.length < 3) return coordinates;
  const first = coordinates[0];
  const last = coordinates[coordinates.length - 1];
  if (first[0] === last[0] && first[1] === last[1]) return coordinates;
  return [...coordinates, first];
}

function polygonFromCenter(lat, lng, metersLat, metersLng, rotation = 0) {
  const latDelta = metersLat / 111320;
  const lngDelta = metersLng / (111320 * Math.cos((lat * Math.PI) / 180));
  const points = [
    [-lngDelta, -latDelta],
    [lngDelta, -latDelta],
    [lngDelta, latDelta],
    [-lngDelta, latDelta]
  ];
  const sin = Math.sin(rotation);
  const cos = Math.cos(rotation);
  const ring = points.map(([x, y]) => {
    const rx = x * cos - y * sin;
    const ry = x * sin + y * cos;
    return [lng + rx, lat + ry];
  });
  return closeRing(ring);
}

function toNativeCoordinates(ring) {
  return ring.map(([longitude, latitude]) => ({ latitude, longitude }));
}

export function createFootprintsAround(location, areaLabel = "Selected area") {
  const lat = Number(location.lat ?? location.latitude);
  const lng = Number(location.lng ?? location.longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return [];

  const offsets = [
    { north: 38, east: -42, size: [16, 27], rotation: 0.14 },
    { north: -24, east: 36, size: [18, 34], rotation: -0.2 },
    { north: 58, east: 46, size: [13, 25], rotation: 0.42 },
    { north: -52, east: -28, size: [22, 28], rotation: -0.08 },
    { north: 6, east: 72, size: [14, 24], rotation: 0.22 }
  ];

  return offsets.map((item, index) => {
    const centerLat = lat + item.north / 111320;
    const centerLng = lng + item.east / (111320 * Math.cos((lat * Math.PI) / 180));
    const ring = polygonFromCenter(centerLat, centerLng, item.size[0], item.size[1], item.rotation);
    return {
      id: `prototype-footprint-${lat.toFixed(5)}-${lng.toFixed(5)}-${index + 1}`,
      name: `${areaLabel} building ${index + 1}`,
      source: "local-offline-grid",
      positions: toNativeCoordinates(ring),
      geometry: { type: "Polygon", coordinates: [ring] }
    };
  });
}

function parseOverpassElements(elements = []) {
  return elements
    .filter((element) => Array.isArray(element.geometry) && element.geometry.length >= 3)
    .slice(0, 40)
    .map((element, index) => {
      const ring = closeRing(element.geometry.map((point) => [point.lon, point.lat]));
      return {
        id: `osm-${element.type}-${element.id}`,
        name: element.tags?.name || element.tags?.["addr:housenumber"] || `OSM building ${index + 1}`,
        source: "openstreetmap-overpass",
        positions: toNativeCoordinates(ring),
        geometry: { type: "Polygon", coordinates: [ring] }
      };
    });
}

export async function fetchOsmBuildings(location, radiusMeters = 220) {
  const lat = Number(location.lat ?? location.latitude);
  const lng = Number(location.lng ?? location.longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return [];

  const query = `[out:json][timeout:18];(way["building"](around:${radiusMeters},${lat},${lng});relation["building"](around:${radiusMeters},${lat},${lng}););out body geom;`;
  let lastError;

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const response = await fetch(`${endpoint}?data=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error(`Overpass ${response.status}`);
      const data = await response.json();
      const parsed = parseOverpassElements(data.elements);
      if (parsed.length) return parsed;
    } catch (error) {
      lastError = error;
    }
  }

  if (lastError) throw lastError;
  return [];
}
