import Link from 'next/link'

export default async function InquiryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <>
    <div className="page-header"><div><h1>Inquiry Detail</h1><div className="muted">Saved inquiry record · {id}</div></div><Link className="button secondary" href="/inquiries">Back to Inquiries</Link></div>
    <section className="card"><dl className="detail-grid">
      <dt>Client</dt><dd>ABC Autism</dd>
      <dt>Date Received</dt><dd>October 9, 2026</dd>
      <dt>Inquiry Type</dt><dd>Denial Question</dd>
      <dt>Status</dt><dd><span className="badge">Resolved</span></dd>
      <dt>Client Question</dt><dd>Why did Medicaid deny these claims?</dd>
      <dt>Answer Provided</dt><dd>The patient was not eligible for benefits on the date of service.</dd>
      <dt>Client Action</dt><dd>Review / Confirm</dd>
      <dt>Follow-Up</dt><dd>None</dd>
    </dl></section>
    <section className="card"><h2>Operations Review</h2><p className="muted">Root cause is classified by Operations after the frontline inquiry is resolved.</p><dl className="detail-grid"><dt>Root Cause</dt><dd>Eligibility Not Verified</dd><dt>Corrective Action</dt><dd>Client Education</dd><dt>Review Status</dt><dd>Completed</dd></dl></section>
  </>
}
