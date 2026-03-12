import { NextRequest } from 'next/server'
import { mockRooms } from '@/lib/mock-data'
import { successResponse, errorResponse, withAdmin } from '@/lib/api-utils'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const all = searchParams.get('all')

    let rooms = mockRooms
    if (all !== 'true') {
      rooms = mockRooms.filter((r) => r.is_active)
    }

    return successResponse(rooms)
  } catch (err) {
    console.error('Rooms list error:', err)
    return errorResponse('서버 오류가 발생했습니다.', 'SERVER_ERROR', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { admin, error: authError } = await withAdmin()
    if (authError) return authError
    void admin

    const body = await request.json()

    // 목업: 입력값을 그대로 반환
    const newRoom = {
      id: `room-${Date.now()}`,
      name: body.name,
      description: body.description || '',
      type: body.type || '',
      base_capacity: body.base_capacity || 2,
      max_capacity: body.max_capacity || 4,
      size: body.size || '',
      amenities: body.amenities || [],
      images: body.images || [],
      sort_order: body.sort_order || 0,
      is_active: body.is_active !== false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    return successResponse(newRoom, 201)
  } catch (err) {
    console.error('Room create error:', err)
    return errorResponse('서버 오류가 발생했습니다.', 'SERVER_ERROR', 500)
  }
}
