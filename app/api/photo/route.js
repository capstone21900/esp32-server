export const runtime = "nodejs";

import OpenAI from "openai";

export async function GET() {
  return new Response(
    "Use POST. Send JSON {distanceCm, imageBase64} or raw JPEG with headers.",
    { status: 200 }
  );
}

export async function POST(req) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return new Response("Missing OPENAI_API_KEY", { status: 500 });
    }

    const ct = (req.headers.get("content-type") || "").toLowerCase();

    let distanceCm = 0;
    let imageBase64 = "";
    let buttonPressed = 1;
    let photoTaken = 1;

    // ✅ 1) JSON(base64) 방식 (너 마스터 코드와 100% 호환)
    if (ct.includes("application/json")) {
      const body = await req.json();
      distanceCm = Number(body.distanceCm ?? body.distance ?? 0);
      imageBase64 = String(body.imageBase64 ?? "").trim();
      buttonPressed = Number(body.buttonPressed ?? 1);
      photoTaken = Number(body.photoTaken ?? 1);
    }
    // ✅ 2) Raw JPEG 방식 (나중에 필요하면 사용)
    else if (ct.includes("image/jpeg") || ct.includes("application/octet-stream")) {
      distanceCm = Number(req.headers.get("x-distance-cm") || 0);
      buttonPressed = Number(req.headers.get("x-button-pressed") || 1);
      photoTaken = Number(req.headers.get("x-photo-taken") || 1);

      const jpegArrayBuffer = await req.arrayBuffer();
      imageBase64 = Buffer.from(jpegArrayBuffer).toString("base64");
    }
    // ❌ 지원 안 함
    else {
      return new Response("Unsupported Content-Type", { status: 415 });
    }

    console.log("[PHOTO] ct=", ct, "dist=", distanceCm, "b=", buttonPressed, "p=", photoTaken, "b64len=", imageBase64.length);

    if (buttonPressed !== 1 || photoTaken !== 1) {
      return Response.json({ ok: false, reason: "not_ready" }, { status: 202 });
    }

    if (!imageBase64) {
      return new Response("Missing imageBase64", { status: 400 });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const analysis = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are an obstacle detection assistant." },
        {
          role: "user",
          content: [
            {
              type: "text",
              text:
                `Ultrasonic distance: ${distanceCm} cm.\n` +
                `Answer in Korean in 1–2 short sentences with a safe instruction.`,
            },
            {
              type: "image_url",
              image_url: { url: `data:image/jpeg;base64,${imageBase64}` },
            },
          ],
        },
      ],
    });

    const resultText =
      analysis.choices?.[0]?.message?.content?.trim() || "앞에 장애물이 있습니다.";

    const tts = await openai.audio.speech.create({
      model: "gpt-4o-mini-tts",
      voice: "alloy",
      input: resultText,
      response_format: "pcm",
    });

    const pcm = Buffer.from(await tts.arrayBuffer());

    return new Response(pcm, {
      status: 200,
      headers: {
        "Content-Type": "application/octet-stream",
        "X-Audio-Format": "pcm_s16le",
        "X-Audio-Sample-Rate": "24000",
        "Content-Length": String(pcm.length),
      },
    });
  } catch (err) {
    console.error("Photo API Error:", err);
    return new Response(`Error: ${err?.message || "Unknown error"}`, {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });
  }
}
