import { NextResponse } from "next/server"

export async function POST() {
  // Public registration disabled — accounts are created by clinic owners/admins
  return NextResponse.json({ error: "Public registration is disabled" }, { status: 403 })
}
