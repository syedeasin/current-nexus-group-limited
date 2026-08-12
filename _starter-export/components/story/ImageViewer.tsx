"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Plus, Minus, Maximize, Download } from "lucide-react";

interface ImageViewerProps {
  src: string;
  alt: string;
}

export default function ImageViewer({ src, alt }: ImageViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const zoomIn = () => setScale((s) => Math.min(+(s + 0.25).toFixed(2), 3));
  const zoomOut = () => setScale((s) => Math.max(+(s - 0.25).toFixed(2), 1));

  const toggleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  const downloadImage = async () => {
    try {
      const response = await fetch(src);
      if (!response.ok) throw new Error("Fetch failed");
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = src.split("/").pop()?.split("?")[0] || "image";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Download failed:", err);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative aspect-[16/9] w-full overflow-hidden rounded-[12px]"
    >
      <div
        className="relative h-full w-full transition-transform duration-200 ease-out"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "center center",
        }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          priority
          sizes="(max-width: 1280px) 100vw, 1280px"
          className="object-cover grayscale"
        />
      </div>

      {/* Bottom-left: download + zoom */}
      <div className="absolute bottom-[20px] left-[20px] flex flex-col gap-[8px]">
        <button
          onClick={downloadImage}
          aria-label="Download image"
          type="button"
          className="flex h-[40px] w-[40px] items-center justify-center rounded-[4px] border border-gray-200 bg-gray-50 p-[8px] text-gray-800 hover:opacity-80"
        >
          <Download className="h-6 w-6" strokeWidth={2} />
        </button>
        <div className="flex flex-col items-center rounded-[4px] border border-gray-200 bg-gray-50">
          <button
            onClick={zoomIn}
            aria-label="Zoom in"
            type="button"
            disabled={scale >= 3}
            className="flex h-[40px] w-[40px] items-center justify-center text-gray-800 hover:opacity-60 disabled:opacity-30"
          >
            <Plus className="h-6 w-6" strokeWidth={2} />
          </button>
          <div className="h-px w-[20px] shrink-0 bg-gray-200" />
          <button
            onClick={zoomOut}
            aria-label="Zoom out"
            type="button"
            disabled={scale <= 1}
            className="flex h-[40px] w-[40px] items-center justify-center text-gray-800 hover:opacity-60 disabled:opacity-30"
          >
            <Minus className="h-6 w-6" strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Bottom-right: fullscreen */}
      <button
        onClick={toggleFullscreen}
        aria-label="Fullscreen"
        type="button"
        className="absolute bottom-[20px] right-[20px] flex h-[40px] w-[40px] items-center justify-center rounded-[4px] border border-gray-200 bg-gray-50 p-[8px] text-gray-800 hover:opacity-80"
      >
        <Maximize className="h-6 w-6" strokeWidth={2} />
      </button>
    </div>
  );
}
