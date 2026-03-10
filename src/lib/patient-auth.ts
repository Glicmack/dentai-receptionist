import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"

const PATIENT_COOKIE_NAME = "patient_session"
const JWT_SECRET = new TextEncoder().encode(
  process.env.PATIENT_JWT_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || "fallback-dev-secret"
)
const SESSION_EXPIRY_DAYS = 7

export interface PatientSession {
  phone: string
  email?: string
  name?: string
  clinicId: string
  clinicSlug: string
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function createPatientToken(payload: PatientSession): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_EXPIRY_DAYS}d`)
    .sign(JWT_SECRET)
}

export async function verifyPatientToken(token: string): Promise<PatientSession | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return {
      phone: payload.phone as string,
      email: (payload.email as string) || undefined,
      name: (payload.name as string) || undefined,
      clinicId: payload.clinicId as string,
      clinicSlug: payload.clinicSlug as string,
    }
  } catch {
    return null
  }
}

export async function getPatientSession(): Promise<PatientSession | null> {
  const cookieStore = cookies()
  const token = cookieStore.get(PATIENT_COOKIE_NAME)?.value
  if (!token) return null
  return verifyPatientToken(token)
}

export function setPatientCookie(token: string): void {
  const cookieStore = cookies()
  cookieStore.set(PATIENT_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_EXPIRY_DAYS * 24 * 60 * 60,
    path: "/p",
  })
}

export function clearPatientCookie(): void {
  const cookieStore = cookies()
  cookieStore.delete(PATIENT_COOKIE_NAME)
}

export function normalizePhone(phone: string): string {
  // Strip everything except digits and leading +
  const cleaned = phone.replace(/[^\d+]/g, "")
  return cleaned
}

export { PATIENT_COOKIE_NAME }
