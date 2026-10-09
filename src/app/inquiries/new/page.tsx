import { createClient } from '@/lib/supabase/server'
import { createInquiry } from '@/features/inquiries/actions'

export default async function NewInquiryPage() {
  const supabase = await createClient()
  const [{data:clients=[]},{data:types=[]},{data:statuses=[]},{data:actions=[]},{data:answers=[]}] = await Promise.all([
    supabase.from('clients').select('id,name').eq('active',true).order('name'),
    supabase.from('config_options').select('id,label').eq('kind','inquiry_type').eq('active',true).order('sort_order'),
    supabase.from('config_options').select('id,label,code').eq('kind','status').eq('active',true).order('sort_order'),
    supabase.from('config_options').select('id,label').eq('kind','client_action').eq('active',true).order('sort_order'),
    supabase.from('config_options').select('id,label').eq('kind','answer_category').eq('active',true).order('sort_order'),
  ])
  return <><h1>New Client Inquiry</h1><p className="muted">Document what the client asked and what was communicated. Operations determines root cause after resolution.</p>
    <form action={createInquiry} className="form">
      <label className="field">Client<select name="client_id" required><option value="">Select client</option>{clients.map((x:any)=><option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
      <label className="field">Inquiry type<select name="inquiry_type_id" required><option value="">Select type</option>{types.map((x:any)=><option key={x.id} value={x.id}>{x.label}</option>)}</select></label>
      <label className="field">Client question / inquiry<textarea name="question_text" rows={4} required /></label>
      <label className="field">Answer category<select name="answer_category_id"><option value="">Select answer</option>{answers.map((x:any)=><option key={x.id} value={x.id}>{x.label}</option>)}</select></label>
      <label className="field">Answer / resolution<textarea name="answer_text" rows={4} /></label>
      <label className="field">Client action<select name="client_action_id"><option value="">Select action</option>{actions.map((x:any)=><option key={x.id} value={x.id}>{x.label}</option>)}</select></label>
      <label className="field">Client action note<textarea name="client_action_note" rows={2} /></label>
      <label className="field">Follow-up date<input name="follow_up_date" type="date" /></label>
      <label className="field">Status<select name="status_id" required>{statuses.map((x:any)=><option key={x.id} value={x.id}>{x.label}</option>)}</select></label>
      <button className="btn" type="submit">Save inquiry</button>
    </form></>
}
