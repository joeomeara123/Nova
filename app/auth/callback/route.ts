import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@/src/lib/supabase'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(`${origin}/?error=missing_code`)
  }

  const cookieStore = cookies()
  const supabase = createServerClient({
    get: (name: string) => cookieStore.get(name)?.value,
    set: (name: string, value: string, options?: any) => cookieStore.set(name, value, options),
    remove: (name: string, options?: any) => cookieStore.delete(name),
  })

  await supabase.auth.exchangeCodeForSession(code)

  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    await supabase
      .from('profiles')
      .upsert({ id: user.id, email: user.email ?? null }, { onConflict: 'id' })
  }

  return NextResponse.redirect(`${origin}/`)
}

