import { NextRequest } from 'next/server'
import { mockSettings } from '@/lib/mock-data'
import { successResponse, errorResponse, withAdmin } from '@/lib/api-utils'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await params

    const value = mockSettings[key]
    if (value === undefined) {
      return errorResponse('설정을 찾을 수 없습니다.', 'NOT_FOUND', 404)
    }

    return successResponse({ key, value })
  } catch (err) {
    console.error('Setting detail error:', err)
    return errorResponse('서버 오류가 발생했습니다.', 'SERVER_ERROR', 500)
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { admin, error: authError } = await withAdmin()
    if (authError) return authError
    void admin

    const { key } = await params
    const body = await request.json()

    // 목업: 성공 응답 반환
    return successResponse({ key, value: body.value })
  } catch (err) {
    console.error('Setting update error:', err)
    return errorResponse('서버 오류가 발생했습니다.', 'SERVER_ERROR', 500)
  }
}
