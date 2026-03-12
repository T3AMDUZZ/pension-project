import Link from 'next/link'
import { Users, Maximize } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import type { Room } from '@/lib/types'
import PlaceholderImage from '@/components/ui/PlaceholderImage'

interface RoomCardProps {
  room: Room
  showPrice?: number | null
}

export default function RoomCard({ room, showPrice }: RoomCardProps) {
  const primaryImage = room.images?.find((img) => img.is_primary) || room.images?.[0]

  return (
    <Link href={`/rooms/${room.id}`} className="block group">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-lg transition-shadow duration-300">
        {/* Image */}
        <div className="relative h-48 md:h-56 overflow-hidden">
          {primaryImage?.url ? (
            <div
              className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
              style={{ backgroundImage: `url(${primaryImage.url})` }}
            />
          ) : (
            <PlaceholderImage
              type="room"
              text={room.name}
              className="w-full h-full group-hover:scale-105 transition-transform duration-500"
            />
          )}
          {/* Type badge */}
          {room.type && (
            <span className="absolute top-3 left-3 bg-pension-primary text-white text-xs px-2.5 py-1 rounded-full font-medium">
              {room.type}
            </span>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-pension-primary transition-colors">
            {room.name}
          </h3>
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
            <span className="flex items-center gap-1">
              <Users size={14} />
              기준 {room.base_capacity}명 / 최대 {room.max_capacity}명
            </span>
            {room.size && (
              <span className="flex items-center gap-1">
                <Maximize size={14} />
                {room.size}
              </span>
            )}
          </div>
          {showPrice != null && showPrice > 0 && (
            <p className="text-pension-primary font-bold text-lg">
              {formatPrice(showPrice)}
              <span className="text-xs text-gray-400 font-normal"> /1박</span>
            </p>
          )}
          <span className="inline-block mt-2 text-sm text-pension-primary font-medium group-hover:underline">
            자세히 보기 &rarr;
          </span>
        </div>
      </div>
    </Link>
  )
}
