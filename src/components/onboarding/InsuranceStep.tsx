"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const COMMON_INSURANCE = [
  "Delta Dental",
  "Cigna",
  "Aetna",
  "MetLife",
  "Guardian",
  "United Concordia",
  "Humana",
  "Blue Cross Blue Shield",
  "UnitedHealthcare",
  "Principal",
]

interface Props {
  data: string[]
  onChange: (data: string[]) => void
}

export function InsuranceStep({ data, onChange }: Props) {
  const [custom, setCustom] = useState("")

  function toggle(name: string) {
    if (data.includes(name)) {
      onChange(data.filter((i) => i !== name))
    } else {
      onChange([...data, name])
    }
  }

  function addCustom() {
    if (!custom || data.includes(custom)) return
    onChange([...data, custom])
    setCustom("")
  }

  return (
    <div className="space-y-6">
      <div>
        <Label className="mb-2 block">Select insurance plans you accept</Label>
        <div className="flex flex-wrap gap-2">
          {COMMON_INSURANCE.map((name) => {
            const selected = data.includes(name)
            return (
              <Button
                key={name}
                variant={selected ? "default" : "outline"}
                size="sm"
                onClick={() => toggle(name)}
              >
                {selected ? "- " : "+ "}
                {name}
              </Button>
            )
          })}
        </div>
      </div>

      {data.length > 0 && (
        <div>
          <Label className="mb-2 block">
            Selected ({data.length})
          </Label>
          <div className="flex flex-wrap gap-2">
            {data.map((name) => (
              <span
                key={name}
                className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm"
              >
                {name}
                <button
                  onClick={() => toggle(name)}
                  className="ml-1 text-muted-foreground hover:text-foreground"
                >
                  x
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <Input
          placeholder="Add custom insurance"
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addCustom()}
        />
        <Button variant="outline" onClick={addCustom} disabled={!custom}>
          Add
        </Button>
      </div>
    </div>
  )
}
