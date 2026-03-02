/**
 * Barrel export for the storage module.
 * Import everything through this file — not individual modules.
 *
 * Usage:
 *   import { uploadFile, type UploadResult, type MediaDocument } from '@/shared/lib/storage';
 */
export { uploadFile } from './upload';
export { compressImage } from './compress';
export { buildStoragePath } from './naming';
export { assertUploadRateLimit } from './rateLimit';
export type { MediaDocument } from './types';
export type { UploadOptions, UploadResult } from './upload';
