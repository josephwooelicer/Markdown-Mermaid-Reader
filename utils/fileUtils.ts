
export const isIgnoredFile = (path: string): boolean => {
  // Ignore macOS-specific metadata folders.
  if (path.startsWith('__MACOSX/')) {
    return true;
  }
  // Ignore .DS_Store files anywhere in the zip.
  if (path.split('/').pop() === '.DS_Store') {
    return true;
  }
  return false;
};

export const pathIsMarkdown = (path: string): boolean => {
  return path.toLowerCase().endsWith('.md') || path.toLowerCase().endsWith('.markdown');
};

export const pathIsImage = (path: string): boolean => {
  return /\.(png|jpe?g|gif|svg|webp)$/i.test(path);
};

export const getMimeType = (path: string): string => {
    const extension = path.split('.').pop()?.toLowerCase();
    switch (extension) {
        case 'png': return 'image/png';
        case 'jpg':
        case 'jpeg': return 'image/jpeg';
        case 'gif': return 'image/gif';
        case 'svg': return 'image/svg+xml';
        case 'webp': return 'image/webp';
        default: return 'application/octet-stream';
    }
}
