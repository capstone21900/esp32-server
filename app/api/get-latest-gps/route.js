export const runtime = "nodejs";

import { getLatestGPS } from "@/lib/gpsStore";

export async function GET() {
  return Response.json({ ok: true, gps: getLatestGPS() });
}
