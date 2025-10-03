'use client'

import Link from 'next/link'
import { ArrowLeft, AlertCircle } from 'lucide-react'

export default function StaffAssignmentsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link
                href="/staff/courses"
                className="text-gray-500 hover:text-gray-700 mr-4 flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Courses
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Assignments</h1>
                <p className="text-sm text-gray-500">Assignment Management</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Access Restricted Message */}
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Restricted</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Staff members do not have permission to assign instructors or create assignment categories. 
            You can manage assignment submissions for courses you're teaching through the individual course pages.
          </p>
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              To manage assignments for your courses:
            </p>
            <div className="bg-gray-50 rounded-lg p-4 text-left max-w-md mx-auto">
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                <li>Go to <Link href="/staff/courses" className="text-blue-600 hover:text-blue-500">Courses</Link></li>
                <li>Select a course you're teaching</li>
                <li>Navigate to the "Content" tab</li>
                <li>View assignment submissions for each lesson</li>
              </ol>
            </div>
          </div>
          <div className="mt-8">
            <Link
              href="/staff/courses"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium inline-flex items-center space-x-2"
            >
              <span>Go to My Courses</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}