import type { Ref } from "react";
import { preload } from "react-dom";
import { getImageProps, type ImageProps } from "next/image";

/** Full-width photos (hero, banners) get a higher quality so they stay sharp on retina screens. */
const FULL_WIDTH_QUALITY = 85;

type PictureProps = ImageProps & { ref?: Ref<HTMLImageElement> };

/**
 * Drop-in replacement for next/image that renders a <picture>: an AVIF
 * <source> first, with the WebP <img> as the fallback for browsers without
 * AVIF support (images.formats in next.config.ts lists AVIF, then WebP).
 * Every size is still generated and compressed by the Next.js image
 * optimizer, so dashboard uploads get the same treatment as files in /public.
 *
 * Same props as next/image (fill, sizes, preload/priority, quality, ref,
 * onLoad…). SVGs and `unoptimized` images render as a plain <img>, since they
 * have no AVIF form.
 */
export default function Picture({ quality, ref, onLoad, ...props }: PictureProps) {
  const fullWidth = props.fill && (!props.sizes || props.sizes.includes("100vw"));
  const { props: img } = getImageProps({
    ...props,
    quality: quality ?? (fullWidth ? FULL_WIDTH_QUALITY : undefined),
  });

  if ((props.preload || props.priority) && img.srcSet) {
    preload(img.src, { as: "image", imageSrcSet: img.srcSet, imageSizes: img.sizes, fetchPriority: "high" });
  }

  // eslint-disable-next-line @next/next/no-img-element -- optimized props from getImageProps
  const image = <img {...img} ref={ref} onLoad={onLoad} alt={img.alt} data-nimg={props.fill ? "fill" : "1"} />;

  const src = typeof props.src === "string" ? props.src : "";
  if (props.unoptimized || !img.srcSet || /\.svg($|\?)/i.test(src)) return image;

  return (
    // display: contents keeps the <img> as the layout box, exactly like next/image.
    <picture style={{ display: "contents" }}>
      <source type="image/avif" srcSet={img.srcSet} sizes={img.sizes} />
      {image}
    </picture>
  );
}
