"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"

interface AdminEntry {
  id: string
  email: string
  full_name: string | null
  created_at: string
}

export default function AdminSettingsPage() {
  const [admins, setAdmins] = useState<AdminEntry[]>([])
  const [, setLoading] = useState(true)
  const [newEmail, setNewEmail] = useState("")
  const [newName, setNewName] = useState("")
  const [adding, setAdding] = useState(false)
  const { toast } = useToast()

  useEffect(() => { loadAdmins() }, [])

  async function loadAdmins() {
    const res = await fetch("/api/admin/admins")
    const data = await res.json()
    setAdmins(data.admins || [])
    setLoading(false)
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setAdding(true)
    try {
      const res = await fetch("/api/admin/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newEmail, full_name: newName || null }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      toast({ title: "Admin added" })
      setNewEmail("")
      setNewName("")
      loadAdmins()
    } catch (err) {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" })
    }
    setAdding(false)
  }

  async function handleRemove(id: string) {
    const res = await fetch(`/api/admin/admins?id=${id}`, { method: "DELETE" })
    if (res.ok) {
      toast({ title: "Admin removed" })
      loadAdmins()
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Platform Settings</h1>
        <p className="text-gray-400 text-sm mt-1">Manage admin access</p>
      </div>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Admin Emails</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleAdd} className="flex gap-3">
            <Input className="bg-gray-700 border-gray-600 text-white" placeholder="Email" type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} required />
            <Input className="bg-gray-700 border-gray-600 text-white" placeholder="Name (optional)" value={newName} onChange={e => setNewName(e.target.value)} />
            <Button type="submit" className="bg-purple-600 hover:bg-purple-700 shrink-0" disabled={adding}>
              {adding ? "..." : "Add"}
            </Button>
          </form>

          <div className="space-y-2">
            {admins.map(admin => (
              <div key={admin.id} className="flex items-center justify-between rounded-lg bg-gray-700/50 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-white">{admin.full_name || admin.email}</p>
                  <p className="text-xs text-gray-400">{admin.email}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  onClick={() => handleRemove(admin.id)}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
