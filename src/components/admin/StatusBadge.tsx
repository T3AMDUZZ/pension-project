'use client'

import { getStatusLabel, getStatusColor } from '@/lib/utils'

interface StatusBadgeProps {
  status: string
  className?: string
}

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(status)} ${className}`}
    >
      {getStatusLabel(status)}
    </span>
  )
}
