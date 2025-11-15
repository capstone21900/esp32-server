// app/api/esp/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ----- 타입 정의 -----
type GpsData = {
  lat: number;
  lng: number;
};

type UltrasonicData = {
  frontLeft?: number;
  frontRight?: number;
  backLeft?: number;
  backRight?: number;
};

type ButtonData = {
  pressed?: boolean;
};

type EspPayload = {
  role?: "master" | "slave";
  deviceId?: string;
  gps?: GpsData | null;
  ultrasonic?: UltrasonicData;
  button?: ButtonData;
  timestamp?: number;
};

// 마지막으로 받은 데이터 임시 저장 (진짜 서비스면 DB 사용)
let lastData: EspPayload | null = null;

// ----- GET /api/esp : 상태 확인 -----
export async function GET() {
  return NextResponse.json({
    ok: true,
    message: "맹인조끼 ESP API 서버 살아있음 (GET)",
    lastData,
  });
}

// ----- POST /api/esp : ESP 데이터 + (버튼 눌리면) GPT 호출 -----
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as EspPayload;

    const { role, deviceId, gps, ultrasonic, button, timestamp } = body;

    // 마지막 데이터 저장
    lastData = {
      role,
      deviceId,
      gps,
      ultrasonic,
      button,
      timestamp: timestamp ?? Date.now(),
    };

    const baseResponse: any = {
      ok: true,
      message: "ESP 데이터 수신 완료",
      saved: lastData,
    };

    // GPT API 키가 없으면 GPT는 건너뛰고 바로 응답
    if (!process.env.OPENAI_API_KEY) {
      baseResponse.gptMessage = null;
      baseResponse.gptError = "OPENAI_API_KEY 가 설정되지 않았습니다.";
      return NextResponse.json(baseResponse);
    }

    // 버튼이 눌렸을 때만 GPT 호출 (원하면 조건 바꿔도 됨)
    if (button?.pressed) {
      const parts: string[] = [];

      if (ultrasonic?.frontLeft != null) {
        parts.push(`앞 왼쪽 ${ultrasonic.frontLeft.toFixed(0)}cm`);
      }
      if (ultrasonic?.frontRight != null) {
        parts.push(`앞 오른쪽 ${ultrasonic.frontRight.toFixed(0)}cm`);
      }
      if (ultrasonic?.backLeft != null) {
        parts.push(`뒤 왼쪽 ${ultrasonic.backLeft.toFixed(0)}cm`);
      }
      if (ultrasonic?.backRight != null) {
        parts.push(`뒤 오른쪽 ${ultrasonic.backRight.toFixed(0)}cm`);
      }

      const sensorSummary =
        parts.length > 0 ? parts.join(", ") : "센서 정보 없음";

      const gpsText =
        gps && gps.lat != null && gps.lng != null
          ? `현재 위치는 위도 ${gps.lat}, 경도 ${gps.lng} 근처입니다.`
          : "GPS 정보는 없습니다.";

      const userPrompt = `
당신은 시각장애인 안내 조끼의 음성 안내 시스템입니다.
사용자의 센서 상황을 듣고, 한국어 한 문장으로만 짧게 안내 멘트를 만들어 주세요.

조건:
- 존댓말 사용 (예: "~하세요", "~하시면 됩니다")
- 1~2초 정도 길이로 짧게
- 어떤 방향으로 얼마나 피해야 하는지 중심으로 안내

센서 요약: ${sensorSummary}
${gpsText}
`;

      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "너는 시각장애인 안내 조끼의 안내 음성을 만들어 주는 도우미야.",
            },
            {
              role: "user",
              content: userPrompt,
            },
          ],
          max_tokens: 80,
        });

        const gptMessage =
          completion.choices[0]?.message?.content ??
          "안내 멘트를 만들지 못했습니다.";

        baseResponse.gptMessage = gptMessage;
      } catch (gptError) {
        console.error("GPT 호출 에러:", gptError);
        baseResponse.gptMessage = null;
        baseResponse.gptError = "GPT 호출 중 오류가 발생했습니다.";
      }
    }

    return NextResponse.json(baseResponse);
  } catch (error) {
    console.error("POST /api/esp 에러:", error);
    return NextResponse.json(
      { ok: false, error: "잘못된 요청 형식이거나 서버 오류입니다." },
      { status: 400 }
    );
  }
}
