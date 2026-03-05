"use client"

import { useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"

interface OTPInputProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export function OTPInput({ value, onChange, disabled }: OTPInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const digits = value.padEnd(6, "").split("").slice(0, 6)

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus()
  }, [])

  function handleInput(index: number, digit: string) {
    if (!/^\d?$/.test(digit)) return

    const newDigits = [...digits]
    newDigits[index] = digit
    onChange(newDigits.join("").trim())

    // Auto-advance to next input
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
      const newDigits = [...digits]
      newDigits[index - 1] = ""
      onChange(newDigits.join("").trim())
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault()
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
    if (pasted) {
      onChange(pasted)
      const focusIndex = Math.min(pasted.length, 5)
      inputRefs.current[focusIndex]?.focus()
    }
  }

  return (
    <div className="flex gap-2 justify-center">
      {digits.map((digit, i) => (
        <Input
          key={i}
          ref={(el) => { inputRefs.current[i] = el }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit || ""}
          onChange={(e) => handleInput(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={i === 0 ? handlePaste : undefined}
          disabled={disabled}
          className="h-12 w-12 text-center text-lg font-semibold sm:h-14 sm:w-14 sm:text-xl"
        />
      ))}
    </div>
  )
}
