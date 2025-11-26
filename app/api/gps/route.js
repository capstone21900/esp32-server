// app/api/gps/route.js
import { setLatestGPS } from "../../../lib/gpsStore";

export async function POST(req) {
  try {
    const body = await req.json();
    let { lat, lon } = body;

    // 문자열로 들어와도 숫자로 변환
    lat = typeof lat === "string" ? parseFloat(lat) : lat;
    lon = typeof lon === "string" ? parseFloat(lon) : lon;

    if (
      typeof lat !== "number" ||
      typeof lon !== "number" ||
      Number.isNaN(lat) ||
      Number.isNaN(lon)
    ) {
      return new Response(
        JSON.stringify({ ok: false, error: "유효한 lat, lon 값이 필요합니다." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // ✅ 공용 저장소에 최신 좌표 저장
    setLatestGPS(lat, lon);

    console.log("📡 GPS Received:", { lat, lon });

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("GPS API Error:", err);
    return new Response(
      JSON.stringify({ ok: false, error: "Server Error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
