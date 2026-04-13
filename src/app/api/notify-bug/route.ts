import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { title, description, category, severity, username } = await req.json();

    await resend.emails.send({
      from: "Lumia Bug Reports <onboarding@resend.dev>",
      to: process.env.NOTIFY_EMAIL_TO!,
      subject: `[Bug Report] ${severity?.toUpperCase()} — ${title}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px;">
          <h2 style="color: #0F0A1E;">New bug report from @${username ?? "anonymous"}</h2>
          <p><strong>Severity:</strong> ${severity}</p>
          <p><strong>Category:</strong> ${category}</p>
          <p><strong>Title:</strong> ${title}</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="white-space: pre-wrap; color: #333;">${description}</p>
          <p style="margin-top: 24px; color: #888; font-size: 12px;">
            Review in Supabase → bug_reports table. Add to known_bugs to make it public.
          </p>
        </div>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Bug notify error:", err);
    // Don't block the bug report if email fails
    return NextResponse.json({ ok: true });
  }
}
