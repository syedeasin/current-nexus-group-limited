/**
 * Upload size ceilings, shared by the server-side validators
 * (lib/validation/upload.ts) and the dashboard's upload widgets, which check
 * before sending so an oversized file fails instantly with a clear message
 * instead of being rejected mid-request.
 *
 * Every layer in front of the app must allow at least MAX_DOCUMENT_BYTES plus
 * multipart overhead: `experimental.serverActions.bodySizeLimit` in
 * next.config.ts, and on the production server nginx's
 * `client_max_body_size` (its 1MB default made every image over 1MB hang).
 */
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

export const MAX_DOCUMENT_BYTES = 25 * 1024 * 1024;

export function formatMegabytes(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}
