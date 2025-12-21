export const runtime = "nodejs";

import { setLatestGPS, getLatestGPS } from "../../../lib/gpsStore";

export async function POST(req) {
  try {
    const body = await req.json();
    const lat = Number(body.lat);
    const lon = Number(body.lon);

    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      return new Response("lat/lon must be numbers", { status: 400 });
    }

    setLatestGPS({
      lat,
      lon,
      speed: body.speed,
      ts: body.ts,
    });

    return Response.json({ ok: true });
  } catch (e) {
    return new Response(`GPS Error: ${e?.message || "unknown"}`, { status: 500 });
  }
}

export async function GET() {
  return Response.json({ ok: true, gps: getLatestGPS() });
}
