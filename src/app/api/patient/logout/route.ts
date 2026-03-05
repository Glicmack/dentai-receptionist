import { NextResponse } from "next/server"
import { clearPatientCookie } from "@/lib/patient-auth"

export async function POST() {
  clearPatientCookie()
  return NextResponse.json({ success: true })
}
