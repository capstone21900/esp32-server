import OpenAI from "openai";

export async function POST(req) {
  try {
    const { distance, imageBase64 } = await req.json();

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // 1) GPT 이미지 분석
    const analysis = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are an obstacle detection assistant." },
        { role: "user", content: `Analyze this image. Nearest obstacle is ${distance} cm away.` },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: `data:image/jpeg;base64,${imageBase64}`,
            },
          ],
        },
      ],
    });

    const resultText = analysis.choices[0].message.content;

    // 2) TTS 생성
    const tts = await openai.audio.speech.create({
      model: "gpt-4o-mini-tts",
      voice: "alloy",
      input: resultText,
      format: "mp3",
    });

    const audioBuffer = Buffer.from(await tts.arrayBuffer());

    // 3) ESP32로 mp3 반환
    return new Response(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.length,
      },
    });

  } catch (err) {
    console.error("Photo API Error:", err);
    return new Response("Server Error", { status: 500 });
  }
}
