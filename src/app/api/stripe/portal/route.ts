import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createPortalSession } from "@/lib/stripe"

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
      .select("stripe_customer_id")
      .eq("id", userData.clinic_id)
      .single()

    if (!clinic?.stripe_customer_id) {
      return NextResponse.json(
        { error: "No active subscription. Please subscribe first." },
        { status: 400 }
      )
    }

    const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || ""

    const session = await createPortalSession(
      clinic.stripe_customer_id,
      `${origin}/dashboard/settings`
    )

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("Stripe portal error:", error)
    return NextResponse.json({ error: "Failed to open billing portal" }, { status: 500 })
  }
}
