'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Maximize, Download, X } from 'lucide-react'

type Photo = {
  id: string
  url: string
  caption: string | null
  /** Renamed from `participant_name` — display name of whatever this photo links to. */
  subjectName: string
  /** Renamed from `participant_slug` — used with `hrefBase` to build the link. */
  subjectSlug: string
}

function downloadImage(src: string) {
  fetch(src)
    .then((r) => r.blob())
    .then((blob) => {
      const blobUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = src.split('/').pop()?.split('?')[0] || 'image'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(blobUrl)
    })
    .catch(console.error)
}

export default function PhotoGrid({
  photos,
  hrefBase = '/stories',
}: {
  photos: Photo[]
  /** Base path each tile links to, e.g. '/stories'. Tile href is `${hrefBase}/${subjectSlug}`. */
  hrefBase?: string
}) {
  const [fullscreen, setFullscreen] = useState<Photo | null>(null)

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {photos.map((photo) => (
          <PhotoTile key={photo.id} photo={photo} hrefBase={hrefBase} onFullscreen={() => setFullscreen(photo)} />
        ))}
      </div>

      {fullscreen && (
        <FullscreenModal photo={fullscreen} onClose={() => setFullscreen(null)} />
      )}
    </>
  )
}

function PhotoTile({ photo, hrefBase, onFullscreen }: { photo: Photo; hrefBase: string; onFullscreen: () => void }) {
  return (
    <div className="group relative aspect-square overflow-hidden rounded-sm bg-dark/10">
      <Link
        href={`${hrefBase}/${photo.subjectSlug}`}
        className="absolute inset-0 z-0"
        aria-label={photo.caption ?? photo.subjectName}
      >
        <Image
          src={photo.url}
          alt={photo.caption ?? photo.subjectName}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
          className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        />
      </Link>

      <div className="absolute right-2 top-2 z-10 flex items-center gap-0.5 rounded-full bg-white/95 px-2 py-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        <button
          type="button"
          aria-label="Fullscreen preview"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onFullscreen() }}
          className="flex h-6 w-6 items-center justify-center text-dark/70 transition-colors hover:text-primary"
        >
          <Maximize className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          aria-label="Download image"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); downloadImage(photo.url) }}
          className="flex h-6 w-6 items-center justify-center text-dark/70 transition-colors hover:text-primary"
        >
          <Download className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}

function FullscreenModal({ photo, onClose }: { photo: Photo; onClose: () => void }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Image preview"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
      onClick={onClose}
    >
      <div
        className="relative"
        style={{ width: 'min(90vw, 1200px)', height: 'min(90vh, 800px)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={photo.url}
          alt={photo.caption ?? photo.subjectName}
          fill
          sizes="90vw"
          className="object-contain"
        />
        <button
          type="button"
          aria-label="Close preview"
          onClick={onClose}
          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-dark transition-colors hover:bg-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
