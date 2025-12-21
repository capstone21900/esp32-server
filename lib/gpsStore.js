const KEY = "__latestGPS__";

export function setLatestGPS(gps) {
  globalThis[KEY] = {
    lat: Number(gps.lat),
    lon: Number(gps.lon),
    speed: gps.speed != null ? Number(gps.speed) : null,
    ts: gps.ts != null ? Number(gps.ts) : Date.now(),
  };
}

export function getLatestGPS() {
  return globalThis[KEY] ?? null;
}
