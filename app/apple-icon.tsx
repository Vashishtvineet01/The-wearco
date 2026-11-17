import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 40,
          background: "linear-gradient(135deg, #7c5cff 0%, #ff5c3b 50%, #d8ff36 100%)",
        }}
      >
        <svg
          width="88"
          height="88"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#0f0d0a"
          strokeWidth="2.2"
        >
          <path d="M3 7l9-5 9 5-9 5-9-5zM3 12l9 5 9-5M3 17l9 5 9-5" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
