import './globals.css'
import { AppShell } from '@/components/app-shell'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Client Communications - Missing Piece ABA Billing' }

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><AppShell>{children}</AppShell></body></html>
}
