import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function OperationsReviewPage() {
  const supabase = await createClient()
  const { data=[] } = await supabase.from('operations_reviews').select('inquiry_id,created_at,client_inquiries(question_text,date_received,clients(name))').eq('review_status','pending').order('created_at')
  return <><h1>Operations Review</h1><p className="muted">Resolved inquiries awaiting human-confirmed root cause classification.</p><table className="table"><thead><tr><th>Client</th><th>Inquiry</th><th>Received</th><th></th></tr></thead><tbody>{data.map((row:any)=><tr key={row.inquiry_id}><td>{row.client_inquiries?.clients?.name}</td><td>{row.client_inquiries?.question_text}</td><td>{row.client_inquiries?.date_received ? new Date(row.client_inquiries.date_received).toLocaleDateString() : '—'}</td><td><Link className="btn" href={`/operations-review/${row.inquiry_id}`}>Review</Link></td></tr>)}</tbody></table></>
}
