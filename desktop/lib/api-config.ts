// API Configuration for the exam platform
// Two separate backends: Main backend (Node.js) and Python face detection

export const API_CONFIG = {
  // Main backend for authentication, tests, and submissions
  BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001",
  
  // Python face detection backend
  FACE_DETECTION_URL: process.env.NEXT_PUBLIC_FACE_DETECTION_URL || "http://localhost:5000",
  
  // Endpoints
  ENDPOINTS: {
    // Auth
    REGISTER: "/api/auth/register",
    LOGIN: "/api/auth/login",
    
    // Tests
    TEST_ACCESS: "/api/test/access",
    TEST_SUBMIT: "/api/test/:testId/submit",
    
    // Student
    STUDENT_RESULTS: "/api/student/results",
    
    // Face Detection (Python API)
    FACE_DETECTION_HEALTH: "/health",
    FACE_DETECTION_ANALYZE: "/analyze-frame",
  }
}

// Helper to get full URL
export const getApiUrl = (endpoint: string, useBackend: boolean = true): string => {
  const baseUrl = useBackend ? API_CONFIG.BACKEND_URL : API_CONFIG.FACE_DETECTION_URL
  return `${baseUrl}${endpoint}`
}

// Helper to replace path parameters (e.g., :testId)
export const replaceParams = (path: string, params: Record<string, string>): string => {
  let result = path
  Object.entries(params).forEach(([key, value]) => {
    result = result.replace(`:${key}`, value)
  })
  return result
}
