import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { getStripe } from "@/lib/stripe"
import { createAdminClient } from "@/lib/supabase/admin"
import Stripe from "stripe"

export async function POST(request: Request) {
  const body = await request.text()
  const sig = headers().get("stripe-signature")

  if (!sig) {
    return NextResponse.json({ error: "No signature" }, { status: 400 })
  }

  const stripe = getStripe()
  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  const supabase = createAdminClient()

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session
      const clinicId = session.metadata?.clinic_id

      if (clinicId && session.subscription) {
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        )

        const priceId = subscription.items.data[0]?.price.id
        let plan = "starter"
        if (priceId === process.env.STRIPE_GROWTH_PRICE_ID) plan = "growth"
        else if (priceId === process.env.STRIPE_PRO_PRICE_ID) plan = "pro"

        await supabase
          .from("clinics")
          .update({
            plan,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
            subscription_status: "active",
          })
          .eq("id", clinicId)
      }
      break
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription
      const customerId = subscription.customer as string

      const { data: clinic } = await supabase
        .from("clinics")
        .select("id")
        .eq("stripe_customer_id", customerId)
        .single()

      if (clinic) {
        await supabase
          .from("clinics")
          .update({
            subscription_status: subscription.status,
          })
          .eq("id", clinic.id)
      }
      break
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription
      const customerId = subscription.customer as string

      const { data: clinic } = await supabase
        .from("clinics")
        .select("id")
        .eq("stripe_customer_id", customerId)
        .single()

      if (clinic) {
        await supabase
          .from("clinics")
          .update({
            plan: "trial",
            subscription_status: "cancelled",
            stripe_subscription_id: null,
          })
          .eq("id", clinic.id)
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
