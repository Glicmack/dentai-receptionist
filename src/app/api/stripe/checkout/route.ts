import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createCheckoutSession, getPriceIdForPlan } from "@/lib/stripe"

export async function POST(request: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { data: userData } = await supabase
      .from("users")
      .select("clinic_id")
      .eq("id", user.id)
      .single()
    if (!userData?.clinic_id) return NextResponse.json({ error: "No clinic" }, { status: 404 })

    const { data: clinic } = await supabase
      .from("clinics")
      .select("id, email")
      .eq("id", userData.clinic_id)
      .single()
    if (!clinic) return NextResponse.json({ error: "Clinic not found" }, { status: 404 })

    const body = await request.json()
    const { plan, annual } = body

    const result = getPriceIdForPlan(plan, annual || false)
    if (!result.priceId) {
      console.error("Plan selection error:", result.error)
      return NextResponse.json({ error: result.error || "Invalid plan" }, { status: 400 })
    }

    const priceId = result.priceId

    const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || ""

    const session = await createCheckoutSession(
      clinic.id,
      clinic.email,
      priceId,
      `${origin}/dashboard/settings?success=subscribed`,
      `${origin}/pricing?cancelled=true`
    )

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("Stripe checkout error:", error)
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 })
  }
}
