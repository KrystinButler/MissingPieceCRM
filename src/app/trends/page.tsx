import { createClient } from '@/lib/supabase/server'

export default async function TrendsPage(){
  const supabase=await createClient(); const {data}=await supabase.from('trend_snapshots').select('id,as_of_date,total_inquiries,root_cause_count,percentage,trend_status,clients(name),config_options!trend_snapshots_root_cause_id_fkey(label)').order('as_of_date',{ascending:false}).limit(100)
  return <><div className="page-header"><div><h1>Client Education</h1><p className="muted">30-day root-cause trends and education/process opportunities.</p></div></div><div className="table-wrap"><table className="table"><thead><tr><th>Client</th><th>Root Cause</th><th>Count</th><th>30-Day %</th><th>Status</th><th>As Of</th></tr></thead><tbody>{(data??[]).map((r:any)=><tr key={r.id}><td>{r.clients?.name}</td><td>{r.config_options?.label}</td><td>{r.root_cause_count} / {r.total_inquiries}</td><td>{r.percentage}%</td><td><span className="badge">{r.trend_status}</span></td><td>{r.as_of_date}</td></tr>)}</tbody></table></div></>
}
