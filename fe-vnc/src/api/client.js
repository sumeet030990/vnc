import { store } from '../store/index.js'
import { loggedOut, selectToken } from '../store/authSlice.js'

const BASE_URL = import.meta.env.VITE_BE_URL ?? 'http://localhost:4000'

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

export async function apiFetch(path, { body, headers, ...options } = {}) {
  const token = selectToken(store.getState())
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(body !== undefined && { 'Content-Type': 'application/json' }),
      ...(token && { Authorization: `Bearer ${token}` }),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  const data = res.status === 204 ? null : await res.json().catch(() => null)

  // A rejected token means the session is over — send the user back to login.
  if (res.status === 401 && token) store.dispatch(loggedOut())

  if (!res.ok) {
    throw new ApiError(
      data?.message ?? `Request failed with status ${res.status}`,
      res.status,
      data,
    )
  }

  // The API wraps every result as { success, message, data }.
  return data?.data ?? null
}
