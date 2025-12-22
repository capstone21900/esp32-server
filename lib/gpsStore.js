// lib/gpsStore.js
// 서버 메모리에 "가장 최근 GPS"를 저장/조회하는 간단 스토어 (Vercel 서버리스에서도 테스트용으로 사용)

let latestGPS = {
  lat: null,
  lon: null,
  updatedAt: null,
};

export function setLatestGPS({ lat, lon }) {
  latestGPS = {
    lat: typeof lat === "number" ? lat : Number(lat),
    lon: typeof lon === "number" ? lon : Number(lon),
    updatedAt: new Date().toISOString(),
  };
  return latestGPS;
}

export function getLatestGPS() {
  return latestGPS;
}