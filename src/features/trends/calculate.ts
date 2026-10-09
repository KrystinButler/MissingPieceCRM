export type TrendStatus = 'normal' | 'watch' | 'trend' | 'high_priority'
export function classifyTrend(percentage: number): TrendStatus {
  if (percentage >= 15) return 'high_priority'
  if (percentage >= 10) return 'trend'
  if (percentage >= 5) return 'watch'
  return 'normal'
}
export function rootCausePercentage(rootCauseCount: number, totalInquiries: number) {
  if (totalInquiries <= 0) return null
  return Math.round((rootCauseCount / totalInquiries) * 10000) / 100
}
