import { createClient } from '@/lib/supabase/server'

export default async function ManagementEscalationsPage(){
  const supabase=await createClient(); const {data}=await supabase.from('management_escalations').select('id,status,created_at,internal_notes,clients(name),client_inquiries(question_text)').order('created_at',{ascending:false})
  return <><div className="page-header"><div><h1>Management</h1><p className="muted">Internal-only follow-up failures and management escalations. These details are excluded from client reports.</p></div></div><div className="table-wrap"><table className="table"><thead><tr><th>Client</th><th>Inquiry</th><th>Status</th><th>Created</th><th>Internal Notes</th></tr></thead><tbody>{(data??[]).map((r:any)=><tr key={r.id}><td>{r.clients?.name}</td><td>{r.client_inquiries?.question_text}</td><td><span className="badge">{r.status}</span></td><td>{new Date(r.created_at).toLocaleString()}</td><td>{r.internal_notes||'—'}</td></tr>)}</tbody></table></div></>
}
