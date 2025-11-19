// Test Service
// Handles test access, submission, and results retrieval

import { API_CONFIG, getApiUrl, replaceParams } from "./api-config"
import { AuthService } from "./auth-service"

export interface Question {
  id: string
  question: string
  options: string[]
  correct_answer?: number // Only available after submission
}

export interface TestData {
  id: string
  test_code: string
  title: string
  description: string
  subject: string
  difficulty: string
  duration_minutes: number
  total_questions: number
  questions: Question[]
}

export interface TestAnswer {
  question_id: string
  selected_answer: number
  time_spent_seconds: number
}

export interface SubmitTestPayload {
  answers: TestAnswer[]
  total_time_seconds: number
}

export interface TestResult {
  result_id: string
  score: number
  total_questions: number
  percentage: string
  flagged_for_cheating: boolean
  cheating_reasons?: string[]
}

export interface TestHistory {
  result_id: string
  test_id: string
  test_title: string
  test_subject: string
  test_difficulty: string
  test_code: string
  teacher_name: string
  teacher_email: string
  score: number
  total_questions: number
  percentage: number
  time_taken_seconds: number
  submitted_at: string
  flagged_for_cheating: boolean
  cheating_reasons: string[]
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
  }
}

export class TestService {
  // Access test with code
  static async accessTest(testCode: string): Promise<ApiResponse<TestData>> {
    try {
      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.TEST_ACCESS), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...AuthService.getAuthHeader(),
        },
        body: JSON.stringify({
          test_code: testCode.toUpperCase(),
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        return { success: true, data: data.data }
      }

      return {
        success: false,
        error: data.error || {
          code: "ACCESS_FAILED",
          message: response.status === 403 ? "Invalid test code" : "Could not access test",
        },
      }
    } catch (error) {
      console.error("Test access error:", error)
      return {
        success: false,
        error: {
          code: "NETWORK_ERROR",
          message: "Could not connect to server. Please check your connection.",
        },
      }
    }
  }

  // Submit test answers
  static async submitTest(
    testId: string,
    payload: SubmitTestPayload
  ): Promise<ApiResponse<TestResult>> {
    try {
      const endpoint = replaceParams(API_CONFIG.ENDPOINTS.TEST_SUBMIT, { testId })
      
      const response = await fetch(getApiUrl(endpoint), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...AuthService.getAuthHeader(),
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        return { success: true, data: data.data }
      }

      return {
        success: false,
        error: data.error || {
          code: "SUBMIT_FAILED",
          message: "Could not submit test",
        },
      }
    } catch (error) {
      console.error("Test submission error:", error)
      return {
        success: false,
        error: {
          code: "NETWORK_ERROR",
          message: "Could not connect to server. Please check your connection.",
        },
      }
    }
  }

  // Get student's test history/results
  static async getStudentResults(): Promise<ApiResponse<{ results: TestHistory[]; total_tests_taken: number }>> {
    try {
      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.STUDENT_RESULTS), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...AuthService.getAuthHeader(),
        },
      })

      const data = await response.json()

      if (response.ok && data.success) {
        return { success: true, data: data.data }
      }

      return {
        success: false,
        error: data.error || {
          code: "FETCH_FAILED",
          message: "Could not fetch results",
        },
      }
    } catch (error) {
      console.error("Fetch results error:", error)
      return {
        success: false,
        error: {
          code: "NETWORK_ERROR",
          message: "Could not connect to server. Please check your connection.",
        },
      }
    }
  }
}
