import type {
  Room,
  Season,
  RoomPrice,
  Reservation,
  Notice,
  DashboardSummary,
  PensionInfo,
  BankAccount,
  ReservationPolicy,
} from './types'

// ─── 객실 (3개) ───────────────────────────────────────────────

export const mockRooms: Room[] = [
  {
    id: 'room-001',
    name: 'A동 로즈',
    description:
      '넓은 정원과 독립된 공간에서 프라이빗한 힐링을 즐길 수 있는 독채형 객실입니다. 가족 여행이나 소규모 모임에 적합합니다.',
    type: '독채',
    base_capacity: 4,
    max_capacity: 6,
    size: '49.5㎡',
    amenities: [
      '에어컨',
      '냉장고',
      'TV',
      'Wi-Fi',
      '개별 바베큐장',
      '주방(취사 가능)',
      '세탁기',
      '주차 가능',
    ],
    images: [
      { url: '', alt: 'A동 로즈 거실', is_primary: true, sort_order: 1 },
      { url: '', alt: 'A동 로즈 침실', is_primary: false, sort_order: 2 },
      { url: '', alt: 'A동 로즈 욕실', is_primary: false, sort_order: 3 },
    ],
    sort_order: 1,
    is_active: true,
    created_at: '2025-01-15T09:00:00Z',
    updated_at: '2025-01-15T09:00:00Z',
  },
  {
    id: 'room-002',
    name: 'B동 라벤더',
    description:
      '커플을 위한 아늑한 감성 객실입니다. 탁 트인 창 밖으로 펼쳐지는 산 경치가 일품입니다.',
    type: '커플룸',
    base_capacity: 2,
    max_capacity: 3,
    size: '26.4㎡',
    amenities: ['에어컨', '냉장고', 'TV', 'Wi-Fi', '커피머신'],
    images: [
      { url: '', alt: 'B동 라벤더 전경', is_primary: true, sort_order: 1 },
      { url: '', alt: 'B동 라벤더 침실', is_primary: false, sort_order: 2 },
    ],
    sort_order: 2,
    is_active: true,
    created_at: '2025-01-15T09:00:00Z',
    updated_at: '2025-01-15T09:00:00Z',
  },
  {
    id: 'room-003',
    name: 'C동 선셋',
    description:
      '대가족이나 단체 모임에 적합한 프리미엄 특실입니다. 넓은 거실과 2개의 침실, 독립 테라스를 갖추고 있습니다.',
    type: '특실',
    base_capacity: 6,
    max_capacity: 10,
    size: '66㎡',
    amenities: [
      '에어컨',
      '냉장고',
      'TV 2대',
      'Wi-Fi',
      '개별 바베큐장',
      '주방(취사 가능)',
      '세탁기',
      '테라스',
      '주차 2대 가능',
    ],
    images: [
      { url: '', alt: 'C동 선셋 거실', is_primary: true, sort_order: 1 },
      { url: '', alt: 'C동 선셋 침실1', is_primary: false, sort_order: 2 },
      { url: '', alt: 'C동 선셋 침실2', is_primary: false, sort_order: 3 },
      { url: '', alt: 'C동 선셋 테라스', is_primary: false, sort_order: 4 },
    ],
    sort_order: 3,
    is_active: true,
    created_at: '2025-01-15T09:00:00Z',
    updated_at: '2025-01-15T09:00:00Z',
  },
]

// ─── 시즌 (4개) ───────────────────────────────────────────────

export const mockSeasons: Season[] = [
  {
    id: 'season-001',
    name: '비수기(상반기)',
    start_date: '2026-01-01',
    end_date: '2026-06-30',
    min_nights: 1,
    created_at: '2025-12-01T00:00:00Z',
  },
  {
    id: 'season-002',
    name: '성수기',
    start_date: '2026-07-01',
    end_date: '2026-08-31',
    min_nights: 2,
    created_at: '2025-12-01T00:00:00Z',
  },
  {
    id: 'season-003',
    name: '준성수기',
    start_date: '2026-09-01',
    end_date: '2026-10-31',
    min_nights: 1,
    created_at: '2025-12-01T00:00:00Z',
  },
  {
    id: 'season-004',
    name: '비수기(하반기)',
    start_date: '2026-11-01',
    end_date: '2026-12-31',
    min_nights: 1,
    created_at: '2025-12-01T00:00:00Z',
  },
]

// ─── 객실 요금 (12개 = 3객실 x 4시즌) ─────────────────────────

export const mockRoomPrices: RoomPrice[] = [
  // A동 로즈
  {
    id: 'price-001',
    room_id: 'room-001',
    season_id: 'season-001',
    weekday_price: 150000,
    weekend_price: 200000,
    extra_person_price: 20000,
  },
  {
    id: 'price-002',
    room_id: 'room-001',
    season_id: 'season-002',
    weekday_price: 250000,
    weekend_price: 300000,
    extra_person_price: 30000,
  },
  {
    id: 'price-003',
    room_id: 'room-001',
    season_id: 'season-003',
    weekday_price: 180000,
    weekend_price: 230000,
    extra_person_price: 25000,
  },
  {
    id: 'price-004',
    room_id: 'room-001',
    season_id: 'season-004',
    weekday_price: 150000,
    weekend_price: 200000,
    extra_person_price: 20000,
  },
  // B동 라벤더
  {
    id: 'price-005',
    room_id: 'room-002',
    season_id: 'season-001',
    weekday_price: 80000,
    weekend_price: 120000,
    extra_person_price: 15000,
  },
  {
    id: 'price-006',
    room_id: 'room-002',
    season_id: 'season-002',
    weekday_price: 150000,
    weekend_price: 200000,
    extra_person_price: 20000,
  },
  {
    id: 'price-007',
    room_id: 'room-002',
    season_id: 'season-003',
    weekday_price: 100000,
    weekend_price: 150000,
    extra_person_price: 18000,
  },
  {
    id: 'price-008',
    room_id: 'room-002',
    season_id: 'season-004',
    weekday_price: 80000,
    weekend_price: 120000,
    extra_person_price: 15000,
  },
  // C동 선셋
  {
    id: 'price-009',
    room_id: 'room-003',
    season_id: 'season-001',
    weekday_price: 250000,
    weekend_price: 320000,
    extra_person_price: 25000,
  },
  {
    id: 'price-010',
    room_id: 'room-003',
    season_id: 'season-002',
    weekday_price: 400000,
    weekend_price: 500000,
    extra_person_price: 35000,
  },
  {
    id: 'price-011',
    room_id: 'room-003',
    season_id: 'season-003',
    weekday_price: 300000,
    weekend_price: 380000,
    extra_person_price: 30000,
  },
  {
    id: 'price-012',
    room_id: 'room-003',
    season_id: 'season-004',
    weekday_price: 250000,
    weekend_price: 320000,
    extra_person_price: 25000,
  },
]

// ─── 예약 (12개) ──────────────────────────────────────────────

export const mockReservations: Reservation[] = [
  // 오늘(2026-03-12) 체크인 2건 - confirmed
  {
    id: 'rsv-001',
    reservation_number: 'R20260310-001',
    room_id: 'room-001',
    guest_name: '김민수',
    phone: '010-1234-5678',
    check_in: '2026-03-12',
    check_out: '2026-03-14',
    guests_count: 4,
    payment_method: 'bank_transfer',
    total_price: 350000,
    status: 'confirmed',
    vehicle_number: '12가 3456',
    memo: '늦은 체크인 예정 (오후 6시)',
    admin_memo: null,
    created_at: '2026-03-10T14:30:00Z',
    updated_at: '2026-03-10T14:30:00Z',
    room: mockRooms[0],
  },
  {
    id: 'rsv-002',
    reservation_number: 'R20260311-002',
    room_id: 'room-002',
    guest_name: '이수진',
    phone: '010-9876-5432',
    check_in: '2026-03-12',
    check_out: '2026-03-13',
    guests_count: 2,
    payment_method: 'bank_transfer',
    total_price: 150000,
    status: 'confirmed',
    vehicle_number: '34나 7890',
    memo: null,
    admin_memo: null,
    created_at: '2026-03-11T10:00:00Z',
    updated_at: '2026-03-11T10:00:00Z',
    room: mockRooms[1],
  },

  // 오늘 체크아웃 1건 - checked_in
  {
    id: 'rsv-003',
    reservation_number: 'R20260308-003',
    room_id: 'room-003',
    guest_name: '박영호',
    phone: '010-5555-1234',
    check_in: '2026-03-10',
    check_out: '2026-03-12',
    guests_count: 8,
    payment_method: 'bank_transfer',
    total_price: 570000,
    status: 'checked_in',
    vehicle_number: '56다 1234',
    memo: '대가족 모임',
    admin_memo: '바베큐 세트 추가 요청',
    created_at: '2026-03-08T09:20:00Z',
    updated_at: '2026-03-10T15:05:00Z',
    room: mockRooms[2],
  },

  // 현재 투숙중 3건 - checked_in
  {
    id: 'rsv-004',
    reservation_number: 'R20260309-004',
    room_id: 'room-001',
    guest_name: '최정현',
    phone: '010-3333-4444',
    check_in: '2026-03-11',
    check_out: '2026-03-14',
    guests_count: 5,
    payment_method: 'bank_transfer',
    total_price: 500000,
    status: 'checked_in',
    vehicle_number: '78라 5678',
    memo: null,
    admin_memo: '추가 이불 제공 완료',
    created_at: '2026-03-09T16:45:00Z',
    updated_at: '2026-03-11T15:10:00Z',
    room: mockRooms[0],
  },
  {
    id: 'rsv-005',
    reservation_number: 'R20260307-005',
    room_id: 'room-002',
    guest_name: '한소영',
    phone: '010-7777-8888',
    check_in: '2026-03-11',
    check_out: '2026-03-13',
    guests_count: 2,
    payment_method: 'on_site',
    total_price: 160000,
    status: 'checked_in',
    vehicle_number: null,
    memo: '대중교통 이용',
    admin_memo: null,
    created_at: '2026-03-07T11:30:00Z',
    updated_at: '2026-03-11T15:20:00Z',
    room: mockRooms[1],
  },
  {
    id: 'rsv-006',
    reservation_number: 'R20260306-006',
    room_id: 'room-003',
    guest_name: '정대원',
    phone: '010-2222-3333',
    check_in: '2026-03-11',
    check_out: '2026-03-15',
    guests_count: 7,
    payment_method: 'bank_transfer',
    total_price: 1050000,
    status: 'checked_in',
    vehicle_number: '90마 9012',
    memo: '생일파티 예정',
    admin_memo: '케이크 냉장 보관 요청',
    created_at: '2026-03-06T08:00:00Z',
    updated_at: '2026-03-11T15:00:00Z',
    room: mockRooms[2],
  },

  // 입금대기 2건 - awaiting_payment
  {
    id: 'rsv-007',
    reservation_number: 'R20260312-007',
    room_id: 'room-001',
    guest_name: '윤서연',
    phone: '010-4444-5555',
    check_in: '2026-03-20',
    check_out: '2026-03-22',
    guests_count: 4,
    payment_method: 'bank_transfer',
    total_price: 350000,
    status: 'awaiting_payment',
    vehicle_number: '23바 4567',
    memo: null,
    admin_memo: null,
    created_at: '2026-03-12T08:15:00Z',
    updated_at: '2026-03-12T08:15:00Z',
    room: mockRooms[0],
  },
  {
    id: 'rsv-008',
    reservation_number: 'R20260312-008',
    room_id: 'room-003',
    guest_name: '강태훈',
    phone: '010-6666-7777',
    check_in: '2026-03-28',
    check_out: '2026-03-30',
    guests_count: 9,
    payment_method: 'bank_transfer',
    total_price: 690000,
    status: 'awaiting_payment',
    vehicle_number: '45사 6789',
    memo: '워크숍 행사',
    admin_memo: null,
    created_at: '2026-03-12T09:00:00Z',
    updated_at: '2026-03-12T09:00:00Z',
    room: mockRooms[2],
  },

  // 예약확정 2건 - confirmed (미래 날짜)
  {
    id: 'rsv-009',
    reservation_number: 'R20260310-009',
    room_id: 'room-002',
    guest_name: '오지은',
    phone: '010-8888-9999',
    check_in: '2026-03-21',
    check_out: '2026-03-22',
    guests_count: 2,
    payment_method: 'bank_transfer',
    total_price: 150000,
    status: 'confirmed',
    vehicle_number: '67아 8901',
    memo: '기념일 여행',
    admin_memo: null,
    created_at: '2026-03-10T20:00:00Z',
    updated_at: '2026-03-11T09:30:00Z',
    room: mockRooms[1],
  },
  {
    id: 'rsv-010',
    reservation_number: 'R20260309-010',
    room_id: 'room-001',
    guest_name: '신동욱',
    phone: '010-1111-2222',
    check_in: '2026-04-03',
    check_out: '2026-04-05',
    guests_count: 6,
    payment_method: 'bank_transfer',
    total_price: 420000,
    status: 'confirmed',
    vehicle_number: '89자 0123',
    memo: null,
    admin_memo: '최대 인원 - 추가 이불 준비',
    created_at: '2026-03-09T13:00:00Z',
    updated_at: '2026-03-09T15:00:00Z',
    room: mockRooms[0],
  },

  // 체크아웃 완료 1건 - checked_out (과거)
  {
    id: 'rsv-011',
    reservation_number: 'R20260301-011',
    room_id: 'room-002',
    guest_name: '장미경',
    phone: '010-5050-6060',
    check_in: '2026-03-06',
    check_out: '2026-03-08',
    guests_count: 2,
    payment_method: 'bank_transfer',
    total_price: 200000,
    status: 'checked_out',
    vehicle_number: '12차 3456',
    memo: null,
    admin_memo: null,
    created_at: '2026-03-01T17:00:00Z',
    updated_at: '2026-03-08T11:00:00Z',
    room: mockRooms[1],
  },

  // 취소 1건 - cancelled
  {
    id: 'rsv-012',
    reservation_number: 'R20260305-012',
    room_id: 'room-003',
    guest_name: '배성준',
    phone: '010-7070-8080',
    check_in: '2026-03-15',
    check_out: '2026-03-17',
    guests_count: 6,
    payment_method: 'bank_transfer',
    total_price: 500000,
    status: 'cancelled',
    vehicle_number: null,
    memo: '일정 변경으로 취소 요청',
    admin_memo: '전액 환불 처리 완료 (3/10)',
    created_at: '2026-03-05T12:00:00Z',
    updated_at: '2026-03-10T10:00:00Z',
    room: mockRooms[2],
  },
]

// ─── 공지사항 (3개) ───────────────────────────────────────────

export const mockNotices: Notice[] = [
  {
    id: 'notice-001',
    title: '2026년 성수기(7~8월) 예약 안내',
    content: `안녕하세요, 행복한 펜션입니다.

2026년 성수기 예약이 4월 1일부터 시작됩니다.

■ 성수기 기간: 2026년 7월 1일 ~ 8월 31일
■ 예약 오픈: 2026년 4월 1일 오전 10시
■ 최소 숙박: 2박 이상

성수기에는 예약이 조기 마감될 수 있으니 서둘러 예약해주세요.
문의사항은 전화(033-123-4567)로 연락 부탁드립니다.`,
    is_pinned: true,
    created_at: '2026-03-01T09:00:00Z',
    updated_at: '2026-03-01T09:00:00Z',
  },
  {
    id: 'notice-002',
    title: '바베큐장 이용 안내',
    content: `A동, C동 투숙객은 개별 바베큐장을 무료로 이용하실 수 있습니다.

■ 이용 시간: 17:00 ~ 22:00
■ 숯, 그릴은 무료 제공
■ 식재료는 직접 준비해주세요
■ 이용 후 정리 부탁드립니다

B동 투숙객은 공용 바베큐장(사전 예약제)을 이용하실 수 있습니다.
공용 바베큐장 이용료: 20,000원 (숯, 그릴 포함)`,
    is_pinned: false,
    created_at: '2026-02-15T10:00:00Z',
    updated_at: '2026-02-15T10:00:00Z',
  },
  {
    id: 'notice-003',
    title: '주변 맛집 추천',
    content: `펜션 근처 맛집을 소개합니다!

1. 양양 해물칼국수 (차량 5분)
   - 해물칼국수, 수육 / 033-111-2222

2. 속초 중앙시장 닭강정 (차량 20분)
   - 속초 명물 닭강정 / 033-333-4444

3. 하조대 횟집 (차량 10분)
   - 싱싱한 활어회 / 033-555-6666

4. 양양 전통시장 (차량 7분)
   - 매주 수, 토 오일장 운영

프론트에서 더 자세한 맛집 지도를 받으실 수 있습니다.`,
    is_pinned: false,
    created_at: '2026-01-20T14:00:00Z',
    updated_at: '2026-01-20T14:00:00Z',
  },
]

// ─── 설정 ─────────────────────────────────────────────────────

export const mockSettings: Record<string, unknown> = {
  pension_info: {
    name: '행복한 펜션',
    address: '강원도 양양군 현남면 인구항길 23',
    phone: '033-123-4567',
    description:
      '양양 바다가 한눈에 보이는 프리미엄 펜션. 가족, 커플, 단체 모임에 최적화된 다양한 객실을 제공합니다.',
    main_image: '',
    latitude: 38.0764,
    longitude: 128.6169,
  } as PensionInfo,

  bank_account: {
    bank_name: '농협은행',
    account_number: '301-0000-0000-00',
    account_holder: '홍길동',
  } as BankAccount,

  reservation_policy: {
    min_nights: 1,
    max_advance_days: 90,
    refund_policy: `■ 체크인 7일 전: 100% 환불
■ 체크인 5~6일 전: 80% 환불
■ 체크인 3~4일 전: 50% 환불
■ 체크인 1~2일 전: 30% 환불
■ 당일 및 노쇼: 환불 불가
※ 성수기(7~8월)에는 별도 환불 규정이 적용됩니다.`,
    check_in_time: '15:00',
    check_out_time: '11:00',
  } as ReservationPolicy,
}

// ─── 대시보드 요약 ────────────────────────────────────────────

export const mockDashboardSummary: DashboardSummary = {
  today_checkin: 2,
  today_checkout: 1,
  currently_staying: 3,
  awaiting_payment: 2,
  monthly_revenue: 4850000,
}
