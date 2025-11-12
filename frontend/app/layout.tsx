"use client"

import type React from "react"
import { AuthProvider } from "@/context/auth-context"
import "@/styles/globals.css"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>TeachAI - AI Test Generation Dashboard</title>
        <meta name="description" content="Generate AI-powered multiple-choice tests in seconds" />
      </head>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}

// metadata removed because this layout is a client component
