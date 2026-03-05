export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="container mx-auto flex h-16 items-center px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-sm font-bold text-primary-foreground">D</span>
            </div>
            <span className="text-xl font-bold">DentAI</span>
          </div>
        </div>
      </header>
      <main className="container mx-auto max-w-2xl px-4 py-8">
        {children}
      </main>
    </div>
  )
}
