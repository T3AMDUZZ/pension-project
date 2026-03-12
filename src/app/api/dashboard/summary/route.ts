import { successResponse, errorResponse, withAdmin } from '@/lib/api-utils'
import { mockDashboardSummary } from '@/lib/mock-data'

export async function GET() {
  try {
    const { admin, error: authError } = await withAdmin()
    if (authError) return authError
    void admin

    return successResponse(mockDashboardSummary)
  } catch (err) {
    console.error('Dashboard summary error:', err)
    return errorResponse('서버 오류가 발생했습니다.', 'SERVER_ERROR', 500)
  }
}
