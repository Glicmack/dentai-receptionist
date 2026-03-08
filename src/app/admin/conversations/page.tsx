"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"

interface ConversationRow {
  id: string
  channel: string
  patient_name: string | null
  patient_phone: string | null
  outcome: string | null
  created_at: string
  ai_paused: boolean
  clinics: { name: string }
}

export default function AdminConversationsPage() {
  const [conversations, setConversations] = useState<ConversationRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      // Use admin verify to confirm access then fetch via client
      const verifyRes = await fetch("/api/admin/verify")
      if (!verifyRes.ok) return

      const supabase = createClient()
      const { data } = await supabase
        .from("conversations")
        .select("id, channel, patient_name, patient_phone, outcome, created_at, ai_paused, clinics(name)")
        .order("created_at", { ascending: false })
        .limit(100)

      setConversations((data as unknown as ConversationRow[]) || [])
      setLoading(false)
    }
    load()
  }, [])

  const channelIcons: Record<string, string> = { chat: "💬", voice: "📞", whatsapp: "📱" }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">All Conversations</h1>
        <p className="text-gray-400 text-sm mt-1">Conversations across all doctors</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <Card key={i} className="bg-gray-800 border-gray-700">
              <CardContent className="p-4"><div className="h-5 w-48 bg-gray-700 rounded animate-pulse" /></CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map(conv => (
            <Card key={conv.id} className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{channelIcons[conv.channel] || "💬"}</span>
                    <div>
                      <p className="text-sm font-medium text-white">{conv.patient_name || "Unknown"}</p>
                      <p className="text-xs text-gray-400">{conv.patient_phone || "No phone"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="bg-gray-700 text-gray-300 text-xs">
                      {(conv.clinics as { name: string })?.name}
                    </Badge>
                    {conv.ai_paused && <Badge className="bg-amber-500/20 text-amber-300">AI Paused</Badge>}
                    {conv.outcome && <Badge className="bg-blue-500/20 text-blue-300">{conv.outcome}</Badge>}
                    <span className="text-xs text-gray-500">{new Date(conv.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
