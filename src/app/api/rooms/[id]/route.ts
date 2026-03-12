import { NextRequest } from 'next/server'
import { mockRooms, mockRoomPrices, mockSeasons } from '@/lib/mock-data'
import { successResponse, errorResponse, withAdmin } from '@/lib/api-utils'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const room = mockRooms.find((r) => r.id === id)
    if (!room) {
      return errorResponse('객실을 찾을 수 없습니다.', 'NOT_FOUND', 404)
    }

    // 가격 정보에 시즌 정보 조인
    const prices = mockRoomPrices
      .filter((p) => p.room_id === id)
      .map((p) => ({
        ...p,
        seasons: mockSeasons.find((s) => s.id === p.season_id) || null,
      }))

    return successResponse({ ...room, prices })
  } catch (err) {
    console.error('Room detail error:', err)
    return errorResponse('서버 오류가 발생했습니다.', 'SERVER_ERROR', 500)
  }
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

    const room = mockRooms.find((r) => r.id === id)
    if (!room) {
      return errorResponse('객실을 찾을 수 없습니다.', 'NOT_FOUND', 404)
    }

    // 목업: 기존 데이터에 업데이트 내용 병합해서 반환
    return successResponse({ ...room, ...body, updated_at: new Date().toISOString() })
  } catch (err) {
    console.error('Room update error:', err)
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

    const room = mockRooms.find((r) => r.id === id)
    if (!room) {
      return errorResponse('객실을 찾을 수 없습니다.', 'NOT_FOUND', 404)
    }

    return successResponse(null)
  } catch (err) {
    console.error('Room delete error:', err)
    return errorResponse('서버 오류가 발생했습니다.', 'SERVER_ERROR', 500)
  }
}
