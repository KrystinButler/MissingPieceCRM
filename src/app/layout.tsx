import './globals.css'
import { AppShell } from '@/components/app-shell'
import { createClient } from '@/lib/supabase/server'

export const metadata = { title: 'Missing Piece CRM', description: 'ABA Client Communications' }

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return <html lang="en"><body>{user ? <AppShell>{children}</AppShell> : children}</body></html>
}
