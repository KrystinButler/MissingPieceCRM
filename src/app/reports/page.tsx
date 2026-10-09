import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { normalizeClientFilter } from '@/features/reports/filter'
import { generateMonthlyReport } from '@/features/reports/actions'

export default async function ReportsPage({searchParams}:{searchParams:Promise<{client?:string|string[];month?:string|string[]}>}){
  const params=await searchParams; const rawClient=Array.isArray(params.client)?params.client[0]:params.client; const selectedClientId=normalizeClientFilter(rawClient)
  const rawMonth=Array.isArray(params.month)?params.month[0]:params.month; const month=/^\d{4}-\d{2}$/.test(rawMonth??'')?rawMonth!:new Date().toISOString().slice(0,7)
  const start=`${month}-01`; const next=new Date(`${start}T00:00:00Z`); next.setUTCMonth(next.getUTCMonth()+1); const end=next.toISOString().slice(0,10)
  const supabase=await createClient(); const {data:clients=[]}=await supabase.from('clients').select('id,name').eq('active',true).order('name')
  let daily=supabase.from('daily_reports').select('id,client_id,report_date,status,narrative,clients(name)').gte('report_date',start).lt('report_date',end).order('report_date',{ascending:false}).limit(100)
  let monthly=supabase.from('monthly_reports').select('id,client_id,month_start,status,narrative,clients(name)').eq('month_start',start).order('generated_at',{ascending:false})
  if(selectedClientId){daily=daily.eq('client_id',selectedClientId);monthly=monthly.eq('client_id',selectedClientId)}
  const [{data:dailyReports=[]},{data:monthlyReports=[]}]=await Promise.all([daily,monthly]); const selectedClient=(clients??[]).find((x:any)=>x.id===selectedClientId)
  return <>
    <div className="page-header"><div><h1>Reports</h1><p className="muted">Client inquiry tracking and client-safe communications.</p></div></div>
    <form className="card filter-bar" method="get"><label className="field">Client<select name="client" defaultValue={selectedClientId??''}><option value="">All clients</option>{(clients??[]).map((x:any)=><option key={x.id} value={x.id}>{x.name}</option>)}</select></label><label className="field">Month<input name="month" type="month" defaultValue={month}/></label><button className="btn" type="submit">Apply Filter</button>{(selectedClientId||params.month)&&<Link className="btn secondary" href="/reports">Clear</Link>}</form>
    <section className="card"><div className="page-header"><div><h2>Monthly Client Report{selectedClient?` — ${selectedClient.name}`:''}</h2><p className="muted">Generate only for the selected client and month.</p></div></div>{selectedClientId?<form action={generateMonthlyReport} className="actions"><input type="hidden" name="client_id" value={selectedClientId}/><input type="hidden" name="month" value={month}/><button className="btn" type="submit">Generate Monthly Report</button></form>:<p className="muted">Select one client above to generate a monthly report.</p>}
      {(monthlyReports??[]).map((r:any)=><div className="section" key={r.id}><strong>{r.clients?.name} — {r.month_start}</strong> <span className="badge">{r.status}</span><p>{r.narrative||'Draft report generated.'}</p></div>)}</section>
    <section className="section"><h2>Daily Reports{selectedClient?` — ${selectedClient.name}`:''}</h2><div className="table-wrap"><table className="table"><thead><tr><th>Date</th><th>Client</th><th>Status</th><th>Summary</th></tr></thead><tbody>{(dailyReports??[]).length?(dailyReports??[]).map((r:any)=><tr key={r.id}><td>{r.report_date}</td><td>{r.clients?.name}</td><td><span className="badge">{r.status}</span></td><td>{r.narrative||'—'}</td></tr>):<tr><td colSpan={4} className="muted">No reports found for this client/month filter.</td></tr>}</tbody></table></div></section>
  </>
}
