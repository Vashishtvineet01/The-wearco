import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "TheWearCo — Internet Uniform";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: "#050505",
          color: "#f7f7f7",
          fontFamily: "sans-serif"
        }}
      >
        <div
          style={{
            fontSize: 28,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "#d8ff36",
            marginBottom: 24
          }}
        >
          TheWearCo
        </div>
        <div style={{ fontSize: 72, fontWeight: 700, lineHeight: 1.05, maxWidth: 900 }}>
          Internet uniform for the people building it themselves.
        </div>
      </div>
    ),
    { ...size }
  );
}
