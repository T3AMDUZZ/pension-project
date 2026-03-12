'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import StepIndicator from '@/components/public/StepIndicator'
import Button from '@/components/ui/Button'
import { PageLoading } from '@/components/ui/Loading'
import { formatPrice, getDaysBetween, formatDate } from '@/lib/utils'
import type { Room, PriceCalculation } from '@/lib/types'

export default function ReservationStep2Page() {
  return (
    <Suspense fallback={<PageLoading />}>
      <ReservationStep2Content />
    </Suspense>
  )
}

function ReservationStep2Content() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const roomId = searchParams.get('room_id') || ''
  const checkIn = searchParams.get('check_in') || ''
  const checkOut = searchParams.get('check_out') || ''
  const guestsParam = searchParams.get('guests') || '2'
  const guestsCount = parseInt(guestsParam)

  const [room, setRoom] = useState<Room | null>(null)
  const [pricing, setPricing] = useState<PriceCalculation | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Form state
  const [guestName, setGuestName] = useState('')
  const [phone, setPhone] = useState('')
  const [vehicleNumber, setVehicleNumber] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'bank_transfer' | 'on_site'>('bank_transfer')
  const [memo, setMemo] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!roomId || !checkIn || !checkOut) {
      router.push('/reservation')
      return
    }

    Promise.all([
      fetch(`/api/rooms/${roomId}`).then((res) => res.json()),
      fetch(
        `/api/pricing/calculate?room_id=${roomId}&check_in=${checkIn}&check_out=${checkOut}&guests_count=${guestsCount}`
      ).then((res) => res.json()),
    ])
      .then(([roomJson, pricingJson]) => {
        if (roomJson.success) setRoom(roomJson.data)
        if (pricingJson.success) setPricing(pricingJson.data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [roomId, checkIn, checkOut, guestsCount, router])

  const formatPhoneInput = (value: string) => {
    const numbers = value.replace(/\D/g, '').slice(0, 11)
    if (numbers.length <= 3) return numbers
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!guestName.trim()) newErrors.guestName = '예약자 이름을 입력해주세요.'
    const phoneNumbers = phone.replace(/\D/g, '')
    if (!phoneNumbers || phoneNumbers.length < 10) {
      newErrors.phone = '올바른 휴대폰 번호를 입력해주세요.'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setSubmitting(true)

    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          room_id: roomId,
          guest_name: guestName.trim(),
          phone: phone.replace(/\D/g, ''),
          check_in: checkIn,
          check_out: checkOut,
          guests_count: guestsCount,
          payment_method: paymentMethod,
          vehicle_number: vehicleNumber.trim() || null,
          memo: memo.trim() || null,
        }),
      })
      const json = await res.json()
      if (json.success) {
        const reservation = json.data
        const params = new URLSearchParams({
          id: reservation.id,
          payment_method: paymentMethod,
        })
        router.push(`/reservation/complete?${params.toString()}`)
      } else {
        alert(json.error || '예약에 실패했습니다. 다시 시도해주세요.')
      }
    } catch {
      alert('서버 오류가 발생했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <PageLoading />

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <StepIndicator currentStep={2} />

      <h1 className="text-2xl font-bold text-gray-900 mb-6">정보 입력</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2 space-y-5">
          {/* Guest Name */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
            <h2 className="text-lg font-bold text-gray-900">예약자 정보</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                예약자 이름 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="이름을 입력해주세요"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pension-primary/50 focus:border-pension-primary"
              />
              {errors.guestName && (
                <p className="mt-1 text-sm text-red-600">{errors.guestName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                연락처 (휴대폰) <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(formatPhoneInput(e.target.value))}
                placeholder="010-0000-0000"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pension-primary/50 focus:border-pension-primary"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                차량번호 <span className="text-gray-400">(선택)</span>
              </label>
              <input
                type="text"
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value)}
                placeholder="12가 3456"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pension-primary/50 focus:border-pension-primary"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
            <h2 className="text-lg font-bold text-gray-900">결제 방식</h2>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors has-[:checked]:border-pension-primary has-[:checked]:bg-pension-primary/5">
                <input
                  type="radio"
                  name="payment"
                  value="bank_transfer"
                  checked={paymentMethod === 'bank_transfer'}
                  onChange={() => setPaymentMethod('bank_transfer')}
                  className="w-4 h-4 text-pension-primary focus:ring-pension-primary"
                />
                <div>
                  <p className="text-sm font-medium text-gray-800">무통장 입금</p>
                  <p className="text-xs text-gray-500">예약 후 안내된 계좌로 입금해주세요</p>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors has-[:checked]:border-pension-primary has-[:checked]:bg-pension-primary/5">
                <input
                  type="radio"
                  name="payment"
                  value="on_site"
                  checked={paymentMethod === 'on_site'}
                  onChange={() => setPaymentMethod('on_site')}
                  className="w-4 h-4 text-pension-primary focus:ring-pension-primary"
                />
                <div>
                  <p className="text-sm font-medium text-gray-800">현장 결제</p>
                  <p className="text-xs text-gray-500">체크인 시 현장에서 결제합니다</p>
                </div>
              </label>
            </div>
          </div>

          {/* Memo */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              요청사항 <span className="text-gray-400">(선택)</span>
            </label>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="요청사항을 입력해주세요"
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pension-primary/50 focus:border-pension-primary resize-none"
            />
          </div>

          {/* Submit */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              &larr; 이전 단계
            </button>
            <Button
              onClick={handleSubmit}
              loading={submitting}
              size="lg"
              className="px-12"
            >
              예약하기
            </Button>
          </div>
        </div>

        {/* Sidebar - Summary */}
        <div>
          <div className="sticky top-20 bg-white rounded-xl border border-gray-200 p-5 space-y-4">
            <h3 className="text-lg font-bold text-gray-900">예약 요약</h3>
            {room && (
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">객실</span>
                  <span className="font-medium text-gray-800">{room.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">체크인</span>
                  <span className="font-medium text-gray-800">{formatDate(checkIn)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">체크아웃</span>
                  <span className="font-medium text-gray-800">{formatDate(checkOut)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">숙박</span>
                  <span className="font-medium text-gray-800">{getDaysBetween(checkIn, checkOut)}박</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">인원</span>
                  <span className="font-medium text-gray-800">{guestsCount}명</span>
                </div>
                {pricing && (
                  <>
                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex justify-between">
                        <span className="text-gray-500">숙박 요금</span>
                        <span>{formatPrice(pricing.base_total)}</span>
                      </div>
                      {pricing.extra_person_total > 0 && (
                        <div className="flex justify-between mt-1">
                          <span className="text-gray-500">추가 인원</span>
                          <span>{formatPrice(pricing.extra_person_total)}</span>
                        </div>
                      )}
                    </div>
                    <div className="pt-3 border-t border-gray-200 flex justify-between font-bold text-pension-primary text-base">
                      <span>총 합계</span>
                      <span>{formatPrice(pricing.total_price)}</span>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
