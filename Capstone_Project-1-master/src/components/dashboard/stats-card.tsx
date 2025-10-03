import { ReactNode } from 'react'

interface StatsCardProps {
  title: string
  value: string | number
  icon: ReactNode
  iconBgColor: string
  iconTextColor: string
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
}

export default function StatsCard({
  title,
  value,
  icon,
  iconBgColor,
  iconTextColor,
  trend,
  className = ''
}: StatsCardProps): JSX.Element {
  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      return val.toLocaleString()
    }
    return val
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 transition-all hover:shadow-md ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className={`p-2 sm:p-3 ${iconBgColor} rounded-lg flex-shrink-0`}>
            <div className={`w-5 h-5 sm:w-6 sm:h-6 ${iconTextColor}`}>
              {icon}
            </div>
          </div>
          <div className="ml-3 sm:ml-4 min-w-0 flex-1">
            <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">{title}</p>
            <p className="text-lg sm:text-2xl font-bold text-gray-900 mt-1">{formatValue(value)}</p>
          </div>
        </div>
        {trend && (
          <div className={`flex items-center text-sm ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            <svg 
              className={`w-4 h-4 mr-1 ${trend.isPositive ? '' : 'rotate-180'}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
            </svg>
            <span className="font-medium">{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>
    </div>
  )
}