import type { Metadata } from "next";
import "./globals.css";
import StoreChrome from "@/components/StoreChrome";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  title: {
    default: "TheWearCo — Internet Uniform for Founders & Creators",
    template: "%s — TheWearCo"
  },
  description:
    "TheWearCo is the internet uniform for founders, creators and builders. Drops, QR-unlocked community, and a Design Studio to print your own art.",
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: "TheWearCo — Internet Uniform",
    description:
      "Founder-culture clothing + a Design Studio to print your own art on premium tees, hoodies and caps.",
    type: "website",
    siteName: "TheWearCo"
  },
  twitter: {
    card: "summary_large_image",
    title: "TheWearCo — Internet Uniform",
    description: "Founder-culture clothing + Design Studio."
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-ink-950 font-sans text-ink-50 antialiased">
        <StoreChrome>{children}</StoreChrome>
      </body>
    </html>
  );
}
