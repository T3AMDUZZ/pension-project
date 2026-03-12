'use client'

interface PlaceholderImageProps {
  text?: string
  className?: string
  type?: 'room' | 'pension' | 'attraction'
}

export default function PlaceholderImage({ text, className = '', type = 'room' }: PlaceholderImageProps) {
  const bgColors = {
    room: 'from-emerald-400 to-teal-600',
    pension: 'from-blue-400 to-cyan-600',
    attraction: 'from-amber-400 to-orange-600',
  }

  const icons = {
    room: '\u{1F3E1}',
    pension: '\u{1F33F}',
    attraction: '\u{1F3D4}\uFE0F',
  }

  return (
    <div className={`bg-gradient-to-br ${bgColors[type]} flex items-center justify-center ${className}`}>
      <div className="text-center text-white">
        <div className="text-4xl mb-2">{icons[type]}</div>
        {text && <p className="text-sm font-medium opacity-90">{text}</p>}
      </div>
    </div>
  )
}
