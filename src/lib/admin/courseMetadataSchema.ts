import { z } from 'zod';

export const courseMetadataSchema = z.object({
  title: z.string().min(1, 'Título obligatorio').max(200),
  slug: z
    .string()
    .min(1, 'Slug obligatorio')
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Solo minúsculas, números y guiones',
    ),
  short_description: z.string().max(500),
  description: z.string().max(20000),
  category: z.string().max(100),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  cover_image_url: z.string().max(2000),
  structure_type: z.enum(['linear', 'modular']),
  status: z.enum(['draft', 'published', 'archived']),
  is_featured: z.boolean(),
  is_free: z.boolean(),
  price: z.string(),
  ai_context: z.string().max(50000),
});

export type CourseMetadataSchemaValues = z.infer<typeof courseMetadataSchema>;
