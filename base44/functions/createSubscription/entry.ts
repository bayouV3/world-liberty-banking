import Stripe from "npm:stripe@14";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

const PRICE_ID = "price_1T7RNPAnEjm5yj7VpWQ9OuQx";

Deno.serve(async (req) => {
  try {
    const { successUrl, cancelUrl, email } = await req.json();

    const sessionParams = {
      mode: "subscription",
      line_items: [{ price: PRICE_ID, quantity: 1 }],
      success_url: successUrl || `${req.headers.get("origin")}/subscription?success=true`,
      cancel_url: cancelUrl || `${req.headers.get("origin")}/subscription?cancelled=true`,
      metadata: {
        base44_app_id: Deno.env.get("BASE44_APP_ID"),
      },
    };

    if (email) {
      sessionParams.customer_email = email;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return Response.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error("Stripe error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});