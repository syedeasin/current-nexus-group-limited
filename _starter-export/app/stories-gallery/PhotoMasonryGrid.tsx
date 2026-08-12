'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Maximize, Download, X, ChevronLeft, ChevronRight } from 'lucide-react'

export type MasonryPhoto = {
  id: string
  url: string
  caption: string | null
  /** Renamed from `participant_name` — display name of whatever this photo links to. */
  subjectName: string
  /** Renamed from `participant_slug` — used with `hrefBase` to build the link. */
  subjectSlug: string
}

// Height as % of tile width — deterministic per photo so layout is stable
const RATIOS = [100, 75, 125, 83, 111, 90, 133, 67]

function stableHash(id: string): number {
  let h = 0
  for (let i = 0; i < id.length; i++) {
    h = (Math.imul(31, h) + id.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

async function downloadImage(src: string) {
  try {
    const res = await fetch(src)
    if (!res.ok) throw new Error('fetch failed')
    const blob = await res.blob()
    const blobUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = blobUrl
    a.download = src.split('/').pop()?.split('?')[0] || 'image'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(blobUrl)
  } catch {
    window.open(src, '_blank', 'noopener,noreferrer')
  }
}

export default function PhotoMasonryGrid({
  photos,
  hrefBase = '/stories',
}: {
  photos: MasonryPhoto[]
  /** Base path each tile links to, e.g. '/stories'. Tile href is `${hrefBase}/${subjectSlug}`. */
  hrefBase?: string
}) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  return (
    <>
      <div className="columns-2 gap-4 md:columns-3">
        {photos.map((photo, i) => (
          <PhotoTile
            key={photo.id}
            photo={photo}
            hrefBase={hrefBase}
            onFullscreen={() => setLightboxIndex(i)}
          />
        ))}
      </div>

      {lightboxIndex !== null && (
        <LightboxCarousel
          photos={photos}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  )
}

function PhotoTile({
  photo,
  hrefBase,
  onFullscreen,
}: {
  photo: MasonryPhoto
  hrefBase: string
  onFullscreen: () => void
}) {
  const ratio = RATIOS[stableHash(photo.id) % RATIOS.length]
  const href = `${hrefBase}/${photo.subjectSlug}`

  return (
    <div className="mb-4 break-inside-avoid">
      <div
        className="group relative overflow-hidden rounded-[8px] bg-dark/10"
        style={{ paddingBottom: `${ratio}%` }}
      >
        <Link
          href={href}
          className="absolute inset-0 z-0"
          aria-label={photo.caption ?? photo.subjectName}
        >
          <Image
            src={photo.url}
            alt={photo.caption ?? photo.subjectName}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
            className="object-cover grayscale transition-transform duration-300 group-hover:scale-[1.02]"
          />
        </Link>

        <div className="absolute right-5 top-5 z-10 inline-flex items-center border border-[#E7E4D8] bg-cream opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <button
            type="button"
            aria-label="Preview image"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onFullscreen()
            }}
            className="px-[8px] py-[6px] text-dark/70 transition-colors hover:text-primary"
          >
            <Maximize className="h-5 w-5" />
          </button>
          <div className="h-[12px] w-px shrink-0 bg-dark/10" />
          <button
            type="button"
            aria-label="Download image"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              downloadImage(photo.url)
            }}
            className="px-[8px] py-[6px] text-dark/70 transition-colors hover:text-primary"
          >
            <Download className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

function LightboxCarousel({
  photos,
  initialIndex,
  onClose,
}: {
  photos: MasonryPhoto[]
  initialIndex: number
  onClose: () => void
}) {
  const [index, setIndex] = useState(initialIndex)
  const photo = photos[index]
  const onCloseRef = useRef(onClose)
  useEffect(() => { onCloseRef.current = onClose }, [onClose])

  // Lock body scroll
  useEffect(() => {
    const saved = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = saved }
  }, [])

  // Keyboard navigation
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onCloseRef.current()
      } else if (e.key === 'ArrowLeft') {
        setIndex((i) => (i - 1 + photos.length) % photos.length)
      } else if (e.key === 'ArrowRight') {
        setIndex((i) => (i + 1) % photos.length)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [photos.length])

  const prev = () => setIndex((i) => (i - 1 + photos.length) % photos.length)
  const next = () => setIndex((i) => (i + 1) % photos.length)

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Image lightbox"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
      onClick={onClose}
    >
      {/* X — top-left */}
      <button
        type="button"
        aria-label="Close lightbox"
        onClick={(e) => { e.stopPropagation(); onClose() }}
        className="absolute left-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25"
      >
        <X className="h-5 w-5" />
      </button>

      {/* Counter — top-right */}
      <div className="absolute right-4 top-4 z-10 select-none font-mono text-[13px] tracking-[-0.3px] text-white/60">
        {index + 1} / {photos.length}
      </div>

      {/* Image — plain <img> avoids next/image fill-sizing pitfalls in lightbox */}
      <figure
        className="flex flex-col items-center gap-3"
        onClick={(e) => e.stopPropagation()}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo.url}
          alt={photo.caption ? "" : photo.subjectName}
          className="max-h-[85vh] max-w-[90vw] w-auto h-auto object-contain select-none grayscale"
        />
        {photo.caption && (
          <figcaption className="max-w-[90vw] text-center font-mono text-[12px] tracking-[-0.3px] text-white/70">
            {photo.caption}
          </figcaption>
        )}
      </figure>

      {/* Prev arrow */}
      {photos.length > 1 && (
        <button
          type="button"
          aria-label="Previous image"
          onClick={(e) => { e.stopPropagation(); prev() }}
          className="absolute left-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}

      {/* Next arrow */}
      {photos.length > 1 && (
        <button
          type="button"
          aria-label="Next image"
          onClick={(e) => { e.stopPropagation(); next() }}
          className="absolute right-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      )}
    </div>
  )
}
