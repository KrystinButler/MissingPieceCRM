export function inquiryDetailHref(inquiryId: string): string {
  const id = inquiryId.trim()
  if (!id) throw new Error('Inquiry ID is required')
  return `/inquiries/${id}`
}
