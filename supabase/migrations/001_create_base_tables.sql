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
