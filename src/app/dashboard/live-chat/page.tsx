"use client"

import { useEffect, useState, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"

interface ConversationListItem {
  id: string
  patient_name: string | null
  patient_phone: string | null
  patient_email: string | null
  channel: string
  ai_paused: boolean
  is_active: boolean
  created_at: string
  transcript: Array<{ role: string; content: string; timestamp?: string }>
}

interface MessageItem {
  id: string
  sender_type: "patient" | "ai" | "doctor"
  content: string
  created_at: string
}

export default function LiveChatPage() {
  const [conversations, setConversations] = useState<ConversationListItem[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [messages, setMessages] = useState<MessageItem[]>([])
  const [replyText, setReplyText] = useState("")
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => { loadConversations() }, [])

  useEffect(() => {
    if (selectedId) loadMessages(selectedId)
  }, [selectedId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function loadConversations() {
    const { data } = await supabase
      .from("conversations")
      .select("id, patient_name, patient_phone, patient_email, channel, ai_paused, is_active, created_at, transcript")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(50)

    setConversations((data as ConversationListItem[]) || [])
    setLoading(false)
  }

  async function loadMessages(convId: string) {
    const { data } = await supabase
      .from("conversation_messages")
      .select("id, sender_type, content, created_at")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true })

    setMessages((data as MessageItem[]) || [])
  }

  async function handleSendReply(e: React.FormEvent) {
    e.preventDefault()
    if (!replyText.trim() || !selectedId || sending) return

    setSending(true)
    try {
      const res = await fetch("/api/doctor/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: selectedId, message: replyText }),
      })
      if (!res.ok) throw new Error("Failed to send")

      setReplyText("")
      loadMessages(selectedId)
      loadConversations()
    } catch {
      toast({ title: "Error sending reply", variant: "destructive" })
    }
    setSending(false)
  }

  async function toggleAiPause(convId: string, pause: boolean) {
    try {
      const res = await fetch("/api/doctor/reply", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: convId, aiPaused: pause }),
      })
      if (!res.ok) throw new Error("Failed")
      toast({ title: pause ? "AI paused - you're in control" : "AI resumed" })
      loadConversations()
    } catch {
      toast({ title: "Error", variant: "destructive" })
    }
  }

  const selected = conversations.find(c => c.id === selectedId)

  return (
    <div className="h-[calc(100vh-7.5rem)] flex gap-4">
      {/* Conversation List */}
      <div className="w-80 shrink-0 flex flex-col">
        <div className="mb-3">
          <h1 className="text-lg font-bold">Live Chat</h1>
          <p className="text-xs text-muted-foreground">Active conversations</p>
        </div>
        <div className="flex-1 overflow-y-auto space-y-1">
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <Card key={i}><CardContent className="p-3"><div className="h-4 w-32 bg-gray-200 rounded animate-pulse" /></CardContent></Card>
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <Card><CardContent className="p-6 text-center text-sm text-muted-foreground">No active conversations</CardContent></Card>
          ) : (
            conversations.map(conv => (
              <div
                key={conv.id}
                onClick={() => setSelectedId(conv.id)}
                className={cn(
                  "rounded-lg border p-3 cursor-pointer transition-colors",
                  selectedId === conv.id ? "border-primary bg-primary/5" : "hover:bg-muted"
                )}
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium truncate">{conv.patient_name || conv.patient_email || "Unknown"}</p>
                  {conv.ai_paused && <Badge className="bg-amber-100 text-amber-700 text-[10px]">Manual</Badge>}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-muted-foreground">{conv.channel}</span>
                  <span className="text-[10px] text-muted-foreground">{new Date(conv.created_at).toLocaleDateString()}</span>
                </div>
                {conv.transcript && conv.transcript.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    {conv.transcript[conv.transcript.length - 1]?.content}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col rounded-lg border bg-card">
        {!selectedId ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <div className="text-3xl mb-3">💬</div>
              <p>Select a conversation to view messages</p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div>
                <p className="font-medium">{selected?.patient_name || selected?.patient_email || "Unknown"}</p>
                <p className="text-xs text-muted-foreground">{selected?.patient_phone || selected?.channel}</p>
              </div>
              <div className="flex items-center gap-2">
                {selected?.ai_paused ? (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-green-600 border-green-300"
                    onClick={() => toggleAiPause(selectedId, false)}
                  >
                    Resume AI
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-amber-600 border-amber-300"
                    onClick={() => toggleAiPause(selectedId, true)}
                  >
                    Take Over
                  </Button>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && selected?.transcript ? (
                // Fallback to transcript if no individual messages
                selected.transcript.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={cn(
                      "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm",
                      msg.role === "user"
                        ? "bg-blue-100 text-blue-900 rounded-br-md"
                        : msg.content.startsWith("[Doctor]")
                        ? "bg-amber-100 text-amber-900 rounded-bl-md"
                        : "bg-gray-100 text-gray-700 rounded-bl-md"
                    )}>
                      {msg.role !== "user" && (
                        <p className="text-[10px] font-medium mb-0.5 opacity-60">
                          {msg.content.startsWith("[Doctor]") ? "You" : "AI"}
                        </p>
                      )}
                      <p className="whitespace-pre-wrap">{msg.content.replace(/^\[Doctor\] /, "")}</p>
                    </div>
                  </div>
                ))
              ) : (
                messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.sender_type === "patient" ? "justify-end" : "justify-start"}`}>
                    <div className={cn(
                      "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm",
                      msg.sender_type === "patient"
                        ? "bg-blue-100 text-blue-900 rounded-br-md"
                        : msg.sender_type === "doctor"
                        ? "bg-amber-100 text-amber-900 rounded-bl-md"
                        : "bg-gray-100 text-gray-700 rounded-bl-md"
                    )}>
                      <p className="text-[10px] font-medium mb-0.5 opacity-60">
                        {msg.sender_type === "patient" ? "Patient" : msg.sender_type === "doctor" ? "You" : "AI"}
                      </p>
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Reply input */}
            <form onSubmit={handleSendReply} className="border-t p-4">
              <div className="flex gap-2">
                <Input
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder="Type your reply..."
                  disabled={sending}
                  className="flex-1"
                />
                <Button type="submit" disabled={sending || !replyText.trim()}>
                  {sending ? "..." : "Send"}
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground mt-2">
                Sending a reply will automatically pause the AI for this conversation
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
