import { Link, useNavigate } from 'react-router-dom';
import { FileStack, FileText, Film, Layers, type LucideIcon } from 'lucide-react';
import type { CourseStructure, CourseSection } from '@/types/course';
import type { FileType, Lesson, LessonProgress } from '@/types/lesson';
import { LessonStatusBadge, type LessonStatusVisual } from './LessonStatusBadge';
import { formatMinutes } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';

interface Props {
  structure: CourseStructure | null | undefined;
  currentLessonId: string | undefined;
  progressByLessonId: Map<string, LessonProgress>;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  onLessonNavigate?: () => void;
  className?: string;
}

const FILE_TYPE_ICONS: Record<FileType, LucideIcon> = {
  pdf: FileText,
  video: Film,
  pptx: FileText,
  text: FileText,
  mixed: FileStack,
  unsupported: FileText,
};

const FILE_TYPE_LABELS: Record<FileType, string> = {
  pdf: 'PDF',
  video: 'Video',
  pptx: 'Presentación',
  text: 'Texto',
  mixed: 'Mixto',
  unsupported: 'Recurso',
};

export function CourseSidebar({
  structure,
  currentLessonId,
  progressByLessonId,
  isLoading,
  isError,
  onRetry,
  onLessonNavigate,
  className,
}: Props) {
  if (isLoading) {
    return (
      <aside
        aria-label="Temario del curso"
        className={cn(
          'h-full overflow-y-auto border-r border-slate-200 bg-white',
          className,
        )}
      >
        <LoadingSkeleton variant="sidebar" rows={3} />
      </aside>
    );
  }
  if (isError) {
    return (
      <aside
        aria-label="Temario del curso"
        className={cn(
          'h-full overflow-y-auto border-r border-slate-200 bg-white',
          className,
        )}
      >
        <ErrorState
          title="No pudimos cargar el temario"
          onRetry={onRetry}
          compact
        />
      </aside>
    );
  }
  if (!structure || structure.lessons.length === 0) {
    return (
      <aside
        aria-label="Temario del curso"
        className={cn(
          'h-full overflow-y-auto border-r border-slate-200 bg-white',
          className,
        )}
      >
        <EmptyState
          title="Este curso aún no tiene lecciones"
          description="El instructor está armando el contenido. Vuelve más tarde."
          compact
        />
      </aside>
    );
  }

  const isLinear = structure.course.structure_type === 'linear';

  return (
    <aside
      aria-label="Temario del curso"
      className={cn(
        'scrollbar-thin h-full overflow-y-auto border-r border-slate-200 bg-white',
        className,
      )}
    >
      <div className="border-b border-slate-100 p-4">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          Temario
        </p>
        <h2 className="mt-1 text-sm font-semibold text-slate-900">
          {structure.course.title}
        </h2>
      </div>

      <div className="p-3">
        {isLinear ? (
          <ul role="list" className="space-y-1">
            {[...structure.lessons]
              .sort((a, b) => a.order_index - b.order_index)
              .map((lesson, idx) => (
                <SidebarLessonItem
                  key={lesson.id}
                  lesson={lesson}
                  index={idx + 1}
                  courseSlug={structure.course.slug}
                  isCurrent={lesson.id === currentLessonId}
                  progress={progressByLessonId.get(lesson.id)}
                  onLessonNavigate={onLessonNavigate}
                />
              ))}
          </ul>
        ) : (
          <ModularLessonsList
            structure={structure}
            currentLessonId={currentLessonId}
            progressByLessonId={progressByLessonId}
            onLessonNavigate={onLessonNavigate}
          />
        )}
      </div>
    </aside>
  );
}

function ModularLessonsList({
  structure,
  currentLessonId,
  progressByLessonId,
  onLessonNavigate,
}: {
  structure: CourseStructure;
  currentLessonId: string | undefined;
  progressByLessonId: Map<string, LessonProgress>;
  onLessonNavigate?: () => void;
}) {
  const sortedModules = [...structure.modules].sort(
    (a, b) => a.order_index - b.order_index,
  );

  return (
    <ol role="list" className="space-y-3">
      {sortedModules.map((module) => {
        const moduleSections = structure.sections
          .filter((s) => s.module_id === module.id)
          .sort((a, b) => a.order_index - b.order_index);
        const moduleLessons = structure.lessons
          .filter((l) => l.module_id === module.id)
          .sort((a, b) => a.order_index - b.order_index);

        return (
          <li key={module.id} className="space-y-1.5">
            <div className="flex items-center gap-2 px-1.5 py-1">
              <Layers className="h-3.5 w-3.5 text-slate-400" aria-hidden />
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {module.title}
              </p>
            </div>

            {moduleSections.length > 0 ? (
              <ul role="list" className="space-y-2 pl-1.5">
                {moduleSections.map((section) => (
                  <SectionGroup
                    key={section.id}
                    section={section}
                    lessons={moduleLessons.filter(
                      (l) => l.section_id === section.id,
                    )}
                    courseSlug={structure.course.slug}
                    currentLessonId={currentLessonId}
                    progressByLessonId={progressByLessonId}
                    onLessonNavigate={onLessonNavigate}
                  />
                ))}
              </ul>
            ) : (
              <ul role="list" className="space-y-1">
                {moduleLessons.map((lesson, idx) => (
                  <SidebarLessonItem
                    key={lesson.id}
                    lesson={lesson}
                    index={idx + 1}
                    courseSlug={structure.course.slug}
                    isCurrent={lesson.id === currentLessonId}
                    progress={progressByLessonId.get(lesson.id)}
                    onLessonNavigate={onLessonNavigate}
                  />
                ))}
              </ul>
            )}
          </li>
        );
      })}
    </ol>
  );
}

function SectionGroup({
  section,
  lessons,
  courseSlug,
  currentLessonId,
  progressByLessonId,
  onLessonNavigate,
}: {
  section: CourseSection;
  lessons: Lesson[];
  courseSlug: string;
  currentLessonId: string | undefined;
  progressByLessonId: Map<string, LessonProgress>;
  onLessonNavigate?: () => void;
}) {
  if (lessons.length === 0) return null;
  return (
    <li className="space-y-1">
      {section.title ? (
        <p className="px-2 text-[11px] font-medium text-slate-400">
          {section.title}
        </p>
      ) : null}
      <ul role="list" className="space-y-1">
        {lessons.map((lesson, idx) => (
          <SidebarLessonItem
            key={lesson.id}
            lesson={lesson}
            index={idx + 1}
            courseSlug={courseSlug}
            isCurrent={lesson.id === currentLessonId}
            progress={progressByLessonId.get(lesson.id)}
            onLessonNavigate={onLessonNavigate}
          />
        ))}
      </ul>
    </li>
  );
}

function SidebarLessonItem({
  lesson,
  index,
  courseSlug,
  isCurrent,
  progress,
  onLessonNavigate,
}: {
  lesson: Lesson;
  index: number;
  courseSlug: string;
  isCurrent: boolean;
  progress: LessonProgress | undefined;
  onLessonNavigate?: () => void;
}) {
  const navigate = useNavigate();
  const Icon = FILE_TYPE_ICONS[lesson.file_type] ?? FileText;

  const status: LessonStatusVisual = isCurrent
    ? 'current'
    : progress?.status === 'completed'
      ? 'completed'
      : 'pending';

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    onLessonNavigate?.();
    navigate(`/aprender/${courseSlug}/${lesson.id}`);
  }

  return (
    <li>
      <Link
        to={`/aprender/${courseSlug}/${lesson.id}`}
        onClick={handleClick}
        aria-current={isCurrent ? 'page' : undefined}
        className={cn(
          'focus-ring group flex items-start gap-2.5 rounded-lg px-2 py-2 text-sm transition',
          isCurrent
            ? 'bg-brand-50 text-brand-900 ring-1 ring-brand-200'
            : 'text-slate-700 hover:bg-slate-50',
        )}
      >
        <LessonStatusBadge status={status} className="mt-0.5" />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-1.5">
            <span
              className={cn(
                'shrink-0 text-[11px] font-medium tabular-nums',
                isCurrent ? 'text-brand-500' : 'text-slate-400',
              )}
            >
              {index.toString().padStart(2, '0')}
            </span>
            <p
              className={cn(
                'truncate text-sm',
                isCurrent ? 'font-semibold' : 'font-medium',
              )}
            >
              {lesson.title}
            </p>
          </div>
          <div className="mt-0.5 flex items-center gap-2 text-[11px] text-slate-400">
            <span className="inline-flex items-center gap-1">
              <Icon className="h-3 w-3" aria-hidden />
              {FILE_TYPE_LABELS[lesson.file_type]}
            </span>
            {lesson.duration_minutes ? (
              <span aria-hidden>·</span>
            ) : null}
            {lesson.duration_minutes ? (
              <span>{formatMinutes(lesson.duration_minutes)}</span>
            ) : null}
          </div>
        </div>
      </Link>
    </li>
  );
}
