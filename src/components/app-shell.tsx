import Link from 'next/link'
import { signOut } from '@/features/inquiries/actions'

const links = [
  ['/', 'Home'],
  ['/inquiries', 'Client Inquiries'],
  ['/operations-review', 'Operations'],
  ['/reports', 'Reports'],
  ['/trends', 'Client Education'],
  ['/management-escalations', 'Management'],
  ['/settings', 'Settings'],
]

export function AppShell({ children }: { children: React.ReactNode }) {
  return <>
    <a className="skip" href="#main">Skip to content</a>
    <header className="topbar no-print">
      <div className="brand">Missing Piece ABA Billing</div>
      <nav className="topnav" aria-label="Primary navigation">
        {links.map(([href, label]) => <Link key={href} href={href}>{label}</Link>)}
      </nav>
      <form action={signOut}><button className="btn secondary compact" type="submit">Sign out</button></form>
    </header>
    <main className="main" id="main">{children}</main>
  </>
}
