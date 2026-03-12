'use client'

import { useRef } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination, Navigation } from 'swiper/modules'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'
import PlaceholderImage from '@/components/ui/PlaceholderImage'

interface ImageSliderProps {
  images: { url: string; alt: string }[]
  height?: string
  autoplay?: boolean
  overlay?: React.ReactNode
}

export default function ImageSlider({
  images,
  height = 'h-[400px] md:h-[500px]',
  autoplay = true,
  overlay,
}: ImageSliderProps) {
  const prevRef = useRef<HTMLButtonElement>(null)
  const nextRef = useRef<HTMLButtonElement>(null)

  if (images.length === 0) {
    return (
      <PlaceholderImage
        type="pension"
        text="이미지가 없습니다"
        className={height}
      />
    )
  }

  return (
    <div className={`relative ${height} group`}>
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        spaceBetween={0}
        slidesPerView={1}
        loop={images.length > 1}
        autoplay={autoplay ? { delay: 5000, disableOnInteraction: false } : false}
        pagination={{ clickable: true }}
        navigation={true}
        onBeforeInit={(swiper) => {
          if (swiper.params.navigation && typeof swiper.params.navigation !== 'boolean') {
            swiper.params.navigation.prevEl = prevRef.current
            swiper.params.navigation.nextEl = nextRef.current
          }
        }}
        onInit={(swiper) => {
          if (swiper.params.navigation && typeof swiper.params.navigation !== 'boolean') {
            swiper.params.navigation.prevEl = prevRef.current
            swiper.params.navigation.nextEl = nextRef.current
            swiper.navigation.init()
            swiper.navigation.update()
          }
        }}
        className="w-full h-full"
      >
        {images.map((image, index) => (
          <SwiperSlide key={index}>
            {image.url ? (
              <div
                className="w-full h-full bg-cover bg-center"
                style={{ backgroundImage: `url(${image.url})` }}
              />
            ) : (
              <PlaceholderImage
                type="pension"
                text={image.alt || `슬라이드 ${index + 1}`}
                className="w-full h-full"
              />
            )}
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Navigation arrows */}
      {images.length > 1 && (
        <>
          <button
            ref={prevRef}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="이전"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            ref={nextRef}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="다음"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {/* Overlay content */}
      {overlay && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/30">
          {overlay}
        </div>
      )}
    </div>
  )
}
