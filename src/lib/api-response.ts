import { NextResponse } from "next/server"

interface ApiSuccessResponse<T> {
  success: true
  data: T
  error: null
}

interface ApiErrorResponse {
  success: false
  data: null
  error: string
  details?: unknown
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json(
    { success: true, data, error: null } satisfies ApiSuccessResponse<T>,
    { status }
  )
}

export function apiError(message: string, status = 500, details?: unknown) {
  return NextResponse.json(
    { success: false, data: null, error: message, ...(details ? { details } : {}) } satisfies ApiErrorResponse & { details?: unknown },
    { status }
  )
}
