// 날짜 포맷
export function formatDate(date: string | Date, format: string = 'yyyy-MM-dd'): string {
  const d = new Date(date)
  const yyyy = d.getFullYear()
  const MM = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')

  return format
    .replace('yyyy', String(yyyy))
    .replace('MM', MM)
    .replace('dd', dd)
}

// 가격 포맷 (10000 -> "10,000원")
export function formatPrice(price: number): string {
  return price.toLocaleString('ko-KR') + '원'
}

// 전화번호 포맷
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3')
  }
  return phone
}

// 주말 체크 (금, 토 = 주말)
export function isWeekend(date: Date): boolean {
  const day = date.getDay()
  return day === 5 || day === 6 // 금요일, 토요일
}

// 예약 상태 한글
export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: '예약대기',
    awaiting_payment: '입금대기',
    payment_confirmed: '입금확인',
    confirmed: '예약확정',
    checked_in: '체크인',
    checked_out: '체크아웃',
    cancelled: '취소',
    no_show: '노쇼',
  }
  return labels[status] || status
}

// 예약 상태 색상
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    awaiting_payment: 'bg-orange-100 text-orange-800',
    payment_confirmed: 'bg-blue-100 text-blue-800',
    confirmed: 'bg-green-100 text-green-800',
    checked_in: 'bg-purple-100 text-purple-800',
    checked_out: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800',
    no_show: 'bg-red-100 text-red-800',
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

// 예약번호 생성
export function generateReservationNumber(): string {
  const now = new Date()
  const date = formatDate(now, 'yyyyMMdd')
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `R${date}${random}`
}

// 두 날짜 사이의 일수
export function getDaysBetween(start: string | Date, end: string | Date): number {
  const startDate = new Date(start)
  const endDate = new Date(end)
  const diffTime = endDate.getTime() - startDate.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

// cn 헬퍼 - Tailwind 클래스 병합
export function cn(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(' ')
}
