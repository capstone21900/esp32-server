import OpenAI from "openai";

export async function POST(req) {
  try {
    const { distance, imageBase64 } = await req.json();

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // 1) GPT 이미지 분석
    // content 타입 이름만 제대로 바꿔줌: input_text ❌ → text ✅, input_image ❌ → image_url ✅
    const userContent = [
      {
        type: "text",
        text: `Analyze this image. Nearest obstacle is ${distance} cm away.`
      },
    ];

    // imageBase64가 비어있을 때는 이미지 안 보내도록 (curl로 테스트할 때 에러 방지용)
    if (imageBase64 && imageBase64.trim() !== "") {
      userContent.push({
        type: "image_url",
        image_url: {
          url: `data:image/jpeg;base64,${imageBase64}`
        }
      });
    }

    const analysis = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: [
            {
              type: "text",
              text: "You are an obstacle detection assistant."
            }
          ]
        },
        {
          role: "user",
          content: userContent
        }
      ]
    });

    // chat.completions는 일반적으로 string으로 content를 줌
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
