import { createClient } from '@/lib/supabase/server'
export default async function EscalationsPage(){
 const supabase=await createClient(); const {data=[]}=await supabase.from('management_escalations').select('id,status,created_at,internal_notes,clients(name),client_inquiries(question_text)').order('created_at',{ascending:false})
 return <><h1>Management Escalations</h1><p className="muted">Internal only. These details are never included in client-facing reports.</p><table className="table"><thead><tr><th>Client</th><th>Inquiry</th><th>Status</th><th>Created</th></tr></thead><tbody>{data.map((r:any)=><tr key={r.id}><td>{r.clients?.name}</td><td>{r.client_inquiries?.question_text}</td><td><span className="badge">{r.status}</span></td><td>{new Date(r.created_at).toLocaleDateString()}</td></tr>)}</tbody></table></>
}
