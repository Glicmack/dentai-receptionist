import { NextResponse } from "next/server"
import { registerPatient, createPatientToken, setPatientCookie } from "@/lib/patient-auth"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, fullName, phone } = body

    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: "Email, password, and full name are required" },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      )
    }

    const patient = await registerPatient(email, password, fullName, phone)

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
    const message = error instanceof Error ? error.message : "Registration failed"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
