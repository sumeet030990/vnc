import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from './client.js'
import { statsKeys } from './stats.js'

export const itemKeys = {
  all: ['items'],
}

// The API sends the full list (sorted by name), so the page searches and pages it locally.
export function useItems() {
  return useQuery({
    queryKey: itemKeys.all,
    queryFn: ({ signal }) => apiFetch('/api/items', { signal }),
  })
}

// Any change to items makes the list and the dashboard totals out of date.
function useItemMutation(mutationFn) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: itemKeys.all })
      queryClient.invalidateQueries({ queryKey: statsKeys.summary })
    },
  })
}

export function useCreateItem() {
  return useItemMutation((item) =>
    apiFetch('/api/items', { method: 'POST', body: item }),
  )
}

export function useUpdateItem() {
  return useItemMutation(({ id, ...item }) =>
    apiFetch(`/api/items/${id}`, { method: 'PUT', body: item }),
  )
}

export function useDeleteItem() {
  return useItemMutation((id) =>
    apiFetch(`/api/items/${id}`, { method: 'DELETE' }),
  )
}
