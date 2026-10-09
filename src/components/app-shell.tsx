import Link from 'next/link'
import type { ReactNode } from 'react'
const nav = [['Home','/'],['Client Inquiries','/inquiries'],['Operations','/operations-review'],['Reports','/reports'],['Client Education','/trends'],['Management','/management-escalations'],['Settings','/settings']] as const
export function AppShell({ children }: { children: ReactNode }) { return <><a className="skip-link" href="#main-content">Skip to content</a><header className="topbar"><div className="brand">Client Communications · Missing Piece ABA Billing</div><nav aria-label="Primary navigation">{nav.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}</nav></header><main id="main-content" className="page">{children}</main></> }
