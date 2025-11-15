// app/api/esp/route.ts
import { NextResponse } from 'next/server';

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
  pressed: boolean;
};

type EspPayload = {
  role?: 'master' | 'slave';
  deviceId?: string;
  gps?: GpsData | null;
  ultrasonic?: UltrasonicData;
  button?: ButtonData;
  timestamp?: number;
};

let lastData: EspPayload | null = null;

// ESP 마스터/슬레이브에서 센서 데이터 보내는 곳
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as EspPayload;

    const { role, deviceId, gps, ultrasonic, button, timestamp } = body;

    console.log('===== ESP 데이터 수신 =====');
    console.log('role:', role);
    console.log('deviceId:', deviceId);
    console.log('gps:', gps);
    console.log('ultrasonic:', ultrasonic);
    console.log('button:', button);
    console.log('timestamp:', timestamp);
    console.log('===========================');

    // 마지막 데이터 저장 (나중에 DB로 교체 가능)
    lastData = {
      role,
      deviceId,
      gps,
      ultrasonic,
      button,
      timestamp: timestamp ?? Date.now(),
    };

    return NextResponse.json({
      ok: true,
      message: 'ESP 데이터 수신 완료',
      receivedRole: role,
    });
  } catch (error) {
    console.error('POST /api/esp 에러:', error);
    return NextResponse.json(
      { ok: false, error: '잘못된 요청 형식입니다.' },
      { status: 400 }
    );
  }
}

// GET /api/esp : 서버 살아있는지, 마지막 데이터 뭐 받았는지 확인
export async function GET() {
  return NextResponse.json({
    ok: true,
    message: '맹인조끼 ESP API 서버 살아있음',
    lastData,
  });
}
