let latestGPS = { lat: 0, lon: 0 };

export async function POST(req) {
  try {
    const body = await req.json();
    const { lat, lon } = body;

    latestGPS = { lat, lon };

    console.log("📡 GPS Received:", lat, lon);

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
    });
  } catch (err) {
    return new Response("Server Error", { status: 500 });
  }
}
