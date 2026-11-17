import { ImageResponse } from "next/og";

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
                "linear-gradient(135deg, #7c5cff 0%, #ff5c3b 50%, #d8ff36 100%)",
            }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#0f0d0a"
              strokeWidth="2.2"
            >
              <path d="M3 7l9-5 9 5-9 5-9-5zM3 12l9 5 9-5M3 17l9 5 9-5" />
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
            Internet uniform for the people building it themselves.
          </div>
          <div style={{ fontSize: 24, color: "#4a4737", maxWidth: 720 }}>
            Drops · Design Studio · Bulk for teams
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
