import { describe, expect, it } from 'vitest'
import { classifyTrend, rootCausePercentage } from '@/features/trends/calculate'

describe('30-day trend thresholds', () => {
  it('uses exact 5/10/15 percent boundaries', () => {
    expect(classifyTrend(4.99)).toBe('normal')
    expect(classifyTrend(5)).toBe('watch')
    expect(classifyTrend(10)).toBe('trend')
    expect(classifyTrend(15)).toBe('high_priority')
  })
  it('uses all inquiries as denominator and handles zero inquiry windows', () => {
    expect(rootCausePercentage(3, 20)).toBe(15)
    expect(rootCausePercentage(0, 0)).toBeNull()
  })
})
