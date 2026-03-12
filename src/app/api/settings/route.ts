import { mockSettings } from '@/lib/mock-data'
import { successResponse, errorResponse } from '@/lib/api-utils'

export async function GET() {
  try {
    return successResponse(mockSettings)
  } catch (err) {
    console.error('Settings list error:', err)
    return errorResponse('서버 오류가 발생했습니다.', 'SERVER_ERROR', 500)
  }
}
