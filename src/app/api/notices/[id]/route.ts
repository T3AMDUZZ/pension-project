import { NextRequest } from 'next/server'
import { mockNotices } from '@/lib/mock-data'
import { successResponse, errorResponse, withAdmin } from '@/lib/api-utils'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const notice = mockNotices.find((n) => n.id === id)
    if (!notice) {
      return errorResponse('공지사항을 찾을 수 없습니다.', 'NOT_FOUND', 404)
    }

    return successResponse(notice)
  } catch (err) {
    console.error('Notice detail error:', err)
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

    const notice = mockNotices.find((n) => n.id === id)
    if (!notice) {
      return errorResponse('공지사항을 찾을 수 없습니다.', 'NOT_FOUND', 404)
    }

    // 목업: 기존 데이터에 업데이트 내용 병합해서 반환
    return successResponse({ ...notice, ...body, updated_at: new Date().toISOString() })
  } catch (err) {
    console.error('Notice update error:', err)
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

    const notice = mockNotices.find((n) => n.id === id)
    if (!notice) {
      return errorResponse('공지사항을 찾을 수 없습니다.', 'NOT_FOUND', 404)
    }

    return successResponse(null)
  } catch (err) {
    console.error('Notice delete error:', err)
    return errorResponse('서버 오류가 발생했습니다.', 'SERVER_ERROR', 500)
  }
}
