"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function MobileNav() {
  const [open, setOpen] = useState(false)

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex h-9 w-9 items-center justify-center rounded-md border"
        aria-label="Toggle menu"
      >
        {open ? (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-16 z-50 border-b bg-white/95 backdrop-blur-lg p-4 shadow-lg animate-fade-up">
          <nav className="flex flex-col gap-3">
            <Link
              href="/pricing"
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              Pricing
            </Link>
            <Link href="/login" onClick={() => setOpen(false)}>
              <Button variant="ghost" className="w-full justify-start">Log In</Button>
            </Link>
            <Link href="/register" onClick={() => setOpen(false)}>
              <Button className="w-full shadow-md shadow-primary/20">Start Free Trial</Button>
            </Link>
          </nav>
        </div>
      )}
    </div>
  )
}
