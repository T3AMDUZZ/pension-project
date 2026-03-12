-- ============================================================
-- 003_create_reservations.sql
-- 예약 테이블 생성: reservations (+ enum 타입)
-- ============================================================

-- 예약 상태 enum
CREATE TYPE reservation_status AS ENUM (
  'pending',
  'awaiting_payment',
  'payment_confirmed',
  'confirmed',
  'checked_in',
  'checked_out',
  'cancelled',
  'no_show'
);

COMMENT ON TYPE reservation_status IS '예약 상태: pending(대기), awaiting_payment(입금대기), payment_confirmed(입금확인), confirmed(확정), checked_in(체크인), checked_out(체크아웃), cancelled(취소), no_show(노쇼)';

-- 결제 방식 enum
CREATE TYPE payment_method AS ENUM ('bank_transfer', 'on_site');

COMMENT ON TYPE payment_method IS '결제 방식: bank_transfer(무통장입금), on_site(현장결제)';

-- reservations 테이블: 예약 정보
CREATE TABLE reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_number VARCHAR(20) UNIQUE NOT NULL,
  room_id UUID NOT NULL REFERENCES rooms(id),
  guest_name VARCHAR(50) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  guests_count INT NOT NULL DEFAULT 2,
  payment_method payment_method NOT NULL DEFAULT 'bank_transfer',
  total_price INT NOT NULL DEFAULT 0,
  status reservation_status NOT NULL DEFAULT 'pending',
  vehicle_number VARCHAR(20),
  memo TEXT,
  admin_memo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT check_dates CHECK (check_out > check_in)
);

COMMENT ON TABLE reservations IS '예약 정보 테이블';
COMMENT ON COLUMN reservations.reservation_number IS '예약번호 (고유)';
COMMENT ON COLUMN reservations.room_id IS '객실 ID (FK: rooms)';
COMMENT ON COLUMN reservations.guest_name IS '예약자 이름';
COMMENT ON COLUMN reservations.phone IS '연락처';
COMMENT ON COLUMN reservations.check_in IS '체크인 날짜';
COMMENT ON COLUMN reservations.check_out IS '체크아웃 날짜';
COMMENT ON COLUMN reservations.guests_count IS '투숙 인원수';
COMMENT ON COLUMN reservations.payment_method IS '결제 방식';
COMMENT ON COLUMN reservations.total_price IS '총 결제 금액 (원)';
COMMENT ON COLUMN reservations.status IS '예약 상태';
COMMENT ON COLUMN reservations.vehicle_number IS '차량 번호';
COMMENT ON COLUMN reservations.memo IS '고객 메모';
COMMENT ON COLUMN reservations.admin_memo IS '관리자 메모';

-- 인덱스
CREATE INDEX idx_reservations_room_id ON reservations(room_id);
CREATE INDEX idx_reservations_status ON reservations(status);
CREATE INDEX idx_reservations_check_in ON reservations(check_in);
CREATE INDEX idx_reservations_check_out ON reservations(check_out);
CREATE INDEX idx_reservations_number ON reservations(reservation_number);
CREATE INDEX idx_reservations_phone ON reservations(phone);
