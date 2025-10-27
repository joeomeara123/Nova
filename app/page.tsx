feature/env-contract-supabase-healthcheck
'use client'

  import { FormEvent, useState } from 'react'
  import { useSupabase } from '@/src/components/supabase-provider'

  export default function HomePage() {
    const { supabase, session } = useSupabase()
    const [email, setEmail] = useState('')
    const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
    const [message, setMessage] = useState<string | null>(null)

    const handleSignIn = async (event: FormEvent) => {
      event.preventDefault()
      setStatus('sending')
      setMessage(null)

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      })

      if (error) {
        setStatus('error')
        setMessage(error.message)
      } else {
        setStatus('sent')
        setMessage('Check your email for a magic link.')
      }
    }

    const handleSignOut = async () => {
      await supabase.auth.signOut()
    }

    return (
      <main style={{ maxWidth: 400, margin: '96px auto', fontFamily: 'system-ui' }}>
        {session ? (
          <div>
            <p>Signed in as <strong>{session.user.email}</strong></p>
            <button onClick={handleSignOut} style={{ marginTop: 16 }}>
              Sign out
            </button>
          </div>
        ) : (
          <form onSubmit={handleSignIn}>
            <h1>Sign in to Nova</h1>
            <label style={{ display: 'block', marginTop: 16 }}>
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                style={{ width: '100%', marginTop: 8 }}
              />
            </label>
            <button
              type="submit"
              disabled={status === 'sending'}
              style={{ marginTop: 24 }}
            >
              {status === 'sending' ? 'Sending…' : 'Send magic link'}
            </button>
            {message && <p style={{ marginTop: 12 }}>{message}</p>}
          </form>
        )}
      </main>
    )
  }

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
main
