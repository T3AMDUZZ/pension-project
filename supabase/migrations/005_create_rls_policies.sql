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
