import { NextRequest } from 'next/server'
import { successResponse, errorResponse, withAdmin } from '@/lib/api-utils'
import { mockSeasons } from '@/lib/mock-data'
import type { Season } from '@/lib/types'

export async function GET() {
  try {
    const sorted = [...mockSeasons].sort(
      (a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
    )
    return successResponse(sorted)
  } catch (err) {
    console.error('Seasons list error:', err)
    return errorResponse('서버 오류가 발생했습니다.', 'SERVER_ERROR', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { admin, error: authError } = await withAdmin()
    if (authError) return authError
    void admin

    const body = await request.json()

    if (!body.name || !body.start_date || !body.end_date) {
      return errorResponse('시즌 이름, 시작일, 종료일을 입력해주세요.', 'MISSING_FIELDS')
    }

    const newSeason: Season = {
      id: `season-mock-${Date.now()}`,
      name: body.name,
      start_date: body.start_date,
      end_date: body.end_date,
      min_nights: body.min_nights || 1,
      created_at: new Date().toISOString(),
    }

    return successResponse(newSeason, 201)
  } catch (err) {
    console.error('Season create error:', err)
    return errorResponse('서버 오류가 발생했습니다.', 'SERVER_ERROR', 500)
  }
}
