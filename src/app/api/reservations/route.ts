import { NextRequest } from 'next/server'
import { successResponse, errorResponse, paginatedResponse, withAdmin } from '@/lib/api-utils'
import { mockReservations, mockRooms } from '@/lib/mock-data'
import { generateReservationNumber } from '@/lib/utils'
import type { PaymentMethod, Reservation } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    const { admin, error: authError } = await withAdmin()
    if (authError) return authError
    void admin

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')
    const roomId = searchParams.get('room_id')
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const search = searchParams.get('search')

    let filtered = [...mockReservations]

    if (status) filtered = filtered.filter((r) => r.status === status)
    if (roomId) filtered = filtered.filter((r) => r.room_id === roomId)
    if (from) filtered = filtered.filter((r) => r.check_in >= from)
    if (to) filtered = filtered.filter((r) => r.check_out <= to)
    if (search) {
      const s = search.toLowerCase()
      filtered = filtered.filter(
        (r) =>
          r.guest_name.toLowerCase().includes(s) ||
          r.phone.includes(s) ||
          r.reservation_number.toLowerCase().includes(s)
      )
    }

    // 최신순 정렬
    filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    const total = filtered.length
    const offset = (page - 1) * limit
    const paged = filtered.slice(offset, offset + limit)

    return paginatedResponse(paged, total, page, limit)
  } catch (err) {
    console.error('Reservations list error:', err)
    return errorResponse('서버 오류가 발생했습니다.', 'SERVER_ERROR', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { room_id, guest_name, phone, check_in, check_out, guests_count, payment_method, vehicle_number, memo } = body

    if (!room_id || !guest_name || !phone || !check_in || !check_out || !guests_count || !payment_method) {
      return errorResponse('필수 입력 항목을 확인해주세요.', 'MISSING_FIELDS')
    }

    // 날짜 충돌 검증
    const conflicts = mockReservations.filter(
      (r) =>
        r.room_id === room_id &&
        r.status !== 'cancelled' &&
        r.status !== 'no_show' &&
        r.check_in < check_out &&
        r.check_out > check_in
    )

    if (conflicts.length > 0) {
      return errorResponse('선택한 날짜에 이미 예약이 있습니다.', 'DATE_CONFLICT', 409)
    }

    const reservationNumber = generateReservationNumber()
    const initialStatus = (payment_method as PaymentMethod) === 'bank_transfer' ? 'awaiting_payment' : 'confirmed'
    const room = mockRooms.find((r) => r.id === room_id)

    const newReservation: Reservation = {
      id: `rsv-mock-${Date.now()}`,
      reservation_number: reservationNumber,
      room_id,
      guest_name,
      phone,
      check_in,
      check_out,
      guests_count,
      payment_method: payment_method as PaymentMethod,
      total_price: 0,
      status: initialStatus,
      vehicle_number: vehicle_number || null,
      memo: memo || null,
      admin_memo: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      room: room || undefined,
    }

    return successResponse(newReservation, 201)
  } catch (err) {
    console.error('Reservation create error:', err)
    const message = err instanceof Error ? err.message : '서버 오류가 발생했습니다.'
    return errorResponse(message, 'SERVER_ERROR', 500)
  }
}
