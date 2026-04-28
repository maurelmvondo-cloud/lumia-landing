import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not configured");
  // Let Stripe use its default API version based on the SDK
  return new Stripe(key);
}

export async function POST(_request: NextRequest) {
  const priceId = process.env.STRIPE_PRICE_ID;

  if (!priceId || !priceId.startsWith("price_")) {
    return NextResponse.json(
      { error: "Configuration Error: STRIPE_PRICE_ID must be a valid Price ID starting with 'price_'." },
      { status: 400 }
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "payment",
      success_url: `${appUrl}/?success=true`,
      cancel_url: `${appUrl}/`,
    });
    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Stripe session error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
