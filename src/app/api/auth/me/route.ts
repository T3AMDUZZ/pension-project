import { successResponse, errorResponse, requireAdmin } from '@/lib/api-utils'

export async function GET() {
  try {
    const admin = await requireAdmin()
    if (!admin) {
      return errorResponse('인증이 필요합니다.', 'UNAUTHORIZED', 401)
    }

    return successResponse({ id: 'admin-1', username: 'admin' })
  } catch (err) {
    console.error('Me error:', err)
    return errorResponse('서버 오류가 발생했습니다.', 'SERVER_ERROR', 500)
  }
}
