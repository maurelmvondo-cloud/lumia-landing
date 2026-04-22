import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const bricolage = localFont({
  src: [
    { path: "./fonts/HelveticaNowDisplay-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/HelveticaNowDisplay-RegIta.woff2",  weight: "400", style: "italic" },
    { path: "./fonts/HelveticaNowDisplay-Medium.woff2",  weight: "500", style: "normal" },
    { path: "./fonts/HelveticaNowDisplay-Bold.woff2",    weight: "700", style: "normal" },
    { path: "./fonts/HelveticaNowDisplay-BoldIta.woff2", weight: "700", style: "italic" },
    { path: "./fonts/HelveticaNowDisplay-ExtraBold.woff2", weight: "800", style: "normal" },
    { path: "./fonts/HelveticaNowDisplay-Black.woff2",   weight: "900", style: "normal" },
    { path: "./fonts/HelveticaNowDisplay-BlackIta.woff2",weight: "900", style: "italic" },
  ],
  variable: "--font-bricolage",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://getlumia.ca"),
  title: "Lumia — Think once. Execute everywhere.",
  description:
    "Lumia gives Claude, ChatGPT, and Gemini persistent memory. Drop your intent — Lumia injects your context and builds the prompt. macOS · Download free.",
  openGraph: {
    title: "Lumia — Think once. Execute everywhere.",
    description:
      "Lumia gives Claude, ChatGPT, and Gemini persistent memory. Drop your intent — Lumia injects your context and builds the prompt. macOS · Download free.",
    url: "https://getlumia.ca",
    siteName: "Lumia",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lumia — Think once. Execute everywhere.",
    description:
      "Lumia gives Claude, ChatGPT, and Gemini persistent memory. Drop your intent — Lumia injects your context and builds the prompt. macOS · Download free.",
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
