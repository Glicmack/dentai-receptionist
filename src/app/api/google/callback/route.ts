import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { getTokensFromCode } from "@/lib/google-calendar"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const error = searchParams.get("error")

  if (error || !code) {
    return NextResponse.redirect(`${origin}/dashboard/settings?error=google_auth_failed`)
  }

  try {
    // Get current user's clinic
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.redirect(`${origin}/login`)
    }

    const { data: userData } = await supabase
      .from("users")
      .select("clinic_id")
      .eq("id", user.id)
      .single()

    if (!userData?.clinic_id) {
      return NextResponse.redirect(`${origin}/dashboard/settings?error=no_clinic`)
    }

    // Exchange code for tokens
    const tokens = await getTokensFromCode(code)

    // Save tokens using admin client (bypasses RLS)
    const adminSupabase = createAdminClient()
    await adminSupabase
      .from("clinics")
      .update({
        google_calendar_connected: true,
        google_calendar_token: {
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expiry_date: tokens.expiry_date,
          token_type: tokens.token_type || "Bearer",
          scope: tokens.scope,
        },
      })
      .eq("id", userData.clinic_id)

    // Redirect based on where the user came from
    const referer = request.headers.get("referer") || ""
    if (referer.includes("/onboarding")) {
      return NextResponse.redirect(`${origin}/onboarding?calendar=connected`)
    }

    return NextResponse.redirect(`${origin}/dashboard/settings?success=google_connected`)
  } catch (err) {
    console.error("Google OAuth callback error:", err)
    return NextResponse.redirect(`${origin}/dashboard/settings?error=google_auth_failed`)
  }
}
