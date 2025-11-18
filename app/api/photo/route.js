import OpenAI from "openai";

export async function POST(req) {
  try {
    const { distance, imageBase64 } = await req.json();

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // 1) GPT 이미지 분석
    const userContent = [
      {
        type: "text",
        text: `Analyze this image. Nearest obstacle is ${distance} cm away.`,
      },
    ];

    // base64 이미지가 있을 때만 이미지 추가
    if (imageBase64 && imageBase64.trim() !== "") {
      userContent.push({
        type: "image_url",
        image_url: {
          url: `data:image/jpeg;base64,${imageBase64}`,
        },
      });
    }

    const analysis = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an obstacle detection assistant.",
        },
        {
          role: "user",
          content: userContent,
        },
      ],
    });

    const resultText = analysis.choices[0].message.content;

    // 2) TTS 생성
    const tts = await openai.audio.speech.create({
      model: "gpt-4o-mini-tts",
      voice: "alloy",
      input: resultText,
      response_format: "mp3",
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

    // 🔴 디버그용: 에러 메시지를 그대로 응답으로 보내기
    const msg = `Error: ${err?.message || "Unknown error"}`;
    return new Response(msg, {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });
  }
}
