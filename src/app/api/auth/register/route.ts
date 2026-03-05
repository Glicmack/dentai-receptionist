import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

function generateSlug(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim() +
    "-" +
    Math.random().toString(36).substring(2, 6)
  )
}

export async function POST(request: Request) {
  try {
    const { clinicName, fullName, email, password } = await request.json()

    if (!clinicName || !fullName || !email || !password) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // 1. Create auth user via admin API (bypasses email confirmation)
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Auto-confirm email
        user_metadata: {
          full_name: fullName,
          clinic_name: clinicName,
        },
      })

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: authError?.message || "Failed to create account" },
        { status: 400 }
      )
    }

    // 2. Generate slug and create clinic record (admin bypasses RLS)
    const slug = generateSlug(clinicName)
    const { data: clinic, error: clinicError } = await supabase
      .from("clinics")
      .insert({
        name: clinicName,
        slug,
        email,
      })
      .select()
      .single()

    if (clinicError || !clinic) {
      // Cleanup: delete the auth user if clinic creation fails
      await supabase.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json(
        { error: clinicError?.message || "Failed to create clinic" },
        { status: 500 }
      )
    }

    // 3. Create user record linking auth user to clinic (admin bypasses RLS)
    const { error: userError } = await supabase.from("users").insert({
      id: authData.user.id,
      clinic_id: clinic.id,
      email,
      full_name: fullName,
      role: "owner",
    })

    if (userError) {
      // Cleanup: delete clinic and auth user
      await supabase.from("clinics").delete().eq("id", clinic.id)
      await supabase.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json(
        { error: userError.message || "Failed to create user profile" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      clinicId: clinic.id,
      userId: authData.user.id,
      slug: clinic.slug,
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}
