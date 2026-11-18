import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import StoreChrome from "@/components/StoreChrome";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;

export const metadata: Metadata = {
  title: {
    default: "TheWearCo — Shop apparel & custom prints",
    template: "%s — TheWearCo"
  },
  description:
    "Shop premium tees, hoodies, caps, mugs and posters — or design your own in the Design Studio. No minimums. Printed and shipped in 5–7 days.",
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: "TheWearCo — Shop it. Design it. Wear it.",
    description:
      "A shopping destination for apparel and prints, plus a Design Studio to customize your own art on premium blanks.",
    type: "website",
    siteName: "TheWearCo"
  },
  twitter: {
    card: "summary_large_image",
    title: "TheWearCo — Shop it. Design it. Wear it.",
    description: "Shop apparel & prints, or design your own. No minimums."
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
