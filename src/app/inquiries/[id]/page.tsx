import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

type Inquiry = { id:string; date_received:string; inquiry_type:string; client_question:string; status:string; answer_category:string|null; answer_provided:string|null; client_action:string; client_action_note:string|null; follow_up_date:string|null; resolved_date:string|null; clients:{name:string}|null; operations_reviews:{review_status:string;root_cause:string|null;root_cause_notes:string|null;corrective_action:string|null;reviewed_at:string|null}[]|null }

export default async function InquiryDetailPage({ params }:{ params:Promise<{id:string}> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data, error } = await supabase.from('client_inquiries').select('id,date_received,inquiry_type,client_question,status,answer_category,answer_provided,client_action,client_action_note,follow_up_date,resolved_date,clients(name),operations_reviews(review_status,root_cause,root_cause_notes,corrective_action,reviewed_at)').eq('id', id).maybeSingle()
  if (error) throw error
  if (!data) notFound()
  const inquiry = data as unknown as Inquiry
  const review = inquiry.operations_reviews?.[0]
  return <>
    <div className="page-header"><div><h1>Inquiry Details</h1><div className="muted">Saved inquiry record and Operations outcome</div></div><div className="actions"><Link className="button secondary" href="/inquiries">Back to Inquiries</Link>{inquiry.status === 'Resolved' && review?.review_status !== 'Completed' ? <Link className="button" href={`/operations-review/${inquiry.id}`}>Operations Review</Link> : null}</div></div>
    <section className="card"><dl className="detail-grid"><dt>Client</dt><dd>{inquiry.clients?.name ?? '—'}</dd><dt>Date Received</dt><dd>{new Date(inquiry.date_received).toLocaleString()}</dd><dt>Inquiry Type</dt><dd>{inquiry.inquiry_type}</dd><dt>Status</dt><dd><span className="badge">{inquiry.status}</span></dd><dt>Client Question</dt><dd>{inquiry.client_question}</dd><dt>Answer Category</dt><dd>{inquiry.answer_category ?? '—'}</dd><dt>Answer Provided</dt><dd>{inquiry.answer_provided ?? '—'}</dd><dt>Client Action</dt><dd>{inquiry.client_action}</dd><dt>Client Action Note</dt><dd>{inquiry.client_action_note ?? '—'}</dd><dt>Follow-up Date</dt><dd>{inquiry.follow_up_date ?? '—'}</dd></dl></section>
    <section className="card"><h2>Operations Review</h2>{!review ? <p>Not yet queued for Operations Review.</p> : <dl className="detail-grid"><dt>Review Status</dt><dd>{review.review_status}</dd><dt>Root Cause</dt><dd>{review.root_cause ?? 'Pending classification'}</dd><dt>Operations Notes</dt><dd>{review.root_cause_notes ?? '—'}</dd><dt>Corrective Action</dt><dd>{review.corrective_action ?? '—'}</dd><dt>Reviewed</dt><dd>{review.reviewed_at ? new Date(review.reviewed_at).toLocaleString() : '—'}</dd></dl>}</section>
  </>
}
