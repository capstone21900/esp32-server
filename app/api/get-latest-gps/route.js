import { getLatestGPS } from "../../../lib/gpsStore";

export async function GET() {
  try {
    const latestGPS = getLatestGPS();

    // lat, lon 값이 유효하지 않으면 오류 처리
    if (
      typeof latestGPS.lat !== 'number' ||
      typeof latestGPS.lon !== 'number' ||
      isNaN(latestGPS.lat) ||
      isNaN(latestGPS.lon)
    ) {
      return new Response(
        JSON.stringify({ ok: false, error: "유효한 lat, lon 값이 필요합니다." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

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
