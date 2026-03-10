import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    if (id === user.id) {
      return NextResponse.json({ error: "Cannot remove yourself" }, { status: 400 })
    }

    const adminSupabase = createAdminClient()
    const { data: targetUser } = await adminSupabase
      .from("users")
      .select("id, clinic_id, role")
      .eq("id", id)
      .single()

    if (!targetUser || targetUser.clinic_id !== userData.clinic_id) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (targetUser.role === "owner" && userData.role !== "owner") {
      return NextResponse.json({ error: "Only owners can remove other owners" }, { status: 403 })
    }

    await adminSupabase.from("users").delete().eq("id", id)
    await adminSupabase.auth.admin.deleteUser(id)

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Failed to remove team member" }, { status: 500 })
  }
}
