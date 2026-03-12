import { NextRequest } from 'next/server'
import { successResponse, errorResponse, requireAdmin } from '@/lib/api-utils'

export async function PUT(request: NextRequest) {
  try {
    const admin = await requireAdmin()
    if (!admin) {
      return errorResponse('인증이 필요합니다.', 'UNAUTHORIZED', 401)
    }

    const body = await request.json()
    const { current_password, new_password } = body

    if (!current_password || !new_password) {
      return errorResponse('현재 비밀번호와 새 비밀번호를 입력해주세요.', 'MISSING_FIELDS')
    }

    if (new_password.length < 4) {
      return errorResponse('새 비밀번호는 4자 이상이어야 합니다.', 'PASSWORD_TOO_SHORT')
    }

    // 목업: 항상 성공 응답
    return successResponse(null)
  } catch (err) {
    console.error('Password change error:', err)
    return errorResponse('서버 오류가 발생했습니다.', 'SERVER_ERROR', 500)
  }
}
