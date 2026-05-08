import type { Metadata } from "next";
import { Playfair_Display, Outfit } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["700", "800", "900"],
  variable: "--font-playfair",
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-outfit",
});


export const metadata: Metadata = {
  title: "VeraDoc | AI-Powered Certificate Verification",
  description: "Stop Trusting. Start Verifying. VeraDoc detects fake academic certificates and transcripts in seconds using advanced AI forensics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${playfair.variable} ${outfit.variable} antialiased`}>
        {children}
      </body>
    </html>

  );
}