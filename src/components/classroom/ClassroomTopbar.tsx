import { Link } from 'react-router-dom';
import { ArrowLeft, Building2, GraduationCap, LayoutDashboard, User2 } from 'lucide-react';
import type { Course } from '@/types/course';
import type { Lesson } from '@/types/lesson';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { LessonProgressBar } from './progress/LessonProgressBar';
import { LessonNavigation } from './progress/LessonNavigation';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils/cn';

interface Props {
  course?: Course | null;
  lesson?: Lesson | null;
  percentage: number;
  totalLessons: number;
  completedLessons: number;
  previousLesson: Lesson | null;
  nextLesson: Lesson | null;
  isCompleted: boolean;
  isCompleting?: boolean;
  onComplete: () => void;
  loading?: boolean;
  className?: string;
}

export function ClassroomTopbar({
  course,
  lesson,
  percentage,
  totalLessons,
  completedLessons,
  previousLesson,
  nextLesson,
  isCompleted,
  isCompleting,
  onComplete,
  loading,
  className,
}: Props) {
  const { user } = useAuth();

  return (
    <header
      className={cn(
        'sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur',
        className,
      )}
      role="banner"
    >
      <div className="mx-auto flex max-w-[1600px] items-center gap-3 px-3 py-2.5 md:px-5">
        <Link
          to="/"
          aria-label="Volver al inicio"
          className="focus-ring inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
        </Link>

        <div className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 md:inline-flex">
          <GraduationCap className="h-5 w-5" aria-hidden />
        </div>

        <div className="min-w-0 flex-1">
          {loading || !course || !lesson ? (
            <LoadingSkeleton variant="topbar" rows={2} />
          ) : (
            <div className="flex flex-col gap-0.5">
              <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                {course.title}
              </p>
              <h1 className="truncate text-sm font-semibold text-slate-900 md:text-base">
                {lesson.title}
              </h1>
            </div>
          )}
        </div>

        <div className="hidden w-56 shrink-0 md:block">
          <LessonProgressBar
            percentage={percentage}
            totalLessons={totalLessons}
            completedLessons={completedLessons}
            compact
          />
        </div>

        <div className="hidden items-center gap-1 md:flex">
          <Link
            to="/dashboard"
            className="focus-ring rounded-lg px-2 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
          >
            <span className="inline-flex items-center gap-1">
              <LayoutDashboard className="h-3.5 w-3.5" aria-hidden />
              <span className="hidden lg:inline">Dashboard</span>
            </span>
          </Link>
          <Link
            to="/mi-negocio"
            className="focus-ring rounded-lg px-2 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
          >
            <span className="inline-flex items-center gap-1">
              <Building2 className="h-3.5 w-3.5" aria-hidden />
              <span className="hidden lg:inline">Mi negocio</span>
            </span>
          </Link>
        </div>

        <div className="hidden lg:block">
          <LessonNavigation
            courseSlug={course?.slug ?? ''}
            previousLesson={previousLesson}
            nextLesson={nextLesson}
            isCompleted={isCompleted}
            isCompleting={isCompleting}
            onComplete={onComplete}
            size="sm"
          />
        </div>

        <button
          type="button"
          aria-label={user.full_name ?? 'Cuenta'}
          className="focus-ring inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50"
        >
          <User2 className="h-4 w-4" aria-hidden />
        </button>
      </div>

      <div className="px-3 pb-2 md:hidden">
        <LessonProgressBar
          percentage={percentage}
          totalLessons={totalLessons}
          completedLessons={completedLessons}
          compact
        />
      </div>
    </header>
  );
}
