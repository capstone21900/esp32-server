import Image from "next/image";
// app/page.tsx
export default function HomePage() {
  return (
    <main style={{ padding: "24px", fontFamily: "system-ui" }}>
      <h1>맹인조끼 서버</h1>
      <p>ESP32 마스터/슬레이브에서 센서 데이터를 받아오는 Next.js 서버입니다.</p>
      <p>
        엔드포인트: <code>/api/esp</code>
      </p>
      <ul>
        <li>GET /api/esp : 서버 상태 및 마지막 수신 데이터 확인</li>
        <li>POST /api/esp : ESP에서 센서 데이터 전송</li>
      </ul>
    </main>
  );
}
