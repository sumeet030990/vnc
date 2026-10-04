import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { useMemo } from 'react'
import { apiFetch } from './client.js'
import { authKeys } from './auth.js'
import { billKeys } from './bills.js'
import { reportKeys } from './reports.js'
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

// The API sends newest first; pickers read better in name order.
const selectUsersByName = (data) =>
  [...data.users].sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''))

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
    select: selectUsersByName,
  })
}

// People with the given roles (e.g. ['buyer', 'seller']) in one list, sorted by name.
// A role that doesn't exist makes useUserOptions return everyone, so keep only these roles.
export function usePeopleOptions(roles) {
  const buyers = useUserOptions('buyer')
  const sellers = useUserOptions('seller')
  const data = useMemo(() => {
    const byId = new Map()
    for (const person of [...(buyers.data ?? []), ...(sellers.data ?? [])]) {
      if (roles.includes(person.role?.slug)) byId.set(person.id, person)
    }
    return [...byId.values()].sort((a, b) =>
      (a.name ?? '').localeCompare(b.name ?? ''),
    )
  }, [buyers.data, sellers.data, roles])
  // Only wait for the lists this page shows.
  const isPending =
    (roles.includes('buyer') && buyers.isPending) ||
    (roles.includes('seller') && sellers.isPending)
  return { data, isPending }
}

// Any change to users makes the list, the dashboard totals, the login list,
// and the bills and reports (which show buyer, seller and transporter details) out of date.
function useUserMutation(mutationFn) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all })
      queryClient.invalidateQueries({ queryKey: statsKeys.summary })
      queryClient.invalidateQueries({ queryKey: authKeys.users })
      queryClient.invalidateQueries({ queryKey: billKeys.all })
      queryClient.invalidateQueries({ queryKey: reportKeys.all })
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
