'use client'

import { useState, useEffect, useCallback, use } from 'react'
import { useRouter } from 'next/navigation'
import Card, { CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { PageLoading } from '@/components/ui/Loading'
import StatusBadge from '@/components/admin/StatusBadge'
import ConfirmDialog from '@/components/admin/ConfirmDialog'
import { formatDate, formatPrice, formatPhone } from '@/lib/utils'
import { ArrowLeft } from 'lucide-react'
import type { Reservation, ReservationStatus } from '@/lib/types'

// 유효한 상태 전이
const validTransitions: Record<string, { status: ReservationStatus; label: string; variant: 'primary' | 'danger' }[]> = {
  pending: [
    { status: 'awaiting_payment', label: '입금대기로 변경', variant: 'primary' },
    { status: 'confirmed', label: '바로 확정', variant: 'primary' },
  ],
  awaiting_payment: [
    { status: 'payment_confirmed', label: '입금확인', variant: 'primary' },
  ],
  payment_confirmed: [
    { status: 'confirmed', label: '예약확정', variant: 'primary' },
  ],
  confirmed: [
    { status: 'checked_in', label: '체크인 처리', variant: 'primary' },
    { status: 'no_show', label: '노쇼 처리', variant: 'danger' },
  ],
  checked_in: [
    { status: 'checked_out', label: '체크아웃 처리', variant: 'primary' },
  ],
}

export default function ReservationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [reservation, setReservation] = useState<Reservation | null>(null)
  const [loading, setLoading] = useState(true)
  const [adminMemo, setAdminMemo] = useState('')
  const [memoSaving, setMemoSaving] = useState(false)
  const [memoSaved, setMemoSaved] = useState(false)

  // Confirm dialog
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState<{ status: string; label: string } | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  const fetchReservation = useCallback(async () => {
    try {
      const res = await fetch(`/api/reservations/${id}`)
      const json = await res.json()
      if (json.success) {
        setReservation(json.data)
        setAdminMemo(json.data.admin_memo || '')
      }
    } catch (err) {
      console.error('Fetch reservation error:', err)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { fetchReservation() }, [fetchReservation])

  const handleStatusChange = async () => {
    if (!confirmAction) return
    setActionLoading(true)
    try {
      const res = await fetch(`/api/reservations/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: confirmAction.status }),
      })
      const json = await res.json()
      if (json.success) {
        setReservation((prev) => prev ? { ...prev, status: confirmAction.status as ReservationStatus } : prev)
      }
    } catch (err) {
      console.error('Status change error:', err)
    } finally {
      setActionLoading(false)
      setConfirmOpen(false)
      setConfirmAction(null)
    }
  }

  const handleCancel = async () => {
    setActionLoading(true)
    try {
      const res = await fetch(`/api/reservations/${id}`, { method: 'DELETE' })
      const json = await res.json()
      if (json.success) {
        setReservation((prev) => prev ? { ...prev, status: 'cancelled' } : prev)
      }
    } catch (err) {
      console.error('Cancel error:', err)
    } finally {
      setActionLoading(false)
      setConfirmOpen(false)
      setConfirmAction(null)
    }
  }

  const saveMemo = async () => {
    setMemoSaving(true)
    try {
      await fetch(`/api/reservations/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: reservation?.status, admin_memo: adminMemo }),
      })
      setMemoSaved(true)
      setTimeout(() => setMemoSaved(false), 2000)
    } catch (err) {
      console.error('Memo save error:', err)
    } finally {
      setMemoSaving(false)
    }
  }

  if (loading) return <PageLoading />
  if (!reservation) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">예약을 찾을 수 없습니다.</p>
        <Button variant="ghost" className="mt-4" onClick={() => router.push('/admin/reservations')}>
          목록으로 돌아가기
        </Button>
      </div>
    )
  }

  const transitions = validTransitions[reservation.status] || []
  const canCancel = !['cancelled', 'checked_out', 'no_show'].includes(reservation.status)

  return (
    <div className="space-y-6 max-w-3xl">
      {/* 헤더 */}
      <div className="flex items-center gap-4">
        <button onClick={() => router.push('/admin/reservations')} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">예약 상세</h1>
            <StatusBadge status={reservation.status} />
          </div>
          <p className="text-sm text-gray-500 font-mono">{reservation.reservation_number}</p>
        </div>
      </div>

      {/* 예약 정보 카드 */}
      <Card>
        <CardTitle className="mb-4">예약 정보</CardTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <InfoRow label="예약자명" value={reservation.guest_name} />
          <InfoRow label="연락처" value={formatPhone(reservation.phone)} />
          <InfoRow label="객실" value={reservation.room?.name || '-'} />
          <InfoRow label="인원" value={`${reservation.guests_count}명`} />
          <InfoRow label="체크인" value={formatDate(reservation.check_in)} />
          <InfoRow label="체크아웃" value={formatDate(reservation.check_out)} />
          <InfoRow label="결제방식" value={reservation.payment_method === 'bank_transfer' ? '계좌이체' : '현장결제'} />
          <InfoRow label="총 금액" value={formatPrice(reservation.total_price)} highlight />
          {reservation.vehicle_number && <InfoRow label="차량번호" value={reservation.vehicle_number} />}
          {reservation.memo && <InfoRow label="요청사항" value={reservation.memo} />}
          <InfoRow label="예약일시" value={formatDate(reservation.created_at, 'yyyy-MM-dd')} />
        </div>
      </Card>

      {/* 상태 변경 */}
      <Card>
        <CardTitle className="mb-4">상태 변경</CardTitle>
        <div className="flex flex-wrap gap-3">
          {transitions.map((t) => (
            <Button
              key={t.status}
              variant={t.variant}
              size="sm"
              onClick={() => {
                setConfirmAction({ status: t.status, label: t.label })
                setConfirmOpen(true)
              }}
            >
              {t.label}
            </Button>
          ))}
          {canCancel && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                setConfirmAction({ status: 'cancelled', label: '예약 취소' })
                setConfirmOpen(true)
              }}
            >
              예약 취소
            </Button>
          )}
          {transitions.length === 0 && !canCancel && (
            <p className="text-sm text-gray-400">변경 가능한 상태가 없습니다.</p>
          )}
        </div>
      </Card>

      {/* 관리자 메모 */}
      <Card>
        <CardTitle className="mb-4">관리자 메모</CardTitle>
        <textarea
          value={adminMemo}
          onChange={(e) => setAdminMemo(e.target.value)}
          rows={4}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pension-primary/50"
          placeholder="관리자 메모를 입력하세요..."
        />
        <div className="flex items-center gap-3 mt-3">
          <Button size="sm" onClick={saveMemo} loading={memoSaving}>
            메모 저장
          </Button>
          {memoSaved && <span className="text-sm text-green-600">저장되었습니다.</span>}
        </div>
      </Card>

      {/* 상태 변경 확인 모달 */}
      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => { setConfirmOpen(false); setConfirmAction(null) }}
        onConfirm={confirmAction?.status === 'cancelled' ? handleCancel : handleStatusChange}
        title="상태 변경"
        message={`이 예약을 "${confirmAction?.label}" 처리하시겠습니까?`}
        confirmText={confirmAction?.label || '확인'}
        variant={confirmAction?.status === 'cancelled' ? 'danger' : 'primary'}
        loading={actionLoading}
      />
    </div>
  )
}

function InfoRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <dt className="text-gray-500 text-xs mb-0.5">{label}</dt>
      <dd className={`font-medium ${highlight ? 'text-pension-primary text-lg' : 'text-gray-900'}`}>{value}</dd>
    </div>
  )
}
