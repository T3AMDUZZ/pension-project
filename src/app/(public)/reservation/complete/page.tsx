'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, CreditCard, Building } from 'lucide-react'
import StepIndicator from '@/components/public/StepIndicator'
import Button from '@/components/ui/Button'
import { PageLoading } from '@/components/ui/Loading'
import { formatPrice, formatDate, getDaysBetween } from '@/lib/utils'
import type { Reservation, BankAccount } from '@/lib/types'

export default function ReservationCompletePage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <ReservationCompleteContent />
    </Suspense>
  )
}

function ReservationCompleteContent() {
  const searchParams = useSearchParams()
  const reservationId = searchParams.get('id')
  const paymentMethodParam = searchParams.get('payment_method')

  const [reservation, setReservation] = useState<Reservation | null>(null)
  const [bankAccount, setBankAccount] = useState<BankAccount | null>(null)
  const [loading, setLoading] = useState(!!reservationId)

  useEffect(() => {
    if (!reservationId) {
      return
    }

    // Fetch bank account settings
    fetch('/api/settings')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data?.bank_account) {
          setBankAccount(json.data.bank_account)
        }
      })
      .catch(() => {})

    // Fetch reservation details
    fetch(`/api/reservations/${reservationId}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setReservation(json.data)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [reservationId])

  if (loading) return <PageLoading />

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <StepIndicator currentStep={3} />

      {/* Success Message */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
          <CheckCircle size={40} className="text-green-600" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          예약이 완료되었습니다
        </h1>
        <p className="text-gray-500">
          아래 예약 정보를 확인해주세요
        </p>
      </div>

      {/* Reservation Info */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">예약 정보</h2>
        {reservation ? (
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">예약번호</span>
              <span className="font-bold text-pension-primary text-base">
                {reservation.reservation_number}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">객실</span>
              <span className="font-medium text-gray-800">
                {reservation.room?.name || '-'}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">체크인</span>
              <span className="font-medium text-gray-800">
                {formatDate(reservation.check_in)}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">체크아웃</span>
              <span className="font-medium text-gray-800">
                {formatDate(reservation.check_out)}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">숙박</span>
              <span className="font-medium text-gray-800">
                {getDaysBetween(reservation.check_in, reservation.check_out)}박
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">인원</span>
              <span className="font-medium text-gray-800">{reservation.guests_count}명</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">예약자</span>
              <span className="font-medium text-gray-800">{reservation.guest_name}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-500">결제 금액</span>
              <span className="font-bold text-pension-primary text-lg">
                {formatPrice(reservation.total_price)}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-gray-400 text-center py-4">예약 정보를 불러올 수 없습니다.</p>
        )}
      </div>

      {/* Payment Info */}
      {(paymentMethodParam === 'bank_transfer' || reservation?.payment_method === 'bank_transfer') ? (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-bold text-blue-900 mb-3 flex items-center gap-2">
            <Building size={20} />
            입금 안내
          </h2>
          <div className="space-y-2 text-sm text-blue-800">
            {bankAccount ? (
              <>
                <p>
                  <span className="font-medium">입금 은행:</span> {bankAccount.bank_name}
                </p>
                <p>
                  <span className="font-medium">계좌번호:</span> {bankAccount.account_number}
                </p>
                <p>
                  <span className="font-medium">예금주:</span> {bankAccount.account_holder}
                </p>
              </>
            ) : (
              <>
                <p>
                  <span className="font-medium">입금 은행:</span> 국민은행
                </p>
                <p>
                  <span className="font-medium">계좌번호:</span> 000-000000-00-000
                </p>
                <p>
                  <span className="font-medium">예금주:</span> 홍길동
                </p>
              </>
            )}
            <p className="mt-3 pt-3 border-t border-blue-200 text-blue-700">
              예약일로부터 24시간 이내 입금해주세요. 미입금 시 자동 취소될 수 있습니다.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-bold text-green-900 mb-3 flex items-center gap-2">
            <CreditCard size={20} />
            현장 결제 안내
          </h2>
          <div className="space-y-2 text-sm text-green-800">
            <p>체크인 시 현장에서 결제해주세요.</p>
            <p>현금 및 카드 결제 모두 가능합니다.</p>
          </div>
        </div>
      )}

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/">
          <Button variant="outline" size="lg" className="w-full sm:w-auto px-8">
            홈으로
          </Button>
        </Link>
        <Link href="/check">
          <Button size="lg" className="w-full sm:w-auto px-8">
            예약 조회
          </Button>
        </Link>
      </div>
    </div>
  )
}
