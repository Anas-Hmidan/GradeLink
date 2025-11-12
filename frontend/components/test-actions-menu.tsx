"use client"

import { useState } from "react"
import axios from "@/lib/axios"
import { Button } from "@/components/ui/button"

interface TestActionsMenuProps {
  testId: string
  onDuplicate?: () => void
  onDelete?: () => void
  onClose?: () => void
  status: "draft" | "published" | "closed"
}

export default function TestActionsMenu({ testId, onDuplicate, onDelete, onClose, status }: TestActionsMenuProps) {
  const [loading, setLoading] = useState(false)

  const handleDuplicate = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("auth_token")
      await axios.post(
        `/api/tests/${testId}/duplicate`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      onDuplicate?.()
    } catch {
      alert("Failed to duplicate test")
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("auth_token")
      await axios.put(
        `/api/tests/${testId}/status`,
        {
          status: status === "published" ? "closed" : "published",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      onClose?.()
    } catch {
      alert("Failed to update test status")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this test?")) {
      setLoading(true)
      try {
        const token = localStorage.getItem("auth_token")
        await axios.delete(`/api/tests/${testId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        onDelete?.()
      } catch {
        alert("Failed to delete test")
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button variant="outline" onClick={handleDuplicate} disabled={loading} className="justify-start bg-transparent">
        Copy Test
      </Button>
      {status !== "closed" && (
        <Button
          variant="outline"
          onClick={handleToggleStatus}
          disabled={loading}
          className="justify-start bg-transparent"
        >
          {status === "published" ? "Close Test" : "Reopen"}
        </Button>
      )}
      <Button
        variant="outline"
        onClick={handleDelete}
        disabled={loading}
        className="justify-start text-destructive hover:text-destructive bg-transparent"
      >
        Delete
      </Button>
    </div>
  )
}
