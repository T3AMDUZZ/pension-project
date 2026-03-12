'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const subNavItems = [
  { href: '/about', label: '인사말' },
  { href: '/about/location', label: '오시는 길' },
  { href: '/about/attractions', label: '주변 관광지' },
]

function AboutSubNav() {
  const pathname = usePathname()
  return (
    <div className="flex gap-1 mb-8 border-b border-gray-200">
      {subNavItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            'px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors',
            pathname === item.href
              ? 'border-pension-primary text-pension-primary'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          )}
        >
          {item.label}
        </Link>
      ))}
    </div>
  )
}

export { AboutSubNav }

export default function AboutPage() {
  const [description, setDescription] = useState('')

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data?.pension_info) {
          const info = json.data.pension_info
          setDescription(typeof info === 'string' ? info : info.description || '')
        }
      })
      .catch(() => {})
  }, [])

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">펜션 소개</h1>
      <p className="text-gray-500 mb-6">숲속의 아침 펜션을 소개합니다</p>

      <AboutSubNav />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
        {/* Image */}
        <div className="h-72 md:h-96 bg-gradient-to-br from-pension-primary to-pension-secondary rounded-2xl flex items-center justify-center">
          <span className="text-white/50 text-lg">펜션 대표 이미지</span>
        </div>

        {/* Content */}
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
            자연 속에서 찾는 편안한 휴식
          </h2>
          <div className="space-y-4 text-gray-600 leading-relaxed">
            {description ? (
              <p className="whitespace-pre-line">{description}</p>
            ) : (
              <>
                <p>
                  숲속의 아침 펜션은 경기도 가평의 아름다운 자연 속에 위치한
                  전원형 펜션입니다. 사계절 변화하는 자연의 아름다움을 느끼며
                  도시의 번잡함에서 벗어나 진정한 휴식을 취할 수 있는 곳입니다.
                </p>
                <p>
                  깨끗하고 넓은 객실, 자연을 만끽할 수 있는 테라스,
                  가족과 함께 즐길 수 있는 바베큐 시설, 그리고 주변의
                  다양한 관광지가 여러분의 특별한 여행을 만들어 드립니다.
                </p>
                <p>
                  소중한 사람들과 함께 숲속의 아침에서 잊지 못할
                  추억을 만들어 보세요.
                </p>
              </>
            )}
          </div>

          <div className="mt-8 grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-pension-light/30 rounded-xl">
              <p className="text-2xl font-bold text-pension-primary">15+</p>
              <p className="text-xs text-gray-500 mt-1">운영 경력(년)</p>
            </div>
            <div className="text-center p-4 bg-pension-light/30 rounded-xl">
              <p className="text-2xl font-bold text-pension-primary">8</p>
              <p className="text-xs text-gray-500 mt-1">객실 수</p>
            </div>
            <div className="text-center p-4 bg-pension-light/30 rounded-xl">
              <p className="text-2xl font-bold text-pension-primary">4.8</p>
              <p className="text-xs text-gray-500 mt-1">만족도</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
