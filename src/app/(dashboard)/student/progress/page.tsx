'use client'

import { useState, useEffect } from 'react'

interface CourseProgress {
  id: string
  title: string
  course_code: string
  progress_percentage: number
  lessons_completed: number
  total_lessons: number
  assessments_completed: number
  total_assessments: number
  average_grade: number
  time_spent_hours: number
  last_accessed: string
  status: 'active' | 'completed' | 'dropped'
}

interface LearningStreak {
  current_streak: number
  longest_streak: number
  last_activity_date: string
}

export default function StudentProgress() {
  const [courseProgress, setCourseProgress] = useState<CourseProgress[]>([])
  const [learningStreak, setLearningStreak] = useState<LearningStreak | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'courses'>('overview')

  useEffect(() => {
    const fetchProgressData = async () => {
      try {
        // Mock data for course progress
        setCourseProgress([
          {
            id: '1',
            title: 'Restaurant Service Operations NC II',
            course_code: 'RSO-NCII',
            progress_percentage: 85,
            lessons_completed: 17,
            total_lessons: 20,
            assessments_completed: 8,
            total_assessments: 10,
            average_grade: 88,
            time_spent_hours: 45,
            last_accessed: '2024-01-20',
            status: 'active'
          },
          {
            id: '2',
            title: 'Bar Operations and Beverage Service',
            course_code: 'BOBS-001',
            progress_percentage: 100,
            lessons_completed: 15,
            total_lessons: 15,
            assessments_completed: 6,
            total_assessments: 6,
            average_grade: 92,
            time_spent_hours: 38,
            last_accessed: '2023-12-15',
            status: 'completed'
          },
          {
            id: '3',
            title: 'Front Desk Operations NC II',
            course_code: 'FDO-NCII',
            progress_percentage: 45,
            lessons_completed: 9,
            total_lessons: 20,
            assessments_completed: 3,
            total_assessments: 8,
            average_grade: 85,
            time_spent_hours: 22,
            last_accessed: '2024-01-18',
            status: 'active'
          },
          {
            id: '4',
            title: 'Commercial Cooking NC II',
            course_code: 'CC-NCII',
            progress_percentage: 25,
            lessons_completed: 5,
            total_lessons: 20,
            assessments_completed: 1,
            total_assessments: 8,
            average_grade: 90,
            time_spent_hours: 15,
            last_accessed: '2024-01-19',
            status: 'active'
          }
        ])

        // Mock data for learning streak
        setLearningStreak({
          current_streak: 5,
          longest_streak: 12,
          last_activity_date: '2024-01-20'
        })
      } catch (error) {
        console.error('Error fetching progress data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProgressData()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100'
      case 'active':
        return 'text-blue-600 bg-blue-100'
      case 'dropped':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const totalLessons = courseProgress.reduce((sum, course) => sum + course.total_lessons, 0)
  const completedLessons = courseProgress.reduce((sum, course) => sum + course.lessons_completed, 0)
  const totalAssessments = courseProgress.reduce((sum, course) => sum + course.total_assessments, 0)
  const completedAssessments = courseProgress.reduce((sum, course) => sum + course.assessments_completed, 0)
  const totalTimeSpent = courseProgress.reduce((sum, course) => sum + course.time_spent_hours, 0)
  const overallProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Learning Progress</h1>
        <p className="text-gray-600 mt-2">Track your learning journey and course progress.</p>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('courses')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'courses'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Course Progress
            </button>
          </nav>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="text-2xl font-bold text-blue-600">{overallProgress}%</div>
              <div className="text-sm text-gray-600">Overall Progress</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="text-2xl font-bold text-green-600">{completedLessons}</div>
              <div className="text-sm text-gray-600">Lessons Completed</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="text-2xl font-bold text-purple-600">{totalTimeSpent}h</div>
              <div className="text-sm text-gray-600">Time Spent Learning</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="text-2xl font-bold text-orange-600">{completedAssessments}</div>
              <div className="text-sm text-gray-600">Assessments Completed</div>
            </div>
          </div>

          {/* Learning Streak */}
          {learningStreak && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Learning Streak 🔥</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">{learningStreak.current_streak}</div>
                  <div className="text-sm text-gray-600">Current Streak (days)</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600">{learningStreak.longest_streak}</div>
                  <div className="text-sm text-gray-600">Longest Streak (days)</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-900">{learningStreak.last_activity_date}</div>
                  <div className="text-sm text-gray-600">Last Activity</div>
                </div>
              </div>
            </div>
          )}

          {/* Course Progress Summary */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Progress Summary</h3>
            <div className="space-y-4">
              {courseProgress.map((course) => (
                <div key={course.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{course.title}</div>
                    <div className="text-sm text-gray-600">{course.course_code}</div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <div className="text-sm font-medium text-blue-600">{course.progress_percentage}%</div>
                      <div className="text-xs text-gray-500">Progress</div>
                    </div>
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${course.progress_percentage}%` }}
                      ></div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(course.status)}`}>
                      {course.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Course Progress Tab */}
      {activeTab === 'courses' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {courseProgress.map((course) => (
              <div key={course.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{course.title}</h3>
                    <p className="text-sm text-gray-600">{course.course_code}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(course.status)}`}>
                    {course.status.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div>
                    <div className="text-sm text-gray-600">Overall Progress</div>
                    <div className="text-lg font-semibold text-blue-600">{course.progress_percentage}%</div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${course.progress_percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Lessons</div>
                    <div className="text-lg font-semibold text-green-600">
                      {course.lessons_completed}/{course.total_lessons}
                    </div>
                    <div className="text-xs text-gray-500">
                      {Math.round((course.lessons_completed / course.total_lessons) * 100)}% complete
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Assessments</div>
                    <div className="text-lg font-semibold text-purple-600">
                      {course.assessments_completed}/{course.total_assessments}
                    </div>
                    <div className="text-xs text-gray-500">
                      Avg Grade: {course.average_grade}%
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Time Spent</div>
                    <div className="text-lg font-semibold text-orange-600">{course.time_spent_hours}h</div>
                    <div className="text-xs text-gray-500">
                      Last: {course.last_accessed}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <a
                    href={`/student/courses/${course.id}`}
                    className="text-sm text-blue-600 hover:text-blue-500 font-medium"
                  >
                    View Course Details →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}