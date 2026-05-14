import { BookOpen, ListTree, NotebookPen, Sparkles } from 'lucide-react';
import type { MobileTab } from '@/types/classroom';
import { cn } from '@/lib/utils/cn';

interface Props {
  active: MobileTab;
  onChange: (tab: MobileTab) => void;
  className?: string;
}

const TABS: Array<{ id: MobileTab; label: string; Icon: typeof BookOpen }> = [
  { id: 'content', label: 'Contenido', Icon: BookOpen },
  { id: 'syllabus', label: 'Temario', Icon: ListTree },
  { id: 'notes', label: 'Notas', Icon: NotebookPen },
  { id: 'mentor', label: 'Mentor', Icon: Sparkles },
];

export function MobileClassroomTabs({ active, onChange, className }: Props) {
  return (
    <nav
      role="tablist"
      aria-label="Secciones del Aula"
      className={cn(
        'sticky bottom-0 z-30 grid grid-cols-4 border-t border-reset-border bg-reset-bg-1/95 backdrop-blur',
        className,
      )}
    >
      {TABS.map(({ id, label, Icon }) => {
        const isActive = id === active;
        return (
          <button
            key={id}
            role="tab"
            type="button"
            aria-selected={isActive}
            aria-controls={`tabpanel-${id}`}
            onClick={() => onChange(id)}
            className={cn(
              'focus-ring flex flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium transition',
              isActive
                ? 'text-brand-300'
                : 'text-reset-text-muted hover:text-white',
            )}
          >
            <Icon
              className={cn(
                'h-4 w-4',
                isActive ? 'text-brand-300' : 'text-reset-text-dim',
              )}
              aria-hidden
            />
            <span>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
