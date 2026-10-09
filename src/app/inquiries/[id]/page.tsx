import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

async function labelFor(supabase: any, id?: string | null) {
  if (!id) return null
  const { data } = await supabase.from('config_options').select('label').eq('id', id).maybeSingle()
  return data?.label ?? null
}

export default async function InquiryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: inquiry } = await supabase.from('client_inquiries').select('*').eq('id', id).maybeSingle()
  if (!inquiry) notFound()

  const [{ data: client }, { data: review }, inquiryType, status, answerCategory, clientAction] = await Promise.all([
    supabase.from('clients').select('name').eq('id', inquiry.client_id).maybeSingle(),
    supabase.from('operations_reviews').select('*').eq('inquiry_id', id).maybeSingle(),
    labelFor(supabase, inquiry.inquiry_type_id),
    labelFor(supabase, inquiry.status_id),
    labelFor(supabase, inquiry.answer_category_id),
    labelFor(supabase, inquiry.client_action_id),
  ])

  const [rootCause, correctiveAction] = await Promise.all([
    labelFor(supabase, review?.root_cause_id),
    labelFor(supabase, review?.corrective_action_id),
  ])

  const item = (label:string, value:any) => <div className="detail-item"><span className="detail-label">{label}</span><div className="detail-value">{value || '—'}</div></div>

  return <>
    <div className="page-header"><div><h1>Inquiry Details</h1><p className="muted">Saved communication record and subsequent Operations classification.</p></div><Link className="btn secondary" href="/inquiries">Back to Inquiries</Link></div>
    <section className="card">
      <div className="detail-grid">
        {item('Client', client?.name)}
        {item('Date received', new Date(inquiry.date_received).toLocaleString())}
        {item('Inquiry type', inquiryType)}
        {item('Status', status)}
        {item('Client question / inquiry', inquiry.question_text)}
        {item('Answer category', answerCategory)}
        {item('Answer / resolution', inquiry.answer_text)}
        {item('Client action', clientAction)}
        {item('Client action note', inquiry.client_action_note)}
        {item('Follow-up date', inquiry.follow_up_date)}
        {item('Resolved', inquiry.resolved_at ? new Date(inquiry.resolved_at).toLocaleString() : null)}
      </div>
    </section>
    <section className="card section">
      <h2>Operations Review</h2>
      {!review ? <p className="muted">No Operations Review has been created for this inquiry yet.</p> : <div className="detail-grid">
        {item('Review status', review.review_status)}
        {item('Root cause', rootCause)}
        {item('Root-cause notes', review.root_cause_notes)}
        {item('Corrective action', correctiveAction)}
        {item('Routed queue', review.routed_queue)}
        {item('Reviewed', review.reviewed_at ? new Date(review.reviewed_at).toLocaleString() : null)}
      </div>}
    </section>
  </>
}
