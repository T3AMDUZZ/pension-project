import { NextRequest } from 'next/server'
import { successResponse, errorResponse, withAdmin } from '@/lib/api-utils'

export async function POST(request: NextRequest) {
  try {
    const { admin, error: authError } = await withAdmin()
    if (authError) return authError
    void admin

    const body = await request.json()

    if (!body.room_id || !body.date || body.price === undefined) {
      return errorResponse('객실, 날짜, 가격을 입력해주세요.', 'MISSING_FIELDS')
    }

    const newSpecialPrice = {
      id: `special-mock-${Date.now()}`,
      room_id: body.room_id,
      date: body.date,
      price: body.price,
    }

    return successResponse(newSpecialPrice, 201)
  } catch (err) {
    console.error('Special price create error:', err)
    return errorResponse('서버 오류가 발생했습니다.', 'SERVER_ERROR', 500)
  }
}
