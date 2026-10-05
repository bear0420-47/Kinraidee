import { X } from '@phosphor-icons/react'
import { useState } from 'react'

import { Button } from '@/components/Button'
import { Dialog } from '@/components/Dialog'
import { ImagePreview } from '@/components/ImagePreview'

type ImageLightboxProps = {
  url: string
  // Name of what the image shows, used for the button label, dialog title, and alt text.
  name: string
}

// A thumbnail that opens the full, uncropped image in a modal (a "lightbox").
export function ImageLightbox({ url, name }: ImageLightboxProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        aria-label={`ดูรูปเต็ม ${name}`}
        className="block cursor-zoom-in rounded-sm transition hover:opacity-80 motion-reduce:transition-none"
        onClick={() => setIsOpen(true)}
      >
        <ImagePreview url={url} alt="" size="cell" />
      </button>
      {isOpen ? (
        <Dialog title={name} size="wide" onClose={() => setIsOpen(false)}>
          <ImagePreview url={url} alt={`รูป ${name}`} size="full" />
          <div className="flex justify-end">
            <Button variant="secondary" onClick={() => setIsOpen(false)}>
              <X aria-hidden weight="bold" />
              ปิด
            </Button>
          </div>
        </Dialog>
      ) : null}
    </>
  )
}
