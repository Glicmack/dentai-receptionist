import { NextResponse } from "next/server"
import { Resend } from "resend"

export async function POST(request: Request) {
  try {
    const { name, email, clinicName, message } = await request.json()

    if (!name || !email || !clinicName || !message) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from: "DentAI <noreply@dentai.com>",
      to: process.env.ADMIN_EMAIL || "support@dentai.com",
      replyTo: email,
      subject: `New Clinic Inquiry: ${clinicName}`,
      html: `
        <h2>New Clinic Setup Request</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Clinic Name:</strong> ${clinicName}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Contact form error:", error)
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}
