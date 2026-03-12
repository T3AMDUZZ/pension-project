import Link from 'next/link'
import { Phone, MapPin } from 'lucide-react'

// 사용자 페이지 푸터
export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 펜션 정보 */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4">숲속의 아침</h3>
            <div className="space-y-2 text-sm">
              <p className="flex items-center gap-2">
                <MapPin size={16} />
                <span>경기도 가평군 상면 축령산로 000-00</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone size={16} />
                <a href="tel:010-0000-0000" className="hover:text-white transition-colors">
                  010-0000-0000
                </a>
              </p>
            </div>
          </div>

          {/* 입금 계좌 */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4">입금 계좌</h3>
            <div className="space-y-1 text-sm">
              <p>국민은행 000-000000-00-000</p>
              <p>예금주: 홍길동</p>
            </div>
          </div>

          {/* 바로가기 */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4">바로가기</h3>
            <div className="space-y-2 text-sm">
              <Link href="/rooms" className="block hover:text-white transition-colors">
                객실안내
              </Link>
              <Link href="/reservation" className="block hover:text-white transition-colors">
                예약하기
              </Link>
              <Link href="/check" className="block hover:text-white transition-colors">
                예약조회
              </Link>
              <Link href="/notice" className="block hover:text-white transition-colors">
                공지사항
              </Link>
            </div>
          </div>
        </div>

        {/* 하단 저작권 */}
        <div className="mt-8 pt-8 border-t border-gray-700 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} 숲속의 아침. All rights reserved.</p>
          <p className="mt-1">사업자등록번호: 000-00-00000 | 대표: 홍길동</p>
        </div>
      </div>
    </footer>
  )
}
