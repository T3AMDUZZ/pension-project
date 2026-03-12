'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Users, Info } from 'lucide-react'
import StepIndicator from '@/components/public/StepIndicator'
import Calendar from '@/components/public/Calendar'
import Button from '@/components/ui/Button'
import { PageLoading } from '@/components/ui/Loading'
import { formatPrice, getDaysBetween } from '@/lib/utils'
import type { Room, PriceCalculation } from '@/lib/types'

export default function ReservationStep1Page() {
  return (
    <Suspense fallback={<PageLoading />}>
      <ReservationStep1Content />
    </Suspense>
  )
}

function ReservationStep1Content() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const roomIdParam = searchParams.get('room_id')
  const checkInParam = searchParams.get('check_in')
  const checkOutParam = searchParams.get('check_out')

  const [rooms, setRooms] = useState<Room[]>([])
  const [selectedRoomId, setSelectedRoomId] = useState(roomIdParam || '')
  const [checkIn, setCheckIn] = useState<string | null>(checkInParam)
  const [checkOut, setCheckOut] = useState<string | null>(checkOutParam)
  const [guests, setGuests] = useState(2)
  const [pricing, setPricing] = useState<PriceCalculation | null>(null)
  const [pricingLoading, setPricingLoading] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/rooms')
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setRooms(json.data || [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const calculatePrice = useCallback(async () => {
    if (!selectedRoomId || !checkIn || !checkOut) {
      setPricing(null)
      return
    }
    setPricingLoading(true)
    try {
      const params = new URLSearchParams({
        room_id: selectedRoomId,
        check_in: checkIn,
        check_out: checkOut,
        guests_count: String(guests),
      })
      const res = await fetch(`/api/pricing/calculate?${params.toString()}`)
      const json = await res.json()
      if (json.success) {
        setPricing(json.data)
      } else {
        setPricing(null)
      }
    } catch {
      setPricing(null)
    } finally {
      setPricingLoading(false)
    }
  }, [selectedRoomId, checkIn, checkOut, guests])

  useEffect(() => {
    calculatePrice()
  }, [calculatePrice])

  const selectedRoom = rooms.find((r) => r.id === selectedRoomId)

  const handleNext = () => {
    if (!selectedRoomId || !checkIn || !checkOut) return
    const params = new URLSearchParams({
      room_id: selectedRoomId,
      check_in: checkIn,
      check_out: checkOut,
      guests: String(guests),
    })
    router.push(`/reservation/info?${params.toString()}`)
  }

  const isValid = selectedRoomId && checkIn && checkOut && guests > 0

  if (loading) return <PageLoading />

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <StepIndicator currentStep={1} />

      <h1 className="text-2xl font-bold text-gray-900 mb-6">날짜 선택</h1>

      <div className="space-y-6">
        {/* Room Selection */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-lg font-bold text-gray-900 mb-3">객실 선택</h2>
          <select
            value={selectedRoomId}
            onChange={(e) => setSelectedRoomId(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pension-primary/50 focus:border-pension-primary bg-white"
          >
            <option value="">객실을 선택해주세요</option>
            {rooms.map((room) => (
              <option key={room.id} value={room.id}>
                {room.name} ({room.type} / 기준 {room.base_capacity}명, 최대 {room.max_capacity}명)
              </option>
            ))}
          </select>
          {selectedRoom && (
            <div className="mt-3 p-3 bg-pension-light/30 rounded-lg text-sm text-gray-600">
              <p className="font-medium text-gray-800">{selectedRoom.name}</p>
              <p>기준 {selectedRoom.base_capacity}명 / 최대 {selectedRoom.max_capacity}명
                {selectedRoom.size && ` / ${selectedRoom.size}`}
              </p>
            </div>
          )}
        </div>

        {/* Calendar */}
        {selectedRoomId && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-3">날짜 선택</h2>
            <Calendar
              roomId={selectedRoomId}
              onDateSelect={(ci, co) => {
                setCheckIn(ci)
                setCheckOut(co)
              }}
              selectedCheckIn={checkIn}
              selectedCheckOut={checkOut}
            />
            {checkIn && !checkOut && (
              <p className="mt-2 text-sm text-pension-primary flex items-center gap-1">
                <Info size={14} />
                체크아웃 날짜를 선택해주세요
              </p>
            )}
          </div>
        )}

        {/* Guests */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Users size={18} />
            인원 선택
          </h2>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setGuests(Math.max(1, guests - 1))}
              className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-lg hover:bg-gray-50 transition-colors"
            >
              -
            </button>
            <span className="text-xl font-bold text-gray-900 w-12 text-center">{guests}명</span>
            <button
              onClick={() => setGuests(Math.min(selectedRoom?.max_capacity || 10, guests + 1))}
              className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-lg hover:bg-gray-50 transition-colors"
            >
              +
            </button>
          </div>
          {selectedRoom && guests > selectedRoom.base_capacity && (
            <p className="mt-2 text-xs text-orange-600">
              기준 인원({selectedRoom.base_capacity}명) 초과 시 추가 요금이 발생합니다.
            </p>
          )}
        </div>

        {/* Price Preview */}
        {checkIn && checkOut && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-lg font-bold text-gray-900 mb-3">요금 미리보기</h2>
            {pricingLoading ? (
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <div className="animate-spin h-4 w-4 border-2 border-pension-primary border-t-transparent rounded-full" />
                계산 중...
              </div>
            ) : pricing ? (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{getDaysBetween(checkIn, checkOut)}박 숙박요금</span>
                  <span>{formatPrice(pricing.base_total)}</span>
                </div>
                {pricing.extra_person_total > 0 && (
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>추가 인원 요금</span>
                    <span>{formatPrice(pricing.extra_person_total)}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-gray-200 flex justify-between font-bold text-pension-primary">
                  <span>총 합계</span>
                  <span className="text-xl">{formatPrice(pricing.total_price)}</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-400">요금 정보를 불러올 수 없습니다.</p>
            )}
          </div>
        )}

        {/* Next button */}
        <div className="flex justify-end">
          <Button
            onClick={handleNext}
            disabled={!isValid}
            size="lg"
            className="px-12"
          >
            다음 단계
          </Button>
        </div>
      </div>
    </div>
  )
}
