import { createServerSupabaseClient } from './supabase'
import { isWeekend, getDaysBetween } from './utils'
import type { PriceCalculation } from './types'

export async function calculatePrice(
  roomId: string,
  checkIn: string,
  checkOut: string,
  guestsCount: number
): Promise<PriceCalculation> {
  const supabase = createServerSupabaseClient()

  // 1. 객실 정보 가져오기
  const { data: room, error: roomError } = await supabase
    .from('rooms')
    .select('base_capacity')
    .eq('id', roomId)
    .single()

  if (roomError || !room) {
    throw new Error('객실 정보를 찾을 수 없습니다.')
  }

  const nights = getDaysBetween(checkIn, checkOut)
  if (nights <= 0) {
    throw new Error('체크아웃은 체크인 이후여야 합니다.')
  }

  // 2. 시즌 정보 가져오기
  const { data: seasons } = await supabase.from('seasons').select('*')

  // 3. 특가 정보 가져오기
  const { data: specialPrices } = await supabase
    .from('special_prices')
    .select('*')
    .eq('room_id', roomId)
    .gte('date', checkIn)
    .lt('date', checkOut)

  // 4. 객실 요금 정보 가져오기
  const { data: roomPrices } = await supabase
    .from('room_prices')
    .select('*, seasons(*)')
    .eq('room_id', roomId)

  const dailyPrices: PriceCalculation['daily_prices'] = []
  let baseTotal = 0
  let extraPersonTotal = 0

  const extraPersonCount = Math.max(0, guestsCount - room.base_capacity)

  for (let i = 0; i < nights; i++) {
    const currentDate = new Date(checkIn)
    currentDate.setDate(currentDate.getDate() + i)
    const dateStr = currentDate.toISOString().split('T')[0]
    const weekend = isWeekend(currentDate)

    // a. 특가 확인
    const specialPrice = specialPrices?.find((sp) => sp.date === dateStr)
    if (specialPrice) {
      const dayPrice = specialPrice.price
      baseTotal += dayPrice
      dailyPrices.push({
        date: dateStr,
        price: dayPrice,
        season_name: '특가',
        is_weekend: weekend,
      })
      continue
    }

    // b. 시즌 확인
    const matchedSeason = seasons?.find((s) => {
      return dateStr >= s.start_date && dateStr <= s.end_date
    })

    // c. 시즌에 맞는 room_price 가져오기
    let dayPrice = 0
    let seasonName = '비수기'
    let extraPrice = 0

    if (matchedSeason) {
      const roomPrice = roomPrices?.find((rp) => rp.season_id === matchedSeason!.id)
      if (roomPrice) {
        dayPrice = weekend ? roomPrice.weekend_price : roomPrice.weekday_price
        extraPrice = roomPrice.extra_person_price || 0
        seasonName = matchedSeason.name
      }
    }

    // 시즌에 맞는 가격이 없으면 기본 시즌 없는 가격 찾기
    if (dayPrice === 0 && roomPrices && roomPrices.length > 0) {
      // 시즌이 없는 경우 첫 번째 room_price 사용
      const defaultPrice = roomPrices[0]
      dayPrice = weekend ? defaultPrice.weekend_price : defaultPrice.weekday_price
      extraPrice = defaultPrice.extra_person_price || 0
    }

    baseTotal += dayPrice

    // 추가 인원 요금
    if (extraPersonCount > 0) {
      extraPersonTotal += extraPrice * extraPersonCount
    }

    dailyPrices.push({
      date: dateStr,
      price: dayPrice + (extraPersonCount > 0 ? extraPrice * extraPersonCount : 0),
      season_name: seasonName,
      is_weekend: weekend,
    })
  }

  return {
    room_id: roomId,
    check_in: checkIn,
    check_out: checkOut,
    nights,
    guests_count: guestsCount,
    base_total: baseTotal,
    extra_person_total: extraPersonTotal,
    total_price: baseTotal + extraPersonTotal,
    daily_prices: dailyPrices,
  }
}
