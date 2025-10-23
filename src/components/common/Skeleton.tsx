import React from 'react'
import { motion } from 'framer-motion'

interface SkeletonProps {
  className?: string
  width?: string | number
  height?: string | number
  rounded?: boolean
  animated?: boolean
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  width = '100%',
  height = '1rem',
  rounded = false,
  animated = true
}) => {
  const baseClasses = `bg-slate-200 dark:bg-slate-700 ${rounded ? 'rounded-full' : 'rounded'} ${className}`
  
  if (!animated) {
    return (
      <div
        className={baseClasses}
        style={{ width, height }}
      />
    )
  }

  return (
    <div
      className={baseClasses}
      style={{ width, height }}
    />
  )
}

interface SkeletonCardProps {
  className?: string
  lines?: number
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  className = '',
  lines = 3
}) => {
  return (
    <div className={`p-4 bg-white dark:bg-slate-800 rounded-lg shadow ${className}`}>
      <div className="space-y-3">
        <Skeleton width="60%" height="1.5rem" />
        {Array.from({ length: lines }).map((_, index) => (
          <Skeleton key={index} width={`${80 - index * 10}%`} />
        ))}
      </div>
    </div>
  )
}

interface SkeletonListProps {
  count?: number
  className?: string
}

export const SkeletonList: React.FC<SkeletonListProps> = ({
  count = 5,
  className = ''
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} lines={2} />
      ))}
    </div>
  )
} 