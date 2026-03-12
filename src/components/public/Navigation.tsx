'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

// 네비게이션 메뉴 항목
const navItems = [
  { href: '/', label: '메인' },
  { href: '/rooms', label: '객실안내' },
  { href: '/reservation', label: '예약하기' },
  { href: '/about', label: '펜션소개' },
  { href: '/notice', label: '공지사항' },
  { href: '/guide', label: '이용안내' },
]

interface NavigationProps {
  mobile?: boolean
  onItemClick?: () => void
}

export default function Navigation({ mobile = false, onItemClick }: NavigationProps) {
  const pathname = usePathname()

  return (
    <nav className={cn(mobile ? 'flex flex-col gap-1' : 'flex items-center gap-1')}>
      {navItems.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onItemClick}
            className={cn(
              'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              mobile ? 'block w-full' : '',
              isActive
                ? 'text-pension-primary bg-pension-primary/10'
                : 'text-gray-600 hover:text-pension-primary hover:bg-gray-50'
            )}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
