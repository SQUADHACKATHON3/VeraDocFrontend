/**
 * Root Layout — /
 */
import type { Metadata } from "next";
import { Geist, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import "@/styles/vd.css";
import { Providers } from "./providers";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: "VeraDoc | AI-Powered Certificate Verification",
  description:
    "Stop trusting. Start verifying. VeraDoc detects fake academic certificates and transcripts in seconds using advanced AI forensics.",
  icons: {
    icon: "/assets/veradoc_logo.png",
    shortcut: "/assets/veradoc_logo.png",
    apple: "/assets/veradoc_logo.png",
  },
  openGraph: {
    title: "VeraDoc | AI-Powered Certificate Verification",
    description:
      "Stop trusting. Start verifying. VeraDoc detects fake academic certificates and transcripts in seconds.",
    images: ["/assets/veradoc_logo.png"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "VeraDoc | AI-Powered Certificate Verification",
    description: "Stop trusting. Start verifying. VeraDoc detects fake academic certificates and transcripts in seconds.",
    images: ["/assets/veradoc_logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${geist.variable} ${jetbrainsMono.variable} ${instrumentSerif.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
