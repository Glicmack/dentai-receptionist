"use client"

import { useState, useRef, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"

interface Message {
  role: "user" | "assistant" | "doctor"
  content: string
  timestamp: string
}

export default function DrChatPage() {
  const params = useParams()
  const { toast } = useToast()
  const slug = params.slug as string

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [sending, setSending] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [aiPaused, setAiPaused] = useState(false)
  const [clinicName, setClinicName] = useState("")
  const [patientLoggedIn, setPatientLoggedIn] = useState<boolean | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Check patient auth
    fetch("/api/patient/me")
      .then(r => {
        if (!r.ok) {
          setPatientLoggedIn(false)
          return
        }
        setPatientLoggedIn(true)
        return r.json()
      })
      .catch(() => setPatientLoggedIn(false))

    // Get clinic name
    fetch(`/api/store/doctors`)
      .then(r => r.json())
      .then(d => {
        const doc = (d.doctors || []).find((doc: { slug: string }) => doc.slug === slug)
        if (doc) setClinicName(doc.name)
      })
  }, [slug])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || sending) return

    const userMessage = input.trim()
    setInput("")
    setSending(true)

    setMessages(prev => [...prev, { role: "user", content: userMessage, timestamp: new Date().toISOString() }])

    try {
      const res = await fetch("/api/patient/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clinicSlug: slug,
          message: userMessage,
          conversationId,
          conversationHistory: messages.map(m => ({ role: m.role === "doctor" ? "assistant" : m.role, content: m.content })),
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      if (data.conversationId) setConversationId(data.conversationId)
      setAiPaused(data.aiPaused)

      if (data.message) {
        setMessages(prev => [...prev, { role: "assistant", content: data.message, timestamp: new Date().toISOString() }])
      } else if (data.aiPaused) {
        // Message sent but AI is paused - doctor will reply
      }
    } catch (err) {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" })
    }
    setSending(false)
  }

  if (patientLoggedIn === false) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-4xl">💬</div>
          <h2 className="text-xl font-semibold">Login Required</h2>
          <p className="text-gray-500">You need to sign in to chat with this doctor</p>
          <div className="flex gap-3 justify-center">
            <Link href={`/store/login?redirect=/dr/${slug}/chat`}>
              <Button>Sign In</Button>
            </Link>
            <Link href={`/store/register?redirect=/dr/${slug}/chat`}>
              <Button variant="outline">Create Account</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (patientLoggedIn === null) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto h-[calc(100vh-3.5rem)] flex flex-col">
      {/* Chat header */}
      <div className="flex items-center justify-between border-b px-4 py-3 bg-white">
        <div className="flex items-center gap-3">
          <Link href={`/dr/${slug}`} className="text-gray-400 hover:text-gray-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h2 className="font-semibold">{clinicName || "Doctor"}</h2>
            {aiPaused ? (
              <p className="text-xs text-amber-600">Doctor is responding</p>
            ) : (
              <p className="text-xs text-green-600">AI Assistant active</p>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="text-3xl mb-3">👋</div>
            <p className="text-gray-500">Start a conversation with {clinicName || "this clinic"}</p>
            <p className="text-sm text-gray-400 mt-1">Ask about services, book appointments, or get information</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
              msg.role === "user"
                ? "bg-blue-600 text-white rounded-br-md"
                : msg.role === "doctor"
                ? "bg-amber-100 text-amber-900 rounded-bl-md"
                : "bg-white border text-gray-700 rounded-bl-md"
            }`}>
              {msg.role === "doctor" && (
                <p className="text-xs font-medium text-amber-600 mb-1">Doctor</p>
              )}
              {msg.role === "assistant" && (
                <p className="text-xs font-medium text-blue-500 mb-1">AI Assistant</p>
              )}
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}

        {sending && (
          <div className="flex justify-start">
            <div className="bg-white border rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1">
                <div className="h-2 w-2 bg-gray-300 rounded-full animate-bounce" />
                <div className="h-2 w-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                <div className="h-2 w-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="border-t bg-white p-4">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={aiPaused ? "Send message to doctor..." : "Type your message..."}
            disabled={sending}
            className="flex-1"
            autoFocus
          />
          <Button type="submit" disabled={sending || !input.trim()}>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </Button>
        </div>
      </form>
    </div>
  )
}
