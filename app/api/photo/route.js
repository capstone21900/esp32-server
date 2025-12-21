export const runtime = "nodejs";

import OpenAI from "openai";

export async function POST(req) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return new Response("Missing OPENAI_API_KEY", { status: 500 });
    }

    const ct = (req.headers.get("content-type") || "").toLowerCase();

    const distanceCm = Number(req.headers.get("x-distance-cm") || 0);
    const buttonPressed = Number(req.headers.get("x-button-pressed") || 0);
    const photoTaken = Number(req.headers.get("x-photo-taken") || 1); // ✅ 한 번만!

    if (buttonPressed !== 1 || photoTaken !== 1) {
      return Response.json({ ok: false, reason: "not_ready" }, { status: 202 });
    }

    if (!ct.includes("image/jpeg") && !ct.includes("application/octet-stream")) {
      return new Response("Unsupported Content-Type", { status: 415 });
    }

    const jpegArrayBuffer = await req.arrayBuffer();
    const imageBase64 = Buffer.from(jpegArrayBuffer).toString("base64");

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

    // PCM (I2S로 바로 출력용)
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
