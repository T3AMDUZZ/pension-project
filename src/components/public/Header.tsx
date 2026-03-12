'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, Phone } from 'lucide-react'
import Navigation from './Navigation'

// 사용자 페이지 헤더
export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* 로고 */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-pension-primary">숲속의 아침</span>
          </Link>

          {/* 데스크탑 네비게이션 */}
          <div className="hidden md:block">
            <Navigation />
          </div>

          {/* 전화 아이콘 + 모바일 메뉴 버튼 */}
          <div className="flex items-center gap-2">
            <a
              href="tel:010-0000-0000"
              className="p-2 text-pension-primary hover:bg-pension-primary/10 rounded-lg transition-colors"
              aria-label="전화 문의"
            >
              <Phone size={20} />
            </a>

            {/* 모바일 햄버거 메뉴 */}
            <button
              className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="메뉴 열기"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* 모바일 네비게이션 */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-3">
            <Navigation mobile onItemClick={() => setIsMobileMenuOpen(false)} />
          </div>
        </div>
      )}
    </header>
  )
}
