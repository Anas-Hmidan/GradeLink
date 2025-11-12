"use client"

import { useNavigate } from "@/lib/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import type { User } from "@/types/auth"

interface DashboardHeaderProps {
  user: User | null
}

export default function DashboardHeader({ user }: DashboardHeaderProps) {
  const navigate = useNavigate()
  const { logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <header className="border-b border-border bg-card">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <div onClick={() => navigate("/dashboard")} className="text-2xl font-bold text-primary cursor-pointer">
          TeachAI
        </div>

        <nav className="flex items-center gap-6">
          <button onClick={() => navigate("/dashboard")} className="text-foreground hover:text-primary transition">
            Dashboard
          </button>
          {user?.role === "teacher" && (
            <button onClick={() => navigate("/create-test")} className="text-foreground hover:text-primary transition">
              Create Test
            </button>
          )}
          <button onClick={() => navigate("/results")} className="text-foreground hover:text-primary transition">
            Results
          </button>
        </nav>

        <div className="flex items-center gap-4">
          <div className="text-sm">
            <p className="text-muted-foreground capitalize">{user?.role || "User"}</p>
            <p className="text-foreground font-medium">{user?.email}</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>
    </header>
  )
}
