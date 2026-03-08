import { NextResponse } from "next/server"
import { loginPatient, createPatientToken, setPatientCookie } from "@/lib/patient-auth"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    const patient = await loginPatient(email, password)

    const token = await createPatientToken({
      patientId: patient.id,
      email: patient.email,
      fullName: patient.full_name,
    })

    setPatientCookie(token)

    return NextResponse.json({
      patient: {
        id: patient.id,
        email: patient.email,
        fullName: patient.full_name,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Login failed"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
