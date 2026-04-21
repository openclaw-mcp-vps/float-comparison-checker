import { addPurchaseRecord } from "@/lib/database";
import { verifyStripeSignature } from "@/lib/lemonsqueezy";

export const runtime = "nodejs";

interface StripeEvent {
  type?: string;
  data?: {
    object?: {
      id?: string;
      customer_details?: {
        email?: string;
      };
    };
  };
}

export async function POST(request: Request): Promise<Response> {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secret) {
    return Response.json({ error: "Missing STRIPE_WEBHOOK_SECRET." }, { status: 500 });
  }

  const rawBody = await request.text();
  const signatureHeader = request.headers.get("stripe-signature");

  if (!verifyStripeSignature(rawBody, signatureHeader, secret)) {
    return Response.json({ error: "Invalid webhook signature." }, { status: 400 });
  }

  const event = JSON.parse(rawBody) as StripeEvent;

  if (event.type === "checkout.session.completed") {
    const sessionId = event.data?.object?.id;
    const email = event.data?.object?.customer_details?.email;

    if (sessionId) {
      await addPurchaseRecord({
        sessionId,
        email,
        source: "stripe-payment-link",
        createdAt: new Date().toISOString()
      });
    }
  }

  return Response.json({ received: true });
}
