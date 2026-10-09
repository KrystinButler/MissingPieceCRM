import { createClient } from '@/lib/supabase/server'
export default async function TrendsPage(){
 const supabase=await createClient(); const {data=[]}=await supabase.from('trend_snapshots').select('id,as_of_date,percentage,trend_status,clients(name),config_options!trend_snapshots_root_cause_id_fkey(label)').gte('percentage',5).order('percentage',{ascending:false}).limit(100)
 return <><h1>Client Trends & Education</h1><p className="muted">Rolling 30-day root-cause trends use all client inquiries as the denominator.</p><table className="table"><thead><tr><th>Client</th><th>Root cause</th><th>Percent</th><th>Status</th><th>As of</th></tr></thead><tbody>{data.map((r:any)=><tr key={r.id}><td>{r.clients?.name}</td><td>{r.config_options?.label}</td><td>{r.percentage}%</td><td><span className="badge">{r.trend_status}</span></td><td>{r.as_of_date}</td></tr>)}</tbody></table></>
}
