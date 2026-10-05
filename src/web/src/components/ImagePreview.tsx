import { ImageBroken } from '@phosphor-icons/react'
import { useState, type ReactNode } from 'react'

import { resolveImageUrl } from '@/lib/imageUrl'

type ImagePreviewProps = {
  url: string
  // Empty when the image is decorative next to the record's name.
  alt: string
  size: 'thumbnail' | 'cell' | 'preview' | 'cover' | 'full'
  // Shown instead of the default message when the image cannot load.
  fallback?: ReactNode
}

const framed = 'rounded-sm border-2 border-line-soft'

const sizeClassNames = {
  thumbnail: `h-12 w-12 object-cover ${framed}`,
  // A table's leading image column.
  cell: `h-20 w-20 object-cover ${framed}`,
  preview: `h-40 w-full max-w-xs object-cover ${framed}`,
  // Fills a frame the caller sizes, such as a recommendation card's photo area.
  cover: 'h-full w-full object-cover',
  // The whole image, uncropped, as large as the viewport allows (see `ImageLightbox`).
  full: `max-h-[70vh] w-full bg-canvas-soft object-contain ${framed}`,
}

// External images are shown as-is (never proxied); a broken URL shows a text fallback.
export function ImagePreview({ url, alt, size, fallback }: ImagePreviewProps) {
  const [brokenUrl, setBrokenUrl] = useState<string | null>(null)
  const src = resolveImageUrl(url)

  if (!src || brokenUrl === url) {
    if (fallback) return fallback
    return (
      <span className="inline-flex items-center gap-2 text-small text-muted">
        <ImageBroken aria-hidden size={24} />
        โหลดรูปไม่ได้
      </span>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setBrokenUrl(url)}
      className={sizeClassNames[size]}
    />
  )
}
