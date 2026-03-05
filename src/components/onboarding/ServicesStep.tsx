"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Service } from "@/types"

const SUGGESTED_SERVICES: Service[] = [
  { name: "Cleaning", duration: 60, price: "from $150" },
  { name: "Checkup", duration: 30, price: "from $100" },
  { name: "X-Ray", duration: 30, price: "from $75" },
  { name: "Whitening", duration: 90, price: "from $300" },
  { name: "Filling", duration: 45, price: "from $200" },
  { name: "Crown", duration: 90, price: "from $800" },
  { name: "Root Canal", duration: 90, price: "from $700" },
  { name: "Emergency", duration: 60, price: "varies" },
]

interface Props {
  data: Service[]
  onChange: (data: Service[]) => void
}

export function ServicesStep({ data, onChange }: Props) {
  const [newService, setNewService] = useState<Service>({
    name: "",
    duration: 60,
    price: "",
  })

  function addService(service: Service) {
    if (data.some((s) => s.name === service.name)) return
    onChange([...data, service])
  }

  function addCustomService() {
    if (!newService.name) return
    addService(newService)
    setNewService({ name: "", duration: 60, price: "" })
  }

  function removeService(index: number) {
    onChange(data.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-6">
      {/* Suggestions */}
      <div>
        <Label className="mb-2 block">Quick add common services</Label>
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_SERVICES.map((service) => {
            const isAdded = data.some((s) => s.name === service.name)
            return (
              <Button
                key={service.name}
                variant={isAdded ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  if (isAdded) {
                    onChange(data.filter((s) => s.name !== service.name))
                  } else {
                    addService(service)
                  }
                }}
              >
                {isAdded ? "- " : "+ "}
                {service.name}
              </Button>
            )
          })}
        </div>
      </div>

      {/* Current services */}
      {data.length > 0 && (
        <div>
          <Label className="mb-2 block">Your services</Label>
          <div className="space-y-2">
            {data.map((service, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div>
                  <span className="font-medium">{service.name}</span>
                  <span className="ml-2 text-sm text-muted-foreground">
                    {service.duration} min - {service.price}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeService(i)}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Custom service */}
      <div className="rounded-lg border p-4">
        <Label className="mb-3 block">Add custom service</Label>
        <div className="grid grid-cols-3 gap-3">
          <Input
            placeholder="Service name"
            value={newService.name}
            onChange={(e) =>
              setNewService({ ...newService, name: e.target.value })
            }
          />
          <Select
            value={String(newService.duration)}
            onValueChange={(v) =>
              setNewService({ ...newService, duration: parseInt(v) })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">30 min</SelectItem>
              <SelectItem value="45">45 min</SelectItem>
              <SelectItem value="60">60 min</SelectItem>
              <SelectItem value="90">90 min</SelectItem>
            </SelectContent>
          </Select>
          <Input
            placeholder="from $100"
            value={newService.price}
            onChange={(e) =>
              setNewService({ ...newService, price: e.target.value })
            }
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          className="mt-3"
          onClick={addCustomService}
          disabled={!newService.name}
        >
          Add Service
        </Button>
      </div>
    </div>
  )
}
