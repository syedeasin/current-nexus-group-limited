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

// ---------------------------------------------------------------------------
// Document uploads (Service -> Downloads)
//
// Same rule as images: the multipart MIME type is attacker-controlled, so the
// magic bytes decide. Documents get their own allow-list and a larger ceiling
// than images because datasheets and catalogues are routinely 10MB+.
//
// The OOXML formats (.docx/.xlsx/.pptx) are ZIP containers, so their signature
// is indistinguishable from a plain archive. That is accepted deliberately and
// contained at the serving end instead: the download route always sends
// `Content-Disposition: attachment` and `X-Content-Type-Options: nosniff`, so a
// mislabelled archive is handed to the user as a file and never executed or
// rendered in the site's origin. Bare .zip is not on the allow-list, and
// neither is anything the browser would run.
// ---------------------------------------------------------------------------

export const ALLOWED_DOCUMENT_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
] as const;

export type AllowedDocumentType = (typeof ALLOWED_DOCUMENT_TYPES)[number];

export const MAX_DOCUMENT_BYTES = 25 * 1024 * 1024;

/** Extension used on disk for each accepted type — keep in sync with lib/storage.ts. */
export const DOCUMENT_EXTENSIONS: Record<AllowedDocumentType, string> = {
  "application/pdf": "pdf",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "application/vnd.ms-excel": "xls",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
  "application/vnd.ms-powerpoint": "ppt",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
};

export type DocumentValidationResult =
  | { ok: true; verifiedType: AllowedDocumentType }
  | { ok: false; error: string };

function matchesPdf(b: Uint8Array) {
  // "%PDF-"
  return b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46 && b[4] === 0x2d;
}

/** ZIP local file header — the container OOXML formats are built on. */
function matchesZip(b: Uint8Array) {
  return b[0] === 0x50 && b[1] === 0x4b && (b[2] === 0x03 || b[2] === 0x05 || b[2] === 0x07);
}

/** OLE2 compound file — legacy .doc / .xls / .ppt. */
function matchesOle2(b: Uint8Array) {
  const sig = [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1];
  return sig.every((byte, i) => b[i] === byte);
}

const OOXML_TYPES: AllowedDocumentType[] = [
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
];

const OLE2_TYPES: AllowedDocumentType[] = [
  "application/msword",
  "application/vnd.ms-excel",
  "application/vnd.ms-powerpoint",
];

function isAllowedDocumentType(value: string): value is AllowedDocumentType {
  return (ALLOWED_DOCUMENT_TYPES as readonly string[]).includes(value);
}

export async function validateDocumentUpload(file: File): Promise<DocumentValidationResult> {
  if (file.size === 0) {
    return { ok: false, error: "The file is empty." };
  }

  if (file.size > MAX_DOCUMENT_BYTES) {
    const mb = (file.size / (1024 * 1024)).toFixed(1);
    return { ok: false, error: `File is ${mb}MB, which exceeds the 25MB limit.` };
  }

  const claimed = file.type.toLowerCase();
  const header = new Uint8Array(await file.slice(0, 16).arrayBuffer());

  if (matchesPdf(header)) {
    // A PDF is unambiguous, so it is accepted whatever the browser claimed.
    return { ok: true, verifiedType: "application/pdf" };
  }

  // Past this point the bytes only prove a *container*, so the claimed type has
  // to name which document format lives inside it — and must itself be allowed.
  if (!isAllowedDocumentType(claimed)) {
    return {
      ok: false,
      error: "Unsupported file type. Upload a PDF, Word, Excel or PowerPoint document.",
    };
  }

  if (matchesZip(header) && OOXML_TYPES.includes(claimed)) {
    return { ok: true, verifiedType: claimed };
  }

  if (matchesOle2(header) && OLE2_TYPES.includes(claimed)) {
    return { ok: true, verifiedType: claimed };
  }

  return { ok: false, error: "File contents do not match the claimed file type." };
}
