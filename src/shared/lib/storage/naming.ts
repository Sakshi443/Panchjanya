import { v4 as uuidv4 } from 'uuid';

/**
 * Builds a collision-proof, CDN-friendly storage path.
 * Pattern: {folder}/{timestamp}-{uuid}-{sanitized-name}
 *
 * Never use original filenames directly — they may contain special chars,
 * spaces, or collide across concurrent uploads.
 */
export function buildStoragePath(folder: string, file: File): string {
    const ext = getExtension(file);
    const base = file.name
        .toLowerCase()
        .replace(/\.[^/.]+$/, '')          // strip extension
        .replace(/[^a-z0-9]/g, '-')        // replace non-alphanum with dash
        .replace(/-+/g, '-')              // collapse consecutive dashes
        .slice(0, 40);                     // cap length for URL safety

    return `${folder}/${Date.now()}-${uuidv4()}-${base}.${ext}`;
}

/**
 * Derives the correct output extension given compression target.
 * Images become .webp after compression; other files keep their original ext.
 */
function getExtension(file: File): string {
    if (file.type.startsWith('image/')) return 'webp';
    const match = file.name.match(/\.([^.]+)$/);
    return match ? match[1].toLowerCase() : 'bin';
}
