import { ImageBroken } from '@phosphor-icons/react'
import { useState } from 'react'

import { resolveImageUrl } from '@/lib/imageUrl'

type ImagePreviewProps = {
  url: string
  // Empty when the image is decorative next to the record's name.
  alt: string
  size: 'thumbnail' | 'cell' | 'preview' | 'card' | 'full'
}

const sizeClassNames = {
  thumbnail: 'h-12 w-12 object-cover',
  // A table's leading image column.
  cell: 'h-20 w-20 object-cover',
  preview: 'h-40 w-full max-w-xs object-cover',
  // A recommendation card's photo, full card width.
  card: 'aspect-[4/3] w-full object-cover',
  // The whole image, uncropped, as large as the viewport allows (see `ImageLightbox`).
  full: 'max-h-[70vh] w-full bg-canvas-soft object-contain',
}

// External images are shown as-is (never proxied); a broken URL shows a text fallback.
export function ImagePreview({ url, alt, size }: ImagePreviewProps) {
  const [brokenUrl, setBrokenUrl] = useState<string | null>(null)
  const src = resolveImageUrl(url)

  if (!src || brokenUrl === url) {
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
      className={`${sizeClassNames[size]} rounded-sm border-2 border-line-soft`}
    />
  )
}
