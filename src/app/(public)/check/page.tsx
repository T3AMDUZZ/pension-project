'use client'

import { useState } from 'react'
import { Search, Calendar, Users, CreditCard } from 'lucide-react'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'
import { formatPrice, formatDate, getStatusLabel } from '@/lib/utils'
import type { Reservation } from '@/lib/types'

const statusBadgeVariant: Record<string, 'warning' | 'info' | 'success' | 'danger' | 'orange' | 'purple' | 'default'> = {
  pending: 'warning',
  awaiting_payment: 'orange',
  payment_confirmed: 'info',
  confirmed: 'success',
  checked_in: 'purple',
  checked_out: 'default',
  cancelled: 'danger',
  no_show: 'danger',
}

export default function CheckPage() {
  const [reservationNumber, setReservationNumber] = useState('')
  const [phone, setPhone] = useState('')
  const [reservation, setReservation] = useState<Reservation | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searched, setSearched] = useState(false)
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  const formatPhoneInput = (value: string) => {
    const numbers = value.replace(/\D/g, '').slice(0, 11)
    if (numbers.length <= 3) return numbers
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`
  }

  const handleSearch = async () => {
    if (!reservationNumber.trim() || !phone.trim()) {
      setError('예약번호와 연락처를 모두 입력해주세요.')
      return
    }

    setLoading(true)
    setError('')
    setReservation(null)
    setSearched(true)

    try {
      const res = await fetch('/api/reservations/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reservation_number: reservationNumber.trim(),
          phone: phone.replace(/\D/g, ''),
        }),
      })
      const json = await res.json()
      if (json.success) {
        setReservation(json.data)
      } else {
        setError(json.error || '예약을 찾을 수 없습니다.')
      }
    } catch {
      setError('서버 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!reservation) return
    setCancelling(true)
    try {
      const res = await fetch(`/api/reservations/${reservation.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      })
      const json = await res.json()
      if (json.success) {
        setReservation({ ...reservation, status: 'cancelled' })
        setCancelModalOpen(false)
      } else {
        alert(json.error || '취소에 실패했습니다.')
      }
    } catch {
      alert('서버 오류가 발생했습니다.')
    } finally {
      setCancelling(false)
    }
  }

  const canCancel = reservation && ['pending', 'awaiting_payment'].includes(reservation.status)

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">예약 조회</h1>
      <p className="text-gray-500 mb-8">예약번호와 연락처를 입력하여 예약 내역을 확인하세요.</p>

      {/* Search Form */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">예약번호</label>
            <input
              type="text"
              value={reservationNumber}
              onChange={(e) => setReservationNumber(e.target.value)}
              placeholder="R20260101XXXX"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pension-primary/50 focus:border-pension-primary"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">연락처</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(formatPhoneInput(e.target.value))}
              placeholder="010-0000-0000"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pension-primary/50 focus:border-pension-primary"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button onClick={handleSearch} loading={loading} className="w-full" size="lg">
            <Search size={18} className="mr-2" />
            조회하기
          </Button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Result */}
      {reservation && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Status header */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <span className="text-sm text-gray-500">예약 상태</span>
            <Badge variant={statusBadgeVariant[reservation.status] || 'default'}>
              {getStatusLabel(reservation.status)}
            </Badge>
          </div>

          <div className="p-6 space-y-4 text-sm">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">예약번호</span>
              <span className="font-bold text-pension-primary">{reservation.reservation_number}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">객실</span>
              <span className="font-medium text-gray-800">
                {reservation.room?.name || '-'}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500 flex items-center gap-1">
                <Calendar size={14} />
                체크인
              </span>
              <span className="font-medium text-gray-800">{formatDate(reservation.check_in)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500 flex items-center gap-1">
                <Calendar size={14} />
                체크아웃
              </span>
              <span className="font-medium text-gray-800">{formatDate(reservation.check_out)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500 flex items-center gap-1">
                <Users size={14} />
                인원
              </span>
              <span className="font-medium text-gray-800">{reservation.guests_count}명</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500 flex items-center gap-1">
                <CreditCard size={14} />
                결제 방식
              </span>
              <span className="font-medium text-gray-800">
                {reservation.payment_method === 'bank_transfer' ? '무통장 입금' : '현장 결제'}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-500">결제 금액</span>
              <span className="font-bold text-pension-primary text-lg">
                {formatPrice(reservation.total_price)}
              </span>
            </div>
          </div>

          {/* Cancel button */}
          {canCancel && (
            <div className="px-6 py-4 border-t border-gray-200">
              <Button
                variant="danger"
                onClick={() => setCancelModalOpen(true)}
                className="w-full"
              >
                예약 취소 요청
              </Button>
            </div>
          )}
        </div>
      )}

      {/* No result */}
      {searched && !loading && !reservation && !error && (
        <div className="text-center py-10 text-gray-400">
          일치하는 예약을 찾을 수 없습니다.
        </div>
      )}

      {/* Cancel Modal */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="예약 취소"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            정말 예약을 취소하시겠습니까?
          </p>
          <p className="text-sm text-red-600">
            취소 후에는 복구할 수 없습니다.
          </p>
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setCancelModalOpen(false)}>
              돌아가기
            </Button>
            <Button variant="danger" onClick={handleCancel} loading={cancelling}>
              취소하기
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
