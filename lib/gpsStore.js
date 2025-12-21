let latest = null;

export function setLatestGps(data) {
  latest = { ...data, serverMs: Date.now() };
}

export function getLatestGps() {
  return latest;
}
