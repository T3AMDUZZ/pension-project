import { NextRequest } from 'next/server'
import { successResponse, errorResponse, withAdmin } from '@/lib/api-utils'
import { mockSeasons } from '@/lib/mock-data'

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

    const season = mockSeasons.find((s) => s.id === id)
    if (!season) {
      return errorResponse('시즌을 찾을 수 없습니다.', 'NOT_FOUND', 404)
    }

    const updated = { ...season, ...body, id }
    return successResponse(updated)
  } catch (err) {
    console.error('Season update error:', err)
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
    const season = mockSeasons.find((s) => s.id === id)
    if (!season) {
      return errorResponse('시즌을 찾을 수 없습니다.', 'NOT_FOUND', 404)
    }

    return successResponse(null)
  } catch (err) {
    console.error('Season delete error:', err)
    return errorResponse('서버 오류가 발생했습니다.', 'SERVER_ERROR', 500)
  }
}
