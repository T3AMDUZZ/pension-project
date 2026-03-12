'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import type { Room, PaymentMethod } from '@/lib/types'

interface ManualReservationModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: () => void
  selectedDate?: string
  rooms: Room[]
}

export default function ManualReservationModal({
  isOpen,
  onClose,
  onSubmit,
  selectedDate,
  rooms,
}: ManualReservationModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    room_id: '',
    guest_name: '',
    phone: '',
    check_in: selectedDate || '',
    check_out: '',
    guests_count: 2,
    payment_method: 'on_site' as PaymentMethod,
    vehicle_number: '',
    memo: '',
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: name === 'guests_count' ? parseInt(value) || 1 : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!form.room_id || !form.guest_name || !form.phone || !form.check_in || !form.check_out) {
      setError('필수 항목을 모두 입력해주세요.')
      return
    }

    if (form.check_in >= form.check_out) {
      setError('체크아웃 날짜는 체크인 날짜 이후여야 합니다.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          room_id: form.room_id,
          guest_name: form.guest_name,
          phone: form.phone,
          check_in: form.check_in,
          check_out: form.check_out,
          guests_count: form.guests_count,
          payment_method: form.payment_method,
          vehicle_number: form.vehicle_number || null,
          memo: form.memo || null,
        }),
      })

      const json = await res.json()
      if (!json.success) {
        setError(json.error || '예약 등록에 실패했습니다.')
        return
      }

      onSubmit()
      onClose()
    } catch {
      setError('서버 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">수동 예약 등록</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>
          )}

          {/* 객실 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              객실 <span className="text-red-500">*</span>
            </label>
            <select
              name="room_id"
              value={form.room_id}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pension-primary/50"
              required
            >
              <option value="">객실을 선택하세요</option>
              {rooms
                .filter((r) => r.is_active)
                .map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.name}
                  </option>
                ))}
            </select>
          </div>

          {/* 예약자 이름 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              예약자 이름 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="guest_name"
              value={form.guest_name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pension-primary/50"
              required
            />
          </div>

          {/* 연락처 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              연락처 <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="010-0000-0000"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pension-primary/50"
              required
            />
          </div>

          {/* 날짜 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                체크인 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="check_in"
                value={form.check_in}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pension-primary/50"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                체크아웃 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="check_out"
                value={form.check_out}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pension-primary/50"
                required
              />
            </div>
          </div>

          {/* 인원 수 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">인원 수</label>
            <input
              type="number"
              name="guests_count"
              value={form.guests_count}
              onChange={handleChange}
              min={1}
              max={20}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pension-primary/50"
            />
          </div>

          {/* 결제 방식 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">결제 방식</label>
            <select
              name="payment_method"
              value={form.payment_method}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pension-primary/50"
            >
              <option value="bank_transfer">무통장 입금</option>
              <option value="on_site">현장 결제</option>
            </select>
          </div>

          {/* 차량번호 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">차량번호</label>
            <input
              type="text"
              name="vehicle_number"
              value={form.vehicle_number}
              onChange={handleChange}
              placeholder="선택 입력"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pension-primary/50"
            />
          </div>

          {/* 메모 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">메모</label>
            <textarea
              name="memo"
              value={form.memo}
              onChange={handleChange}
              rows={3}
              placeholder="관리용 메모"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pension-primary/50 resize-none"
            />
          </div>

          {/* 버튼 */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-pension-primary text-white rounded-lg text-sm font-medium hover:bg-pension-primary/90 disabled:opacity-50"
            >
              {loading ? '등록 중...' : '예약 등록'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
