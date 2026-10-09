import { createClient } from '@/lib/supabase/server'
export default async function SettingsPage(){
 const supabase=await createClient(); const {data=[]}=await supabase.from('config_options').select('id,kind,label,active,sort_order').order('kind').order('sort_order')
 return <><h1>Settings</h1><p className="muted">Database-backed option catalogs. Admin mutation controls are the next UI layer; historical records retain their original option IDs.</p><table className="table"><thead><tr><th>Kind</th><th>Label</th><th>Active</th></tr></thead><tbody>{data.map((r:any)=><tr key={r.id}><td>{r.kind}</td><td>{r.label}</td><td>{r.active?'Yes':'No'}</td></tr>)}</tbody></table></>
}
