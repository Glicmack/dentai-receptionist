import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"
import { createAdminClient } from "@/lib/supabase/admin"
import type { PatientSession } from "@/types"

const PATIENT_COOKIE_NAME = "patient_session"
const JWT_SECRET = new TextEncoder().encode(
  process.env.PATIENT_JWT_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || "fallback-dev-secret"
)
const SESSION_EXPIRY_DAYS = 7

/**
 * Hash password using Web Crypto API (no bcrypt dependency needed)
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  )
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    256
  )
  const hashArray = new Uint8Array(derivedBits)
  const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, "0")).join("")
  const hashHex = Array.from(hashArray).map(b => b.toString(16).padStart(2, "0")).join("")
  return `${saltHex}:${hashHex}`
}

/**
 * Verify password against stored hash
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [saltHex, _hashHex] = storedHash.split(":")
  if (!saltHex || !_hashHex) return false

  const salt = new Uint8Array(saltHex.match(/.{2}/g)!.map(byte => parseInt(byte, 16)))
  const encoder = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  )
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    256
  )
  const hashArray = new Uint8Array(derivedBits)
  const hashHex = Array.from(hashArray).map(b => b.toString(16).padStart(2, "0")).join("")
  return hashHex === _hashHex
}

/**
 * Create a JWT token for patient session
 */
export async function createPatientToken(payload: PatientSession): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_EXPIRY_DAYS}d`)
    .sign(JWT_SECRET)
}

/**
 * Verify a patient JWT token
 */
export async function verifyPatientToken(token: string): Promise<PatientSession | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return {
      patientId: payload.patientId as string,
      email: payload.email as string,
      fullName: payload.fullName as string,
    }
  } catch {
    return null
  }
}

/**
 * Get current patient session from cookies
 */
export async function getPatientSession(): Promise<PatientSession | null> {
  const cookieStore = cookies()
  const token = cookieStore.get(PATIENT_COOKIE_NAME)?.value
  if (!token) return null
  return verifyPatientToken(token)
}

/**
 * Set patient session cookie
 */
export function setPatientCookie(token: string): void {
  const cookieStore = cookies()
  cookieStore.set(PATIENT_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_EXPIRY_DAYS * 24 * 60 * 60,
    path: "/",
  })
}

/**
 * Clear patient session cookie
 */
export function clearPatientCookie(): void {
  const cookieStore = cookies()
  cookieStore.delete(PATIENT_COOKIE_NAME)
}

/**
 * Register a new patient
 */
export async function registerPatient(
  email: string,
  password: string,
  fullName: string,
  phone?: string
) {
  const supabase = createAdminClient()

  // Check if email already exists
  const { data: existing } = await supabase
    .from("patients")
    .select("id")
    .eq("email", email.toLowerCase())
    .single()

  if (existing) {
    throw new Error("An account with this email already exists")
  }

  // Validate password
  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters")
  }

  const passwordHash = await hashPassword(password)

  const { data: patient, error } = await supabase
    .from("patients")
    .insert({
      email: email.toLowerCase(),
      full_name: fullName,
      password_hash: passwordHash,
      phone: phone || null,
    })
    .select()
    .single()

  if (error) throw new Error("Failed to create account")

  return patient
}

/**
 * Login a patient with email/password
 */
export async function loginPatient(email: string, password: string) {
  const supabase = createAdminClient()

  const { data: patient, error } = await supabase
    .from("patients")
    .select("*")
    .eq("email", email.toLowerCase())
    .single()

  if (error || !patient) {
    throw new Error("Invalid email or password")
  }

  const isValid = await verifyPassword(password, patient.password_hash)
  if (!isValid) {
    throw new Error("Invalid email or password")
  }

  return patient
}

/**
 * Generate a 6-digit OTP
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * Normalize phone number
 */
export function normalizePhone(phone: string): string {
  return phone.replace(/[^\d+]/g, "")
}

export { PATIENT_COOKIE_NAME }
