import { describe, expect, it } from 'vitest'
import { inquiryDetailHref } from '../src/features/inquiries/links'
describe('inquiry detail links',()=>{it('builds a stable route for a saved inquiry',()=>{expect(inquiryDetailHref('8e0beafe-b6c1-4a74-9721-2f8f4d4ed310')).toBe('/inquiries/8e0beafe-b6c1-4a74-9721-2f8f4d4ed310')});it('rejects an empty inquiry id',()=>{expect(()=>inquiryDetailHref('')).toThrow(/inquiry id/i)})})
