import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { apiFetch } from './client.js'
import { useRoles } from './roles.js'
import { statsKeys } from './stats.js'

export const userKeys = {
  all: ['users'],
  list: (params) => ['users', 'list', params],
}

// params: { page, pageSize, search, roleId } — empty values are left out.
export function useUsers(params) {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, value]) => value !== '' && value != null),
  )
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: ({ signal }) => apiFetch(`/api/users?${query}`, { signal }),
    // Keep the current page on screen while the next one loads.
    placeholderData: keepPreviousData,
  })
}

const OPTIONS_PAGE_SIZE = 100

// Users with one role (by slug), for pickers that filter in the browser.
// If that role doesn't exist, falls back to everyone.
export function useUserOptions(roleSlug) {
  const roles = useRoles()
  const roleId = roles.data?.find((role) => role.slug === roleSlug)?.id ?? ''
  const params = { page: 1, pageSize: OPTIONS_PAGE_SIZE, roleId }
  const query = new URLSearchParams(
    Object.entries(params).filter(([, value]) => value !== ''),
  )
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: ({ signal }) => apiFetch(`/api/users?${query}`, { signal }),
    enabled: roles.isSuccess,
    select: (data) => data.users,
  })
}

// Any change to users makes the list and the dashboard totals out of date.
function useUserMutation(mutationFn) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all })
      queryClient.invalidateQueries({ queryKey: statsKeys.summary })
    },
  })
}

export function useCreateUser() {
  return useUserMutation((user) =>
    apiFetch('/api/users', { method: 'POST', body: user }),
  )
}

// PUT replaces the whole record; leave `password` out to keep the current one.
export function useUpdateUser() {
  return useUserMutation(({ id, ...user }) =>
    apiFetch(`/api/users/${id}`, { method: 'PUT', body: user }),
  )
}

export function useDeleteUser() {
  return useUserMutation((id) =>
    apiFetch(`/api/users/${id}`, { method: 'DELETE' }),
  )
}
