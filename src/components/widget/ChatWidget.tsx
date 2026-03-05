"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { TranscriptMessage } from "@/types"

interface ClinicConfig {
  name: string
  slug: string
  phone: string | null
  greeting: string
  tone: string
}

interface ChatWidgetProps {
  clinicConfig: ClinicConfig
}

export function ChatWidget({ clinicConfig }: ChatWidgetProps) {
  const [messages, setMessages] = useState<TranscriptMessage[]>([])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [sessionId] = useState(() => crypto.randomUUID())
  const [hasInteracted, setHasInteracted] = useState(false)
  const [showLeadPrompt, setShowLeadPrompt] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inactivityTimer = useRef<NodeJS.Timeout | null>(null)

  // Send initial greeting
  useEffect(() => {
    const greeting: TranscriptMessage = {
      role: "assistant",
      content: clinicConfig.greeting || `Hi! Welcome to ${clinicConfig.name}. How can I help you today?`,
      timestamp: new Date().toISOString(),
    }
    setMessages([greeting])
  }, [clinicConfig])

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  // Inactivity timer for lead capture
  useEffect(() => {
    if (hasInteracted) {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current)
      inactivityTimer.current = setTimeout(() => {
        // Check if we already have contact info
        const hasContact = messages.some(
          (m) => m.role === "user" && /\d{3}.*\d{4}/.test(m.content)
        )
        if (!hasContact) {
          setShowLeadPrompt(true)
        }
      }, 45000) // 45 seconds
    }
    return () => {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current)
    }
  }, [hasInteracted, messages])

  async function sendMessage(text?: string) {
    const messageText = text || input.trim()
    if (!messageText) return

    setHasInteracted(true)
    setInput("")
    setShowLeadPrompt(false)

    const userMessage: TranscriptMessage = {
      role: "user",
      content: messageText,
      timestamp: new Date().toISOString(),
    }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setIsTyping(true)

    try {
      // Send history WITHOUT the current user message — the API adds it
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clinicSlug: clinicConfig.slug,
          message: messageText,
          sessionId,
          conversationHistory: messages,
        }),
      })

      if (!response.ok) throw new Error("Failed to get response")

      const data = await response.json()
      const aiMessage: TranscriptMessage = {
        role: "assistant",
        content: data.message,
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, aiMessage])
    } catch {
      const errorMessage: TranscriptMessage = {
        role: "assistant",
        content: `I'm having trouble connecting right now. Please call us directly at ${clinicConfig.phone || "our office number"} and we'll be happy to help!`,
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 border-b bg-primary px-4 py-3 text-primary-foreground">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
          <span className="text-sm font-bold">
            {clinicConfig.name.charAt(0)}
          </span>
        </div>
        <div>
          <p className="font-medium">{clinicConfig.name}</p>
          <p className="flex items-center gap-1 text-xs opacity-80">
            <span className="inline-block h-2 w-2 rounded-full bg-green-400" />
            Online
          </p>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="rounded-2xl bg-muted px-4 py-2 text-sm">
                <span className="inline-flex gap-1">
                  <span className="animate-bounce">.</span>
                  <span className="animate-bounce" style={{ animationDelay: "0.1s" }}>.</span>
                  <span className="animate-bounce" style={{ animationDelay: "0.2s" }}>.</span>
                </span>
              </div>
            </div>
          )}

          {/* Lead capture prompt */}
          {showLeadPrompt && (
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
              <p className="mb-2 text-sm font-medium">
                Would you like us to call you back?
              </p>
              <p className="mb-3 text-xs text-muted-foreground">
                Leave your phone number and we&apos;ll get back to you shortly.
              </p>
              <Button
                size="sm"
                onClick={() => {
                  setShowLeadPrompt(false)
                  sendMessage("I'd like to leave my number for a callback")
                }}
              >
                Yes, call me back
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t p-3">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            sendMessage()
          }}
          className="flex gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={isTyping}
            className="flex-1"
          />
          <Button type="submit" disabled={!input.trim() || isTyping} size="sm">
            Send
          </Button>
        </form>
        <p className="mt-2 text-center text-[10px] text-muted-foreground">
          Powered by DentAI
        </p>
      </div>
    </div>
  )
}
