'use client'

import { useState, useRef } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Thumbs } from 'swiper/modules'
import type { Swiper as SwiperType } from 'swiper'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/thumbs'
import PlaceholderImage from '@/components/ui/PlaceholderImage'

interface ImageGalleryProps {
  images: { url: string; alt: string }[]
}

export default function ImageGallery({ images }: ImageGalleryProps) {
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null)
  const prevRef = useRef<HTMLButtonElement>(null)
  const nextRef = useRef<HTMLButtonElement>(null)

  if (images.length === 0) {
    return (
      <PlaceholderImage
        type="room"
        text="이미지가 없습니다"
        className="h-64 md:h-96 rounded-xl"
      />
    )
  }

  return (
    <div>
      {/* Main image */}
      <div className="relative group rounded-xl overflow-hidden">
        <Swiper
          modules={[Navigation, Thumbs]}
          spaceBetween={0}
          slidesPerView={1}
          thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
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
          className="h-64 md:h-96"
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
                  type="room"
                  text={image.alt || `이미지 ${index + 1}`}
                  className="w-full h-full"
                />
              )}
            </SwiperSlide>
          ))}
        </Swiper>

        {images.length > 1 && (
          <>
            <button
              ref={prevRef}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              ref={nextRef}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="mt-3">
          <Swiper
            modules={[Thumbs]}
            onSwiper={setThumbsSwiper}
            spaceBetween={8}
            slidesPerView={Math.min(images.length, 5)}
            watchSlidesProgress
            className="!px-0"
          >
            {images.map((image, index) => (
              <SwiperSlide key={index} className="cursor-pointer">
                <div className="h-16 md:h-20 rounded-lg overflow-hidden border-2 border-transparent [.swiper-slide-thumb-active_&]:border-pension-primary">
                  {image.url ? (
                    <div
                      className="w-full h-full bg-cover bg-center"
                      style={{ backgroundImage: `url(${image.url})` }}
                    />
                  ) : (
                    <PlaceholderImage
                      type="room"
                      text={`${index + 1}`}
                      className="w-full h-full"
                    />
                  )}
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}
    </div>
  )
}
