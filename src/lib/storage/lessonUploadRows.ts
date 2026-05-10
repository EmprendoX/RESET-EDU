import type { FileType } from '@/types/lesson';

/** Qué filas de `lesson_assets` reemplazar al subir (evita duplicados por lección). */
export type LessonAssetSlot = 'pdf' | 'pptx' | 'misc';

export interface LessonUploadRowConfig {
  id: string;
  label: string;
  hint: string;
  accept: string;
  applyPdf?: boolean;
  applyFile?: boolean;
  fileType: FileType;
  /** Coincide con la política de reemplazo en `persistLessonAssetAfterUpload`. */
  assetSlot: LessonAssetSlot;
  validate: (file: File) => string | null;
}

export const LESSON_UPLOAD_ROWS: LessonUploadRowConfig[] = [
  {
    id: 'pdf',
    label: 'PDF',
    hint: 'PDF para el visor del aula.',
    accept: 'application/pdf,.pdf',
    applyPdf: true,
    fileType: 'pdf',
    assetSlot: 'pdf',
    validate: (f) =>
      f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
        ? null
        : 'Selecciona un archivo PDF.',
  },
  {
    id: 'ppt',
    label: 'Presentación (PPT/PPTX)',
    hint: 'Se guarda como archivo; el visor de diapositivas usa PDF si lo exportas.',
    accept:
      '.ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation',
    applyFile: true,
    fileType: 'pptx',
    assetSlot: 'pptx',
    validate: (f) => {
      const n = f.name.toLowerCase();
      if (n.endsWith('.ppt') || n.endsWith('.pptx')) return null;
      if (
        f.type.includes('presentation') ||
        f.type.includes('powerpoint')
      ) {
        return null;
      }
      return 'Selecciona un PowerPoint (.ppt o .pptx).';
    },
  },
  {
    id: 'doc',
    label: 'Documento (Word)',
    hint: 'Archivo adjunto descargable.',
    accept:
      '.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    applyFile: true,
    fileType: 'unsupported',
    assetSlot: 'misc',
    validate: (f) => {
      const n = f.name.toLowerCase();
      if (n.endsWith('.doc') || n.endsWith('.docx')) return null;
      if (
        f.type.includes('word') ||
        f.type === 'application/msword'
      ) {
        return null;
      }
      return 'Selecciona un documento Word (.doc o .docx).';
    },
  },
  {
    id: 'image',
    label: 'Imagen',
    hint: 'Recurso visual (URL pública tras subir).',
    accept: 'image/jpeg,image/png,image/webp,image/gif,image/*',
    applyFile: true,
    fileType: 'unsupported',
    assetSlot: 'misc',
    validate: (f) =>
      f.type.startsWith('image/') ? null : 'Selecciona una imagen.',
  },
  {
    id: 'generic',
    label: 'Archivo genérico',
    hint: 'Cualquier archivo como recurso descargable.',
    accept: '*/*',
    applyFile: true,
    fileType: 'unsupported',
    assetSlot: 'misc',
    validate: () => null,
  },
];
