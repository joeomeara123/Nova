'use client'

  import { createContext, useContext, useEffect, useMemo, useState } from 'react'
  import type { Session, SupabaseClient } from '@supabase/supabase-js'
  import { createBrowserClient } from '@/src/lib/supabase'

  type SupabaseContextValue = {
    supabase: SupabaseClient
    session: Session | null
    setSession: (session: Session | null) => void
  }

  const SupabaseContext = createContext<SupabaseContextValue | undefined>(undefined)

  export default function SupabaseProvider({
    children,
    initialSession,
  }: {
    children: React.ReactNode
    initialSession: Session | null
  }) {
    const [session, setSession] = useState<Session | null>(initialSession)
    const supabase = useMemo(() => createBrowserClient(), [])

    useEffect(() => {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, nextSession) => {
        setSession(nextSession)
      })

      return () => subscription.unsubscribe()
    }, [supabase])

    const value = useMemo(
      () => ({ supabase, session, setSession }),
      [supabase, session]
    )

    return <SupabaseContext.Provider value={value}>{children}</SupabaseContext.Provider>
  }

  export function useSupabase() {
    const ctx = useContext(SupabaseContext)
    if (!ctx) {
      throw new Error('useSupabase must be used within SupabaseProvider')
    }
    return ctx
  }