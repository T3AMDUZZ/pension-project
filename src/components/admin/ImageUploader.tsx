'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, X, Star, ArrowUp, ArrowDown } from 'lucide-react'
import type { RoomImage } from '@/lib/types'

interface ImageUploaderProps {
  images: RoomImage[]
  onChange: (images: RoomImage[]) => void
}

export default function ImageUploader({ images, onChange }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const uploadFile = useCallback(async (file: File): Promise<string | null> => {
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const json = await res.json()
      if (json.success) return json.data.url
      return null
    } catch {
      return null
    }
  }, [])

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    setUploading(true)
    const newImages: RoomImage[] = [...images]
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue
      const url = await uploadFile(file)
      if (url) {
        newImages.push({
          url,
          alt: file.name,
          is_primary: newImages.length === 0,
          sort_order: newImages.length,
        })
      }
    }
    onChange(newImages)
    setUploading(false)
  }, [images, onChange, uploadFile])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files)
  }, [handleFiles])

  const removeImage = (idx: number) => {
    const updated = images.filter((_, i) => i !== idx)
    if (updated.length > 0 && !updated.some((img) => img.is_primary)) {
      updated[0].is_primary = true
    }
    onChange(updated)
  }

  const setPrimary = (idx: number) => {
    const updated = images.map((img, i) => ({ ...img, is_primary: i === idx }))
    onChange(updated)
  }

  const moveImage = (idx: number, dir: -1 | 1) => {
    const target = idx + dir
    if (target < 0 || target >= images.length) return
    const updated = [...images]
    ;[updated[idx], updated[target]] = [updated[target], updated[idx]]
    updated.forEach((img, i) => (img.sort_order = i))
    onChange(updated)
  }

  return (
    <div>
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragOver ? 'border-pension-primary bg-pension-light/20' : 'border-gray-300'
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <Upload className="mx-auto mb-2 text-gray-400" size={32} />
        <p className="text-sm text-gray-500 mb-2">이미지를 드래그하거나 클릭하여 업로드</p>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="text-sm text-pension-primary hover:underline"
          disabled={uploading}
        >
          {uploading ? '업로드 중...' : '파일 선택'}
        </button>
        <input
          ref={fileRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-4">
          {images.map((img, idx) => (
            <div
              key={idx}
              className={`relative group rounded-lg overflow-hidden border-2 ${
                img.is_primary ? 'border-pension-primary' : 'border-gray-200'
              }`}
            >
              <div className="aspect-[4/3] bg-gray-100">
                <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
              </div>
              {img.is_primary && (
                <span className="absolute top-1 left-1 bg-pension-primary text-white text-[10px] px-1.5 py-0.5 rounded">
                  대표
                </span>
              )}
              <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {!img.is_primary && (
                  <button
                    type="button"
                    onClick={() => setPrimary(idx)}
                    className="p-1 bg-white rounded shadow text-yellow-500 hover:text-yellow-600"
                    title="대표 이미지로 설정"
                  >
                    <Star size={14} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => moveImage(idx, -1)}
                  disabled={idx === 0}
                  className="p-1 bg-white rounded shadow text-gray-500 hover:text-gray-700 disabled:opacity-30"
                >
                  <ArrowUp size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => moveImage(idx, 1)}
                  disabled={idx === images.length - 1}
                  className="p-1 bg-white rounded shadow text-gray-500 hover:text-gray-700 disabled:opacity-30"
                >
                  <ArrowDown size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="p-1 bg-white rounded shadow text-red-500 hover:text-red-700"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
