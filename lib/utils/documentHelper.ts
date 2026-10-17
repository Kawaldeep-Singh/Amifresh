/**
 * Helper utilities for KYC and User Document handling
 */

export function isImageData(val?: string | null): boolean {
  if (!val) return false;
  const trimmed = val.trim();
  if (
    trimmed.startsWith('data:image') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('/') ||
    trimmed.startsWith('blob:')
  ) {
    return true;
  }
  // If it's a long base64 string (> 100 characters)
  if (trimmed.length > 100) {
    return true;
  }
  return false;
}

export function getSafeImageSrc(val?: string | null): string {
  if (!val) return '';
  const trimmed = val.trim();
  if (
    trimmed.startsWith('data:image') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('/') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }
  if (trimmed.length > 100) {
    // If raw base64 without prefix, default to jpeg
    return `data:image/jpeg;base64,${trimmed}`;
  }
  return trimmed;
}

/**
 * Downloads a data URI or URL as a file with a given filename
 */
export function downloadDocumentImage(src: string, filename: string): void {
  try {
    if (src.startsWith('data:')) {
      const parts = src.split(';base64,');
      const contentType = parts[0].split(':')[1] || 'image/jpeg';
      const raw = window.atob(parts[1]);
      const rawLength = raw.length;
      const uInt8Array = new Uint8Array(rawLength);

      for (let i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
      }

      const blob = new Blob([uInt8Array], { type: contentType });
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    } else {
      const link = document.createElement('a');
      link.href = src;
      link.download = filename;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  } catch (err) {
    console.error('Failed to download document:', err);
    // Fallback: direct anchor trigger
    const link = document.createElement('a');
    link.href = src;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

/**
 * Opens image in a new tab safely
 */
export function openImageInNewTab(src: string): void {
  try {
    if (src.startsWith('data:')) {
      const parts = src.split(';base64,');
      const contentType = parts[0].split(':')[1] || 'image/jpeg';
      const raw = window.atob(parts[1]);
      const uInt8Array = new Uint8Array(raw.length);
      for (let i = 0; i < raw.length; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
      }
      const blob = new Blob([uInt8Array], { type: contentType });
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
    } else {
      window.open(src, '_blank');
    }
  } catch (err) {
    console.error('Failed to open image in new tab:', err);
    window.open(src, '_blank');
  }
}
