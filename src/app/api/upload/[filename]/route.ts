import { NextRequest } from 'next/server'
import { successResponse, errorResponse, withAdmin } from '@/lib/api-utils'

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { admin, error: authError } = await withAdmin()
    if (authError) return authError
    void admin

    // params를 await해서 사용 (Next.js 규약)
    await params

    // 목업: 항상 성공 응답
    return successResponse(null)
  } catch (err) {
    console.error('Delete upload error:', err)
    return errorResponse('서버 오류가 발생했습니다.', 'SERVER_ERROR', 500)
  }
}
