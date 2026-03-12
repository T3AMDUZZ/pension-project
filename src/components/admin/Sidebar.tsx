'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  CalendarCheck,
  BedDouble,
  DollarSign,
  Bell,
  Settings,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// 관리자 사이드바 메뉴 항목
const menuItems = [
  { href: '/admin', label: '대시보드', icon: LayoutDashboard },
  { href: '/admin/reservations', label: '예약관리', icon: CalendarCheck },
  { href: '/admin/rooms', label: '객실관리', icon: BedDouble },
  { href: '/admin/pricing', label: '요금관리', icon: DollarSign },
  { href: '/admin/notices', label: '공지관리', icon: Bell },
  { href: '/admin/settings', label: '설정', icon: Settings },
]

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* 모바일 오버레이 */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* 사이드바 */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-64 bg-gray-900 text-white transition-transform duration-300',
          'lg:translate-x-0 lg:static lg:z-auto',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* 사이드바 헤더 */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-700">
          <Link href="/admin" className="text-lg font-bold text-white">
            관리자
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* 메뉴 목록 */}
        <nav className="mt-4 px-3 space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-pension-primary text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                )}
              >
                <Icon size={20} />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </aside>
    </>
  )
}
