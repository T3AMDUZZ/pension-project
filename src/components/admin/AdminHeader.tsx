'use client'

import { Menu, LogOut } from 'lucide-react'

interface AdminHeaderProps {
  onMenuClick: () => void
}

// 관리자 상단 헤더
export default function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const handleLogout = () => {
    // TODO: 로그아웃 처리
    window.location.href = '/admin/login'
  }

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-gray-200 px-4 flex items-center justify-between">
      {/* 모바일 메뉴 버튼 */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="메뉴 열기"
      >
        <Menu size={24} />
      </button>

      {/* 빈 공간 (데스크탑) */}
      <div className="hidden lg:block" />

      {/* 우측: 관리자 정보 + 로그아웃 */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">관리자</span>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut size={16} />
          로그아웃
        </button>
      </div>
    </header>
  )
}
