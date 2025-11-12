"use client"

import LoginForm from "@/components/login-form"

interface LoginPageProps {
  signup?: boolean
}

export default function LoginPage({ signup = false }: LoginPageProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10">
        <LoginForm isSignup={signup} />
      </div>
    </div>
  )
}
