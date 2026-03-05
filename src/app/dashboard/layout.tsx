"use client"

import { useState } from "react"
import { Sidebar } from "@/components/dashboard/Sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile top bar with hamburger */}
        <header className="flex h-14 items-center gap-3 border-b bg-card px-4 md:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
              <span className="text-xs font-bold text-primary-foreground">D</span>
            </div>
            <span className="text-lg font-bold">DentAI</span>
          </div>
        </header>
        <main className="flex-1 overflow-auto bg-muted/30 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
