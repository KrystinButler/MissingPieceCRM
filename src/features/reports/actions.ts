'use server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function generateMonthlyReport(formData:FormData){
  const clientId=String(formData.get('client_id')??'').trim(); const month=String(formData.get('month')??'').trim()
  if(!clientId||!/^[0-9a-f-]{36}$/i.test(clientId)) throw new Error('A valid client is required.')
  if(!/^\d{4}-\d{2}$/.test(month)) throw new Error('A valid report month is required.')
  const supabase=await createClient(); const {data:{user}}=await supabase.auth.getUser(); if(!user) redirect('/login')
  const start=`${month}-01`; const next=new Date(`${start}T00:00:00Z`); next.setUTCMonth(next.getUTCMonth()+1); const end=next.toISOString().slice(0,10)
  const [{data:client},{data:inquiries=[]}]=await Promise.all([
    supabase.from('clients').select('name').eq('id',clientId).single(),
    supabase.from('client_inquiries').select('id,status_id,question_text,answer_text,date_received').eq('client_id',clientId).gte('date_received',`${start}T00:00:00Z`).lt('date_received',`${end}T00:00:00Z`).order('date_received')])
  const narrative=`${client?.name??'Client'} had ${(inquiries??[]).length} documented client inquiries during ${month}. This report summarizes the communication activity recorded in Missing Piece CRM.`
  const {error}=await supabase.from('monthly_reports').upsert({client_id:clientId,month_start:start,narrative,status:'draft',generated_by:user.id,generated_at:new Date().toISOString(),updated_at:new Date().toISOString()},{onConflict:'client_id,month_start'}); if(error)throw error
  revalidatePath('/reports'); redirect(`/reports?client=${encodeURIComponent(clientId)}&month=${month}`)
}
