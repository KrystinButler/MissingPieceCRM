'use server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function createInquiry(formData: FormData) {
  const forbidden = ['root_cause_id','corrective_action_id']
  if (forbidden.some((key) => formData.has(key))) throw new Error('Root cause and corrective action are Operations-only fields.')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const statusId = String(formData.get('status_id') ?? '')
  const { data: status } = await supabase.from('config_options').select('code').eq('id', statusId).single()
  const payload = {
    client_id: String(formData.get('client_id')),
    inquiry_type_id: String(formData.get('inquiry_type_id')),
    question_text: String(formData.get('question_text') ?? '').trim(),
    assigned_employee_id: user.id,
    status_id: statusId,
    answer_category_id: formData.get('answer_category_id') ? String(formData.get('answer_category_id')) : null,
    answer_text: String(formData.get('answer_text') ?? '').trim() || null,
    client_action_id: formData.get('client_action_id') ? String(formData.get('client_action_id')) : null,
    client_action_note: String(formData.get('client_action_note') ?? '').trim() || null,
    follow_up_date: formData.get('follow_up_date') ? String(formData.get('follow_up_date')) : null,
    resolved_at: status?.code === 'resolved' ? new Date().toISOString() : null,
    created_by: user.id,
    updated_by: user.id,
  }
  const { data: inquiry, error } = await supabase.from('client_inquiries').insert(payload).select('id').single()
  if (error) throw error

  if (status?.code === 'resolved') {
    const { error: reviewError } = await supabase.from('operations_reviews').upsert(
      { inquiry_id: inquiry.id, review_status: 'pending' },
      { onConflict: 'inquiry_id', ignoreDuplicates: true },
    )
    if (reviewError) throw reviewError
  }

  await supabase.from('audit_events').insert({ actor_id:user.id, entity_type:'client_inquiry', entity_id:inquiry.id, action:'created', after_data:payload })
  revalidatePath('/inquiries')
  revalidatePath('/operations-review')
  redirect(`/inquiries/${inquiry.id}`)
}
