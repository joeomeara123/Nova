import type { Metadata } from 'next'
  import { cookies } from 'next/headers'
  import './globals.css'
  import { Inter } from 'next/font/google'
  import { createServerClient } from '@/src/lib/supabase'
  import SupabaseProvider from '@/src/components/supabase-provider'

  const inter = Inter({ subsets: ['latin'] })

  export const metadata: Metadata = {
    title: 'Nova - Chat with AI, Plant Trees',
    description: 'An LLM chat web app that plants trees as you use it—like Ecosia for AI.',
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
    const {
      data: { session },
    } = await supabase.auth.getSession()

    return (
      <html lang="en">
        <body className={inter.className}>
          <SupabaseProvider initialSession={session}>{children}</SupabaseProvider>
        </body>
      </html>
    )
  }