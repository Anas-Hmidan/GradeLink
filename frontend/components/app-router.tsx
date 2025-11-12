"use client"

import React, { Suspense, useEffect, useState } from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"

const HomePage = React.lazy(() => import("@/app/page"))
const LoginPage = React.lazy(() => import("@/components/quick-login"))
const DashboardPage = React.lazy(() => import("@/app/dashboard/page"))
const CreateTestPage = React.lazy(() => import("@/app/create-test/page"))
const TestDetailsPage = React.lazy(() => import("@/app/tests/[id]/page"))
const ResultsPage = React.lazy(() => import("@/app/results/page"))
const StudentTestPage = React.lazy(() => import("@/app/take-test/page"))
const NotFoundPage = React.lazy(() => import("@/app/not-found/page"))

export default function AppRouter() {
  const [isClient, setIsClient] = useState(false)

  // Avoid rendering BrowserRouter on the server. On the server `window`/`document`
  // aren't available and react-router-dom's browser history will throw. We set
  // a flag in useEffect (runs only on the client) and render the Router only then.
  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    // Server-side placeholder: render nothing (or a minimal fallback). This
    // prevents react-router-dom from accessing `document` during SSR.
    return <>{/* client-only router will mount on the browser */}</>
  }

  return (
    <Router>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<LoginPage signup />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/create-test" element={<CreateTestPage />} />
          <Route path="/tests/:id" element={<TestDetailsPage />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/take-test/:link" element={<StudentTestPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </Router>
  )
}
