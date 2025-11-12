"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function NotFoundPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-2xl font-bold text-foreground mb-2">Page Not Found</h2>
        <p className="text-muted-foreground mb-6">The page you are looking for does not exist or has been removed.</p>
        <div className="flex gap-4 justify-center">
          <Button variant="outline" onClick={() => router.back()}>
            Go Back
          </Button>
          <Button onClick={() => router.push("/")}>Home</Button>
        </div>
      </div>
    </div>
  )
}
