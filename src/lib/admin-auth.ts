import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

/**
 * Check if the currently authenticated Supabase user is a platform admin.
 * Uses the admin client to query platform_admins table (bypasses RLS).
 */
export async function isCurrentUserAdmin(): Promise<boolean> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.email) return false
    return isEmailAdmin(user.email)
  } catch {
    return false
  }
}

/**
 * Check if a given email is in the platform_admins table.
 */
export async function isEmailAdmin(email: string): Promise<boolean> {
  try {
    const admin = createAdminClient()
    const { data } = await admin
      .from("platform_admins")
      .select("id")
      .eq("email", email.toLowerCase())
      .single()
    return !!data
  } catch {
    return false
  }
}

/**
 * Get current admin user details. Returns null if not admin.
 */
export async function getAdminUser() {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.email) return null

    const admin = createAdminClient()
    const { data } = await admin
      .from("platform_admins")
      .select("*")
      .eq("email", user.email.toLowerCase())
      .single()

    return data
  } catch {
    return null
  }
}

/**
 * Require admin access for API routes. Throws if not admin.
 */
export async function requireAdmin() {
  const isAdmin = await isCurrentUserAdmin()
  if (!isAdmin) {
    throw new Error("Unauthorized: Admin access required")
  }
}
