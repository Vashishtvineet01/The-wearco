import { ImageResponse } from "next/og";

export const alt = "TheWearCo bulk orders";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function BulkOg() {
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
            background: "rgba(255,92,59,0.32)",
            filter: "blur(80px)",
          }}
        />
        <div
          style={{
            fontSize: 18,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "#b33a1f",
            fontFamily: "monospace",
            marginBottom: 16,
          }}
        >
          // Bulk
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
          Kit out your team. Volume pricing from 10 units.
        </div>
      </div>
    ),
    { ...size }
  );
}
