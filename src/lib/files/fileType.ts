import type { FileType } from '@/types/lesson';

export interface FileMeta {
  fileType: FileType;
  fileName?: string;
}

const VIDEO_HOSTS = [
  'youtube.com',
  'youtu.be',
  'youtube-nocookie.com',
  'vimeo.com',
  'player.vimeo.com',
  'iframe.mediadelivery.net',
  'cloudflarestream.com',
  'videodelivery.net',
];

export function isVideoUrl(url: string | undefined): boolean {
  if (!url) return false;
  try {
    const u = new URL(url);
    return VIDEO_HOSTS.some((h) => u.hostname.endsWith(h));
  } catch {
    return false;
  }
}

function getExtension(url: string): string | null {
  try {
    const path = new URL(url).pathname;
    const dot = path.lastIndexOf('.');
    if (dot === -1) return null;
    return path.slice(dot + 1).toLowerCase();
  } catch {
    return null;
  }
}

export function getFileNameFromUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  try {
    const u = new URL(url);
    const segments = u.pathname.split('/').filter(Boolean);
    const last = segments[segments.length - 1];
    return last ? decodeURIComponent(last) : undefined;
  } catch {
    return undefined;
  }
}

export function detectFileType(args: {
  fileType?: FileType;
  videoUrl?: string;
  pdfUrl?: string;
  fileUrl?: string;
  contentText?: string;
}): FileType {
  const { fileType, videoUrl, pdfUrl, fileUrl, contentText } = args;
  if (fileType) return fileType;
  if (videoUrl) return 'video';
  if (pdfUrl) return 'pdf';
  if (fileUrl) {
    const ext = getExtension(fileUrl);
    if (ext === 'pdf') return 'pdf';
    if (ext === 'pptx' || ext === 'ppt') return 'pptx';
    if (ext === 'mp4' || ext === 'webm' || ext === 'mov') return 'video';
    if (isVideoUrl(fileUrl)) return 'video';
  }
  if (contentText && contentText.trim().length > 0) return 'text';
  return 'unsupported';
}

export function pickPrimaryFileMeta(args: {
  fileType?: FileType;
  videoUrl?: string;
  pdfUrl?: string;
  fileUrl?: string;
  contentText?: string;
}): FileMeta {
  const fileType = detectFileType(args);
  const fileName =
    getFileNameFromUrl(args.pdfUrl) ??
    getFileNameFromUrl(args.fileUrl) ??
    undefined;
  return { fileType, fileName };
}
