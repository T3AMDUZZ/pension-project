'use client'

import { useState, useEffect } from 'react'
import { MapPin, Car, Bus } from 'lucide-react'
import { AboutSubNav } from '../page'
import KakaoMap from '@/components/public/KakaoMap'
import type { PensionInfo } from '@/lib/types'

export default function LocationPage() {
  const [pensionInfo, setPensionInfo] = useState<PensionInfo | null>(null)

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data?.pension_info) {
          setPensionInfo(json.data.pension_info as PensionInfo)
        }
      })
      .catch(() => {})
  }, [])

  const pensionName = pensionInfo?.name || '숲속의 아침 펜션'
  const pensionAddress = pensionInfo?.address || '경기도 가평군 상면 축령산로 000-00'
  const latitude = pensionInfo?.latitude || 37.8316
  const longitude = pensionInfo?.longitude || 127.5095

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">오시는 길</h1>
      <p className="text-gray-500 mb-6">{pensionName} 찾아오시는 방법</p>

      <AboutSubNav />

      {/* KakaoMap */}
      <div className="mb-8">
        <KakaoMap
          latitude={latitude}
          longitude={longitude}
          address={pensionAddress}
          name={pensionName}
        />
      </div>

      {/* Address */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
          <MapPin size={20} className="text-pension-primary" />
          주소
        </h2>
        <div className="space-y-1 text-sm text-gray-600">
          <p>
            <span className="font-medium text-gray-700">[도로명]</span>{' '}
            {pensionAddress}
          </p>
        </div>
      </div>

      {/* Transportation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* By Car */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Car size={20} className="text-pension-primary" />
            자가용
          </h2>
          <div className="space-y-3 text-sm text-gray-600">
            <div>
              <p className="font-medium text-gray-700 mb-1">서울 방면</p>
              <p>경춘고속도로 &rarr; 가평IC &rarr; 축령산 방면 좌회전 &rarr; 약 15분</p>
            </div>
            <div>
              <p className="font-medium text-gray-700 mb-1">수원/용인 방면</p>
              <p>중부고속도로 &rarr; 하남JC &rarr; 경춘고속도로 &rarr; 가평IC</p>
            </div>
            <div className="pt-2 border-t border-gray-100">
              <p className="text-pension-primary font-medium">
                네비게이션에 &quot;{pensionName}&quot; 또는 주소를 검색해주세요.
              </p>
            </div>
          </div>
        </div>

        {/* Public Transport */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Bus size={20} className="text-pension-primary" />
            대중교통
          </h2>
          <div className="space-y-3 text-sm text-gray-600">
            <div>
              <p className="font-medium text-gray-700 mb-1">ITX-청춘 이용 시</p>
              <p>용산역/청량리역 &rarr; 가평역 하차 &rarr; 택시 약 20분</p>
            </div>
            <div>
              <p className="font-medium text-gray-700 mb-1">시외버스 이용 시</p>
              <p>동서울터미널 &rarr; 가평터미널 하차 &rarr; 택시 약 20분</p>
            </div>
            <div className="pt-2 border-t border-gray-100">
              <p className="text-pension-primary font-medium">
                픽업 서비스: 가평역/터미널 픽업 가능 (사전 문의)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
