import { Bookmark, BookmarkCheck } from 'lucide-react';
import type { CreateNoteInput } from '@/types/notes';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';
import { truncate } from '@/lib/utils/format';

interface Props {
  courseId: string | undefined;
  lessonId?: string;
  defaultTitle?: string;
  content: string;
  source: CreateNoteInput['source'];
  selectionMeta?: CreateNoteInput['selection_meta'];
  tags?: string[];
  onSave: (input: CreateNoteInput) => Promise<unknown>;
  size?: 'sm' | 'md';
  variant?: 'outline' | 'ghost' | 'primary';
  label?: string;
}

export function SaveAsNoteButton({
  courseId,
  lessonId,
  defaultTitle,
  content,
  source,
  selectionMeta,
  tags,
  onSave,
  size = 'sm',
  variant = 'outline',
  label = 'Guardar como nota',
}: Props) {
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleSave() {
    if (!courseId) return;
    try {
      setPending(true);
      await onSave({
        course_id: courseId,
        lesson_id: lessonId,
        title: defaultTitle?.trim() || truncate(content, 60),
        content,
        source,
        tags,
        selection_meta: selectionMeta,
      });
      setSaved(true);
    } finally {
      setPending(false);
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleSave}
      loading={pending}
      disabled={saved || !courseId}
      leftIcon={
        saved ? (
          <BookmarkCheck className="h-4 w-4 text-emerald-600" aria-hidden />
        ) : (
          <Bookmark className="h-4 w-4" aria-hidden />
        )
      }
    >
      {saved ? 'Guardada' : label}
    </Button>
  );
}
