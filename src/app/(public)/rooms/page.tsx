'use client'

import { useState, useEffect, useMemo, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { ArrowUpDown, Filter } from 'lucide-react'
import RoomCard from '@/components/public/RoomCard'
import { PageLoading } from '@/components/ui/Loading'
import type { Room } from '@/lib/types'

export default function RoomsPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <RoomsContent />
    </Suspense>
  )
}

function RoomsContent() {
  const searchParams = useSearchParams()
  const checkIn = searchParams.get('check_in')
  const checkOut = searchParams.get('check_out')
  const guestsParam = searchParams.get('guests')

  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [guestsFilter, setGuestsFilter] = useState<number>(
    guestsParam ? parseInt(guestsParam) : 0
  )
  const [sortOrder, setSortOrder] = useState<'default' | 'price_asc' | 'price_desc'>('default')

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await fetch('/api/rooms')
        const json = await res.json()
        if (json.success) {
          setRooms(json.data || [])
        }
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    fetchRooms()
  }, [])

  const filteredAndSorted = useMemo(() => {
    let result = [...rooms]

    // Filter by guest count
    if (guestsFilter > 0) {
      result = result.filter((room) => room.max_capacity >= guestsFilter)
    }

    // Sort
    if (sortOrder === 'price_asc') {
      result.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
    } else if (sortOrder === 'price_desc') {
      result.sort((a, b) => (b.sort_order || 0) - (a.sort_order || 0))
    }

    return result
  }, [rooms, guestsFilter, sortOrder])

  if (loading) return <PageLoading />

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">객실 안내</h1>
        <p className="text-gray-500">편안하고 아늑한 객실에서 특별한 시간을 보내세요</p>
        {checkIn && checkOut && (
          <p className="mt-2 text-sm text-pension-primary bg-pension-primary/10 inline-block px-3 py-1 rounded-full">
            {checkIn} ~ {checkOut} 예약 가능 객실
          </p>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-400" />
          <span className="text-sm text-gray-500">인원:</span>
          <select
            value={guestsFilter}
            onChange={(e) => setGuestsFilter(parseInt(e.target.value))}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-pension-primary/50 bg-white"
          >
            <option value={0}>전체</option>
            {[2, 3, 4, 5, 6, 7, 8].map((n) => (
              <option key={n} value={n}>
                {n}명 이상
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <ArrowUpDown size={16} className="text-gray-400" />
          <span className="text-sm text-gray-500">정렬:</span>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as typeof sortOrder)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-pension-primary/50 bg-white"
          >
            <option value="default">기본순</option>
            <option value="price_asc">이름순</option>
            <option value="price_desc">이름역순</option>
          </select>
        </div>
      </div>

      {/* Room Grid */}
      {filteredAndSorted.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSorted.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-gray-400 text-lg">조건에 맞는 객실이 없습니다.</p>
          <button
            onClick={() => {
              setGuestsFilter(0)
              setSortOrder('default')
            }}
            className="mt-4 text-pension-primary hover:underline text-sm"
          >
            필터 초기화
          </button>
        </div>
      )}
    </div>
  )
}
