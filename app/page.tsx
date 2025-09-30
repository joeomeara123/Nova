export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Nova
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Chat with AI, Plant Trees
          </p>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Nova is an LLM chat web app that plants trees as you use it—like Ecosia for AI.
            Every conversation helps grow forests while you get AI assistance.
          </p>
        </div>
      </div>
    </main>
  )
}