'use client'

import { useEffect, useRef, useState } from 'react'

declare global {
  interface Window {
    kakao: any
  }
}

interface KakaoMapProps {
  latitude: number
  longitude: number
  address?: string
  name?: string
}

export default function KakaoMap({ latitude, longitude, address, name }: KakaoMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY
    if (!apiKey) {
      setError(true)
      return
    }

    // 이미 로드되어 있으면 바로 사용
    if (window.kakao && window.kakao.maps) {
      setIsLoaded(true)
      return
    }

    const script = document.createElement('script')
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&autoload=false`
    script.onload = () => {
      window.kakao.maps.load(() => {
        setIsLoaded(true)
      })
    }
    script.onerror = () => setError(true)
    document.head.appendChild(script)
  }, [])

  useEffect(() => {
    if (!isLoaded || !mapRef.current) return

    const position = new window.kakao.maps.LatLng(latitude, longitude)
    const map = new window.kakao.maps.Map(mapRef.current, {
      center: position,
      level: 5,
    })

    const marker = new window.kakao.maps.Marker({
      position,
      map,
    })

    if (name) {
      const infowindow = new window.kakao.maps.InfoWindow({
        content: `<div style="padding:5px;font-size:14px;">${name}</div>`,
      })
      infowindow.open(map, marker)
    }

    // 지도 컨트롤
    map.addControl(new window.kakao.maps.ZoomControl(), window.kakao.maps.ControlPosition.RIGHT)
  }, [isLoaded, latitude, longitude, name])

  if (error) {
    return (
      <div className="w-full h-[400px] bg-gray-100 rounded-lg flex flex-col items-center justify-center text-gray-500">
        <div className="text-4xl mb-3">🗺️</div>
        <p className="font-medium">지도를 표시할 수 없습니다</p>
        {address && <p className="text-sm mt-2">{address}</p>}
        <a
          href={`https://map.kakao.com/link/search/${encodeURIComponent(address || '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 text-sm text-pension-primary hover:underline"
        >
          카카오맵에서 보기 →
        </a>
      </div>
    )
  }

  return (
    <div>
      <div ref={mapRef} className="w-full h-[400px] rounded-lg" />
      {address && (
        <div className="mt-3 flex gap-3">
          <a
            href={`https://map.kakao.com/link/to/${encodeURIComponent(name || '')},,${latitude},${longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-pension-primary hover:underline"
          >
            길찾기
          </a>
          <a
            href={`https://map.kakao.com/link/map/${encodeURIComponent(name || '')},,${latitude},${longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-pension-primary hover:underline"
          >
            큰 지도 보기
          </a>
        </div>
      )}
    </div>
  )
}
