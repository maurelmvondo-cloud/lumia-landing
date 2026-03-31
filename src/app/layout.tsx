import type { Metadata } from "next";
import "./globals.css";
import localFont from "next/font/local";

const bricolage = localFont({
  src: [
    { path: "./fonts/Bricolage_Grotesque/BricolageGrotesque_24pt_SemiCondensed-ExtraBold.ttf", weight: "800", style: "normal" },
    { path: "./fonts/Bricolage_Grotesque/BricolageGrotesque_24pt_SemiCondensed-Bold.ttf", weight: "700", style: "normal" },
    { path: "./fonts/Bricolage_Grotesque/BricolageGrotesque_24pt_SemiCondensed-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "./fonts/Bricolage_Grotesque/BricolageGrotesque_24pt_SemiCondensed-Regular.ttf", weight: "400", style: "normal" },
  ],
  variable: "--font-bricolage",
  display: "swap",
});

const instrument = localFont({
  src: [
    { path: "./fonts/Instrument_Sans/InstrumentSans_SemiCondensed-Medium.ttf", weight: "500", style: "normal" },
    { path: "./fonts/Instrument_Sans/InstrumentSans_SemiCondensed-Regular.ttf", weight: "400", style: "normal" },
  ],
  variable: "--font-instrument",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lumia – The Zero-Prompt AI Experience",
  description: "Don't prompt, just pilot. Lumia extracts your raw intent and turns it into real action — no prompts needed.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${bricolage.variable} ${instrument.variable}`}>
      <body>{children}</body>
    </html>
  );
}
