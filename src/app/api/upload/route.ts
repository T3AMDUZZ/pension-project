import { NextRequest } from 'next/server'
import { successResponse, errorResponse, withAdmin } from '@/lib/api-utils'

export async function POST(request: NextRequest) {
  try {
    const { admin, error: authError } = await withAdmin()
    if (authError) return authError
    void admin

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return errorResponse('파일을 선택해주세요.', 'NO_FILE')
    }

    // 목업: 목업 URL 반환
    return successResponse({ url: '/uploads/mock-image.jpg', filename: 'mock-image.jpg' }, 201)
  } catch (err) {
    console.error('Upload error:', err)
    return errorResponse('서버 오류가 발생했습니다.', 'SERVER_ERROR', 500)
  }
}
