import { Request, Response, NextFunction } from "express";
import Stripe from "stripe";
import { User } from "../models/user.model";
import { PremiumEmail } from "../models/premium-email.model";
import { STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, CLIENT_URL } from "../config/env";

const stripe = new Stripe(STRIPE_SECRET_KEY || "sk_test_dummy", {
  apiVersion: "2026-05-27.dahlia" as any,
});

const getClientUrl = () => {
  return CLIENT_URL || "http://localhost:3000"; // fallback if missing
};

export const createCheckoutSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "uah",
            product_data: {
              name: "Speaker Premium Subscription",
              description: "Unlock all languages and AI features",
            },
            unit_amount: 9900, // 99 UAH (in kopecks)
          },
          quantity: 1,
        },
      ],
      success_url: `${getClientUrl()}/?payment=success`,
      cancel_url: `${getClientUrl()}/?payment=cancel`,
    });

    res.status(200).json({ success: true, url: session.url });
  } catch (error) {
    next(error);
  }
};

export const handleWebhook = async (req: Request, res: Response, next: NextFunction) => {
  const sig = req.headers["stripe-signature"] as string;

  let event: any;

  try {
    if (STRIPE_WEBHOOK_SECRET) {
        event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);
    } else {
        // If testing without webhook secret, just parse it
        event = JSON.parse(req.body.toString());
    }
  } catch (err: any) {
    console.error("Stripe Webhook signature verification failed.", err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  try {
      if (event.type === "checkout.session.completed") {
        const session = event.data.object as any;
        const customerEmail = session.customer_details?.email;

        if (customerEmail) {
          console.log(`Payment successful for email: ${customerEmail}`);
          const user = await User.findOne({ email: customerEmail });
          if (user) {
            user.subscription = "premium";
            await user.save();
            console.log(`Upgraded existing user ${customerEmail} to premium.`);
          } else {
             const existingPremium = await PremiumEmail.findOne({ email: customerEmail });
             if (!existingPremium) {
                await PremiumEmail.create({ email: customerEmail });
                console.log(`Saved email ${customerEmail} as premium for future registration.`);
             }
          }
        }
      }

      res.status(200).json({ received: true });
  } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Internal Server Error" });
  }
};
