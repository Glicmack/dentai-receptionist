"use client"

import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import type { BusinessHours, DayHours } from "@/types"

const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const

type DayName = (typeof DAYS)[number]

interface Props {
  data: BusinessHours
  onChange: (data: BusinessHours) => void
}

export function BusinessHoursStep({ data, onChange }: Props) {
  function updateDay(day: DayName, updates: Partial<DayHours>) {
    onChange({
      ...data,
      [day]: { ...data[day], ...updates },
    })
  }

  function copyToWeekdays() {
    const mondayHours = data.monday
    const updated = { ...data }
    const weekdays: DayName[] = ["tuesday", "wednesday", "thursday", "friday"]
    weekdays.forEach((day) => {
      updated[day] = { ...mondayHours }
    })
    onChange(updated)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Set your clinic&apos;s operating hours
        </p>
        <Button variant="outline" size="sm" onClick={copyToWeekdays}>
          Copy Monday to weekdays
        </Button>
      </div>

      <div className="space-y-4">
        {DAYS.map((day) => (
          <div
            key={day}
            className="flex items-center gap-4 rounded-lg border p-3"
          >
            <div className="flex w-28 items-center gap-2">
              <Switch
                checked={!data[day].closed}
                onCheckedChange={(checked) =>
                  updateDay(day, { closed: !checked })
                }
              />
              <Label className="capitalize">{day}</Label>
            </div>
            {!data[day].closed ? (
              <div className="flex items-center gap-2">
                <Input
                  type="time"
                  value={data[day].open || "09:00"}
                  onChange={(e) => updateDay(day, { open: e.target.value })}
                  className="w-32"
                />
                <span className="text-sm text-muted-foreground">to</span>
                <Input
                  type="time"
                  value={data[day].close || "17:00"}
                  onChange={(e) => updateDay(day, { close: e.target.value })}
                  className="w-32"
                />
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">Closed</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
