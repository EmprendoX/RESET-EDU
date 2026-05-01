import { useEffect, useState } from 'react';
import type { Course } from '@/types/course';
import type { Lesson } from '@/types/lesson';
import type { MentorMode } from '@/types/ai';
import type { CreateNoteInput } from '@/types/notes';
import { useAIMentor } from '@/hooks/useAIMentor';
import { useBusinessProfile } from '@/hooks/useBusinessProfile';
import { useNotes } from '@/hooks/useNotes';
import { useClassroomStore } from '@/stores/useClassroomStore';
import { detectFileType, getFileNameFromUrl } from '@/lib/files/fileType';
import { ErrorState } from '@/components/common/ErrorState';
import { AIChatWindow } from './AIChatWindow';
import { AIContextChips } from './AIContextChips';
import { AIInputBox } from './AIInputBox';
import { AIQuickActions } from './AIQuickActions';

interface Props {
  courseId: string | undefined;
  lessonId: string | undefined;
  course?: Course | null;
  lesson?: Lesson | null;
}

export function AIMentorPanel({ courseId, lessonId, course, lesson }: Props) {
  const fileContext = lesson
    ? {
        fileName:
          getFileNameFromUrl(lesson.pdf_url ?? lesson.file_url) ?? undefined,
        fileType: detectFileType({
          fileType: lesson.file_type,
          videoUrl: lesson.video_url,
          pdfUrl: lesson.pdf_url,
          fileUrl: lesson.file_url,
          contentText: lesson.content_text,
        }) as 'pdf' | 'video' | 'pptx' | 'text' | 'mixed',
      }
    : undefined;

  const { messages, isLoadingMessages, isError, isStreaming, sendMessage } =
    useAIMentor({ courseId, lessonId, fileContext });

  const { profile: businessProfile } = useBusinessProfile();
  const { createNote } = useNotes({ courseId, lessonId });

  const aiMode = useClassroomStore((s) => s.aiMode);
  const setAiMode = useClassroomStore((s) => s.setAiMode);
  const pendingPrompt = useClassroomStore((s) => s.pendingAIPrompt);
  const setPendingAIPrompt = useClassroomStore((s) => s.setPendingAIPrompt);
  const selectedText = useClassroomStore((s) => s.selectedText);
  const clearSelectedText = useClassroomStore((s) => s.clearSelectedText);

  const [stagedSelection, setStagedSelection] = useState<string | null>(null);
  const [draftSeed, setDraftSeed] = useState<string | undefined>(undefined);

  // When SelectedTextActionMenu pushes a pending prompt, prefill the input.
  useEffect(() => {
    if (pendingPrompt) {
      setDraftSeed(pendingPrompt);
      if (selectedText?.text) {
        setStagedSelection(selectedText.text);
      }
      // Clear immediately so refreshes of the panel don't re-stage.
      setPendingAIPrompt(null);
      clearSelectedText();
    }
  }, [pendingPrompt, selectedText?.text, setPendingAIPrompt, clearSelectedText]);

  function handleQuickPick({
    mode,
    prompt,
  }: {
    mode: MentorMode;
    prompt: string;
  }) {
    setAiMode(mode);
    void sendMessage({
      userMessage: prompt,
      mode,
      selectedText: stagedSelection ?? undefined,
    });
    setStagedSelection(null);
    setDraftSeed('');
  }

  function handleSend(text: string) {
    void sendMessage({
      userMessage: text,
      mode: aiMode,
      selectedText: stagedSelection ?? undefined,
    });
    setStagedSelection(null);
    setDraftSeed('');
  }

  async function handleSaveAsNote(input: CreateNoteInput) {
    await createNote(input);
  }

  if (isError) {
    return (
      <ErrorState
        title="No pudimos conectar con el mentor"
        description="Vuelve a intentar en unos segundos. Tus mensajes anteriores no se pierden."
      />
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 border-b border-slate-200 bg-white px-3 py-2.5">
        <AIContextChips
          course={course}
          lesson={lesson}
          business={businessProfile ?? null}
          mode={aiMode}
        />
        <div className="mt-2">
          <AIQuickActions onPick={handleQuickPick} disabled={isStreaming} />
        </div>
      </div>

      <AIChatWindow
        messages={messages}
        isStreaming={isStreaming}
        isLoading={isLoadingMessages}
        courseId={courseId}
        lessonId={lessonId}
        onSaveAsNote={handleSaveAsNote}
      />

      <AIInputBox
        onSend={handleSend}
        disabled={isStreaming || !courseId}
        initialValue={draftSeed}
        selectedTextPreview={stagedSelection ?? undefined}
        onClearSelection={() => setStagedSelection(null)}
        currentMode={aiMode}
      />
    </div>
  );
}
