import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { completeOperationsReview } from '@/features/operations-review/actions'

export default async function OperationsReviewDetailPage({params}:{params:Promise<{inquiryId:string}>}){
  const {inquiryId}=await params; const supabase=await createClient(); const {data:inquiry}=await supabase.from('client_inquiries').select('id,inquiry_type_id,question_text,answer_text,date_received,clients(name)').eq('id',inquiryId).maybeSingle(); if(!inquiry)notFound()
  const [{data:mappings},{data:actions}]=await Promise.all([supabase.from('inquiry_root_cause_mappings').select('root_cause_id,config_options!inquiry_root_cause_mappings_root_cause_id_fkey(label)').eq('inquiry_type_id',inquiry.inquiry_type_id),supabase.from('config_options').select('id,label').eq('kind','corrective_action').eq('active',true).order('sort_order')])
  return <><div className="page-header"><div><h1>Operations Review</h1><p className="muted">Classify why this resolved inquiry occurred.</p></div><Link className="btn secondary" href={`/inquiries/${inquiryId}`}>View Inquiry</Link></div>
    <section className="card"><p><strong>Client:</strong> {(inquiry as any).clients?.name}</p><p><strong>Inquiry:</strong> {inquiry.question_text}</p><p><strong>Answer:</strong> {inquiry.answer_text||'—'}</p></section>
    <form action={completeOperationsReview} className="form card section"><input type="hidden" name="inquiry_id" value={inquiryId}/><label className="field">Root cause<select name="root_cause_id" required><option value="">Select root cause</option>{(mappings??[]).map((x:any)=><option key={x.root_cause_id} value={x.root_cause_id}>{x.config_options?.label}</option>)}</select></label><label className="field">Root-cause notes<textarea name="root_cause_notes" rows={4}/></label><label className="field">Corrective action override (optional)<select name="corrective_action_id"><option value="">Use mapped corrective action</option>{(actions??[]).map((x:any)=><option key={x.id} value={x.id}>{x.label}</option>)}</select></label><label className="field">Override reason<textarea name="override_reason" rows={2}/></label><button className="btn" type="submit">Complete Operations Review</button></form>
  </>
}
