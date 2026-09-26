import { useQuery } from '@tanstack/react-query'
import { apiFetch } from './client.js'

export const healthKeys = {
  all: ['health'],
}

export function useHealth() {
  return useQuery({
    queryKey: healthKeys.all,
    queryFn: ({ signal }) => apiFetch('/api/health', { signal }),
  })
}
