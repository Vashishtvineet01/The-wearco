import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import StoreChrome from "@/components/StoreChrome";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;

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
      <body className="min-h-screen bg-paper-50 font-sans text-paper-900 antialiased">
        <StoreChrome>{children}</StoreChrome>
        {/* Cookie-less analytics — only loads when domain is configured. */}
        {plausibleDomain ? (
          <Script
            defer
            data-domain={plausibleDomain}
            src="https://plausible.io/js/script.js"
            strategy="afterInteractive"
          />
        ) : null}
      </body>
    </html>
  );
}
