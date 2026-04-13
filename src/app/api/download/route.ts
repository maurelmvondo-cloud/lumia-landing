import { NextResponse } from "next/server";

// ─── DMG Download Redirect ─────────────────────────────────────────────────────
// Update DMG_URL to point to wherever the file is hosted
// (Supabase Storage public URL, S3, GitHub Releases, etc.)
const DMG_URL =
  process.env.DMG_DOWNLOAD_URL ||
  "https://getlumia.ca/public/Lumia-AI.dmg";

export async function GET() {
  return NextResponse.redirect(DMG_URL, { status: 302 });
}
