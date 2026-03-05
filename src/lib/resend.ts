import { Resend } from "resend"

let _resend: Resend | null = null

function getResend() {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY)
  }
  return _resend
}

export async function sendBookingNotification(
  clinicEmail: string,
  patientName: string,
  serviceName: string,
  appointmentDate: string,
  appointmentTime: string,
  bookedVia: string
) {
  try {
    await getResend().emails.send({
      from: "DentAI <noreply@dentai.com>",
      to: clinicEmail,
      subject: `New Appointment: ${patientName} - ${serviceName}`,
      html: `
        <h2>New Appointment Booked</h2>
        <p><strong>Patient:</strong> ${patientName}</p>
        <p><strong>Service:</strong> ${serviceName}</p>
        <p><strong>Date:</strong> ${appointmentDate}</p>
        <p><strong>Time:</strong> ${appointmentTime}</p>
        <p><strong>Booked via:</strong> ${bookedVia}</p>
        <br>
        <p>View details in your <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/appointments">DentAI Dashboard</a>.</p>
      `,
    })
    return true
  } catch (error) {
    console.error("Resend email error:", error)
    return false
  }
}

export async function sendDailySummary(
  clinicEmail: string,
  clinicName: string,
  stats: {
    conversations: number
    appointments: number
    leads: number
    revenue: number
  }
) {
  try {
    await getResend().emails.send({
      from: "DentAI <noreply@dentai.com>",
      to: clinicEmail,
      subject: `Daily Summary for ${clinicName}`,
      html: `
        <h2>Your Daily Summary</h2>
        <p>Here's what happened at ${clinicName} today:</p>
        <ul>
          <li><strong>${stats.conversations}</strong> conversations handled</li>
          <li><strong>${stats.appointments}</strong> appointments booked</li>
          <li><strong>${stats.leads}</strong> new leads captured</li>
          <li><strong>$${stats.revenue}</strong> estimated revenue</li>
        </ul>
        <br>
        <p>View full details in your <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard">DentAI Dashboard</a>.</p>
      `,
    })
    return true
  } catch (error) {
    console.error("Resend daily summary error:", error)
    return false
  }
}
