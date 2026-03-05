import Stripe from "stripe"

let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2026-02-25.clover",
    })
  }
  return _stripe
}

export async function createCheckoutSession(
  clinicId: string,
  email: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string
) {
  const stripe = getStripe()
  const session = await stripe.checkout.sessions.create({
    customer_email: email,
    payment_method_types: ["card"],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: "subscription",
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      clinic_id: clinicId,
    },
  })

  return session
}

export async function createPortalSession(customerId: string, returnUrl: string) {
  const stripe = getStripe()
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })
  return session
}

export function getPriceIdForPlan(plan: string, annual: boolean): string | null {
  const prices: Record<string, { monthly: string; annual: string }> = {
    starter: {
      monthly: process.env.STRIPE_STARTER_PRICE_ID || "",
      annual: process.env.STRIPE_STARTER_ANNUAL_PRICE_ID || process.env.STRIPE_STARTER_PRICE_ID || "",
    },
    growth: {
      monthly: process.env.STRIPE_GROWTH_PRICE_ID || "",
      annual: process.env.STRIPE_GROWTH_ANNUAL_PRICE_ID || process.env.STRIPE_GROWTH_PRICE_ID || "",
    },
    pro: {
      monthly: process.env.STRIPE_PRO_PRICE_ID || "",
      annual: process.env.STRIPE_PRO_ANNUAL_PRICE_ID || process.env.STRIPE_PRO_PRICE_ID || "",
    },
  }

  const planPrices = prices[plan]
  if (!planPrices) return null
  return annual ? planPrices.annual : planPrices.monthly
}
