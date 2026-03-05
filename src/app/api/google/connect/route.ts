import { NextResponse } from "next/server"
import { getAuthUrl } from "@/lib/google-calendar"

export async function GET() {
  const authUrl = getAuthUrl()
  return NextResponse.redirect(authUrl)
}
