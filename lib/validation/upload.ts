export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
] as const;

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

export type UploadValidationResult =
  | { ok: true; verifiedType: (typeof ALLOWED_IMAGE_TYPES)[number] }
  | { ok: false; error: string };

function matchesJpeg(b: Uint8Array) {
  return b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;
}

function matchesPng(b: Uint8Array) {
  const sig = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  return sig.every((byte, i) => b[i] === byte);
}

function matchesGif(b: Uint8Array) {
  return b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x38;
}

function matchesWebp(b: Uint8Array) {
  const riff = b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46;
  const webp = b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50;
  return riff && webp;
}

function matchesAvif(b: Uint8Array) {
  const ftyp = b[4] === 0x66 && b[5] === 0x74 && b[6] === 0x79 && b[7] === 0x70;
  if (!ftyp) return false;
  const brand = String.fromCharCode(b[8], b[9], b[10], b[11]);
  return brand === "avif" || brand === "avis";
}

// Browsers disagree on image MIME strings (image/jpg, image/pjpeg, image/x-png)
// and sometimes send an empty type. Map only well-formed variants to a canonical
// supported format; anything else is treated as "unknown, trust the bytes".
const MIME_ALIASES: Record<string, (typeof ALLOWED_IMAGE_TYPES)[number]> = {
  "image/jpeg": "image/jpeg",
  "image/jpg": "image/jpeg",
  "image/pjpeg": "image/jpeg",
  "image/png": "image/png",
  "image/x-png": "image/png",
  "image/webp": "image/webp",
  "image/avif": "image/avif",
  "image/gif": "image/gif",
};

function detectSignature(bytes: Uint8Array): (typeof ALLOWED_IMAGE_TYPES)[number] | null {
  if (matchesJpeg(bytes)) return "image/jpeg";
  if (matchesPng(bytes)) return "image/png";
  if (matchesGif(bytes)) return "image/gif";
  if (matchesWebp(bytes)) return "image/webp";
  if (matchesAvif(bytes)) return "image/avif";
  return null;
}

// Verifies magic bytes rather than trusting file.type — the MIME type on a
// multipart upload is attacker-controlled. Without this, "image upload"
// is "arbitrary file upload".
export async function validateImageUpload(file: File): Promise<UploadValidationResult> {
  if (file.type === "image/svg+xml") {
    return {
      ok: false,
      error: "SVG is not supported — it is executable markup and would need sanitisation first.",
    };
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    const mb = (file.size / (1024 * 1024)).toFixed(1);
    return { ok: false, error: `File is ${mb}MB, which exceeds the 8MB limit.` };
  }

  const header = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  const verifiedType = detectSignature(header);

  if (!verifiedType) {
    return { ok: false, error: "File contents do not match a supported image format." };
  }

  // Only reject on a *positive* contradiction: browser sent a well-formed image
  // type that maps to a different supported format than the bytes prove. Empty
  // or unrecognised file.type falls through — the magic bytes are authoritative.
  const claimedType = MIME_ALIASES[file.type.toLowerCase()];
  if (claimedType && claimedType !== verifiedType) {
    return { ok: false, error: "File contents do not match the claimed file type." };
  }

  return { ok: true, verifiedType };
}
