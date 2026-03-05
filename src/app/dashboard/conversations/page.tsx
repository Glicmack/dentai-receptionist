"use client"

import { useEffect, useState, useCallback } from "react"
import { useClinic } from "@/hooks/useClinic"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import type { Conversation, TranscriptMessage } from "@/types"

export default function ConversationsPage() {
  const { clinic, loading: clinicLoading } = useClinic()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<Conversation | null>(null)

  const fetchConversations = useCallback(async () => {
    const params = new URLSearchParams()
    if (filter !== "all") params.set("channel", filter)
    if (search) params.set("search", search)

    const response = await fetch(`/api/conversations?${params}`)
    if (response.ok) {
      const data = await response.json()
      setConversations(data)
    }
    setLoading(false)
  }, [filter, search])

  useEffect(() => {
    if (!clinic) return
    fetchConversations()
  }, [clinic, filter, search, fetchConversations])

  if (clinicLoading || loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16" />)}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Conversations</h1>
        <p className="text-muted-foreground">All patient conversations via chat and voice</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex gap-2">
          {["all", "chat", "voice"].map((ch) => (
            <Button key={ch} variant={filter === ch ? "default" : "outline"} size="sm" onClick={() => setFilter(ch)}>
              {ch === "all" ? "All" : ch === "chat" ? "Chat" : "Voice"}
            </Button>
          ))}
        </div>
        <Input
          placeholder="Search by name or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{conversations.length} conversation{conversations.length !== 1 ? "s" : ""}</CardTitle>
        </CardHeader>
        <CardContent>
          {conversations.length === 0 ? (
            <p className="text-sm text-muted-foreground">No conversations found.</p>
          ) : (
            <div className="space-y-2">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  className="flex w-full items-center justify-between rounded-lg border p-4 text-left hover:bg-muted/50 transition-colors"
                  onClick={() => setSelected(conv)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{conv.channel === "voice" ? "📞" : "💬"}</span>
                    <div>
                      <p className="font-medium">{conv.patient_name || "Unknown Patient"}</p>
                      <p className="text-xs text-muted-foreground">
                        {conv.patient_phone || "No phone"} - {new Date(conv.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {conv.duration_seconds && (
                      <span className="text-xs text-muted-foreground">
                        {Math.floor(conv.duration_seconds / 60)}:{(conv.duration_seconds % 60).toString().padStart(2, "0")}
                      </span>
                    )}
                    {conv.outcome && (
                      <Badge variant={conv.outcome === "booked" ? "default" : "secondary"}>
                        {conv.outcome.replace("_", " ")}
                      </Badge>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Conversation detail sheet */}
      <Sheet open={!!selected} onOpenChange={() => setSelected(null)}>
        <SheetContent className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Conversation Details</SheetTitle>
          </SheetHeader>
          {selected && (
            <div className="mt-4 space-y-4">
              <div className="rounded-lg border p-3 space-y-1">
                <p className="text-sm"><span className="font-medium">Patient:</span> {selected.patient_name || "Unknown"}</p>
                <p className="text-sm"><span className="font-medium">Phone:</span> {selected.patient_phone || "N/A"}</p>
                <p className="text-sm"><span className="font-medium">Channel:</span> {selected.channel}</p>
                <p className="text-sm"><span className="font-medium">Date:</span> {new Date(selected.created_at).toLocaleString()}</p>
                {selected.outcome && (
                  <p className="text-sm"><span className="font-medium">Outcome:</span> <Badge>{selected.outcome}</Badge></p>
                )}
                {selected.summary && (
                  <p className="text-sm"><span className="font-medium">Summary:</span> {selected.summary}</p>
                )}
              </div>

              <h3 className="font-medium">Transcript</h3>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3 pr-4">
                  {(selected.transcript || []).map((msg: TranscriptMessage, i: number) => (
                    <div
                      key={i}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                          msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
