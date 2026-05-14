import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  User2,
} from 'lucide-react';
import type { Course } from '@/types/course';
import type { Lesson } from '@/types/lesson';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { LessonProgressBar } from './progress/LessonProgressBar';
import { LessonNavigation } from './progress/LessonNavigation';
import { useAuth } from '@/hooks/useAuth';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client';
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
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [signingOut, setSigningOut] = useState(false);
  const showSignOut = isSupabaseConfigured() && isAuthenticated;

  async function handleSignOut() {
    const sb = getSupabase();
    if (!sb) return;
    setSigningOut(true);
    try {
      await sb.auth.signOut();
      navigate('/?signedOut=1', { replace: true });
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <header
      className={cn(
        'sticky top-0 z-30 border-b border-reset-border bg-reset-bg-1/90 backdrop-blur',
        className,
      )}
      role="banner"
    >
      <div className="mx-auto flex max-w-[1600px] items-center gap-3 px-3 py-2.5 md:px-5">
        <Link
          to="/"
          aria-label="Volver al inicio"
          className="focus-ring inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-reset-text-muted hover:bg-reset-bg-3 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
        </Link>

        <div className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-500/15 text-brand-300 md:inline-flex">
          <GraduationCap className="h-5 w-5" aria-hidden />
        </div>

        <div className="min-w-0 flex-1">
          {loading || !course || !lesson ? (
            <LoadingSkeleton variant="topbar" rows={2} />
          ) : (
            <div className="flex flex-col gap-0.5">
              <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-reset-text-dim">
                {course.title}
              </p>
              <h1 className="truncate font-display text-sm font-semibold text-white md:text-base">
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
            className="focus-ring rounded-lg px-2 py-1.5 text-xs font-medium text-reset-text-muted hover:bg-reset-bg-3 hover:text-white"
          >
            <span className="inline-flex items-center gap-1">
              <LayoutDashboard className="h-3.5 w-3.5" aria-hidden />
              <span className="hidden lg:inline">Dashboard</span>
            </span>
          </Link>
          <Link
            to="/mi-negocio"
            className="focus-ring rounded-lg px-2 py-1.5 text-xs font-medium text-reset-text-muted hover:bg-reset-bg-3 hover:text-white"
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

        <div className="flex shrink-0 items-center gap-1">
          {showSignOut ? (
            <button
              type="button"
              disabled={signingOut}
              onClick={() => void handleSignOut()}
              className="focus-ring inline-flex items-center gap-1 rounded-lg border border-reset-border bg-reset-bg-2 px-2 py-1.5 text-xs font-medium text-reset-text-muted transition hover:bg-reset-bg-3 hover:text-white"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden />
              Salir
            </button>
          ) : null}
          <span
            className="focus-ring inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-reset-border bg-reset-bg-2 text-reset-text-muted"
            aria-label={user.full_name ?? 'Cuenta'}
          >
            <User2 className="h-4 w-4" aria-hidden />
          </span>
        </div>
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
