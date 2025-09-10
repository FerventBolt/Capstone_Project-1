'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavigationItem {
  name: string
  href: string
  icon: string
  children?: NavigationItem[]
}

const adminNavigation: NavigationItem[] = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: '📊' },
  {
    name: 'User Management',
    href: '/admin/users',
    icon: '👥',
    children: [
      { name: 'All Users', href: '/admin/users', icon: '👤' },
      { name: 'Invitations', href: '/admin/users/invitations', icon: '✉️' },
      { name: 'Roles & Permissions', href: '/admin/users/roles', icon: '🔐' }
    ]
  },
  {
    name: 'Course Management',
    href: '/admin/courses',
    icon: '📚',
    children: [
      { name: 'All Courses', href: '/admin/courses', icon: '📖' },
      { name: 'Course Assignments', href: '/admin/courses/assignments', icon: '👨‍🏫' }
    ]
  },
  {
    name: 'Certifications',
    href: '/admin/certifications',
    icon: '🎓',
    children: [
      { name: 'All Certifications', href: '/admin/certifications', icon: '📜' },
      { name: 'Applications', href: '/admin/certifications/applications', icon: '📝' },
      { name: 'TESDA Exams', href: '/admin/certifications/exams', icon: '🏆' }
    ]
  },
  { name: 'Reminders', href: '/admin/reminders', icon: '📢' },
  { name: 'Reports', href: '/admin/reports', icon: '📈' },
  { name: 'Settings', href: '/admin/settings', icon: '⚙️' }
]

const staffNavigation: NavigationItem[] = [
  { name: 'Dashboard', href: '/staff/dashboard', icon: '📊' },
  {
    name: 'Course Management',
    href: '/staff/courses',
    icon: '📚',
    children: [
      { name: 'All Courses', href: '/staff/courses', icon: '📖' },
      { name: 'Course Assignments', href: '/staff/courses/assignments', icon: '👨‍🏫' }
    ]
  },
  { name: 'Students', href: '/staff/students', icon: '👨‍🎓' },
  { name: 'Reminders', href: '/staff/reminders', icon: '📢' },
  { name: 'Grading', href: '/staff/grading', icon: '✅' },
  { name: 'Profile', href: '/staff/profile', icon: '👤' }
]

const studentNavigation: NavigationItem[] = [
  { name: 'Dashboard', href: '/student/dashboard', icon: '📊' },
  { name: 'My Courses', href: '/student/courses', icon: '📚' },
  { name: 'Certifications', href: '/student/certifications', icon: '🎓' },
  { name: 'Progress', href: '/student/progress', icon: '📈' },
  { name: 'Profile', href: '/student/profile', icon: '👤' }
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const pathname = usePathname()

  // Add authentication debugging and session handling
  const [userSession, setUserSession] = useState<any>(null)
  
  useEffect(() => {
    console.log('🔍 DEBUG: Dashboard layout mounted')
    console.log('🔍 DEBUG: Current pathname:', pathname)
    
    // Read demo session from cookie
    const cookies = document.cookie.split(';')
    const demoSessionCookie = cookies.find(cookie => cookie.trim().startsWith('demo-session='))
    
    if (demoSessionCookie) {
      try {
        const sessionData = JSON.parse(demoSessionCookie.split('=')[1])
        console.log('🔍 DEBUG: Found demo session:', sessionData)
        setUserSession(sessionData)
      } catch (error) {
        console.error('🔍 DEBUG: Error parsing demo session:', error)
      }
    } else {
      console.log('🔍 DEBUG: No demo session found')
    }
  }, [pathname])

  // Auto-collapse sidebar on mobile and load saved state
  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== 'undefined' && window.innerWidth < 1024) {
        setSidebarCollapsed(false)
        setSidebarOpen(false)
      }
    }

    // Load saved sidebar state with fallback
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        const savedCollapsed = localStorage.getItem('sidebar-collapsed')
        if (savedCollapsed) {
          setSidebarCollapsed(JSON.parse(savedCollapsed))
        }
      } catch (error) {
        console.warn('Failed to load sidebar state from localStorage:', error)
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize)
      handleResize()

      return () => window.removeEventListener('resize', handleResize)
    }
  }, [])

  // Save sidebar state with fallback
  useEffect(() => {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('sidebar-collapsed', JSON.stringify(sidebarCollapsed))
      } catch (error) {
        console.warn('Failed to save sidebar state to localStorage:', error)
      }
    }
  }, [sidebarCollapsed])

  // Determine user role based on pathname
  const getUserRole = () => {
    if (pathname.startsWith('/admin')) return 'admin'
    if (pathname.startsWith('/staff')) return 'staff'
    if (pathname.startsWith('/student')) return 'student'
    return 'admin' // default
  }

  const getNavigation = () => {
    const role = getUserRole()
    switch (role) {
      case 'admin': return adminNavigation
      case 'staff': return staffNavigation
      case 'student': return studentNavigation
      default: return adminNavigation
    }
  }

  const toggleExpanded = (itemName: string) => {
    if (sidebarCollapsed) return
    setExpandedItems(prev =>
      prev.includes(itemName)
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    )
  }

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/')
  }

  const navigation = getNavigation()
  const userRole = getUserRole()
  const sidebarWidth = sidebarCollapsed ? 'w-16' : 'w-64'
  const mainMargin = sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setSidebarOpen(false)
            }
          }}
          role="button"
          tabIndex={0}
          aria-label="Close sidebar"
        />
      )}

      {/* Sidebar */}
      <nav
        className={`fixed inset-y-0 left-0 z-50 ${sidebarWidth} bg-white shadow-lg transform transition-all duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <div className="flex items-center min-w-0">
            <div className="text-2xl font-bold text-blue-600 flex-shrink-0">
              {sidebarCollapsed ? 'C' : 'CTE'}
            </div>
            {!sidebarCollapsed && (
              <div className="ml-2 text-sm text-gray-600 capitalize truncate">{userRole}</div>
            )}
          </div>
          
          {/* Mobile close button */}
          <button
            onClick={() => setSidebarOpen(false)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                setSidebarOpen(false)
              }
            }}
            className="lg:hidden text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded p-1"
            aria-label="Close sidebar"
            type="button"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Desktop collapse button */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                setSidebarCollapsed(!sidebarCollapsed)
              }
            }}
            className="hidden lg:block text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded p-1"
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            type="button"
          >
            <svg
              className={`w-5 h-5 transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        <div className="mt-6 px-3 flex-1 overflow-y-auto pb-20" role="menu">
          <ul className="space-y-1" role="none">
            {navigation.map((item) => (
              <li key={item.name} role="none">
                {item.children ? (
                  <div>
                    <button
                      onClick={() => toggleExpanded(item.name)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          toggleExpanded(item.name)
                        }
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        isActive(item.href)
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      title={sidebarCollapsed ? item.name : undefined}
                      aria-expanded={expandedItems.includes(item.name)}
                      aria-controls={`submenu-${item.name.replace(/\s+/g, '-').toLowerCase()}`}
                      type="button"
                      role="menuitem"
                    >
                      <div className="flex items-center min-w-0">
                        <span className="text-lg flex-shrink-0">{item.icon}</span>
                        {!sidebarCollapsed && (
                          <span className="ml-3 truncate">{item.name}</span>
                        )}
                      </div>
                      {!sidebarCollapsed && (
                        <svg
                          className={`w-4 h-4 transition-transform flex-shrink-0 ${
                            expandedItems.includes(item.name) ? 'rotate-90' : ''
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      )}
                    </button>
                    {!sidebarCollapsed && expandedItems.includes(item.name) && (
                      <ul
                        className="mt-1 ml-6 space-y-1"
                        id={`submenu-${item.name.replace(/\s+/g, '-').toLowerCase()}`}
                        role="menu"
                      >
                        {item.children.map((child) => (
                          <li key={child.name} role="none">
                            <Link
                              href={child.href}
                              className={`flex items-center px-3 py-2 text-sm rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                                isActive(child.href)
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'text-gray-600 hover:bg-gray-100'
                              }`}
                              role="menuitem"
                            >
                              <span className="text-base mr-3 flex-shrink-0" aria-hidden="true">{child.icon}</span>
                              <span className="truncate">{child.name}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      isActive(item.href)
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    title={sidebarCollapsed ? item.name : undefined}
                    role="menuitem"
                  >
                    <span className="text-lg flex-shrink-0" aria-hidden="true">{item.icon}</span>
                    {!sidebarCollapsed && (
                      <span className="ml-3 truncate">{item.name}</span>
                    )}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>


        {/* User info at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0" aria-hidden="true">
              <span className="text-sm font-medium text-blue-600">
                {userSession?.name?.charAt(0) || 'U'}
              </span>
            </div>
            {!sidebarCollapsed && (
              <div className="ml-3 min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-700 truncate">
                  {userSession?.name || 'User'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {userSession?.email || 'user@example.com'}
                </p>
              </div>
            )}
          </div>
          {!sidebarCollapsed && (
            <button
              onClick={() => {
                // Clear demo session
                document.cookie = 'demo-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
                console.log('🔍 DEBUG: Demo session cleared, redirecting to login')
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
      </nav>

      {/* Main content */}
      <div className={`transition-all duration-300 ${mainMargin}`}>
        {/* Top bar */}
        <header className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setSidebarOpen(true)
                  }
                }}
                className="lg:hidden text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded p-1"
                aria-label="Open sidebar"
                type="button"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              {/* Empty space where notifications and search used to be */}
            </div>

            {/* Empty div to maintain justify-between spacing */}
            <div></div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-full overflow-x-hidden">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}