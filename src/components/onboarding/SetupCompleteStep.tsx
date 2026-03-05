"use client"

import { Button } from "@/components/ui/button"
import type { Clinic } from "@/types"

interface Props {
  clinic: Partial<Clinic>
  onGoToDashboard: () => void
}

export function SetupCompleteStep({ clinic, onGoToDashboard }: Props) {
  const widgetCode = `<script src="${process.env.NEXT_PUBLIC_APP_URL || "https://app.dentai.com"}/widget-loader.js" data-clinic="${clinic.slug}"></script>`

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold">Setup Complete!</h3>
        <p className="mt-2 text-muted-foreground">
          Your AI receptionist is ready to start helping patients.
        </p>
      </div>

      {/* Summary */}
      <div className="rounded-lg border p-4">
        <h4 className="mb-3 font-medium">What&apos;s been configured:</h4>
        <ul className="space-y-2 text-sm">
          <li className="flex items-center gap-2">
            <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Clinic details ({clinic.name})
          </li>
          <li className="flex items-center gap-2">
            <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Business hours configured
          </li>
          <li className="flex items-center gap-2">
            <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            {(clinic.services as unknown[])?.length || 0} services added
          </li>
          <li className="flex items-center gap-2">
            <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            {(clinic.insurance_accepted as unknown[])?.length || 0} insurance plans accepted
          </li>
          <li className="flex items-center gap-2">
            {clinic.google_calendar_connected ? (
              <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="h-4 w-4 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            )}
            Google Calendar {clinic.google_calendar_connected ? "connected" : "not connected (can add later)"}
          </li>
        </ul>
      </div>

      {/* Widget embed code */}
      <div className="rounded-lg border p-4">
        <h4 className="mb-2 font-medium">Chat widget embed code</h4>
        <p className="mb-3 text-sm text-muted-foreground">
          Paste this code on your website to add the AI chat widget:
        </p>
        <div className="rounded bg-muted p-3">
          <code className="break-all text-xs">{widgetCode}</code>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="mt-2"
          onClick={() => navigator.clipboard.writeText(widgetCode)}
        >
          Copy Code
        </Button>
      </div>

      <Button onClick={onGoToDashboard} className="w-full" size="lg">
        Go to Dashboard
      </Button>
    </div>
  )
}
