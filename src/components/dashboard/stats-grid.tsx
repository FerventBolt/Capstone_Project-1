import StatsCard from './stats-card'

interface StatsData {
  totalUsers: number
  totalCourses: number
  totalCertifications: number
  activeEnrollments: number
  pendingApplications: number
  upcomingExams: number
}

interface StatsGridProps {
  stats: StatsData
  loading?: boolean
}

export default function StatsGrid({ stats, loading = false }: StatsGridProps): JSX.Element {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-6 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 animate-pulse">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-gray-200 rounded-lg w-10 h-10 sm:w-12 sm:h-12"></div>
              <div className="ml-3 sm:ml-4 flex-1">
                <div className="h-3 bg-gray-200 rounded mb-2"></div>
                <div className="h-6 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const statsConfig = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: (
        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
      iconBgColor: 'bg-blue-100',
      iconTextColor: 'text-blue-600',
      trend: { value: 12, isPositive: true }
    },
    {
      title: 'Total Courses',
      value: stats.totalCourses,
      icon: (
        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      iconBgColor: 'bg-green-100',
      iconTextColor: 'text-green-600',
      trend: { value: 8, isPositive: true }
    },
    {
      title: 'Certifications',
      value: stats.totalCertifications,
      icon: (
        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      iconBgColor: 'bg-purple-100',
      iconTextColor: 'text-purple-600'
    },
    {
      title: 'Active Enrollments',
      value: stats.activeEnrollments,
      icon: (
        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      iconBgColor: 'bg-yellow-100',
      iconTextColor: 'text-yellow-600',
      trend: { value: 5, isPositive: true }
    },
    {
      title: 'Pending Applications',
      value: stats.pendingApplications,
      icon: (
        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      iconBgColor: 'bg-red-100',
      iconTextColor: 'text-red-600',
      trend: { value: 3, isPositive: false }
    },
    {
      title: 'Upcoming Exams',
      value: stats.upcomingExams,
      icon: (
        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      iconBgColor: 'bg-indigo-100',
      iconTextColor: 'text-indigo-600'
    }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-6 gap-4 sm:gap-6 mb-6 sm:mb-8">
      {statsConfig.map((config, index) => (
        <StatsCard
          key={index}
          title={config.title}
          value={config.value}
          icon={config.icon}
          iconBgColor={config.iconBgColor}
          iconTextColor={config.iconTextColor}
          trend={config.trend}
        />
      ))}
    </div>
  )
}