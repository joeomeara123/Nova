import './globals.css'
  import { cookies } from 'next/headers'
  import { createServerClient } from '@/src/lib/supabase'
  import SupabaseProvider from '@/src/components/supabase-provider'

  export const metadata = {
    title: 'Nova',
    description: 'Chat with AI, plant trees.',
  }

  export default async function RootLayout({
    children,
  }: {
    children: React.ReactNode
  }) {
    const cookieStore = cookies()
    const supabase = createServerClient({
      get: (name: string) => cookieStore.get(name)?.value,
      set: () => {},
      remove: () => {},
    })
    const { data: { session } } = await supabase.auth.getSession()

    return (
      <html lang="en">
        <body>
          <SupabaseProvider initialSession={session}>
            {children}
          </SupabaseProvider>
        </body>
      </html>
    )
  }

