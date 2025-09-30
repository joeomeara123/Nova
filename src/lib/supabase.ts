import { createBrowserClient as createBrowserClientBase, createServerClient as createServerClientBase } from '@supabase/ssr'
import { getEnvStrict } from '../env'

/**
 * Create a Supabase client for browser use
 */
export function createBrowserClient() {
  const env = getEnvStrict(['supabase'])

  return createBrowserClientBase(
    env.NEXT_PUBLIC_SUPABASE_URL!,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

/**
 * Create a Supabase client for server use (API routes)
 */
export function createServerClient(cookies: {
  get: (name: string) => string | undefined
  set: (name: string, value: string, options?: any) => void
  remove: (name: string, options?: any) => void
}) {
  const env = getEnvStrict(['supabase'])

  return createServerClientBase(
    env.NEXT_PUBLIC_SUPABASE_URL!,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies,
    }
  )
}