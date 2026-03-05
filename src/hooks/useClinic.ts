"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Clinic } from "@/types"

export function useClinic() {
  const [clinic, setClinic] = useState<Clinic | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function getClinic() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      const { data: userData } = await supabase
        .from("users")
        .select("clinic_id")
        .eq("id", user.id)
        .single()

      if (!userData?.clinic_id) {
        setLoading(false)
        return
      }

      const { data } = await supabase
        .from("clinics")
        .select("*")
        .eq("id", userData.clinic_id)
        .single()

      setClinic(data)
      setLoading(false)
    }

    getClinic()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function refetch() {
    if (!clinic) return
    const { data } = await supabase
      .from("clinics")
      .select("*")
      .eq("id", clinic.id)
      .single()
    if (data) setClinic(data)
  }

  return { clinic, loading, refetch }
}
