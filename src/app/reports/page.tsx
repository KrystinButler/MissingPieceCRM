import { normalizeClientFilter } from '@/features/reports/filter'

const clients = [
  { id: '11111111-1111-4111-8111-111111111111', name: 'ABC Autism' },
  { id: '22222222-2222-4222-8222-222222222222', name: 'Bright Steps ABA' },
]

const dailyReports = [
  { clientId: clients[0].id, client: 'ABC Autism', date: '2026-10-09', status: 'Finalized', summary: '7 documented inquiries; 6 resolved and 1 remains open or awaiting follow-up.' },
  { clientId: clients[1].id, client: 'Bright Steps ABA', date: '2026-10-09', status: 'Draft', summary: '2 documented inquiries; both remain in follow-up.' },
]

export default async function ReportsPage({ searchParams }: { searchParams: Promise<{ clientId?: string; month?: string }> }) {
  const params = await searchParams
  const selected = normalizeClientFilter(params.clientId)
  const visible = selected ? dailyReports.filter(r => r.clientId === selected) : dailyReports
  return <>
    <div className="page-header"><div><h1>Reports</h1><div className="muted">Client inquiry tracking and communications</div></div></div>
    <section className="card">
      <h2>Monthly Client Report</h2>
      <form className="toolbar" method="get">
        <div className="field"><label htmlFor="clientId">Client</label><select id="clientId" name="clientId" defaultValue={selected ?? ''}><option value="">All clients</option>{clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
        <div className="field"><label htmlFor="month">Month</label><input id="month" name="month" type="month" defaultValue={params.month ?? '2026-10'} /></div>
        <button className="button" type="submit">Filter Reports</button>
      </form>
    </section>
    <section className="card"><h2>Daily Reports</h2>{visible.length === 0 ? <p>No reports match this client.</p> : visible.map(report => <article key={report.clientId + report.date} className="report-section">
      <div className="page-header"><div><h3>{report.client} — {report.date}</h3><span className="badge">{report.status}</span></div><div className="actions"><button className="button secondary">Reopen Draft</button><button className="button">Download PDF</button></div></div>
      <p>{report.summary}</p>
      <div className="report-section"><h3>Resolved Inquiries</h3><ul><li>Denial Question — patient eligibility explanation provided.</li><li>Claim Status — payment status communicated.</li></ul></div>
      <div className="report-section"><h3>Open Follow-Up</h3><ul><li>Authorization Question — awaiting renewal decision.</li></ul></div>
      <div className="report-section"><h3>Operations Findings</h3><ul><li>Eligibility Not Verified → Client Education</li><li>EDI / ERA Enrollment Missing → System / Configuration Change</li></ul></div>
    </article>)}</section>
  </>
}
