import { useMutation, useQuery } from '@tanstack/react-query'
import { apiFetch } from './client.js'

export const authKeys = {
  users: ['auth', 'users'],
}

export function useLoginUsers() {
  return useQuery({
    queryKey: authKeys.users,
    queryFn: ({ signal }) => apiFetch('/api/auth/users', { signal }),
  })
}

export function useLogin() {
  return useMutation({
    mutationFn: (credentials) =>
      apiFetch('/api/auth/login', { method: 'POST', body: credentials }),
  })
}
