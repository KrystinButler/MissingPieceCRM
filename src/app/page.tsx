import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const today = new Date().toISOString().slice(0,10)
  const [{ count: inquiries }, { count: open }, { count: reviews }, { count: reports }] = await Promise.all([
    supabase.from('client_inquiries').select('*',{count:'exact',head:true}).gte('date_received', `${today}T00:00:00`),
    supabase.from('client_inquiries').select('*',{count:'exact',head:true}).is('resolved_at', null),
    supabase.from('operations_reviews').select('*',{count:'exact',head:true}).eq('review_status','pending'),
    supabase.from('daily_reports').select('*',{count:'exact',head:true}).eq('report_date', today),
  ])
  const cards = [['Today’s inquiries', inquiries ?? 0],['Open inquiries',open ?? 0],['Operations review',reviews ?? 0],['Reports today',reports ?? 0]]
  return <><h1>Dashboard</h1><p className="muted">Client communications and operational follow-up.</p><div className="grid grid-4">{cards.map(([label,value])=><div className="card" key={String(label)}><div className="muted">{label}</div><div style={{fontSize:32,fontWeight:700}}>{value}</div></div>)}</div></>
}
