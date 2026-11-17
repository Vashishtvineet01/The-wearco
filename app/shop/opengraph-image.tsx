import { ImageResponse } from "next/og";

export const alt = "Shop TheWearCo drops";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function ShopOg() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 64,
          background: "#fafaf7",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -140,
            right: -80,
            width: 480,
            height: 480,
            borderRadius: 999,
            background: "rgba(216,255,54,0.35)",
            filter: "blur(80px)",
          }}
        />
        <div
          style={{
            fontSize: 18,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "#4a6b00",
            fontFamily: "monospace",
            marginBottom: 16,
          }}
        >
          // Shop
        </div>
        <div
          style={{
            fontSize: 64,
            fontWeight: 800,
            letterSpacing: -1.5,
            color: "#0f0d0a",
            maxWidth: 900,
            lineHeight: 1.05,
          }}
        >
          Current drops. Limited runs. Ships in 48h.
        </div>
      </div>
    ),
    { ...size }
  );
}
