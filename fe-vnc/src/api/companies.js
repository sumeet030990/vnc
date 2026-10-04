import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from './client.js'

export const companyKeys = {
  all: ['companies'],
  detail: (id) => ['companies', id],
}

// The business that issues the bills is always the first company.
export const MAIN_COMPANY_ID = 1

// The API sends the full list (sorted by name), so the page searches and pages it locally.
export function useCompanies() {
  return useQuery({
    queryKey: companyKeys.all,
    queryFn: ({ signal }) => apiFetch('/api/companies', { signal }),
  })
}

export function useCompany(id) {
  return useQuery({
    queryKey: companyKeys.detail(id),
    queryFn: ({ signal }) => apiFetch(`/api/companies/${id}`, { signal }),
  })
}

// Any change to a company makes the list out of date.
function useCompanyMutation(mutationFn) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyKeys.all })
    },
  })
}

export function useCreateCompany() {
  return useCompanyMutation((company) =>
    apiFetch('/api/companies', { method: 'POST', body: company }),
  )
}

export function useUpdateCompany() {
  return useCompanyMutation(({ id, ...company }) =>
    apiFetch(`/api/companies/${id}`, { method: 'PUT', body: company }),
  )
}
