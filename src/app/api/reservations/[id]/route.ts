import { NextRequest } from 'next/server'
import { successResponse, errorResponse, withAdmin } from '@/lib/api-utils'
import { mockReservations } from '@/lib/mock-data'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { admin, error: authError } = await withAdmin()
    if (authError) return authError
    void admin

    const { id } = await params
    const reservation = mockReservations.find((r) => r.id === id)

    if (!reservation) {
      return errorResponse('예약을 찾을 수 없습니다.', 'NOT_FOUND', 404)
    }

    return successResponse(reservation)
  } catch (err) {
    console.error('Reservation detail error:', err)
    return errorResponse('서버 오류가 발생했습니다.', 'SERVER_ERROR', 500)
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { admin, error: authError } = await withAdmin()
    if (authError) return authError
    void admin

    const { id } = await params
    const reservation = mockReservations.find((r) => r.id === id)

    if (!reservation) {
      return errorResponse('예약을 찾을 수 없습니다.', 'NOT_FOUND', 404)
    }

    const cancelled = {
      ...reservation,
      status: 'cancelled' as const,
      updated_at: new Date().toISOString(),
    }

    return successResponse(cancelled)
  } catch (err) {
    console.error('Reservation cancel error:', err)
    return errorResponse('서버 오류가 발생했습니다.', 'SERVER_ERROR', 500)
  }
}
