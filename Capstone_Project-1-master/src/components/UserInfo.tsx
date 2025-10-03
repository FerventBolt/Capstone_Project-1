'use client'

import { useState, useEffect } from 'react'

interface MeResponse {
  user: { email: string } | null
  profile: { name: string } | null
}

export default function UserInfo({
  collapsed,
}: {
  collapsed: boolean
}) {
  const [me, setMe] = useState<MeResponse>({
    user: null,
    profile: null,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((json: MeResponse) => {
        setMe(json)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return null
  }

  const initial = me.profile?.name?.charAt(0) ?? 'U'
  const name = me.profile?.name ?? 'User'
  const email = me.user?.email ?? ''

  return (
    <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
      <div className="flex items-center">
        <div
          className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0"
          aria-hidden="true"
        >
          <span className="text-sm font-medium text-blue-600">
            {initial}
          </span>
        </div>
        {!collapsed && (
          <div className="ml-3 min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-700 truncate">
              {name}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {email}
            </p>
          </div>
        )}
      </div>

      {!collapsed && (
        <button
          onClick={async () => {
            await fetch('/api/auth/signout', { method: 'POST' })
            window.location.href = '/login'
          }}
          className="mt-3 w-full text-left text-sm text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded transition-colors"
          type="button"
          aria-label="Sign out"
        >
          Sign out
        </button>
      )}
    </div>
  )
}
