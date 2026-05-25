import { ImageResponse } from "next/og"
import { type NextRequest } from "next/server"

export const runtime = "edge"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const fortune = searchParams.get("fortune") ?? "The stars remember your name."
  const numbers = searchParams.get("numbers") ?? "33 · 44 · 55"
  const emoji = searchParams.get("emoji") ?? "🌌"

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "radial-gradient(ellipse at center, #2D1B5E 0%, #1A1033 45%, #0D0821 100%)",
          padding: "60px 80px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Cookie emoji */}
        <div style={{ fontSize: 80, marginBottom: 24 }}>🥠</div>

        {/* Fortune text */}
        <div
          style={{
            fontSize: 40,
            fontWeight: 700,
            color: "#FFF5E4",
            textAlign: "center",
            lineHeight: 1.3,
            maxWidth: 900,
            marginBottom: 32,
          }}
        >
          &ldquo;{fortune}&rdquo;
        </div>

        {/* Divider */}
        <div
          style={{
            width: 200,
            height: 2,
            background: "rgba(255,215,0,0.4)",
            marginBottom: 24,
            borderRadius: 1,
          }}
        />

        {/* Lucky info */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            color: "#C4B5FD",
            fontSize: 24,
          }}
        >
          <span style={{ color: "#FFD700" }}>Lucky:</span>
          <span>{numbers}</span>
          <span>{emoji}</span>
        </div>

        {/* Branding */}
        <div
          style={{
            position: "absolute",
            bottom: 28,
            right: 40,
            color: "rgba(196,181,253,0.4)",
            fontSize: 18,
          }}
        >
          fortune-cookie on Monad
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
