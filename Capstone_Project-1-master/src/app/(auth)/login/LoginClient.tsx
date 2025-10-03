// src/app/(auth)/login/LoginClient.tsx
"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export default function LoginClient() {
  const router = useRouter()
  const params = useSearchParams()
  const redirectTo = params.get("redirectTo") || ""

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      const resp = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      const body = await resp.json()

      if (!resp.ok) {
        setError(body.error || "Unknown error")
        return
      }

      const role: string | undefined = body.role

      if (redirectTo) {
        window.location.href = redirectTo
        return
      }

      if (role === "admin") {
        window.location.href = "/admin/dashboard"
      } else if (role === "student") {
        window.location.href = "/student/dashboard"
      } else if (role === "staff") {
        window.location.href = "/staff/dashboard"
      } else {
        window.location.href = "/"
      }
    } catch (err) {
      console.error("[login] fetch error:", err)
      setError("Network error")
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <form
        onSubmit={handleLogin}
        className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-md"
      >
        <h1 className="text-xl font-bold mb-4">Login</h1>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          className="input-field mb-3 w-full"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          className="input-field mb-3 w-full"
        />
        <button type="submit" className="btn-primary w-full">
          Login
        </button>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </form>
    </div>
  )
}
