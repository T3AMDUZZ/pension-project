// 객실
export interface Room {
  id: string
  name: string
  description: string
  type: string
  base_capacity: number
  max_capacity: number
  size: string
  amenities: string[]
  images: RoomImage[]
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface RoomImage {
  url: string
  alt: string
  is_primary: boolean
  sort_order: number
}

// 시즌
export interface Season {
  id: string
  name: string
  start_date: string
  end_date: string
  min_nights: number
  created_at: string
}

// 객실 요금
export interface RoomPrice {
  id: string
  room_id: string
  season_id: string
  weekday_price: number
  weekend_price: number
  extra_person_price: number
}

// 특가
export interface SpecialPrice {
  id: string
  room_id: string
  date: string
  price: number
}

// 예약 상태
export type ReservationStatus =
  | 'pending'
  | 'awaiting_payment'
  | 'payment_confirmed'
  | 'confirmed'
  | 'checked_in'
  | 'checked_out'
  | 'cancelled'
  | 'no_show'

// 결제 방식
export type PaymentMethod = 'bank_transfer' | 'on_site'

// 예약
export interface Reservation {
  id: string
  reservation_number: string
  room_id: string
  guest_name: string
  phone: string
  check_in: string
  check_out: string
  guests_count: number
  payment_method: PaymentMethod
  total_price: number
  status: ReservationStatus
  vehicle_number: string | null
  memo: string | null
  admin_memo: string | null
  created_at: string
  updated_at: string
  room?: Room
}

// 공지사항
export interface Notice {
  id: string
  title: string
  content: string
  is_pinned: boolean
  created_at: string
  updated_at: string
}

// 설정
export interface Setting {
  id: string
  key: string
  value: unknown
}

// 관리자
export interface AdminUser {
  id: string
  username: string
  created_at: string
}

// API 응답
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  code?: string
}

// 페이징
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  total_pages: number
}

// 대시보드
export interface DashboardSummary {
  today_checkin: number
  today_checkout: number
  currently_staying: number
  awaiting_payment: number
  monthly_revenue: number
}

// 예약 가능 날짜
export interface DayAvailability {
  date: string
  available: boolean
  price: number | null
}

// 예약 요금 계산
export interface PriceCalculation {
  room_id: string
  check_in: string
  check_out: string
  nights: number
  guests_count: number
  base_total: number
  extra_person_total: number
  total_price: number
  daily_prices: {
    date: string
    price: number
    season_name: string
    is_weekend: boolean
  }[]
}

// 펜션 설정
export interface PensionInfo {
  name: string
  address: string
  phone: string
  description: string
  main_image: string
  latitude: number
  longitude: number
}

export interface BankAccount {
  bank_name: string
  account_number: string
  account_holder: string
}

export interface ReservationPolicy {
  min_nights: number
  max_advance_days: number
  refund_policy: string
  check_in_time: string
  check_out_time: string
}
