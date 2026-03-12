'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, Clock, Ban, Flame, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AccordionItemProps {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
  defaultOpen?: boolean
}

function AccordionItem({ title, icon, children, defaultOpen = false }: AccordionItemProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-5 py-4 bg-white hover:bg-gray-50 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-pension-primary">{icon}</span>
          <span className="font-bold text-gray-900">{title}</span>
        </div>
        <ChevronDown
          size={20}
          className={cn('text-gray-400 transition-transform', isOpen && 'rotate-180')}
        />
      </button>
      {isOpen && (
        <div className="px-5 py-4 bg-white border-t border-gray-100">
          {children}
        </div>
      )}
    </div>
  )
}

export default function GuidePage() {
  const [checkInTime, setCheckInTime] = useState('15:00')
  const [checkOutTime, setCheckOutTime] = useState('11:00')
  const [refundPolicy, setRefundPolicy] = useState('')

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          const data = json.data
          if (data.reservation_policy) {
            const policy = data.reservation_policy
            if (policy.check_in_time) setCheckInTime(policy.check_in_time)
            if (policy.check_out_time) setCheckOutTime(policy.check_out_time)
            if (policy.refund_policy) setRefundPolicy(policy.refund_policy)
          }
        }
      })
      .catch(() => {})
  }, [])

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">이용안내</h1>
      <p className="text-gray-500 mb-8">펜션 이용에 필요한 안내사항을 확인해주세요</p>

      <div className="space-y-4">
        {/* Check-in/out */}
        <AccordionItem
          title="입퇴실 안내"
          icon={<Clock size={20} />}
          defaultOpen={true}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-pension-light/30 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-500 mb-1">체크인</p>
                <p className="text-2xl font-bold text-pension-primary">{checkInTime}</p>
              </div>
              <div className="bg-pension-light/30 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-500 mb-1">체크아웃</p>
                <p className="text-2xl font-bold text-pension-primary">{checkOutTime}</p>
              </div>
            </div>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-pension-primary mt-1">&#8226;</span>
                체크인 시간 이전 입실은 불가합니다.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-pension-primary mt-1">&#8226;</span>
                체크아웃 시간 초과 시 추가 요금이 발생할 수 있습니다.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-pension-primary mt-1">&#8226;</span>
                늦은 체크인의 경우 사전에 연락 부탁드립니다.
              </li>
            </ul>
          </div>
        </AccordionItem>

        {/* Refund Policy */}
        <AccordionItem title="환불 규정" icon={<Ban size={20} />}>
          <div className="space-y-3">
            {refundPolicy ? (
              <p className="text-sm text-gray-600 whitespace-pre-line">{refundPolicy}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-2 text-left text-gray-700 font-medium border border-gray-200">취소 시점</th>
                      <th className="px-4 py-2 text-center text-gray-700 font-medium border border-gray-200">환불율</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-4 py-2 border border-gray-200 text-gray-600">7일 전까지</td>
                      <td className="px-4 py-2 text-center border border-gray-200 text-green-600 font-medium">100% 환불</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 border border-gray-200 text-gray-600">5~6일 전</td>
                      <td className="px-4 py-2 text-center border border-gray-200 text-yellow-600 font-medium">70% 환불</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 border border-gray-200 text-gray-600">3~4일 전</td>
                      <td className="px-4 py-2 text-center border border-gray-200 text-orange-600 font-medium">50% 환불</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 border border-gray-200 text-gray-600">1~2일 전</td>
                      <td className="px-4 py-2 text-center border border-gray-200 text-red-600 font-medium">30% 환불</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 border border-gray-200 text-gray-600">당일 / 노쇼</td>
                      <td className="px-4 py-2 text-center border border-gray-200 text-red-600 font-medium">환불 불가</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
            <p className="text-xs text-gray-400 mt-2">
              * 성수기(7~8월, 연말연시, 명절) 환불 규정이 다를 수 있습니다.
            </p>
          </div>
        </AccordionItem>

        {/* BBQ */}
        <AccordionItem title="바베큐 이용 안내" icon={<Flame size={20} />}>
          <div className="space-y-3 text-sm text-gray-600">
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-pension-primary mt-1">&#8226;</span>
                바베큐 그릴과 테이블이 각 객실 앞에 비치되어 있습니다.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-pension-primary mt-1">&#8226;</span>
                숯과 그릴 망은 별도 구매가 필요합니다 (관리동에서 판매).
              </li>
              <li className="flex items-start gap-2">
                <span className="text-pension-primary mt-1">&#8226;</span>
                식재료는 가져오시거나, 인근 마트를 이용해주세요.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-pension-primary mt-1">&#8226;</span>
                바베큐 이용 시간: 체크인 후 ~ 밤 10시까지
              </li>
              <li className="flex items-start gap-2">
                <span className="text-pension-primary mt-1">&#8226;</span>
                이용 후 정리정돈을 부탁드립니다.
              </li>
            </ul>
          </div>
        </AccordionItem>

        {/* Other Info */}
        <AccordionItem title="기타 안내사항" icon={<Info size={20} />}>
          <div className="space-y-3 text-sm text-gray-600">
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-pension-primary mt-1">&#8226;</span>
                밤 10시 이후에는 다른 투숙객을 위해 소음을 자제해주세요.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-pension-primary mt-1">&#8226;</span>
                쓰레기는 분리수거하여 지정 장소에 배출해주세요.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-pension-primary mt-1">&#8226;</span>
                반려동물 동반은 사전 문의 후 일부 객실에서만 가능합니다.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-pension-primary mt-1">&#8226;</span>
                객실 내 흡연은 금지되어 있습니다. 지정된 흡연 구역을 이용해주세요.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-pension-primary mt-1">&#8226;</span>
                불꽃놀이, 폭죽 등 화기 사용은 금지됩니다.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-pension-primary mt-1">&#8226;</span>
                객실 비품 파손 시 배상 책임이 있을 수 있습니다.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-pension-primary mt-1">&#8226;</span>
                주차는 객실당 1대 무료이며, 추가 차량은 사전 문의 바랍니다.
              </li>
            </ul>
          </div>
        </AccordionItem>
      </div>
    </div>
  )
}
