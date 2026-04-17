import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-bricolage",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://getlumia.ca"),
  title: "Lumia – AI Memory & Prompt Engine for Claude, ChatGPT & Gemini",
  description:
    "Lumia gives Claude, ChatGPT, and Gemini persistent memory. Drop your intent — Lumia injects your context and builds the prompt. macOS · Download free.",
  openGraph: {
    title: "Lumia – AI Memory & Prompt Engine for Claude, ChatGPT & Gemini",
    description:
      "Lumia gives Claude, ChatGPT, and Gemini persistent memory. Drop your intent — Lumia injects your context and builds the prompt. macOS · Download free.",
    url: "https://getlumia.ca",
    siteName: "Lumia",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Lumia – AI Memory & Prompt Engine",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lumia – AI Memory & Prompt Engine for Claude, ChatGPT & Gemini",
    description:
      "Lumia gives Claude, ChatGPT, and Gemini persistent memory. Drop your intent — Lumia injects your context and builds the prompt. macOS · Download free.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "https://getlumia.ca",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={bricolage.variable}>
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-3YYRR6RKT3"
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-3YYRR6RKT3');
        `}</Script>
      </head>
      <body className="font-sans antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
