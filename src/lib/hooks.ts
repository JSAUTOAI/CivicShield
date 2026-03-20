"use client"

import * as React from "react"

interface FetchState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

export function useFetch<T>(url: string, options?: RequestInit) {
  const [state, setState] = React.useState<FetchState<T>>({
    data: null,
    loading: true,
    error: null,
  })

  const fetchData = React.useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const res = await fetch(url, options)
      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: "Request failed" }))
        throw new Error(body.error || `HTTP ${res.status}`)
      }
      const data = await res.json()
      setState({ data, loading: false, error: null })
    } catch (err) {
      setState({ data: null, loading: false, error: (err as Error).message })
    }
  }, [url, options])

  React.useEffect(() => {
    fetchData()
  }, [fetchData])

  return { ...state, refetch: fetchData }
}

export function useSession() {
  const [session, setSession] = React.useState<{
    user: { id: string; name: string; email: string; role: string } | null
    loading: boolean
  }>({ user: null, loading: true })

  React.useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        setSession({
          user: data?.user || null,
          loading: false,
        })
      })
      .catch(() => {
        setSession({ user: null, loading: false })
      })
  }, [])

  return session
}
