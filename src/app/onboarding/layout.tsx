export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-blue-50/30">
      <div className="absolute inset-0 bg-grid opacity-30" />
      <header className="relative border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 shadow-md">
              <span className="text-sm font-bold text-white">D</span>
            </div>
            <span className="text-xl font-bold">DentAI</span>
          </div>
        </div>
      </header>
      <main className="relative container mx-auto max-w-2xl px-4 py-8">
        {children}
      </main>
    </div>
  )
}
