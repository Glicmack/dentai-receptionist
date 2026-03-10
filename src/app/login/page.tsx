"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    router.push("/dashboard")
    router.refresh()
  }

  return (
    <div className="flex min-h-screen">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 p-12 text-white">
        <div className="absolute inset-0 bg-grid opacity-10" />
        <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl animate-float" />
        <div className="pointer-events-none absolute -right-20 bottom-20 h-64 w-64 rounded-full bg-blue-300/20 blur-3xl animate-float" style={{ animationDelay: "3s" }} />

        <div className="relative z-10 flex flex-col justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <span className="text-lg font-bold">D</span>
            </div>
            <span className="text-2xl font-bold">DentAI</span>
          </div>

          <div className="space-y-6">
            <h2 className="text-3xl font-bold leading-tight xl:text-4xl">
              Your AI receptionist is waiting
            </h2>
            <ul className="space-y-4 text-blue-100">
              {[
                "Answer calls 24/7 with AI voice",
                "Book appointments automatically",
                "Never miss a patient again",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-sm text-blue-200">
            Trusted by 50+ dental clinics nationwide
          </p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md border-0 shadow-none lg:border lg:shadow-sm animate-scale-in">
          <CardHeader className="text-center">
            <div className="lg:hidden mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-md">
              <span className="text-lg font-bold text-white">D</span>
            </div>
            <CardTitle className="text-2xl">Welcome back</CardTitle>
            <CardDescription>Sign in to your DentAI dashboard</CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
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
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full shadow-md shadow-primary/20" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Want to set up your clinic? <a href="mailto:support@dentai.com" className="font-medium text-primary hover:underline">Contact us</a> to schedule a meeting.
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
