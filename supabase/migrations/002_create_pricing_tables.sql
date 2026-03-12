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
