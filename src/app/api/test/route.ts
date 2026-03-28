import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    stripeKey: process.env.STRIPE_SECRET_KEY ? "SET (" + process.env.STRIPE_SECRET_KEY.substring(0, 10) + "...)" : "MISSING",
    priceId: process.env.STRIPE_PRICE_ID || "MISSING",
    appUrl: process.env.NEXT_PUBLIC_APP_URL || "MISSING",
    nodeEnv: process.env.NODE_ENV,
  });
}
