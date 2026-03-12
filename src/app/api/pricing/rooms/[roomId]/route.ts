import { NextRequest } from 'next/server'
import { successResponse, errorResponse, withAdmin } from '@/lib/api-utils'
import { mockRoomPrices, mockSeasons } from '@/lib/mock-data'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params

    const prices = mockRoomPrices
      .filter((rp) => rp.room_id === roomId)
      .map((rp) => {
        const season = mockSeasons.find((s) => s.id === rp.season_id)
        return { ...rp, seasons: season || null }
      })

    return successResponse(prices)
  } catch (err) {
    console.error('Room prices error:', err)
    return errorResponse('서버 오류가 발생했습니다.', 'SERVER_ERROR', 500)
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { admin, error: authError } = await withAdmin()
    if (authError) return authError
    void admin

    const { roomId } = await params
    const body = await request.json()

    const prices = Array.isArray(body) ? body : [body]
    const result = prices.map((p) => ({
      id: `price-mock-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      room_id: roomId,
      season_id: p.season_id,
      weekday_price: p.weekday_price,
      weekend_price: p.weekend_price,
      extra_person_price: p.extra_person_price || 0,
    }))

    return successResponse(result)
  } catch (err) {
    console.error('Room prices update error:', err)
    return errorResponse('서버 오류가 발생했습니다.', 'SERVER_ERROR', 500)
  }
}
