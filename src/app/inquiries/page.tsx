import Link from 'next/link'
import { inquiryDetailHref } from '@/features/inquiries/links'

const inquiries = [
  { id: '8e0beafe-b6c1-4a74-9721-2f8f4d4ed310', client: 'ABC Autism', type: 'Denial Question', received: '2026-10-09', status: 'Resolved', answer: 'Patient was not eligible for benefits on the date of service.' },
  { id: '2e0beafe-b6c1-4a74-9721-2f8f4d4ed311', client: 'ABC Autism', type: 'Authorization Question', received: '2026-10-09', status: 'In Progress', answer: 'Authorization renewal is still pending.' },
]

export default function InquiriesPage() {
  return <>
    <div className="page-header"><div><h1>Client Inquiries</h1><div className="muted">Record, track, and revisit client questions and responses.</div></div><Link className="button" href="/inquiries/new">New Inquiry</Link></div>
    <section className="card"><table className="table"><thead><tr><th>Client</th><th>Received</th><th>Inquiry Type</th><th>Status</th><th>Answer / Resolution</th></tr></thead><tbody>{inquiries.map(i => <tr key={i.id}><td><Link href={inquiryDetailHref(i.id)}><strong>{i.client}</strong></Link></td><td>{i.received}</td><td><Link href={inquiryDetailHref(i.id)}>{i.type}</Link></td><td><span className="badge">{i.status}</span></td><td>{i.answer}</td></tr>)}</tbody></table></section>
  </>
}
