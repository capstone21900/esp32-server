let latestGPS = { lat: 0, lon: 0 };

export async function GET() {
  return new Response(JSON.stringify(latestGPS), { status: 200 });
}
