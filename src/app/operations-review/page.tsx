import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
type ReviewRow = { id:string; inquiry_id:string; review_status:string; client_inquiries:{inquiry_type:string;client_question:string;date_received:string;clients:{name:string}|null}|null }
export default async function OperationsReviewPage() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('operations_reviews').select('id,inquiry_id,review_status,client_inquiries(inquiry_type,client_question,date_received,clients(name))').eq('review_status','Pending').order('created_at',{ascending:true})
  if (error) throw error
  const rows = (data ?? []) as unknown as ReviewRow[]
  return <><div className="page-header"><div><h1>Operations Review</h1><div className="muted">Resolved inquiries awaiting root-cause classification.</div></div></div><section className="card">{rows.length === 0 ? <p>No inquiries are waiting for Operations Review.</p> : <table className="table"><thead><tr><th>Client</th><th>Received</th><th>Inquiry Type</th><th>Inquiry</th><th></th></tr></thead><tbody>{rows.map(r => <tr key={r.id}><td>{r.client_inquiries?.clients?.name ?? '—'}</td><td>{r.client_inquiries?.date_received ? new Date(r.client_inquiries.date_received).toLocaleDateString() : '—'}</td><td>{r.client_inquiries?.inquiry_type ?? '—'}</td><td>{r.client_inquiries?.client_question ?? '—'}</td><td><Link className="button" href={`/operations-review/${r.inquiry_id}`}>Review</Link></td></tr>)}</tbody></table>}</section></>
}
