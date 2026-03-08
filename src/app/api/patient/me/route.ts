import { NextResponse } from "next/server"
import { getPatientSession } from "@/lib/patient-auth"

export async function GET() {
  try {
    const session = await getPatientSession()
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    return NextResponse.json({ patient: session })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
