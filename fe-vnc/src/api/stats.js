import { useQuery } from '@tanstack/react-query'
import { apiFetch } from './client.js'

export const statsKeys = {
  summary: ['stats', 'summary'],
}

export function useStatsSummary() {
  return useQuery({
    queryKey: statsKeys.summary,
    queryFn: ({ signal }) => apiFetch('/api/stats', { signal }),
  })
}
