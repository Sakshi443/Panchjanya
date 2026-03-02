import imageCompression from 'browser-image-compression';

export interface CompressionOptions {
    maxSizeMB?: number;
    maxWidthOrHeight?: number;
    quality?: number;
}

/**
 * Compresses an image file and converts it to WebP before upload.
 * Non-image files are returned unchanged.
 *
 * Uses a Web Worker internally so the UI thread never blocks.
 */
export async function compressImage(
    file: File,
    opts: CompressionOptions = {}
): Promise<File> {
    if (!file.type.startsWith('image/')) return file;

    const compressed = await imageCompression(file, {
        maxSizeMB: opts.maxSizeMB ?? 1,
        maxWidthOrHeight: opts.maxWidthOrHeight ?? 1920,
        useWebWorker: true,
        fileType: 'image/webp',
        initialQuality: opts.quality ?? 0.82,
    });

    // imageCompression preserves the original filename — rename to .webp
    return new File([compressed], file.name.replace(/\.[^/.]+$/, '.webp'), {
        type: 'image/webp',
    });
}
