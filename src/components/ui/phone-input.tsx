"use client"

import PhoneInputLib from "react-phone-number-input"
import "react-phone-number-input/style.css"
import { cn } from "@/lib/utils"

interface PhoneInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  id?: string
}

export function PhoneInput({
  value,
  onChange,
  placeholder = "Enter phone number",
  disabled = false,
  className,
  id,
}: PhoneInputProps) {
  return (
    <PhoneInputLib
      international
      defaultCountry="IN"
      value={value}
      onChange={(val) => onChange(val || "")}
      placeholder={placeholder}
      disabled={disabled}
      id={id}
      className={cn("phone-input-wrapper", className)}
    />
  )
}
