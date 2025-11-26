// app/api/get-latest-gps/route.js
import { getLatestGPS } from "../../../lib/gpsStore";

export async function GET() {
  try {
    const latestGPS = getLatestGPS();

    return new Response(JSON.stringify(latestGPS), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (err) {
    console.error("Get Latest GPS API Error:", err);
    return new Response(
      JSON.stringify({ ok: false, error: "Server Error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
