/**
 * Navigation utilities for Next.js App Router
 * This file provides compatibility layer for navigation
 */

"use client"

import { useRouter as useNextRouter, usePathname as useNextPathname } from "next/navigation"

/**
 * Custom hook that provides navigation similar to react-router-dom
 */
export function useNavigate() {
  const router = useNextRouter()
  
  return (path: string, options?: { state?: any }) => {
    // Next.js doesn't support state in navigation
    // Store state in sessionStorage if needed
    if (options?.state) {
      sessionStorage.setItem(`nav-state-${path}`, JSON.stringify(options.state))
    }
    router.push(path)
  }
}

/**
 * Hook to get pathname
 */
export function usePathname() {
  return useNextPathname()
}

/**
 * Hook to get router
 */
export function useRouter() {
  return useNextRouter()
}

/**
 * Hook to get navigation state (from sessionStorage)
 */
export function useNavigationState<T = any>(path: string): T | null {
  if (typeof window === "undefined") return null
  
  const stateStr = sessionStorage.getItem(`nav-state-${path}`)
  if (!stateStr) return null
  
  try {
    return JSON.parse(stateStr)
  } catch {
    return null
  }
}

/**
 * Clear navigation state
 */
export function clearNavigationState(path: string) {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(`nav-state-${path}`)
  }
}
