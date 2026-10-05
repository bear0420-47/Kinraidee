import { ImageBroken } from '@phosphor-icons/react'
import { useState } from 'react'

import { resolveImageUrl } from '@/lib/imageUrl'

type ImagePreviewProps = {
  url: string
  // Empty when the image is decorative next to the record's name.
  alt: string
  size: 'thumbnail' | 'cell' | 'preview'
}

const sizeClassNames = {
  thumbnail: 'h-12 w-12',
  // A table's leading image column.
  cell: 'h-20 w-20',
  preview: 'h-40 w-full max-w-xs',
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
      className={`${sizeClassNames[size]} rounded-sm border-2 border-line-soft object-cover`}
    />
  )
}
