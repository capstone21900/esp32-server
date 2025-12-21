export const runtime = "nodejs";

import { getLatestGps } from "@/lib/gpsStore";

export async function GET() {
  return Response.json({ ok: true, gps: getLatestGps() });
}
