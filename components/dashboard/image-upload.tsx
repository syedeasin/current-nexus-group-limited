"use client";

import { useId, useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { ImagePlus } from "lucide-react";
import { uploadMedia } from "@/app/dashboard/media/actions";
import FieldLabel from "@/components/dashboard/form/field-label";
import TextInput from "@/components/dashboard/form/text-input";
import FieldHint from "@/components/dashboard/form/field-hint";
import FieldError from "@/components/dashboard/form/field-error";

type ImageUploadProps = {
  name: string;
  // Omit to skip the alt field entirely (e.g. an OG image, which has no alt text).
  altName?: string;
  defaultUrl?: string | null;
  defaultAlt?: string | null;
  label?: string;
  altError?: string;
  onUploadingChange?: (uploading: boolean) => void;
  onUrlChange?: (url: string) => void;
};

type Dimensions = { width: number; height: number } | null;

const ACCEPT = "image/jpeg,image/png,image/webp,image/avif,image/gif";

async function readDimensions(file: File): Promise<Dimensions> {
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(file);
      const dims = { width: bitmap.width, height: bitmap.height };
      bitmap.close();
      return dims;
    } catch {
      // fall through to the <img> based approach below
    }
  }

  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(objectUrl);
    };
    img.onerror = () => {
      resolve(null);
      URL.revokeObjectURL(objectUrl);
    };
    img.src = objectUrl;
  });
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ImageUpload({
  name,
  altName,
  defaultUrl,
  defaultAlt,
  label = "Image",
  altError,
  onUploadingChange,
  onUrlChange,
}: ImageUploadProps) {
  const inputId = useId();
  const altId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [url, setUrl] = useState(defaultUrl ?? "");
  const [alt, setAlt] = useState(defaultAlt ?? "");
  const [size, setSize] = useState<number | null>(null);
  const [dimensions, setDimensions] = useState<Dimensions>(null);

  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const previewSrc = localPreview ?? (url || null);
  const errorId = `${inputId}-error`;

  function setUploading(value: boolean) {
    setIsUploading(value);
    onUploadingChange?.(value);
  }

  async function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;

    setError(null);
    const objectUrl = URL.createObjectURL(file);
    setLocalPreview(objectUrl);
    setUploading(true);

    const dims = await readDimensions(file);

    const formData = new FormData();
    formData.set("file", file);
    if (dims) {
      formData.set("width", String(dims.width));
      formData.set("height", String(dims.height));
    }

    let result;
    try {
      result = await uploadMedia(formData);
    } catch (error) {
      console.error("[image-upload] upload failed", error);
      URL.revokeObjectURL(objectUrl);
      setLocalPreview(null);
      setUploading(false);
      setError("Something went wrong while uploading. Please try again.");
      return;
    }

    URL.revokeObjectURL(objectUrl);
    setLocalPreview(null);
    setUploading(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setUrl(result.media.url);
    setSize(file.size);
    setDimensions(dims);
    onUrlChange?.(result.media.url);
  }

  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    handleFiles(e.target.files);
    e.target.value = "";
  }

  function handleDrop(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }

  function handleRemove() {
    setUrl("");
    setAlt("");
    setSize(null);
    setDimensions(null);
    setError(null);
    onUrlChange?.("");
  }

  function handleReplaceClick() {
    fileInputRef.current?.click();
  }

  return (
    <div>
      {!previewSrc ? (
        <label
          htmlFor={inputId}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`flex min-h-160 cursor-pointer flex-col items-center justify-center gap-8 rounded-16 border-2 border-dashed bg-surface-2 px-24 py-32 text-center transition-colors duration-200 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary ${
            isDragging ? "border-primary" : "border-neutral-10"
          }`}
        >
          <ImagePlus size={28} strokeWidth={1.5} className="text-neutral-6" aria-hidden="true" />
          <span className="text-p3 text-neutral-4">
            <span className="font-medium text-primary">Click to upload</span> or drag and drop
          </span>
          <span className="text-p4 text-neutral-5">
            {label} — JPEG, PNG, WebP, AVIF or GIF, up to 8MB
          </span>
          <input
            ref={fileInputRef}
            id={inputId}
            type="file"
            accept={ACCEPT}
            onChange={handleInputChange}
            className="sr-only"
            aria-describedby={error ? errorId : undefined}
          />
        </label>
      ) : (
        <div className="rounded-16 border border-neutral-10 bg-white p-16">
          <div className="flex gap-16">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewSrc}
              alt=""
              width={dimensions?.width}
              height={dimensions?.height}
              loading="lazy"
              className="h-96 w-96 shrink-0 rounded-8 border border-neutral-10 object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="text-p4 font-medium text-neutral-1">
                {isUploading ? "Uploading…" : label}
              </p>
              <p className="mt-2 text-p4 text-neutral-5">
                {size != null && formatBytes(size)}
                {dimensions && ` · ${dimensions.width}×${dimensions.height}px`}
              </p>
              <div className="mt-12 flex gap-8">
                <button
                  type="button"
                  onClick={handleReplaceClick}
                  disabled={isUploading}
                  className="rounded-full border border-neutral-10 px-16 py-8 text-p4 font-semibold uppercase tracking-[1px] text-neutral-4 transition-colors duration-200 hover:border-primary hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Replace
                </button>
                <button
                  type="button"
                  onClick={handleRemove}
                  disabled={isUploading}
                  className="rounded-full border border-neutral-10 px-16 py-8 text-p4 font-semibold uppercase tracking-[1px] text-error transition-colors duration-200 hover:bg-error/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-error disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPT}
            onChange={handleInputChange}
            className="sr-only"
            tabIndex={-1}
            aria-hidden="true"
          />
        </div>
      )}

      <input type="hidden" name={name} value={url} />

      {error && (
        <p id={errorId} role="alert" className="mt-8 text-p4 text-error">
          {error}
        </p>
      )}

      {altName && (
        <div className="mt-16">
          <FieldLabel htmlFor={altId} required={Boolean(previewSrc)}>
            Alt text
          </FieldLabel>
          <TextInput
            id={altId}
            name={altName}
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            aria-invalid={Boolean(altError)}
            aria-describedby={`${altId}-hint${altError ? ` ${altId}-error` : ""}`}
          />
          <FieldHint id={`${altId}-hint`}>
            Describe the image&apos;s content and purpose — don&apos;t start with &quot;image
            of&quot;. Leave empty only for purely decorative images; a featured image is never
            decorative.
          </FieldHint>
          <FieldError id={`${altId}-error`}>{altError}</FieldError>
        </div>
      )}
    </div>
  );
}
