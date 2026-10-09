'use server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function completeOperationsReview(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const inquiryId = String(formData.get('inquiry_id'))
  const rootCauseId = String(formData.get('root_cause_id'))
  const overrideId = formData.get('corrective_action_id') ? String(formData.get('corrective_action_id')) : null
  const { data: inquiry, error: inquiryError } = await supabase.from('client_inquiries').select('inquiry_type_id,client_id').eq('id', inquiryId).single()
  if (inquiryError) throw inquiryError

  const { data: allowed } = await supabase.from('inquiry_root_cause_mappings').select('root_cause_id').eq('inquiry_type_id', inquiry.inquiry_type_id).eq('root_cause_id', rootCauseId).maybeSingle()
  if (!allowed) throw new Error('Selected root cause is not allowed for this inquiry type.')

  const { data: mapped } = await supabase.from('corrective_action_mappings').select('corrective_action_id').eq('root_cause_id', rootCauseId).maybeSingle()
  const finalActionId = overrideId || mapped?.corrective_action_id || null
  const overridden = Boolean(overrideId && overrideId !== mapped?.corrective_action_id)

  const { data: action } = finalActionId ? await supabase.from('config_options').select('code').eq('id', finalActionId).single() : { data: null }
  let routedQueue: string | null = null
  if (action?.code === 'management_escalation') routedQueue = 'Management'
  else if (action?.code === 'payer_escalation') routedQueue = 'Payer / AR SME'
  else if (action?.code === 'system_configuration_change') routedQueue = 'Operational Owner'
  else if (action?.code === 'information_access_needed') routedQueue = 'Credentialing / Authorization / AR SME'
  else if (action?.code === 'client_education' || action?.code === 'client_process_change') routedQueue = 'Client Education SME'

  const update = {
    review_status:'completed', reviewer_id:user.id, root_cause_id:rootCauseId,
    root_cause_notes:String(formData.get('root_cause_notes') ?? '').trim() || null,
    corrective_action_id:finalActionId, corrective_action_overridden:overridden,
    corrective_action_override_reason:overridden ? String(formData.get('override_reason') ?? '').trim() || null : null,
    routed_queue:routedQueue || 'Unassigned', reviewed_at:new Date().toISOString(), updated_at:new Date().toISOString(),
  }
  const { error } = await supabase.from('operations_reviews').update(update).eq('inquiry_id', inquiryId)
  if (error) throw error
  await supabase.from('audit_events').insert({ actor_id:user.id, entity_type:'operations_review', entity_id:inquiryId, action:'completed', after_data:update })

  const { data: rootCause } = await supabase.from('config_options').select('code').eq('id', rootCauseId).single()
  if (rootCause?.code === 'internal_follow_up_failure') {
    await supabase.from('management_escalations').upsert({ inquiry_id:inquiryId, client_id:inquiry.client_id, status:'open' }, { onConflict:'inquiry_id', ignoreDuplicates:true })
  }

  revalidatePath('/operations-review')
  revalidatePath('/management-escalations')
  redirect('/operations-review')
}
