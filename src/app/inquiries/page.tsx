import Link from 'next/link'
import { inquiryDetailHref } from '@/features/inquiries/links'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

type Row = { id:string; date_received:string; inquiry_type:string; status:string; answer_provided:string|null; clients:{name:string}|null }

export default async function InquiriesPage() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('client_inquiries').select('id,date_received,inquiry_type,status,answer_provided,clients(name)').order('date_received', { ascending:false })
  if (error) throw error
  const inquiries = (data ?? []) as unknown as Row[]
  return <>
    <div className="page-header"><div><h1>Client Inquiries</h1><div className="muted">Record, track, and revisit client questions and responses.</div></div><Link className="button" href="/inquiries/new">New Inquiry</Link></div>
    <section className="card">{inquiries.length === 0 ? <p>No inquiries have been recorded yet.</p> : <table className="table"><thead><tr><th>Client</th><th>Received</th><th>Inquiry Type</th><th>Status</th><th>Answer / Resolution</th><th></th></tr></thead><tbody>{inquiries.map(i => <tr key={i.id}><td>{i.clients?.name ?? '—'}</td><td>{new Date(i.date_received).toLocaleDateString()}</td><td><Link href={inquiryDetailHref(i.id)}><strong>{i.inquiry_type}</strong></Link></td><td><span className="badge">{i.status}</span></td><td>{i.answer_provided ?? '—'}</td><td><Link className="button secondary" href={inquiryDetailHref(i.id)}>View</Link></td></tr>)}</tbody></table>}</section>
  </>
}
