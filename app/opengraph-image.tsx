import { ImageResponse } from "next/og";

export const alt = "TheWearCo — Shop it. Design it. Wear it.";
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
          justifyContent: "space-between",
          padding: 64,
          background: "#fafaf7",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Aurora washes */}
        <div
          style={{
            position: "absolute",
            top: -180,
            left: -120,
            width: 520,
            height: 520,
            borderRadius: 999,
            background: "rgba(124,92,255,0.35)",
            filter: "blur(80px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: -80,
            right: -100,
            width: 460,
            height: 460,
            borderRadius: 999,
            background: "rgba(255,92,59,0.28)",
            filter: "blur(80px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -160,
            left: "35%",
            width: 400,
            height: 400,
            borderRadius: 999,
            background: "rgba(216,255,54,0.28)",
            filter: "blur(80px)",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background:
                "linear-gradient(145deg, #f59e0b 0%, #d97706 45%, #b45309 100%)",
            }}
          >
            <svg
              width="28"
              height="28"
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
          <div
            style={{
              fontSize: 28,
              fontWeight: 800,
              letterSpacing: -0.5,
              color: "#0f0d0a",
            }}
          >
            TheWearCo
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              fontSize: 64,
              fontWeight: 800,
              letterSpacing: -1.5,
              lineHeight: 1.05,
              color: "#0f0d0a",
              maxWidth: 900,
            }}
          >
            Shop apparel & custom prints.
          </div>
          <div style={{ fontSize: 24, color: "#4a4737", maxWidth: 720 }}>
            Shop · Design Studio · Team orders · No minimums
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
