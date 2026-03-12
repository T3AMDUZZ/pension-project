import { NextRequest } from 'next/server'
import { successResponse, errorResponse } from '@/lib/api-utils'
import { mockReservations } from '@/lib/mock-data'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { reservation_number, phone } = body

    if (!reservation_number || !phone) {
      return errorResponse('예약번호와 연락처를 입력해주세요.', 'MISSING_FIELDS')
    }

    const reservation = mockReservations.find(
      (r) => r.reservation_number === reservation_number && r.phone === phone
    )

    if (!reservation) {
      return errorResponse('일치하는 예약을 찾을 수 없습니다.', 'NOT_FOUND', 404)
    }

    // admin_memo 제외
    const { admin_memo: _admin_memo, ...result } = reservation

    return successResponse(result)
  } catch (err) {
    console.error('Reservation check error:', err)
    return errorResponse('서버 오류가 발생했습니다.', 'SERVER_ERROR', 500)
  }
}
