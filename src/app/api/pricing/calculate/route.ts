import { NextRequest } from 'next/server'
import { successResponse, errorResponse } from '@/lib/api-utils'
import { mockRoomPrices, mockSeasons, mockRooms } from '@/lib/mock-data'
import { isWeekend } from '@/lib/utils'
import type { PriceCalculation } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const roomId = searchParams.get('room_id')
    const checkIn = searchParams.get('check_in')
    const checkOut = searchParams.get('check_out')
    const guestsCount = searchParams.get('guests_count')

    if (!roomId || !checkIn || !checkOut || !guestsCount) {
      return errorResponse(
        'room_id, check_in, check_out, guests_count 파라미터가 필요합니다.',
        'MISSING_PARAMS'
      )
    }

    const room = mockRooms.find((r) => r.id === roomId)
    if (!room) {
      return errorResponse('객실을 찾을 수 없습니다.', 'ROOM_NOT_FOUND', 404)
    }

    const guests = parseInt(guestsCount)
    const extraPersons = Math.max(0, guests - room.base_capacity)

    const ciDate = new Date(checkIn)
    const coDate = new Date(checkOut)

    let baseTotal = 0
    let extraPersonTotal = 0
    const dailyPrices: PriceCalculation['daily_prices'] = []

    const current = new Date(ciDate)
    while (current < coDate) {
      const dateStr = current.toISOString().split('T')[0]
      const weekend = isWeekend(current)

      // 해당 날짜의 시즌 찾기
      const season = mockSeasons.find(
        (s) => dateStr >= s.start_date && dateStr <= s.end_date
      )

      if (!season) {
        return errorResponse(
          `${dateStr}에 해당하는 시즌 정보가 없습니다.`,
          'SEASON_NOT_FOUND',
          404
        )
      }

      const roomPrice = mockRoomPrices.find(
        (rp) => rp.room_id === roomId && rp.season_id === season.id
      )

      if (!roomPrice) {
        return errorResponse(
          `${season.name} 시즌의 요금 정보가 없습니다.`,
          'PRICE_NOT_FOUND',
          404
        )
      }

      const dayPrice = weekend ? roomPrice.weekend_price : roomPrice.weekday_price
      const extraPrice = extraPersons * roomPrice.extra_person_price

      baseTotal += dayPrice
      extraPersonTotal += extraPrice

      dailyPrices.push({
        date: dateStr,
        price: dayPrice + extraPrice,
        season_name: season.name,
        is_weekend: weekend,
      })

      current.setDate(current.getDate() + 1)
    }

    const result: PriceCalculation = {
      room_id: roomId,
      check_in: checkIn,
      check_out: checkOut,
      nights: dailyPrices.length,
      guests_count: guests,
      base_total: baseTotal,
      extra_person_total: extraPersonTotal,
      total_price: baseTotal + extraPersonTotal,
      daily_prices: dailyPrices,
    }

    return successResponse(result)
  } catch (err) {
    console.error('Price calculation error:', err)
    const message = err instanceof Error ? err.message : '서버 오류가 발생했습니다.'
    return errorResponse(message, 'CALCULATION_ERROR', 500)
  }
}
