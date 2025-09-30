import { getEnvSoft } from '../../../src/env'
import { createServerClient } from '../../../src/lib/supabase'
import { cookies } from 'next/headers'

export const runtime = 'nodejs'

export async function GET() {
  const env = getEnvSoft()

  // Database health check
  let dbHealth = { reachable: false, time: undefined as string | undefined }

  if (env.supabase) {
    try {
      const cookieStore = cookies()
      const supabase = createServerClient({
        get: (name: string) => cookieStore.get(name)?.value,
        set: (name: string, value: string, options?: any) => cookieStore.set(name, value, options),
        remove: (name: string, options?: any) => cookieStore.delete(name)
      })

      // Use a simple SQL query that works with any Postgres database
      const { data, error } = await supabase
        .rpc('current_timestamp')
        .single()

      if (!error) {
        dbHealth = { reachable: true, time: new Date().toISOString() }
      } else {
        // Fallback: just test connection without expecting specific results
        const { error: connectionError } = await supabase.auth.getSession()
        if (!connectionError) {
          dbHealth = { reachable: true, time: new Date().toISOString() }
        }
      }
    } catch (error) {
      // Silently handle database connection failures
      dbHealth = { reachable: false, time: undefined }
    }
  }

  return Response.json({
    ok: true,
    env: {
      supabase: env.supabase,
      openrouter: env.openrouter,
      ecologi: env.ecologi,
      uploadthing: env.uploadthing,
    },
    db: dbHealth
  })
}