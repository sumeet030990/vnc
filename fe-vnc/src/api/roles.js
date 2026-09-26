import { useQuery } from '@tanstack/react-query'
import { apiFetch } from './client.js'

export const roleKeys = {
  all: ['roles'],
}

export function useRoles() {
  return useQuery({
    queryKey: roleKeys.all,
    queryFn: ({ signal }) => apiFetch('/api/roles', { signal }),
    // Roles rarely change, so keep them for the whole session.
    staleTime: Infinity,
  })
}
