
const defaultGPS = {
  lat: 0,
  lon: 0,
  updatedAt: null,
};


if (!globalThis._latestGPS) {
  globalThis._latestGPS = { ...defaultGPS };
}

export function setLatestGPS(lat, lon) {
  globalThis._latestGPS = {
    lat,
    lon,
    updatedAt: Date.now(),
  };
}

export function getLatestGPS() {
  return globalThis._latestGPS;
}
