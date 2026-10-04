import { useQuery } from '@tanstack/react-query'
import { apiFetch } from './client.js'

export const reportKeys = {
  all: ['reports'],
  detail: (type, id, range) => ['reports', type, id, range],
}

// One buyer's or seller's report for a date range.
// type: 'buyer' | 'seller'; range: { from, to } as 'YYYY-MM-DD'.
export function useReport(type, id, { from, to }, { enabled = true } = {}) {
  const query = new URLSearchParams({ from, to })
  return useQuery({
    queryKey: reportKeys.detail(type, id, { from, to }),
    queryFn: ({ signal }) =>
      apiFetch(`/api/reports/${type}s/${id}?${query}`, { signal }),
    enabled: Boolean(id) && enabled,
  })
}
