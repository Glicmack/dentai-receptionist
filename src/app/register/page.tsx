"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

export default function RegisterPage() {
  const [clinicName, setClinicName] = useState("")
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      // 1. Call server-side registration API (uses admin client, bypasses RLS)
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clinicName, fullName, email, password }),
      })

      const result = await response.json()

      if (!response.ok) {
        toast({
          title: "Registration failed",
          description: result.error || "Could not create account",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      // 2. Sign in on the client side to establish the browser session
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        toast({
          title: "Account created but sign-in failed",
          description: "Please go to the login page and sign in manually.",
          variant: "destructive",
        })
        setLoading(false)
        router.push("/login")
        return
      }

      toast({
        title: "Account created!",
        description: "Let's set up your clinic.",
      })

      router.push("/onboarding")
      router.refresh()
    } catch {
      toast({
        title: "Registration failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <span className="text-lg font-bold text-primary-foreground">D</span>
          </div>
          <CardTitle className="text-2xl">Start your free trial</CardTitle>
          <CardDescription>Set up your AI receptionist in under 10 minutes</CardDescription>
        </CardHeader>
        <form onSubmit={handleRegister}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="clinicName">Clinic name</Label>
              <Input
                id="clinicName"
                type="text"
                placeholder="Bright Smile Dental"
                value={clinicName}
                onChange={(e) => setClinicName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fullName">Your name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Dr. Jane Smith"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@clinic.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating account..." : "Create Account"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
