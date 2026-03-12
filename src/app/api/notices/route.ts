import { NextRequest } from 'next/server'
import { mockNotices } from '@/lib/mock-data'
import { successResponse, errorResponse, paginatedResponse, withAdmin } from '@/lib/api-utils'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    // 고정글 우선, 그 다음 최신순 정렬
    const sorted = [...mockNotices].sort((a, b) => {
      if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

    const offset = (page - 1) * limit
    const paged = sorted.slice(offset, offset + limit)

    return paginatedResponse(paged, sorted.length, page, limit)
  } catch (err) {
    console.error('Notices list error:', err)
    return errorResponse('서버 오류가 발생했습니다.', 'SERVER_ERROR', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { admin, error: authError } = await withAdmin()
    if (authError) return authError
    void admin

    const body = await request.json()

    if (!body.title || !body.content) {
      return errorResponse('제목과 내용을 입력해주세요.', 'MISSING_FIELDS')
    }

    // 목업: 입력값을 그대로 반환
    const newNotice = {
      id: `notice-${Date.now()}`,
      title: body.title,
      content: body.content,
      is_pinned: body.is_pinned || false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    return successResponse(newNotice, 201)
  } catch (err) {
    console.error('Notice create error:', err)
    return errorResponse('서버 오류가 발생했습니다.', 'SERVER_ERROR', 500)
  }
}
