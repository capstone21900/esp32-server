// app/api/gps/route.js

export async function POST(req) {
  try {
    const body = await req.json();
    const { lat, lon } = body;

    console.log("📡 GPS Received:", lat, lon);

    return new Response(
      JSON.stringify({ message: "GPS OK", lat, lon }),
      { status: 200 }
    );
  } catch (err) {
    console.error("GPS API Error:", err);
    return new Response("Server Error", { status: 500 });
  }
}
