import { z } from 'zod';

const fileTypes = z.enum([
  'pdf',
  'video',
  'pptx',
  'text',
  'mixed',
  'unsupported',
]);

export const lessonFormSchema = z.object({
  title: z.string().min(1, 'Título obligatorio').max(300),
  description: z.string().max(2000),
  content_text: z.string().max(100000),
  ai_context: z.string().max(50000),
  video_url: z.string().max(2000),
  pdf_url: z.string().max(2000),
  file_url: z.string().max(2000),
  file_type: fileTypes,
  duration_minutes: z.coerce.number().int().min(0).max(24 * 60),
  order_index: z.coerce.number().int().min(0),
  is_preview: z.boolean(),
  status: z.enum(['draft', 'published']),
});

export type LessonFormSchemaValues = z.infer<typeof lessonFormSchema>;
