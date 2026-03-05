"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const TIMEZONES = [
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "America/Anchorage", label: "Alaska Time (AKT)" },
  { value: "Pacific/Honolulu", label: "Hawaii Time (HT)" },
]

interface ClinicDetailsData {
  name: string
  phone: string
  address: string
  city: string
  state: string
  zip: string
  website: string
  timezone: string
}

interface Props {
  data: ClinicDetailsData
  onChange: (data: ClinicDetailsData) => void
}

export function ClinicDetailsStep({ data, onChange }: Props) {
  function update(field: keyof ClinicDetailsData, value: string) {
    onChange({ ...data, [field]: value })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Clinic name</Label>
        <Input
          id="name"
          value={data.name}
          onChange={(e) => update("name", e.target.value)}
          placeholder="Bright Smile Dental"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone number</Label>
        <Input
          id="phone"
          value={data.phone}
          onChange={(e) => update("phone", e.target.value)}
          placeholder="(555) 123-4567"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          value={data.address}
          onChange={(e) => update("address", e.target.value)}
          placeholder="123 Main Street"
        />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            value={data.city}
            onChange={(e) => update("city", e.target.value)}
            placeholder="City"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="state">State</Label>
          <Input
            id="state"
            value={data.state}
            onChange={(e) => update("state", e.target.value)}
            placeholder="CA"
            maxLength={2}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="zip">ZIP</Label>
          <Input
            id="zip"
            value={data.zip}
            onChange={(e) => update("zip", e.target.value)}
            placeholder="90210"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="website">Website</Label>
        <Input
          id="website"
          value={data.website}
          onChange={(e) => update("website", e.target.value)}
          placeholder="https://www.yourclinicdental.com"
        />
      </div>
      <div className="space-y-2">
        <Label>Timezone</Label>
        <Select value={data.timezone} onValueChange={(v) => update("timezone", v)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TIMEZONES.map((tz) => (
              <SelectItem key={tz.value} value={tz.value}>
                {tz.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
