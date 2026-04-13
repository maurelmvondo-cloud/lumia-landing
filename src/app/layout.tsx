import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
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
    "Lumia gives Claude, ChatGPT, and Gemini persistent memory. Drop your intent — Lumia injects your context and builds the prompt. macOS · Private beta.",
  openGraph: {
    title: "Lumia – AI Memory & Prompt Engine for Claude, ChatGPT & Gemini",
    description:
      "Lumia gives Claude, ChatGPT, and Gemini persistent memory. Drop your intent — Lumia injects your context and builds the prompt. macOS · Private beta.",
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
      "Lumia gives Claude, ChatGPT, and Gemini persistent memory. Drop your intent — Lumia injects your context and builds the prompt. macOS · Private beta.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "https://getlumia.ca",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={bricolage.variable}>
      <body className="font-sans antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
