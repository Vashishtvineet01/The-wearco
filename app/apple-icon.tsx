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
          background: "linear-gradient(145deg, #f59e0b 0%, #d97706 45%, #b45309 100%)",
        }}
      >
        <svg
          width="88"
          height="88"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#fff8eb"
          strokeWidth="2.2"
        >
          <path d="M4 8.5 12 4l8 4.5-8 4.5-8-4.5Z" />
          <path d="M4 12.5 12 17l8-4.5" />
          <path d="M4 16 12 20.5 20 16" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
