-- ============================================================
-- 펜션 예약 시스템 전체 스키마
-- 모든 마이그레이션 파일(001~005)을 순서대로 결합
-- ============================================================


-- ============================================================
-- 001_create_base_tables.sql
-- 기본 테이블 생성: rooms, seasons, admin_users, notices, settings
-- ============================================================

-- rooms 테이블: 객실 정보
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  type VARCHAR(50),
  base_capacity INT NOT NULL DEFAULT 2,
  max_capacity INT NOT NULL DEFAULT 4,
  size VARCHAR(50),
  amenities JSONB DEFAULT '[]'::jsonb,
  images JSONB DEFAULT '[]'::jsonb,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE rooms IS '객실 정보 테이블';
COMMENT ON COLUMN rooms.name IS '객실명';
COMMENT ON COLUMN rooms.description IS '객실 설명';
COMMENT ON COLUMN rooms.type IS '객실 유형 (독채, 커플룸, 특실 등)';
COMMENT ON COLUMN rooms.base_capacity IS '기준 인원';
COMMENT ON COLUMN rooms.max_capacity IS '최대 인원';
COMMENT ON COLUMN rooms.size IS '객실 면적';
COMMENT ON COLUMN rooms.amenities IS '편의시설 목록 (JSON 배열)';
COMMENT ON COLUMN rooms.images IS '객실 이미지 목록 (JSON 배열)';
COMMENT ON COLUMN rooms.sort_order IS '정렬 순서';
COMMENT ON COLUMN rooms.is_active IS '활성화 여부';

-- seasons 테이블: 시즌 정보
CREATE TABLE seasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  min_nights INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE seasons IS '시즌 정보 테이블';
COMMENT ON COLUMN seasons.name IS '시즌명 (비수기, 성수기, 준성수기)';
COMMENT ON COLUMN seasons.start_date IS '시즌 시작일';
COMMENT ON COLUMN seasons.end_date IS '시즌 종료일';
COMMENT ON COLUMN seasons.min_nights IS '최소 숙박 일수';

-- admin_users 테이블: 관리자 계정
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE admin_users IS '관리자 계정 테이블';
COMMENT ON COLUMN admin_users.username IS '관리자 아이디';
COMMENT ON COLUMN admin_users.password_hash IS '비밀번호 bcrypt 해시';

-- notices 테이블: 공지사항
CREATE TABLE notices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE notices IS '공지사항 테이블';
COMMENT ON COLUMN notices.title IS '공지 제목';
COMMENT ON COLUMN notices.content IS '공지 내용';
COMMENT ON COLUMN notices.is_pinned IS '상단 고정 여부';

-- settings 테이블: 사이트 설정
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) UNIQUE NOT NULL,
  value JSONB NOT NULL DEFAULT '{}'::jsonb
);

COMMENT ON TABLE settings IS '사이트 설정 테이블 (key-value)';
COMMENT ON COLUMN settings.key IS '설정 키';
COMMENT ON COLUMN settings.value IS '설정 값 (JSON)';


-- ============================================================
-- 002_create_pricing_tables.sql
-- 요금 테이블 생성: room_prices, special_prices
-- ============================================================

-- room_prices 테이블: 객실별 시즌별 요금
CREATE TABLE room_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  season_id UUID NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
  weekday_price INT NOT NULL DEFAULT 0,
  weekend_price INT NOT NULL DEFAULT 0,
  extra_person_price INT DEFAULT 0,
  UNIQUE(room_id, season_id)
);

COMMENT ON TABLE room_prices IS '객실별 시즌별 요금 테이블';
COMMENT ON COLUMN room_prices.room_id IS '객실 ID (FK: rooms)';
COMMENT ON COLUMN room_prices.season_id IS '시즌 ID (FK: seasons)';
COMMENT ON COLUMN room_prices.weekday_price IS '평일 요금 (원)';
COMMENT ON COLUMN room_prices.weekend_price IS '주말 요금 (원)';
COMMENT ON COLUMN room_prices.extra_person_price IS '추가 인원당 요금 (원)';

-- special_prices 테이블: 특정일 특별 요금
CREATE TABLE special_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  price INT NOT NULL,
  UNIQUE(room_id, date)
);

COMMENT ON TABLE special_prices IS '특정일 특별 요금 테이블';
COMMENT ON COLUMN special_prices.room_id IS '객실 ID (FK: rooms)';
COMMENT ON COLUMN special_prices.date IS '적용 날짜';
COMMENT ON COLUMN special_prices.price IS '특별 요금 (원)';

-- 인덱스
CREATE INDEX idx_room_prices_room_id ON room_prices(room_id);
CREATE INDEX idx_room_prices_season_id ON room_prices(season_id);
CREATE INDEX idx_special_prices_room_id ON special_prices(room_id);
CREATE INDEX idx_special_prices_date ON special_prices(date);


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


-- ============================================================
-- 004_create_triggers.sql
-- updated_at 자동 갱신 트리거
-- ============================================================

-- updated_at 자동 갱신 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_updated_at() IS 'updated_at 컬럼을 현재 시간으로 자동 갱신하는 트리거 함수';

-- rooms updated_at 트리거
CREATE TRIGGER rooms_updated_at
  BEFORE UPDATE ON rooms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- reservations updated_at 트리거
CREATE TRIGGER reservations_updated_at
  BEFORE UPDATE ON reservations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- notices updated_at 트리거
CREATE TRIGGER notices_updated_at
  BEFORE UPDATE ON notices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ============================================================
-- 005_create_rls_policies.sql
-- RLS(Row Level Security) 정책 설정
-- ============================================================

-- RLS 활성화
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE special_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- rooms: 공개 읽기, 인증된 사용자만 CUD
CREATE POLICY "rooms_public_read" ON rooms FOR SELECT USING (true);
CREATE POLICY "rooms_auth_insert" ON rooms FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "rooms_auth_update" ON rooms FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "rooms_auth_delete" ON rooms FOR DELETE USING (auth.role() = 'authenticated');

-- seasons: 공개 읽기, 인증된 사용자만 CUD
CREATE POLICY "seasons_public_read" ON seasons FOR SELECT USING (true);
CREATE POLICY "seasons_auth_insert" ON seasons FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "seasons_auth_update" ON seasons FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "seasons_auth_delete" ON seasons FOR DELETE USING (auth.role() = 'authenticated');

-- room_prices: 공개 읽기, 인증된 사용자만 CUD
CREATE POLICY "room_prices_public_read" ON room_prices FOR SELECT USING (true);
CREATE POLICY "room_prices_auth_insert" ON room_prices FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "room_prices_auth_update" ON room_prices FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "room_prices_auth_delete" ON room_prices FOR DELETE USING (auth.role() = 'authenticated');

-- special_prices: 공개 읽기, 인증된 사용자만 CUD
CREATE POLICY "special_prices_public_read" ON special_prices FOR SELECT USING (true);
CREATE POLICY "special_prices_auth_insert" ON special_prices FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "special_prices_auth_update" ON special_prices FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "special_prices_auth_delete" ON special_prices FOR DELETE USING (auth.role() = 'authenticated');

-- reservations: 공개 INSERT(예약 생성), 본인 예약만 읽기(예약번호+연락처), 인증된 사용자 전체 관리
CREATE POLICY "reservations_public_insert" ON reservations FOR INSERT WITH CHECK (true);
CREATE POLICY "reservations_auth_select" ON reservations FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "reservations_auth_update" ON reservations FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "reservations_auth_delete" ON reservations FOR DELETE USING (auth.role() = 'authenticated');

-- notices: 공개 읽기, 인증된 사용자만 CUD
CREATE POLICY "notices_public_read" ON notices FOR SELECT USING (true);
CREATE POLICY "notices_auth_insert" ON notices FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "notices_auth_update" ON notices FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "notices_auth_delete" ON notices FOR DELETE USING (auth.role() = 'authenticated');

-- settings: 공개 읽기, 인증된 사용자만 수정
CREATE POLICY "settings_public_read" ON settings FOR SELECT USING (true);
CREATE POLICY "settings_auth_update" ON settings FOR UPDATE USING (auth.role() = 'authenticated');

-- admin_users: 인증된 사용자만 접근
CREATE POLICY "admin_users_auth_select" ON admin_users FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "admin_users_auth_update" ON admin_users FOR UPDATE USING (auth.role() = 'authenticated');
