import { NextRequest } from 'next/server'
import { successResponse, errorResponse, withAdmin } from '@/lib/api-utils'
import { mockReservations } from '@/lib/mock-data'
import type { ReservationStatus } from '@/lib/types'

// 유효한 상태 전이 정의
const validTransitions: Record<ReservationStatus, ReservationStatus[]> = {
  pending: ['awaiting_payment', 'confirmed', 'cancelled'],
  awaiting_payment: ['payment_confirmed', 'cancelled'],
  payment_confirmed: ['confirmed', 'cancelled'],
  confirmed: ['checked_in', 'cancelled', 'no_show'],
  checked_in: ['checked_out'],
  checked_out: [],
  cancelled: [],
  no_show: [],
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { admin, error: authError } = await withAdmin()
    if (authError) return authError
    void admin

    const { id } = await params
    const body = await request.json()
    const { status } = body

    if (!status) {
      return errorResponse('변경할 상태를 입력해주세요.', 'MISSING_STATUS')
    }

    const reservation = mockReservations.find((r) => r.id === id)

    if (!reservation) {
      return errorResponse('예약을 찾을 수 없습니다.', 'NOT_FOUND', 404)
    }

    // 상태 전이 검증
    const currentStatus = reservation.status as ReservationStatus
    const allowed = validTransitions[currentStatus]
    if (!allowed || !allowed.includes(status as ReservationStatus)) {
      return errorResponse(
        `'${currentStatus}'에서 '${status}'로 변경할 수 없습니다.`,
        'INVALID_TRANSITION'
      )
    }

    const updated = {
      ...reservation,
      status: status as ReservationStatus,
      updated_at: new Date().toISOString(),
    }

    return successResponse(updated)
  } catch (err) {
    console.error('Status change error:', err)
    return errorResponse('서버 오류가 발생했습니다.', 'SERVER_ERROR', 500)
  }
}
