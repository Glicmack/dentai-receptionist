"use client"

import { useState, useRef, useEffect } from "react"
import { useClinic } from "@/hooks/useClinic"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import type { TranscriptMessage } from "@/types"

export default function DashboardChatPage() {
  const { clinic, loading: clinicLoading } = useClinic()
  const [messages, setMessages] = useState<TranscriptMessage[]>([])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [sessionId] = useState(() => crypto.randomUUID())
  const scrollRef = useRef<HTMLDivElement>(null)

  // Send initial greeting when clinic loads
  useEffect(() => {
    if (!clinic) return
    const greeting: TranscriptMessage = {
      role: "assistant",
      content:
        clinic.ai_greeting ||
        `Hi! Welcome to ${clinic.name}. How can I help you today?`,
      timestamp: new Date().toISOString(),
    }
    setMessages([greeting])
  }, [clinic])

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  async function sendMessage() {
    const messageText = input.trim()
    if (!messageText || !clinic) return

    setInput("")

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
          clinicSlug: clinic.slug,
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
        content:
          "I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  function resetChat() {
    if (!clinic) return
    setMessages([
      {
        role: "assistant",
        content:
          clinic.ai_greeting ||
          `Hi! Welcome to ${clinic.name}. How can I help you today?`,
        timestamp: new Date().toISOString(),
      },
    ])
  }

  if (clinicLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[500px]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">AI Chat</h1>
          <p className="text-muted-foreground">
            Test your AI receptionist — this is exactly what your patients see
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={resetChat}>
          <svg
            className="mr-2 h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182"
            />
          </svg>
          New Conversation
        </Button>
      </div>

      {/* Chat tips */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[
          "I'd like to book a cleaning",
          "What are your hours?",
          "Do you accept Delta Dental?",
          "I have a toothache",
        ].map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => {
              setInput(suggestion)
            }}
            className="whitespace-nowrap rounded-full border bg-card px-3 py-1.5 text-xs text-muted-foreground transition-all duration-200 hover:bg-primary/5 hover:border-primary/30 hover:text-foreground hover:shadow-sm"
          >
            {suggestion}
          </button>
        ))}
      </div>

      {/* Chat window */}
      <Card className="overflow-hidden">
        {/* Chat header */}
        <div className="flex items-center gap-3 border-b bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 text-white">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
            <span className="text-sm font-bold">
              {clinic?.name?.charAt(0) || "D"}
            </span>
          </div>
          <div>
            <p className="font-medium">{clinic?.name || "Your Clinic"}</p>
            <p className="flex items-center gap-1 text-xs opacity-80">
              <span className="inline-block h-2 w-2 rounded-full bg-green-400" />
              Online
            </p>
          </div>
        </div>

        {/* Messages */}
        <CardContent className="p-0">
          <ScrollArea className="h-[400px] p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
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
                      <span
                        className="animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      >
                        .
                      </span>
                      <span
                        className="animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      >
                        .
                      </span>
                    </span>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>

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
              placeholder="Type a message to test your AI..."
              disabled={isTyping}
              className="flex-1"
            />
            <Button type="submit" disabled={!input.trim() || isTyping}>
              Send
            </Button>
          </form>
        </div>
      </Card>

      {/* Widget embed code */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <svg
                className="h-5 w-5 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5"
                />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">
                Add this chat to your website
              </p>
              <p className="mb-2 text-xs text-muted-foreground">
                Paste this code before the closing &lt;/body&gt; tag on your
                website
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded bg-muted px-3 py-2 text-xs">
                  {`<script src="${typeof window !== "undefined" ? window.location.origin : ""}/widget.js" data-clinic="${clinic?.slug || ""}"></script>`}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `<script src="${window.location.origin}/widget.js" data-clinic="${clinic?.slug || ""}"></script>`
                    )
                  }}
                >
                  Copy
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
