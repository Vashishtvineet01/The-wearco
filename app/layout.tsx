import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CartProvider } from "@/components/CartProvider";

export const metadata: Metadata = {
  title: "TheWearCo — Internet Uniform for Founders & Creators",
  description:
    "TheWearCo is the internet uniform for founders, creators and builders. Drops, QR-unlocked community, and a Design Studio to print your own art.",
  metadataBase: new URL("https://thewearco.example"),
  openGraph: {
    title: "TheWearCo — Internet Uniform",
    description:
      "Founder-culture clothing + a Design Studio to print your own art on premium tees, hoodies and caps.",
    type: "website"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-ink-950 font-sans text-ink-50 antialiased">
        <CartProvider>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
