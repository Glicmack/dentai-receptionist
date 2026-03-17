import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  // Skip auth for webhook/API routes that receive external requests
  const path = request.nextUrl.pathname
  if (path.startsWith('/api/whatsapp') || path.startsWith('/api/vapi') || path.startsWith('/api/cron')) {
    return NextResponse.next()
  }

  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
