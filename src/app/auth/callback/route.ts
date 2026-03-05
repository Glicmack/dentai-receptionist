import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { createAdminClient } from "@/lib/supabase/admin"
import { generateSlug } from "@/lib/utils"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/dashboard"

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=auth_failed`)
  }

  try {
    const cookieStore = cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      console.error("OAuth code exchange failed:", error.message)
      return NextResponse.redirect(`${origin}/login?error=auth_failed`)
    }

    // Check if this is a new OAuth user who needs clinic setup
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.redirect(`${origin}/login?error=auth_failed`)
    }

    const adminClient = createAdminClient()
    const { data: existingUser } = await adminClient
      .from("users")
      .select("id")
      .eq("id", user.id)
      .single()

    if (existingUser) {
      // Existing user — go to dashboard
      return NextResponse.redirect(`${origin}${next}`)
    }

    // New OAuth user — create clinic and user records
    const fullName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "My Clinic"
    const clinicName = `${fullName}'s Clinic`
    const slug = generateSlug(clinicName)

    const { data: clinic, error: clinicError } = await adminClient
      .from("clinics")
      .insert({
        name: clinicName,
        slug,
        email: user.email,
      })
      .select()
      .single()

    if (clinicError || !clinic) {
      console.error("Failed to create clinic for OAuth user:", clinicError?.message)
      // Still redirect to onboarding — it can handle missing clinic
      return NextResponse.redirect(`${origin}/onboarding`)
    }

    const { error: userError } = await adminClient.from("users").insert({
      id: user.id,
      clinic_id: clinic.id,
      email: user.email,
      full_name: fullName,
      role: "owner",
    })

    if (userError) {
      console.error("Failed to create user record for OAuth user:", userError.message)
    }

    // New user -> send to onboarding
    return NextResponse.redirect(`${origin}/onboarding`)
  } catch (err) {
    console.error("Auth callback error:", err)
    return NextResponse.redirect(`${origin}/login?error=auth_failed`)
  }
}
