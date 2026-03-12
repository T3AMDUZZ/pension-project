'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search, Calendar, Users, ChevronRight, Bell } from 'lucide-react'
import ImageSlider from '@/components/public/ImageSlider'
import RoomCard from '@/components/public/RoomCard'
import Button from '@/components/ui/Button'
import { formatDate } from '@/lib/utils'
import type { Room, Notice } from '@/lib/types'

const heroImages = [
  { url: '', alt: '숲속의 아침 펜션 전경' },
  { url: '', alt: '아름다운 자연 속 펜션' },
  { url: '', alt: '편안한 객실 내부' },
  { url: '', alt: '바베큐 시설' },
]

export default function HomePage() {
  const router = useRouter()
  const [rooms, setRooms] = useState<Room[]>([])
  const [notices, setNotices] = useState<Notice[]>([])
  const [pensionInfo, setPensionInfo] = useState<string>('')
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guests, setGuests] = useState('2')

  useEffect(() => {
    // Fetch rooms
    fetch('/api/rooms')
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setRooms(json.data?.slice(0, 4) || [])
      })
      .catch(() => {})

    // Fetch notices
    fetch('/api/notices?limit=3')
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setNotices(json.data || [])
      })
      .catch(() => {})

    // Fetch settings
    fetch('/api/settings')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data?.pension_info) {
          const info = json.data.pension_info
          setPensionInfo(typeof info === 'string' ? info : info.description || '')
        }
      })
      .catch(() => {})
  }, [])

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (checkIn) params.set('check_in', checkIn)
    if (checkOut) params.set('check_out', checkOut)
    if (guests) params.set('guests', guests)
    router.push(`/rooms?${params.toString()}`)
  }

  return (
    <div>
      {/* Hero Banner */}
      <section className="relative">
        <ImageSlider
          images={heroImages}
          height="h-[450px] md:h-[550px]"
          overlay={
            <div className="text-center text-white px-4">
              <h1 className="text-3xl md:text-5xl font-bold mb-4 drop-shadow-lg">
                숲속의 아침
              </h1>
              <p className="text-lg md:text-xl mb-8 drop-shadow-md">
                자연 속에서 편안한 휴식을 즐기세요
              </p>
            </div>
          }
        />

        {/* Quick Booking Form */}
        <div className="absolute bottom-0 left-0 right-0 z-20 transform translate-y-1/2">
          <div className="max-w-4xl mx-auto px-4">
            <div className="bg-white rounded-2xl shadow-xl p-4 md:p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    <Calendar size={12} className="inline mr-1" />
                    체크인
                  </label>
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pension-primary/50 focus:border-pension-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    <Calendar size={12} className="inline mr-1" />
                    체크아웃
                  </label>
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    min={checkIn || new Date().toISOString().split('T')[0]}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pension-primary/50 focus:border-pension-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    <Users size={12} className="inline mr-1" />
                    인원
                  </label>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pension-primary/50 focus:border-pension-primary bg-white"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                      <option key={n} value={n}>
                        {n}명
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={handleSearch}
                    className="w-full py-2.5"
                    size="lg"
                  >
                    <Search size={18} className="mr-2" />
                    검색
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Spacer for overlapping form */}
      <div className="h-20 md:h-16" />

      {/* Room Preview Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">객실 안내</h2>
          <p className="text-gray-500">다양한 객실에서 편안한 시간을 보내세요</p>
        </div>
        {rooms.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {rooms.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-100 rounded-xl h-72 animate-pulse" />
            ))}
          </div>
        )}
        <div className="text-center mt-8">
          <Link href="/rooms">
            <Button variant="outline" size="lg">
              전체 객실 보기
              <ChevronRight size={18} className="ml-1" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Pension Info Section */}
      <section className="bg-pension-light/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div className="h-64 md:h-80 bg-gradient-to-br from-pension-primary to-pension-secondary rounded-2xl flex items-center justify-center">
              <span className="text-white/50 text-lg">펜션 대표 이미지</span>
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                숲속의 아침에 오신 것을 환영합니다
              </h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                {pensionInfo ||
                  '아름다운 자연 속에 위치한 숲속의 아침 펜션은 도심의 번잡함을 벗어나 편안한 휴식을 즐길 수 있는 최적의 공간입니다. 깨끗한 객실과 넓은 바베큐장, 그리고 사계절 아름다운 자연 경관이 여러분을 기다립니다.'}
              </p>
              <Link href="/about" className="inline-block mt-6">
                <Button variant="outline">
                  더 알아보기
                  <ChevronRight size={16} className="ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Notices Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bell size={22} className="text-pension-primary" />
            공지사항
          </h2>
          <Link
            href="/notice"
            className="text-sm text-pension-primary hover:underline flex items-center gap-1"
          >
            전체보기 <ChevronRight size={14} />
          </Link>
        </div>
        {notices.length > 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {notices.map((notice) => (
              <Link
                key={notice.id}
                href={`/notice/${notice.id}`}
                className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {notice.is_pinned && (
                    <span className="text-pension-primary text-xs font-bold bg-pension-primary/10 px-2 py-0.5 rounded">
                      필독
                    </span>
                  )}
                  <span className="text-gray-800 truncate">{notice.title}</span>
                </div>
                <span className="text-sm text-gray-400 ml-4 shrink-0">
                  {formatDate(notice.created_at)}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">
            등록된 공지사항이 없습니다.
          </div>
        )}
      </section>
    </div>
  )
}
