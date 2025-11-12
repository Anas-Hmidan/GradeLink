import axios from "axios"

const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

const api = axios.create({
  baseURL,
  withCredentials: true,
})

// Add request interceptor to include JWT token in all requests
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("auth_token")
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Add response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized - token expired or invalid
    if (error.response?.status === 401) {
      // Clear auth data
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth_token")
        localStorage.removeItem("auth_user")
        // Redirect to login page
        window.location.href = "/login"
      }
    }
    return Promise.reject(error)
  }
)

// re-export isAxiosError type guard for convenience
export const isAxiosError = axios.isAxiosError

export default api
