import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { apiFetch } from './client.js'
import { reportKeys } from './reports.js'

export const billKeys = {
  all: ['bills'],
  list: (params) => ['bills', 'list', params],
  detail: (id) => ['bills', 'detail', id],
}

// params: { page, pageSize, buyerId, transporter_id } — empty values are left out.
export function useBills(params) {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, value]) => value !== '' && value != null),
  )
  return useQuery({
    queryKey: billKeys.list(params),
    queryFn: ({ signal }) => apiFetch(`/api/bills?${query}`, { signal }),
    // Keep the current page on screen while the next one loads.
    placeholderData: keepPreviousData,
  })
}

// One bill with all its items. Skipped when there's no id (a new bill).
export function useBill(id) {
  return useQuery({
    queryKey: billKeys.detail(id),
    queryFn: ({ signal }) => apiFetch(`/api/bills/${id}`, { signal }),
    enabled: Boolean(id),
  })
}

// Any change to a bill makes the lists, that bill's details and the reports out of date.
function useBillMutation(mutationFn) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billKeys.all })
      queryClient.invalidateQueries({ queryKey: reportKeys.all })
    },
  })
}

export function useCreateBill() {
  return useBillMutation((bill) =>
    apiFetch('/api/bills', { method: 'POST', body: bill }),
  )
}

// PUT replaces the whole bill, including its full list of items.
export function useUpdateBill() {
  return useBillMutation(({ id, ...bill }) =>
    apiFetch(`/api/bills/${id}`, { method: 'PUT', body: bill }),
  )
}

export function useDeleteBill() {
  return useBillMutation((id) =>
    apiFetch(`/api/bills/${id}`, { method: 'DELETE' }),
  )
}
