import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not configured");
  return new Stripe(key, { apiVersion: "2025-04-30.basil" });
}

// Disable body parsing — Stripe webhook needs raw body
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

  if (!sig || !webhookSecret) {
    return NextResponse.json(
      { error: "Missing stripe-signature header or webhook secret" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userEmail = session.customer_details?.email;

    if (userEmail && isSupabaseConfigured) {
      console.log(`Updating user status for ${userEmail}`);
      const { error } = await supabaseAdmin
        .from("waitlist")
        .update({ status: "Founding Member" })
        .eq("email", userEmail);

      if (error) {
        console.error("Supabase update error:", error);
      } else {
        console.log(`Successfully updated ${userEmail} to Founding Member`);
      }
    }
  }

  return NextResponse.json({ received: true });
}
