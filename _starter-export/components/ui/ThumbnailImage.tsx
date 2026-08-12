"use client";

import { useState } from "react";
import Image from "next/image";

interface ThumbnailImageProps {
  src: string | null | undefined;
  alt: string;
  name: string;
  className?: string;
}

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export default function ThumbnailImage({
  src,
  alt,
  name,
  className,
}: ThumbnailImageProps) {
  const [errored, setErrored] = useState(false);

  if (!src || errored) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-dark/5">
        <span
          className="select-none font-fjalla text-[40px] uppercase leading-none tracking-[-1px] text-dark/25"
          aria-hidden="true"
        >
          {initials(name)}
        </span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      className={className}
      onError={() => setErrored(true)}
    />
  );
}
