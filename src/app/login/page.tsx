import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { login } from './actions'

type LoginPageProps = { searchParams: Promise<{ error?: string; next?: string }> }
export default async function LoginPage({ searchParams }: LoginPageProps) {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  if (data?.claims?.sub) redirect('/')
  const params = await searchParams
  return <main style={{ maxWidth: 420, margin: '12vh auto', padding: 24 }}><h1>Missing Piece CRM</h1><p>Sign in to continue.</p>{params.error ? <p role="alert">{params.error}</p> : null}<form action={login} style={{ display: 'grid', gap: 12 }}><input type="hidden" name="next" value={params.next ?? '/'} /><label>Email<input name="email" type="email" autoComplete="email" required /></label><label>Password<input name="password" type="password" autoComplete="current-password" required /></label><button type="submit">Sign in</button></form></main>
}
