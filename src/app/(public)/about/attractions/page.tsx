'use client'

import { Clock } from 'lucide-react'
import { AboutSubNav } from '../page'

const attractions = [
  {
    name: '남이섬',
    description: '사계절 아름다운 풍경을 자랑하는 반달 모양의 섬. 메타세쿼이아 길과 은행나무 길이 유명합니다.',
    distance: '차량 약 20분',
    category: '관광지',
  },
  {
    name: '쁘띠프랑스',
    description: '프랑스 문화마을로 이국적인 건물과 공연, 체험을 즐길 수 있습니다.',
    distance: '차량 약 15분',
    category: '테마파크',
  },
  {
    name: '자라섬',
    description: '재즈 페스티벌로 유명한 자라섬. 캠핑장과 산책로가 잘 조성되어 있습니다.',
    distance: '차량 약 25분',
    category: '관광지',
  },
  {
    name: '아침고요수목원',
    description: '축령산 자락에 위치한 아름다운 수목원. 야간 조명 축제가 특히 유명합니다.',
    distance: '차량 약 10분',
    category: '수목원',
  },
  {
    name: '가평 레일바이크',
    description: '경춘선 폐선 구간을 활용한 레일바이크. 북한강의 아름다운 풍경을 즐기며 페달을 밟아보세요.',
    distance: '차량 약 30분',
    category: '레저',
  },
  {
    name: '용추계곡',
    description: '맑은 물과 울창한 숲이 어우러진 계곡. 여름철 물놀이 명소입니다.',
    distance: '차량 약 20분',
    category: '자연',
  },
]

export default function AttractionsPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">주변 관광지</h1>
      <p className="text-gray-500 mb-6">펜션 주변의 가볼 만한 관광지를 소개합니다</p>

      <AboutSubNav />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {attractions.map((attraction) => (
          <div
            key={attraction.name}
            className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
          >
            {/* Image placeholder */}
            <div className="h-44 bg-gradient-to-br from-pension-primary/70 to-pension-secondary/70 flex items-center justify-center">
              <span className="text-white/50 text-sm">{attraction.name}</span>
            </div>

            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs bg-pension-primary/10 text-pension-primary px-2 py-0.5 rounded-full font-medium">
                  {attraction.category}
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{attraction.name}</h3>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{attraction.description}</p>
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <Clock size={12} />
                <span>{attraction.distance}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
