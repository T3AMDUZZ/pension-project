import { NextRequest } from 'next/server'
import { successResponse, errorResponse } from '@/lib/api-utils'
import { mockReservations, mockRoomPrices, mockSeasons } from '@/lib/mock-data'
import { isWeekend } from '@/lib/utils'
import type { DayAvailability } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const roomId = searchParams.get('room_id')
    const year = searchParams.get('year')
    const month = searchParams.get('month')

    if (!roomId || !year || !month) {
      return errorResponse('room_id, year, month 파라미터가 필요합니다.', 'MISSING_PARAMS')
    }

    const yearNum = parseInt(year)
    const monthNum = parseInt(month)

    // 해당 월의 시작일과 마지막일
    const startDate = `${yearNum}-${String(monthNum).padStart(2, '0')}-01`
    const lastDay = new Date(yearNum, monthNum, 0).getDate()
    const endDate = `${yearNum}-${String(monthNum).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`

    // 해당 기간의 예약 조회 (cancelled, no_show 제외)
    const reservations = mockReservations.filter(
      (r) =>
        r.room_id === roomId &&
        r.status !== 'cancelled' &&
        r.status !== 'no_show' &&
        r.check_in <= endDate &&
        r.check_out >= startDate
    )

    // 예약된 날짜 셋 만들기
    const bookedDates = new Set<string>()
    reservations.forEach((r) => {
      const ciDate = new Date(r.check_in)
      const coDate = new Date(r.check_out)
      const current = new Date(ciDate)
      while (current < coDate) {
        const dateStr = current.toISOString().split('T')[0]
        bookedDates.add(dateStr)
        current.setDate(current.getDate() + 1)
      }
    })

    // 각 날짜별 가용성 + 가격 생성
    const availability: DayAvailability[] = []
    for (let day = 1; day <= lastDay; day++) {
      const dateStr = `${yearNum}-${String(monthNum).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const date = new Date(yearNum, monthNum - 1, day)

      // 가격 계산: 시즌 찾기
      const season = mockSeasons.find(
        (s) => dateStr >= s.start_date && dateStr <= s.end_date
      )
      let price: number | null = null
      if (season) {
        const roomPrice = mockRoomPrices.find(
          (rp) => rp.room_id === roomId && rp.season_id === season.id
        )
        if (roomPrice) {
          price = isWeekend(date) ? roomPrice.weekend_price : roomPrice.weekday_price
        }
      }

      availability.push({
        date: dateStr,
        available: !bookedDates.has(dateStr),
        price,
      })
    }

    return successResponse(availability)
  } catch (err) {
    console.error('Availability error:', err)
    return errorResponse('서버 오류가 발생했습니다.', 'SERVER_ERROR', 500)
  }
}
