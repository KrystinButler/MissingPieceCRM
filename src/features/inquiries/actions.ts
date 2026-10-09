'use server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { buildInquiryInsert } from './payload'
export async function signOut() { const supabase = await createClient(); await supabase.auth.signOut(); redirect('/login') }
export async function createInquiry(formData: FormData) {
  if (formData.has('root_cause') || formData.has('corrective_action')) throw new Error('Root cause and corrective action are Operations-only fields.')
  const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) redirect('/login')
  const payload = buildInquiryInsert({ clientId:String(formData.get('client_id')??''), inquiryType:String(formData.get('inquiry_type')??''), question:String(formData.get('client_question')??''), status:String(formData.get('status')??'New') as 'New'|'In Progress'|'Waiting'|'Resolved', answerCategory:String(formData.get('answer_category')??'')||null, answer:String(formData.get('answer_provided')??'')||null, clientAction:String(formData.get('client_action')??'None'), clientActionNote:String(formData.get('client_action_note')??'')||null, followUpDate:String(formData.get('follow_up_date')??'')||null, userId:user.id })
  if (!payload.client_id || !payload.inquiry_type || !payload.client_question) throw new Error('Client, inquiry type, and client question are required.')
  const { data: inquiry, error } = await supabase.from('client_inquiries').insert(payload).select('id').single(); if (error) throw error
  if (payload.status === 'Resolved') { const { error: reviewError } = await supabase.from('operations_reviews').upsert({ inquiry_id: inquiry.id, review_status: 'Pending' }, { onConflict:'inquiry_id', ignoreDuplicates:true }); if (reviewError) throw reviewError }
  await supabase.from('audit_events').insert({ actor_id:user.id, entity_type:'client_inquiry', entity_id:inquiry.id, action:'created', after_data:payload })
  revalidatePath('/inquiries'); revalidatePath('/operations-review'); redirect(`/inquiries/${inquiry.id}`)
}
