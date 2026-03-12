# 펜션 예약 웹사이트 - 데이터베이스 스키마

## ER 다이어그램 (텍스트)

```
┌──────────────┐       ┌──────────────┐
│   seasons    │       │    rooms     │
│──────────────│       │──────────────│
│ id (PK)      │       │ id (PK)      │
│ name         │       │ name         │
│ start_date   │       │ description  │
│ end_date     │       │ type         │
│ min_nights   │       │ base_capacity│
│ created_at   │       │ max_capacity │
└──────┬───────┘       │ size         │
       │               │ amenities    │
       │               │ images       │
       │ 1:N           │ sort_order   │
       │               │ is_active    │
       ▼               │ created_at   │
┌──────────────┐       │ updated_at   │
│ room_prices  │       └──────┬───────┘
│──────────────│              │
│ id (PK)      │              │ 1:N
│ room_id (FK) │◄─────────────┤
│ season_id(FK)│              │
│ weekday_price│              │
│ weekend_price│       ┌──────┴───────┐
│ extra_person │       │special_prices│
└──────────────┘       │──────────────│
                       │ id (PK)      │
                       │ room_id (FK) │
                       │ date         │
                       │ price        │
                       └──────────────┘

       ┌──────────────┐
       │ reservations │
       │──────────────│
       │ id (PK)      │
       │ reservation_ │
       │   number     │
       │ room_id (FK) │───► rooms.id
       │ guest_name   │
       │ phone        │
       │ check_in     │
       │ check_out    │
       │ guests_count │
       │ payment_     │
       │   method     │
       │ total_price  │
       │ status       │
       │ vehicle_     │
       │   number     │
       │ memo         │
       │ admin_memo   │
       │ created_at   │
       │ updated_at   │
       └──────────────┘

┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ admin_users  │  │   notices    │  │   settings   │
│──────────────│  │──────────────│  │──────────────│
│ id (PK)      │  │ id (PK)      │  │ id (PK)      │
│ username     │  │ title        │  │ key (UNIQUE) │
│ password_hash│  │ content      │  │ value (JSONB)│
│ created_at   │  │ is_pinned    │  └──────────────┘
└──────────────┘  │ created_at   │
                  │ updated_at   │
                  └──────────────┘
```

## 테이블 상세

### 1. rooms (객실)

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | UUID | PK, DEFAULT gen_random_uuid() | 객실 고유 ID |
| name | VARCHAR(100) | NOT NULL | 객실명 |
| description | TEXT | - | 객실 설명 |
| type | VARCHAR(50) | - | 객실 유형 (독채, 커플룸, 특실 등) |
| base_capacity | INT | NOT NULL, DEFAULT 2 | 기준 인원 |
| max_capacity | INT | NOT NULL, DEFAULT 4 | 최대 인원 |
| size | VARCHAR(50) | - | 객실 면적 |
| amenities | JSONB | DEFAULT '[]' | 편의시설 목록 |
| images | JSONB | DEFAULT '[]' | 이미지 목록 |
| sort_order | INT | DEFAULT 0 | 정렬 순서 |
| is_active | BOOLEAN | DEFAULT true | 활성화 여부 |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | 생성일시 |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | 수정일시 (트리거 자동 갱신) |

### 2. seasons (시즌)

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | UUID | PK, DEFAULT gen_random_uuid() | 시즌 고유 ID |
| name | VARCHAR(50) | NOT NULL | 시즌명 |
| start_date | DATE | NOT NULL | 시작일 |
| end_date | DATE | NOT NULL | 종료일 |
| min_nights | INT | DEFAULT 1 | 최소 숙박 일수 |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | 생성일시 |

### 3. room_prices (객실 요금)

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | UUID | PK, DEFAULT gen_random_uuid() | 요금 고유 ID |
| room_id | UUID | FK rooms(id) ON DELETE CASCADE | 객실 ID |
| season_id | UUID | FK seasons(id) ON DELETE CASCADE | 시즌 ID |
| weekday_price | INT | NOT NULL, DEFAULT 0 | 평일 요금 (원) |
| weekend_price | INT | NOT NULL, DEFAULT 0 | 주말 요금 (원) |
| extra_person_price | INT | DEFAULT 0 | 추가 인원당 요금 (원) |

- UNIQUE(room_id, season_id) 제약

### 4. special_prices (특별 요금)

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | UUID | PK, DEFAULT gen_random_uuid() | 특별요금 고유 ID |
| room_id | UUID | FK rooms(id) ON DELETE CASCADE | 객실 ID |
| date | DATE | NOT NULL | 적용 날짜 |
| price | INT | NOT NULL | 특별 요금 (원) |

- UNIQUE(room_id, date) 제약

### 5. reservations (예약)

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | UUID | PK, DEFAULT gen_random_uuid() | 예약 고유 ID |
| reservation_number | VARCHAR(20) | UNIQUE, NOT NULL | 예약번호 |
| room_id | UUID | FK rooms(id), NOT NULL | 객실 ID |
| guest_name | VARCHAR(50) | NOT NULL | 예약자 이름 |
| phone | VARCHAR(20) | NOT NULL | 연락처 |
| check_in | DATE | NOT NULL | 체크인 날짜 |
| check_out | DATE | NOT NULL | 체크아웃 날짜 |
| guests_count | INT | NOT NULL, DEFAULT 2 | 투숙 인원 |
| payment_method | payment_method | NOT NULL, DEFAULT 'bank_transfer' | 결제 방식 |
| total_price | INT | NOT NULL, DEFAULT 0 | 총 결제 금액 (원) |
| status | reservation_status | NOT NULL, DEFAULT 'pending' | 예약 상태 |
| vehicle_number | VARCHAR(20) | - | 차량 번호 |
| memo | TEXT | - | 고객 메모 |
| admin_memo | TEXT | - | 관리자 메모 |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | 생성일시 |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | 수정일시 (트리거 자동 갱신) |

- CHECK (check_out > check_in) 제약

### 6. admin_users (관리자)

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | UUID | PK, DEFAULT gen_random_uuid() | 관리자 고유 ID |
| username | VARCHAR(50) | UNIQUE, NOT NULL | 관리자 아이디 |
| password_hash | VARCHAR(255) | NOT NULL | 비밀번호 bcrypt 해시 |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | 생성일시 |

### 7. notices (공지사항)

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | UUID | PK, DEFAULT gen_random_uuid() | 공지 고유 ID |
| title | VARCHAR(200) | NOT NULL | 공지 제목 |
| content | TEXT | - | 공지 내용 |
| is_pinned | BOOLEAN | DEFAULT false | 상단 고정 여부 |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | 생성일시 |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | 수정일시 (트리거 자동 갱신) |

### 8. settings (설정)

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | UUID | PK, DEFAULT gen_random_uuid() | 설정 고유 ID |
| key | VARCHAR(100) | UNIQUE, NOT NULL | 설정 키 |
| value | JSONB | NOT NULL, DEFAULT '{}' | 설정 값 |

## Enum 타입

### reservation_status
| 값 | 설명 |
|----|------|
| pending | 예약 대기 |
| awaiting_payment | 입금 대기 |
| payment_confirmed | 입금 확인 |
| confirmed | 예약 확정 |
| checked_in | 체크인 완료 |
| checked_out | 체크아웃 완료 |
| cancelled | 예약 취소 |
| no_show | 노쇼 |

### payment_method
| 값 | 설명 |
|----|------|
| bank_transfer | 무통장입금 |
| on_site | 현장결제 |

## 인덱스

| 테이블 | 인덱스명 | 컬럼 |
|--------|----------|------|
| room_prices | idx_room_prices_room_id | room_id |
| room_prices | idx_room_prices_season_id | season_id |
| special_prices | idx_special_prices_room_id | room_id |
| special_prices | idx_special_prices_date | date |
| reservations | idx_reservations_room_id | room_id |
| reservations | idx_reservations_status | status |
| reservations | idx_reservations_check_in | check_in |
| reservations | idx_reservations_check_out | check_out |
| reservations | idx_reservations_number | reservation_number |
| reservations | idx_reservations_phone | phone |

## 트리거

| 트리거명 | 테이블 | 시점 | 기능 |
|----------|--------|------|------|
| rooms_updated_at | rooms | BEFORE UPDATE | updated_at 자동 갱신 |
| reservations_updated_at | reservations | BEFORE UPDATE | updated_at 자동 갱신 |
| notices_updated_at | notices | BEFORE UPDATE | updated_at 자동 갱신 |

## settings 키 목록

| key | 설명 | value 구조 |
|-----|------|-----------|
| pension_info | 펜션 기본 정보 | `{name, address, phone, description, main_image, latitude, longitude}` |
| bank_account | 계좌 정보 | `{bank_name, account_number, account_holder}` |
| reservation_policy | 예약 정책 | `{min_nights, max_advance_days, refund_policy, check_in_time, check_out_time}` |
