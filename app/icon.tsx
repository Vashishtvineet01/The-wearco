import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 8,
          background: "linear-gradient(135deg, #7c5cff 0%, #ff5c3b 50%, #d8ff36 100%)",
        }}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#0f0d0a"
          strokeWidth="2.4"
        >
          <path d="M3 7l9-5 9 5-9 5-9-5zM3 12l9 5 9-5M3 17l9 5 9-5" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
