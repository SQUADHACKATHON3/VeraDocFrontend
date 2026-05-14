/**
 * Root Layout — /
 * The main layout wrapper for the entire application, including fonts and global providers.
 * Auth required: No
 */
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});


export const metadata: Metadata = {
  title: "VeraDoc | AI-Powered Certificate Verification",
  description: "Stop Trusting. Start Verifying. VeraDoc detects fake academic certificates and transcripts in seconds using advanced AI forensics.",
  icons: {
    icon: "/assets/favicon.ico",
    apple: "/assets/veradoc_logo.png",
  },
  openGraph: {
    title: "VeraDoc | AI-Powered Certificate Verification",
    description: "Stop Trusting. Start Verifying. VeraDoc detects fake academic certificates and transcripts in seconds using advanced AI forensics.",
    images: ["/assets/veradoc_banner.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${poppins.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>

  );
}
