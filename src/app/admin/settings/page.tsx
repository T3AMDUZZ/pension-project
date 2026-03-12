'use client'

import { useState, useEffect, useCallback } from 'react'
import Card, { CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { PageLoading } from '@/components/ui/Loading'
import type { PensionInfo, BankAccount, ReservationPolicy } from '@/lib/types'

const BANKS = [
  '국민은행', '신한은행', '우리은행', '하나은행', 'NH농협', 'IBK기업은행',
  'SC제일은행', '카카오뱅크', '토스뱅크', '케이뱅크', '우체국',
]

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true)

  // Pension Info
  const [pensionInfo, setPensionInfo] = useState<PensionInfo>({
    name: '', address: '', phone: '', description: '', main_image: '', latitude: 0, longitude: 0,
  })
  const [savingPension, setSavingPension] = useState(false)
  const [pensionSaved, setPensionSaved] = useState(false)

  // Bank Account
  const [bankAccount, setBankAccount] = useState<BankAccount>({
    bank_name: '', account_number: '', account_holder: '',
  })
  const [savingBank, setSavingBank] = useState(false)
  const [bankSaved, setBankSaved] = useState(false)

  // Reservation Policy
  const [policy, setPolicy] = useState<ReservationPolicy>({
    min_nights: 1, max_advance_days: 90, refund_policy: '', check_in_time: '15:00', check_out_time: '11:00',
  })
  const [savingPolicy, setSavingPolicy] = useState(false)
  const [policySaved, setPolicySaved] = useState(false)

  // Password
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [pwError, setPwError] = useState('')
  const [pwSuccess, setPwSuccess] = useState(false)
  const [savingPw, setSavingPw] = useState(false)

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/settings')
      const json = await res.json()
      if (json.success) {
        const data = json.data
        if (data.pension_info) setPensionInfo(data.pension_info)
        if (data.bank_account) setBankAccount(data.bank_account)
        if (data.reservation_policy) setPolicy(data.reservation_policy)
      }
    } catch (err) {
      console.error('Fetch settings error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchSettings() }, [fetchSettings])

  const saveSetting = async (key: string, value: unknown, setSaving: (b: boolean) => void, setSaved: (b: boolean) => void) => {
    setSaving(true)
    setSaved(false)
    try {
      await fetch(`/api/settings/${key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      console.error('Save setting error:', err)
    } finally {
      setSaving(false)
    }
  }

  const changePassword = async () => {
    setPwError('')
    setPwSuccess(false)

    if (!currentPw || !newPw) {
      setPwError('비밀번호를 입력해주세요.')
      return
    }
    if (newPw !== confirmPw) {
      setPwError('새 비밀번호가 일치하지 않습니다.')
      return
    }
    if (newPw.length < 4) {
      setPwError('새 비밀번호는 4자 이상이어야 합니다.')
      return
    }

    setSavingPw(true)
    try {
      const res = await fetch('/api/auth/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ current_password: currentPw, new_password: newPw }),
      })
      const json = await res.json()

      if (json.success) {
        setPwSuccess(true)
        setCurrentPw('')
        setNewPw('')
        setConfirmPw('')
        setTimeout(() => setPwSuccess(false), 3000)
      } else {
        setPwError(json.error || '비밀번호 변경에 실패했습니다.')
      }
    } catch {
      setPwError('서버에 연결할 수 없습니다.')
    } finally {
      setSavingPw(false)
    }
  }

  if (loading) return <PageLoading />

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900">기본 설정</h1>

      {/* 펜션 정보 */}
      <Card>
        <CardTitle className="mb-4">펜션 정보</CardTitle>
        <div className="space-y-4">
          <Input label="펜션명" value={pensionInfo.name} onChange={(e) => setPensionInfo({ ...pensionInfo, name: e.target.value })} />
          <Input label="주소" value={pensionInfo.address} onChange={(e) => setPensionInfo({ ...pensionInfo, address: e.target.value })} />
          <Input label="연락처" value={pensionInfo.phone} onChange={(e) => setPensionInfo({ ...pensionInfo, phone: e.target.value })} placeholder="010-0000-0000" />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">소개글</label>
            <textarea
              value={pensionInfo.description}
              onChange={(e) => setPensionInfo({ ...pensionInfo, description: e.target.value })}
              rows={4}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pension-primary/50"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="위도" type="number" step="any" value={pensionInfo.latitude} onChange={(e) => setPensionInfo({ ...pensionInfo, latitude: Number(e.target.value) })} />
            <Input label="경도" type="number" step="any" value={pensionInfo.longitude} onChange={(e) => setPensionInfo({ ...pensionInfo, longitude: Number(e.target.value) })} />
          </div>
          <div className="flex items-center gap-3">
            <Button size="sm" onClick={() => saveSetting('pension_info', pensionInfo, setSavingPension, setPensionSaved)} loading={savingPension}>저장</Button>
            {pensionSaved && <span className="text-sm text-green-600">저장되었습니다.</span>}
          </div>
        </div>
      </Card>

      {/* 입금 계좌 */}
      <Card>
        <CardTitle className="mb-4">입금 계좌</CardTitle>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">은행명</label>
            <select
              value={bankAccount.bank_name}
              onChange={(e) => setBankAccount({ ...bankAccount, bank_name: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pension-primary/50"
            >
              <option value="">선택</option>
              {BANKS.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
          <Input label="계좌번호" value={bankAccount.account_number} onChange={(e) => setBankAccount({ ...bankAccount, account_number: e.target.value })} />
          <Input label="예금주" value={bankAccount.account_holder} onChange={(e) => setBankAccount({ ...bankAccount, account_holder: e.target.value })} />
          <div className="flex items-center gap-3">
            <Button size="sm" onClick={() => saveSetting('bank_account', bankAccount, setSavingBank, setBankSaved)} loading={savingBank}>저장</Button>
            {bankSaved && <span className="text-sm text-green-600">저장되었습니다.</span>}
          </div>
        </div>
      </Card>

      {/* 예약 정책 */}
      <Card>
        <CardTitle className="mb-4">예약 정책</CardTitle>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="최소 숙박일수" type="number" min={1} value={policy.min_nights} onChange={(e) => setPolicy({ ...policy, min_nights: Number(e.target.value) })} />
            <Input label="최대 예약 가능 일수" type="number" min={1} value={policy.max_advance_days} onChange={(e) => setPolicy({ ...policy, max_advance_days: Number(e.target.value) })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="체크인 시간" type="time" value={policy.check_in_time} onChange={(e) => setPolicy({ ...policy, check_in_time: e.target.value })} />
            <Input label="체크아웃 시간" type="time" value={policy.check_out_time} onChange={(e) => setPolicy({ ...policy, check_out_time: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">환불 규정</label>
            <textarea
              value={policy.refund_policy}
              onChange={(e) => setPolicy({ ...policy, refund_policy: e.target.value })}
              rows={5}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pension-primary/50"
              placeholder="환불 규정을 입력하세요..."
            />
          </div>
          <div className="flex items-center gap-3">
            <Button size="sm" onClick={() => saveSetting('reservation_policy', policy, setSavingPolicy, setPolicySaved)} loading={savingPolicy}>저장</Button>
            {policySaved && <span className="text-sm text-green-600">저장되었습니다.</span>}
          </div>
        </div>
      </Card>

      {/* 비밀번호 변경 */}
      <Card>
        <CardTitle className="mb-4">관리자 계정</CardTitle>
        <div className="space-y-4">
          {pwError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{pwError}</div>
          )}
          {pwSuccess && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-600">
              비밀번호가 변경되었습니다.
            </div>
          )}
          <Input
            label="현재 비밀번호"
            type="password"
            value={currentPw}
            onChange={(e) => setCurrentPw(e.target.value)}
            autoComplete="current-password"
          />
          <Input
            label="새 비밀번호"
            type="password"
            value={newPw}
            onChange={(e) => setNewPw(e.target.value)}
            autoComplete="new-password"
          />
          <Input
            label="비밀번호 확인"
            type="password"
            value={confirmPw}
            onChange={(e) => setConfirmPw(e.target.value)}
            error={confirmPw && newPw !== confirmPw ? '비밀번호가 일치하지 않습니다.' : undefined}
            autoComplete="new-password"
          />
          <Button size="sm" onClick={changePassword} loading={savingPw}>
            비밀번호 변경
          </Button>
        </div>
      </Card>
    </div>
  )
}
