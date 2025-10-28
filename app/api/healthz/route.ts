import { cookies } from 'next/headers'
  import { createServerClient } from '@/src/lib/supabase'
  import { getEnvSoft } from '@/src/env'

  export const runtime = 'nodejs'

  export async function GET() {
    const env = getEnvSoft()

    let dbHealth = { reachable: false, time: undefined as string | undefined }

    if (env.supabase) {
      try {
        const cookieStore = cookies()
        const supabase = createServerClient({
          get: (name: string) => cookieStore.get(name)?.value,
          set: (name: string, value: string, options?: any) =>
            cookieStore.set(name, value, options),
          remove: (name: string, options?: any) => cookieStore.delete(name),
        })

        const { error } = await supabase.rpc('current_timestamp').single()

        if (!error) {
          dbHealth = { reachable: true, time: new Date().toISOString() }
        } else {
          const { error: connectionError } = await supabase.auth.getSession()
          if (!connectionError) {
            dbHealth = { reachable: true, time: new Date().toISOString() }
          }
        }
      } catch {
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
      db: dbHealth,
    })
  }