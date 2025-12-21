export const runtime = "nodejs";

import { setLatestGps } from "@/lib/gpsStore";

export async function POST(req) {
  try {
    const body = await req.json(); // {lat, lon, sat, fix, mac, ms}
    setLatestGps(body);
    return Response.json({ ok: true });
  } catch (e) {
    return new Response(`GPS Error: ${e?.message || "Unknown"}`, { status: 500 });
  }
}
