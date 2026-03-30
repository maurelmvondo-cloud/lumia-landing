import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
