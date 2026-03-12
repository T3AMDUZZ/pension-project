import { NextRequest } from 'next/server'
import { successResponse, errorResponse, withAdmin } from '@/lib/api-utils'
import { mockReservations } from '@/lib/mock-data'

export async function GET(request: NextRequest) {
  try {
    const { admin, error: authError } = await withAdmin()
    if (authError) return authError
    void admin

    const { searchParams } = new URL(request.url)
    const year = searchParams.get('year')
    const month = searchParams.get('month')

    if (!year || !month) {
      return errorResponse('year, month 파라미터가 필요합니다.', 'MISSING_PARAMS')
    }

    const yearNum = parseInt(year)
    const monthNum = parseInt(month)
    const startDate = `${yearNum}-${String(monthNum).padStart(2, '0')}-01`
    const lastDay = new Date(yearNum, monthNum, 0).getDate()
    const endDate = `${yearNum}-${String(monthNum).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`

    const filtered = mockReservations
      .filter(
        (r) =>
          r.status !== 'cancelled' &&
          r.check_in <= endDate &&
          r.check_out >= startDate
      )
      .sort((a, b) => new Date(a.check_in).getTime() - new Date(b.check_in).getTime())

    return successResponse(filtered)
  } catch (err) {
    console.error('Dashboard calendar error:', err)
    return errorResponse('서버 오류가 발생했습니다.', 'SERVER_ERROR', 500)
  }
}
