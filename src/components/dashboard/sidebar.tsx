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

interface SidebarProps {
  navigation: NavigationItem[]
  userRole: string
  isOpen: boolean
  onToggle: () => void
  isCollapsed: boolean
  onCollapse: (collapsed: boolean) => void
}

export default function Sidebar({ 
  navigation, 
  userRole, 
  isOpen, 
  onToggle, 
  isCollapsed, 
  onCollapse 
}: SidebarProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const pathname = usePathname()

  // Auto-collapse on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        onCollapse(false)
      }
    }

    window.addEventListener('resize', handleResize)
    handleResize()

    return () => window.removeEventListener('resize', handleResize)
  }, [onCollapse])

  const toggleExpanded = (itemName: string) => {
    if (isCollapsed) return
    setExpandedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    )
  }

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/')
  }

  const sidebarWidth = isCollapsed ? 'w-16' : 'w-64'
  const sidebarTransform = isOpen ? 'translate-x-0' : '-translate-x-full'

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 ${sidebarWidth} bg-white shadow-lg transform transition-all duration-300 ease-in-out lg:translate-x-0 ${sidebarTransform}`}>
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <div className="flex items-center min-w-0">
            <div className="text-2xl font-bold text-blue-600 flex-shrink-0">
              {isCollapsed ? 'C' : 'CTE'}
            </div>
            {!isCollapsed && (
              <div className="ml-2 text-sm text-gray-600 capitalize truncate">{userRole}</div>
            )}
          </div>
          
          {/* Mobile close button */}
          <button
            onClick={onToggle}
            className="lg:hidden text-gray-400 hover:text-gray-600 p-1"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Desktop collapse button */}
          <button
            onClick={() => onCollapse(!isCollapsed)}
            className="hidden lg:block text-gray-400 hover:text-gray-600 p-1"
          >
            <svg 
              className={`w-5 h-5 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-3 flex-1 overflow-y-auto">
          <div className="space-y-1">
            {navigation.map((item) => (
              <div key={item.name}>
                {item.children ? (
                  <div>
                    <button
                      onClick={() => toggleExpanded(item.name)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors group ${
                        isActive(item.href)
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      title={isCollapsed ? item.name : undefined}
                    >
                      <div className="flex items-center min-w-0">
                        <span className="text-lg flex-shrink-0">{item.icon}</span>
                        {!isCollapsed && (
                          <span className="ml-3 truncate">{item.name}</span>
                        )}
                      </div>
                      {!isCollapsed && (
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
                    
                    {!isCollapsed && expandedItems.includes(item.name) && (
                      <div className="mt-1 ml-6 space-y-1">
                        {item.children.map((child) => (
                          <Link
                            key={child.name}
                            href={child.href}
                            className={`flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                              isActive(child.href)
                                ? 'bg-blue-100 text-blue-700'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            <span className="text-base mr-3 flex-shrink-0">{child.icon}</span>
                            <span className="truncate">{child.name}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors group ${
                      isActive(item.href)
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    title={isCollapsed ? item.name : undefined}
                  >
                    <span className="text-lg flex-shrink-0">{item.icon}</span>
                    {!isCollapsed && (
                      <span className="ml-3 truncate">{item.name}</span>
                    )}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </nav>

        {/* User info at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-medium text-blue-600">A</span>
            </div>
            {!isCollapsed && (
              <div className="ml-3 min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-700 truncate">Admin User</p>
                <p className="text-xs text-gray-500 truncate">admin@lpu.edu.ph</p>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <button className="mt-3 w-full text-left text-sm text-gray-500 hover:text-gray-700 transition-colors">
              Sign out
            </button>
          )}
        </div>
      </div>
    </>
  )
}