"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

const FAQS = [
  {
    q: "How does the AI receptionist work?",
    a: "Our AI uses advanced language models to understand patient requests, answer questions about your clinic, and book appointments directly into your Google Calendar. It handles calls via voice AI and chats via an embeddable widget on your website.",
  },
  {
    q: "Can patients really book appointments through the AI?",
    a: "Yes! The AI checks your real-time availability in Google Calendar and books confirmed appointments. Patients receive an SMS confirmation immediately.",
  },
  {
    q: "What happens after hours?",
    a: "The AI works 24/7. After hours, it can still answer questions, capture lead information, and let patients know when to expect a callback.",
  },
  {
    q: "Is my patient data secure?",
    a: "Absolutely. All data is encrypted in transit and at rest. We follow strict data handling practices and never share patient information with third parties.",
  },
  {
    q: "Can I customize what the AI says?",
    a: "Yes. You can customize the greeting, tone, language, emergency policy, and add custom FAQ responses through your dashboard settings.",
  },
]

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className="relative overflow-hidden py-24">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50 via-blue-50/80 to-blue-100/50" />
      {/* Decorative dots */}
      <div className="absolute inset-0 opacity-[0.15]" style={{
        backgroundImage: "radial-gradient(circle, #3b82f6 1px, transparent 1px)",
        backgroundSize: "32px 32px",
      }} />

      <div className="container relative mx-auto max-w-3xl px-4">
        <h2 className="mb-3 text-center text-3xl font-extrabold tracking-tight md:text-4xl lg:text-5xl">
          Your Questions, Answered
        </h2>
        <p className="mx-auto mb-12 max-w-lg text-center text-muted-foreground">
          Learn more about how DentAI can help your dental clinic.
        </p>

        <div className="space-y-3">
          {FAQS.map((faq, i) => {
            const isOpen = openIndex === i
            return (
              <div key={i} className="group">
                {/* Question button */}
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-full px-6 py-4 text-left transition-all duration-300",
                    isOpen
                      ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/20"
                      : "bg-white/80 text-foreground shadow-sm hover:bg-white hover:shadow-md backdrop-blur-sm"
                  )}
                >
                  <span className={cn(
                    "text-sm font-semibold sm:text-base pr-4",
                    isOpen ? "text-white" : "text-foreground"
                  )}>
                    {faq.q}
                  </span>
                  <div className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-300",
                    isOpen
                      ? "bg-white/20 rotate-180"
                      : "bg-blue-50 text-blue-600"
                  )}>
                    <svg
                      className={cn("h-4 w-4 transition-colors", isOpen ? "text-white" : "text-blue-600")}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {/* Answer panel */}
                <div
                  className={cn(
                    "overflow-hidden transition-all duration-300 ease-in-out",
                    isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  )}
                >
                  <div className="px-6 py-4">
                    <div className="border-l-3 border-blue-500 pl-4" style={{ borderLeftWidth: "3px" }}>
                      <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                        {faq.a}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
