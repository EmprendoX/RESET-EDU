import { useEffect, useMemo } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { ClassroomLayout } from '@/components/classroom/ClassroomLayout';
import { ClassroomTopbar } from '@/components/classroom/ClassroomTopbar';
import { CourseSidebar } from '@/components/classroom/CourseSidebar';
import { LessonContentArea } from '@/components/classroom/LessonContentArea';
import { MobileClassroomTabs } from '@/components/classroom/MobileClassroomTabs';
import { RightLearningPanel } from '@/components/classroom/RightLearningPanel';
import { FileViewer } from '@/components/classroom/viewers/FileViewer';
import { LessonNavigation } from '@/components/classroom/progress/LessonNavigation';
import { NotesPanel } from '@/components/classroom/notes/NotesPanel';
import { AIMentorPanel } from '@/components/classroom/ai/AIMentorPanel';
import { SelectedTextActionMenu } from '@/components/classroom/notes/SelectedTextActionMenu';
import { ErrorState } from '@/components/common/ErrorState';
import {
  useCourseStructure,
  useFirstLessonId,
} from '@/hooks/useCourseStructure';
import { useLessonData } from '@/hooks/useLessonData';
import {
  computeCoursePercentage,
  useCourseProgress,
} from '@/hooks/useLessonProgress';
import { useNextPrevLesson } from '@/hooks/useNextPrevLesson';
import { useNotes } from '@/hooks/useNotes';
import { useSelectedText } from '@/hooks/useSelectedText';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useClassroomStore } from '@/stores/useClassroomStore';

export function ClassroomPage() {
  const { courseSlug, lessonId } = useParams();

  const structureQuery = useCourseStructure(courseSlug);
  const firstLessonQuery = useFirstLessonId(
    !lessonId ? courseSlug : undefined,
  );

  if (!courseSlug) {
    return <Navigate to="/" replace />;
  }

  if (!lessonId) {
    if (firstLessonQuery.isLoading) {
      return <FullScreenLoading />;
    }
    if (firstLessonQuery.data) {
      return (
        <Navigate
          to={`/aprender/${courseSlug}/${firstLessonQuery.data}`}
          replace
        />
      );
    }
    if (structureQuery.isError || firstLessonQuery.isError) {
      return (
        <FullScreenError
          onRetry={() => {
            void structureQuery.refetch();
            void firstLessonQuery.refetch();
          }}
        />
      );
    }
    return <FullScreenLoading />;
  }

  return (
    <ClassroomPageInner
      courseSlug={courseSlug}
      lessonId={lessonId}
    />
  );
}

function ClassroomPageInner({
  courseSlug,
  lessonId,
}: {
  courseSlug: string;
  lessonId: string;
}) {
  const navigate = useNavigate();
  const structureQuery = useCourseStructure(courseSlug);
  const lessonQuery = useLessonData({ courseSlug, lessonId });

  const structure = structureQuery.data ?? null;
  const lesson = lessonQuery.data?.lesson ?? null;
  const courseId = structure?.course.id;

  const { progressByLessonId, markStarted, markCompleted, isCompleting } =
    useCourseProgress(courseId);

  const { previous, next } = useNextPrevLesson(structure, lessonId);

  const activeMobileTab = useClassroomStore((s) => s.activeMobileTab);
  const setActiveMobileTab = useClassroomStore((s) => s.setActiveMobileTab);
  const rightPanelTab = useClassroomStore((s) => s.rightPanelTab);
  const setRightPanelTab = useClassroomStore((s) => s.setRightPanelTab);
  const openAiPanel = useClassroomStore((s) => s.openAiPanel);
  const setAiMode = useClassroomStore((s) => s.setAiMode);
  const setPendingAIPrompt = useClassroomStore((s) => s.setPendingAIPrompt);

  useSelectedText();
  const { createNote } = useNotes({ courseId, lessonId });

  useEffect(() => {
    if (!courseId || !lessonId) return;
    void markStarted(lessonId).catch(() => {
      /* mock-only: ignore in demo */
    });
  }, [courseId, lessonId, markStarted]);

  const totalLessons = structure?.lessons.length ?? 0;
  const completedLessons = useMemo(() => {
    if (!structure) return 0;
    let count = 0;
    structure.lessons.forEach((l) => {
      if (progressByLessonId.get(l.id)?.status === 'completed') count += 1;
    });
    return count;
  }, [structure, progressByLessonId]);

  const percentage = computeCoursePercentage(totalLessons, completedLessons);

  const currentProgress = progressByLessonId.get(lessonId);
  const isCompleted = currentProgress?.status === 'completed';

  const isLoading = structureQuery.isLoading || lessonQuery.isLoading;
  const isError = structureQuery.isError || lessonQuery.isError;

  useKeyboardShortcuts({
    onPrevious: previous
      ? () => navigate(`/aprender/${courseSlug}/${previous.id}`)
      : undefined,
    onNext: next
      ? () => navigate(`/aprender/${courseSlug}/${next.id}`)
      : undefined,
    onNewNote: () => {
      setRightPanelTab('notes');
      setActiveMobileTab('notes');
    },
    onOpenMentor: () => {
      setRightPanelTab('mentor');
      setActiveMobileTab('mentor');
    },
  });

  if (isError && !structure) {
    return (
      <FullScreenError
        onRetry={() => {
          void structureQuery.refetch();
          void lessonQuery.refetch();
        }}
      />
    );
  }

  async function handleComplete() {
    if (!lessonId) return;
    try {
      await markCompleted(lessonId);
      if (next) {
        navigate(`/aprender/${courseSlug}/${next.id}`);
      }
    } catch {
      /* mock-only: ignore in demo */
    }
  }

  return (
    <ClassroomLayout
      activeMobileTab={activeMobileTab}
      topbar={
        <ClassroomTopbar
          course={structure?.course}
          lesson={lesson}
          percentage={percentage}
          totalLessons={totalLessons}
          completedLessons={completedLessons}
          previousLesson={previous}
          nextLesson={next}
          isCompleted={isCompleted}
          isCompleting={isCompleting}
          onComplete={handleComplete}
          loading={isLoading}
        />
      }
      sidebar={
        <CourseSidebar
          structure={structure}
          currentLessonId={lessonId}
          progressByLessonId={progressByLessonId}
          isLoading={structureQuery.isLoading}
          isError={structureQuery.isError}
          onRetry={() => void structureQuery.refetch()}
          onLessonNavigate={() => setActiveMobileTab('content')}
        />
      }
      content={
        <LessonContentArea lesson={lesson} loading={lessonQuery.isLoading}>
          <FileViewer
            lesson={lesson}
            loading={lessonQuery.isLoading}
            isError={lessonQuery.isError}
            onRetry={() => void lessonQuery.refetch()}
          />
          <div className="border-t border-slate-200 bg-white px-3 py-3 lg:hidden">
            <LessonNavigation
              courseSlug={courseSlug}
              previousLesson={previous}
              nextLesson={next}
              isCompleted={isCompleted}
              isCompleting={isCompleting}
              onComplete={handleComplete}
              hideLabelOnMobile
              size="sm"
            />
          </div>
        </LessonContentArea>
      }
      rightPanel={
        <RightLearningPanel
          activeTab={rightPanelTab}
          onTabChange={setRightPanelTab}
          notesContent={
            <NotesPanel courseId={courseId} lessonId={lessonId} />
          }
          mentorContent={
            <AIMentorPanel
              courseId={courseId}
              lessonId={lessonId}
              course={structure?.course}
              lesson={lesson}
            />
          }
        />
      }
      mobileTabs={
        <>
          <SelectedTextActionMenu
            courseId={courseId}
            lessonId={lessonId}
            onSaveAsNote={async (input) => {
              await createNote(input);
              setRightPanelTab('notes');
              setActiveMobileTab('notes');
            }}
            onAskAI={({ initialPrompt, mode }) => {
              setAiMode(mode);
              setPendingAIPrompt(initialPrompt);
              openAiPanel();
            }}
          />
          <MobileClassroomTabs
            active={activeMobileTab}
            onChange={(t) => {
              setActiveMobileTab(t);
              if (t === 'notes') setRightPanelTab('notes');
              if (t === 'mentor') setRightPanelTab('mentor');
            }}
          />
        </>
      }
    />
  );
}

function FullScreenLoading() {
  return (
    <div className="flex h-[100dvh] items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-3 text-slate-500">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-300 border-t-brand-600" />
        <p className="text-sm">Cargando aula…</p>
      </div>
    </div>
  );
}

function FullScreenError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex h-[100dvh] items-center justify-center bg-slate-50 p-6">
      <ErrorState
        title="No pudimos cargar el aula"
        description="Revisa tu conexión y vuelve a intentar."
        onRetry={onRetry}
      />
    </div>
  );
}
