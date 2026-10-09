import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { inquiryDetailHref } from '@/features/inquiries/links'

export default async function InquiriesPage(){
  const supabase=await createClient()
  const {data}=await supabase.from('client_inquiries').select('id,date_received,question_text,answer_text,clients(name),config_options!client_inquiries_status_id_fkey(label)').order('date_received',{ascending:false}).limit(100)
  return <>
    <div className="page-header"><div><h1>Client Inquiries</h1><p className="muted">Click any inquiry to view the saved details and later Operations findings.</p></div><Link className="btn" href="/inquiries/new">New Inquiry</Link></div>
    <div className="table-wrap"><table className="table"><thead><tr><th>Date</th><th>Client</th><th>Inquiry</th><th>Answer</th><th>Status</th><th></th></tr></thead><tbody>
      {(data??[]).map((row:any)=>{const href=inquiryDetailHref(row.id);return <tr key={row.id}><td>{new Date(row.date_received).toLocaleDateString()}</td><td>{row.clients?.name}</td><td><Link className="table-link" href={href}>{row.question_text}</Link></td><td>{row.answer_text||'—'}</td><td><span className="badge">{row.config_options?.label}</span></td><td><Link className="btn secondary compact" href={href}>View</Link></td></tr>})}
    </tbody></table></div>
  </>
}
