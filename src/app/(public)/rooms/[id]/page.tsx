'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Users, Maximize, Snowflake, Tv, Wifi, Flame, Car, Bath,
  AirVent, Utensils, Coffee, WashingMachine, Mountain, TreePine,
  ChevronLeft,
} from 'lucide-react'
import ImageGallery from '@/components/public/ImageGallery'
import Calendar from '@/components/public/Calendar'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { PageLoading } from '@/components/ui/Loading'
import { formatPrice } from '@/lib/utils'
import type { Room, RoomPrice, Season } from '@/lib/types'

// Amenity icon mapping
const amenityIcons: Record<string, React.ReactNode> = {
  '에어컨': <Snowflake size={18} />,
  'TV': <Tv size={18} />,
  '와이파이': <Wifi size={18} />,
  'WiFi': <Wifi size={18} />,
  '바베큐': <Flame size={18} />,
  '주차': <Car size={18} />,
  '욕조': <Bath size={18} />,
  '냉장고': <AirVent size={18} />,
  '취사': <Utensils size={18} />,
  '커피포트': <Coffee size={18} />,
  '세탁기': <WashingMachine size={18} />,
  '산 전망': <Mountain size={18} />,
  '정원': <TreePine size={18} />,
}

interface RoomWithPrices extends Room {
  prices: (RoomPrice & { seasons: Season })[]
}

export default function RoomDetailPage() {
  const params = useParams()
  const router = useRouter()
  const roomId = params.id as string

  const [room, setRoom] = useState<RoomWithPrices | null>(null)
  const [loading, setLoading] = useState(true)
  const [checkIn, setCheckIn] = useState<string | null>(null)
  const [checkOut, setCheckOut] = useState<string | null>(null)

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const res = await fetch(`/api/rooms/${roomId}`)
        const json = await res.json()
        if (json.success) {
          setRoom(json.data)
        }
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    fetchRoom()
  }, [roomId])

  const handleReservation = () => {
    const params = new URLSearchParams({ room_id: roomId })
    if (checkIn) params.set('check_in', checkIn)
    if (checkOut) params.set('check_out', checkOut)
    router.push(`/reservation?${params.toString()}`)
  }

  if (loading) return <PageLoading />

  if (!room) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 text-lg mb-4">객실을 찾을 수 없습니다.</p>
        <Link href="/rooms">
          <Button variant="outline">객실 목록으로 돌아가기</Button>
        </Link>
      </div>
    )
  }

  const images = room.images?.length > 0
    ? room.images.sort((a, b) => a.sort_order - b.sort_order)
    : [
        { url: '', alt: `${room.name} 이미지 1`, is_primary: true, sort_order: 0 },
        { url: '', alt: `${room.name} 이미지 2`, is_primary: false, sort_order: 1 },
        { url: '', alt: `${room.name} 이미지 3`, is_primary: false, sort_order: 2 },
      ]

  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <div className="mb-4">
          <Link
            href="/rooms"
            className="inline-flex items-center text-sm text-gray-500 hover:text-pension-primary transition-colors"
          >
            <ChevronLeft size={16} />
            객실 목록
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left - Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <ImageGallery images={images} />

            {/* Room Info */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                {room.type && <Badge variant="primary">{room.type}</Badge>}
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{room.name}</h1>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Users size={16} />
                  기준 {room.base_capacity}명 / 최대 {room.max_capacity}명
                </span>
                {room.size && (
                  <span className="flex items-center gap-1">
                    <Maximize size={16} />
                    {room.size}
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            {room.description && (
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-3">객실 소개</h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                  {room.description}
                </p>
              </div>
            )}

            {/* Amenities */}
            {room.amenities && room.amenities.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-3">편의시설</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {room.amenities.map((amenity) => (
                    <div
                      key={amenity}
                      className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-lg text-sm text-gray-700"
                    >
                      <span className="text-pension-primary">
                        {amenityIcons[amenity] || <Snowflake size={18} />}
                      </span>
                      {amenity}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Price Table */}
            {room.prices && room.prices.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-3">요금 안내</h2>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-pension-primary/10">
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border border-gray-200">
                          시즌
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 border border-gray-200">
                          주중
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 border border-gray-200">
                          주말 (금/토)
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 border border-gray-200">
                          추가인원
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {room.prices.map((price) => (
                        <tr key={price.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-700 border border-gray-200 font-medium">
                            {price.seasons?.name || '기본'}
                          </td>
                          <td className="px-4 py-3 text-sm text-center text-gray-700 border border-gray-200">
                            {formatPrice(price.weekday_price)}
                          </td>
                          <td className="px-4 py-3 text-sm text-center text-gray-700 border border-gray-200">
                            {formatPrice(price.weekend_price)}
                          </td>
                          <td className="px-4 py-3 text-sm text-center text-gray-700 border border-gray-200">
                            {price.extra_person_price > 0
                              ? `${formatPrice(price.extra_person_price)}/인`
                              : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  * 기준 인원 초과 시 추가 요금이 부과됩니다.
                </p>
              </div>
            )}

            {/* Calendar */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-3">예약 현황</h2>
              <Calendar
                roomId={roomId}
                onDateSelect={(ci, co) => {
                  setCheckIn(ci)
                  setCheckOut(co)
                }}
                selectedCheckIn={checkIn}
                selectedCheckOut={checkOut}
              />
            </div>
          </div>

          {/* Right - Sidebar (sticky) */}
          <div className="hidden lg:block">
            <div className="sticky top-20">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
                <h3 className="text-lg font-bold text-gray-900">{room.name}</h3>
                <div className="text-sm text-gray-500 space-y-1">
                  <p>기준 {room.base_capacity}명 / 최대 {room.max_capacity}명</p>
                  {room.size && <p>크기: {room.size}</p>}
                </div>

                {checkIn && checkOut && (
                  <div className="bg-pension-light/50 rounded-lg p-3 text-sm">
                    <p className="text-gray-600">
                      <span className="font-medium">체크인:</span> {checkIn}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">체크아웃:</span> {checkOut}
                    </p>
                  </div>
                )}

                <Button onClick={handleReservation} className="w-full" size="lg">
                  예약하기
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile fixed bottom CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 p-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <p className="text-sm font-bold text-gray-900">{room.name}</p>
            {checkIn && checkOut && (
              <p className="text-xs text-gray-500">
                {checkIn} ~ {checkOut}
              </p>
            )}
          </div>
          <Button onClick={handleReservation} size="lg">
            예약하기
          </Button>
        </div>
      </div>
      {/* Spacer for mobile fixed bottom */}
      <div className="lg:hidden h-20" />
    </div>
  )
}
