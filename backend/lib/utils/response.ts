export interface ApiResponse<T = null> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: Record<string, any>
  }
}

export function successResponse<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    data,
  }
}

export function errorResponse(code: string, message: string, details?: Record<string, any>): ApiResponse {
  return {
    success: false,
    error: {
      code,
      message,
      details,
    },
  }
}
