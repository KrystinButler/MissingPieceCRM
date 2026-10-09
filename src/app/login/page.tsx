import { login } from './actions'

export default async function LoginPage({ searchParams }: { searchParams: Promise<{error?:string}> }) {
  const { error } = await searchParams
  return <div className="login"><div className="card"><h1>Missing Piece CRM</h1><p className="muted">Internal ABA client communications</p>
    {error && <p role="alert">{error}</p>}
    <form action={login} className="form">
      <label className="field">Email<input name="email" type="email" required autoComplete="email" /></label>
      <label className="field">Password<input name="password" type="password" required autoComplete="current-password" /></label>
      <button className="btn" type="submit">Sign in</button>
    </form></div></div>
}
