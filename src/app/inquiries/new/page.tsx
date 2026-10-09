import { createInquiry } from '@/features/inquiries/actions'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

const inquiryTypes = ['Claim Status','Denial Question','Authorization Question','Credentialing Question','Eligibility Question','Payment Question','Patient Balance Question','Documentation Question','Payer Question','Complaint / Concern']
const answerCategories = ['Acknowledged','Received','Processing','Adjudicated','Denied','Rejected','Payment Mailed','Posting Error']
const clientActions = ['None','Send Information','Correct Information','Review / Confirm','Complete Required Step','Other']

export default async function NewInquiryPage() {
  const supabase = await createClient()
  const { data: clients, error } = await supabase.from('clients').select('id,name').eq('active', true).order('name')
  if (error) throw error
  return <>
    <div className="page-header"><div><h1>New Inquiry</h1><div className="muted">Frontline staff document the question and response. Root cause is assigned later by Operations.</div></div></div>
    <form className="card" action={createInquiry}>
      <div className="toolbar">
        <div className="field"><label htmlFor="client_id">Client</label><select id="client_id" name="client_id" required><option value="">Select client</option>{clients?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
        <div className="field"><label htmlFor="inquiry_type">Inquiry Type</label><select id="inquiry_type" name="inquiry_type" required><option value="">Select type</option>{inquiryTypes.map(v => <option key={v}>{v}</option>)}</select></div>
        <div className="field"><label htmlFor="status">Status</label><select id="status" name="status" defaultValue="New"><option>New</option><option>In Progress</option><option>Waiting</option><option>Resolved</option></select></div>
      </div>
      <div className="field" style={{marginTop:16,minWidth:'100%'}}><label htmlFor="client_question">Client Question / Inquiry</label><textarea id="client_question" name="client_question" rows={4} required /></div>
      <div className="field" style={{marginTop:16}}><label htmlFor="answer_category">Answer Category</label><select id="answer_category" name="answer_category"><option value="">Select when applicable</option>{answerCategories.map(v => <option key={v}>{v}</option>)}</select></div>
      <div className="field" style={{marginTop:16,minWidth:'100%'}}><label htmlFor="answer_provided">Answer Provided</label><textarea id="answer_provided" name="answer_provided" rows={4} /></div>
      <div className="toolbar" style={{marginTop:16}}><div className="field"><label htmlFor="client_action">Client Action</label><select id="client_action" name="client_action" defaultValue="None">{clientActions.map(v => <option key={v}>{v}</option>)}</select></div><div className="field"><label htmlFor="follow_up_date">Follow-up Date</label><input id="follow_up_date" name="follow_up_date" type="date" /></div></div>
      <div className="field" style={{marginTop:16,minWidth:'100%'}}><label htmlFor="client_action_note">Client Action Note</label><textarea id="client_action_note" name="client_action_note" rows={2} /></div>
      <div style={{marginTop:20}}><button className="button" type="submit">Save Inquiry</button></div>
    </form>
  </>
}
