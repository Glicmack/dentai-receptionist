import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { sendTeamInvite } from "@/lib/resend"
import crypto from "crypto"

export async function POST(request: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { data: userData } = await supabase
      .from("users")
      .select("clinic_id, role")
      .eq("id", user.id)
      .single()

    if (!userData || !["owner", "admin"].includes(userData.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { email, fullName, role } = await request.json()
    if (!email || !fullName || !role) {
      return NextResponse.json({ error: "Email, name, and role are required" }, { status: 400 })
    }
    if (!["staff", "admin"].includes(role)) {
      return NextResponse.json({ error: "Role must be staff or admin" }, { status: 400 })
    }

    const tempPassword = crypto.randomBytes(12).toString("base64url")

    const adminSupabase = createAdminClient()
    const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    })

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: authError?.message || "Failed to create account" },
        { status: 400 }
      )
    }

    const { error: userError } = await adminSupabase.from("users").insert({
      id: authData.user.id,
      clinic_id: userData.clinic_id,
      email,
      full_name: fullName,
      role,
    })

    if (userError) {
      await adminSupabase.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json(
        { error: userError.message || "Failed to create user record" },
        { status: 500 }
      )
    }

    const { data: clinic } = await supabase
      .from("clinics")
      .select("name")
      .eq("id", userData.clinic_id)
      .single()

    await sendTeamInvite(email, fullName, clinic?.name || "Your Clinic", role, tempPassword)

    return NextResponse.json({
      id: authData.user.id,
      email,
      full_name: fullName,
      role,
    })
  } catch (error) {
    console.error("Team invite error:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
