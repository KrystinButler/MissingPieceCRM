'use server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { defaultCorrectiveAction } from './mapping'
export async function completeOperationsReview(formData: FormData) {
  const supabase=await createClient(); const {data:{user}}=await supabase.auth.getUser(); if(!user) redirect('/login')
  const inquiryId=String(formData.get('inquiry_id')??''); const rootCause=String(formData.get('root_cause')??'').trim(); const selectedAction=String(formData.get('corrective_action')??'').trim(); const mappedAction=defaultCorrectiveAction(rootCause); const finalAction=selectedAction||mappedAction; const overridden=Boolean(selectedAction&&selectedAction!==mappedAction); if(!inquiryId||!rootCause) throw new Error('Inquiry and root cause are required.')
  const {data:inquiry,error:inquiryError}=await supabase.from('client_inquiries').select('client_id').eq('id',inquiryId).single(); if(inquiryError) throw inquiryError
  const update={review_status:'Completed',reviewer_id:user.id,root_cause:rootCause,root_cause_notes:String(formData.get('root_cause_notes')??'').trim()||null,corrective_action:finalAction,corrective_action_override:overridden,override_reason:overridden?String(formData.get('override_reason')??'').trim()||null:null,reviewed_at:new Date().toISOString(),updated_at:new Date().toISOString()}
  const {error}=await supabase.from('operations_reviews').update(update).eq('inquiry_id',inquiryId); if(error) throw error
  if(rootCause==='Internal Follow-Up Failure'){const {error:escalationError}=await supabase.from('management_escalations').upsert({inquiry_id:inquiryId,client_id:inquiry.client_id,reason:'Internal Follow-Up Failure',status:'Open'},{onConflict:'inquiry_id,reason',ignoreDuplicates:true});if(escalationError)throw escalationError}
  await supabase.from('audit_events').insert({actor_id:user.id,entity_type:'operations_review',entity_id:inquiryId,action:'completed',after_data:update}); revalidatePath('/operations-review'); revalidatePath(`/inquiries/${inquiryId}`); revalidatePath('/management-escalations'); redirect('/operations-review')
}
