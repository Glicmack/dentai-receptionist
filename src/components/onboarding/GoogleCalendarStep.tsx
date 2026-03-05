"use client"

import { Button } from "@/components/ui/button"

interface Props {
  connected: boolean
  onConnect: () => void
  onSkip: () => void
}

export function GoogleCalendarStep({ connected, onConnect, onSkip }: Props) {
  return (
    <div className="space-y-6 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
      </div>

      <div>
        <h3 className="text-lg font-semibold">Connect Google Calendar</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Allow DentAI to check your availability and book appointments directly into your calendar.
        </p>
      </div>

      {connected ? (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <div className="flex items-center justify-center gap-2 text-green-700">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-medium">Google Calendar connected!</span>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <Button onClick={onConnect} className="w-full max-w-xs">
            Connect Google Calendar
          </Button>
          <div>
            <Button variant="ghost" size="sm" onClick={onSkip}>
              Skip for now (you can connect later in Settings)
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
