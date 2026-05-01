import { NotebookPen, Sparkles } from 'lucide-react';
import type { RightPanelTab } from '@/types/classroom';
import { cn } from '@/lib/utils/cn';

interface Props {
  activeTab: RightPanelTab;
  onTabChange: (tab: RightPanelTab) => void;
  notesContent: React.ReactNode;
  mentorContent: React.ReactNode;
  className?: string;
  showHeader?: boolean;
}

const TABS: Array<{ id: RightPanelTab; label: string; Icon: typeof NotebookPen }> =
  [
    { id: 'notes', label: 'Notas', Icon: NotebookPen },
    { id: 'mentor', label: 'Mentor IA', Icon: Sparkles },
  ];

export function RightLearningPanel({
  activeTab,
  onTabChange,
  notesContent,
  mentorContent,
  className,
  showHeader = true,
}: Props) {
  return (
    <aside
      aria-label="Panel de notas y mentor"
      className={cn(
        'flex h-full min-h-0 flex-col border-l border-slate-200 bg-white',
        className,
      )}
    >
      {showHeader ? (
        <div
          role="tablist"
          aria-label="Notas o Mentor IA"
          className="flex shrink-0 border-b border-slate-200"
        >
          {TABS.map(({ id, label, Icon }) => {
            const isActive = id === activeTab;
            return (
              <button
                key={id}
                role="tab"
                type="button"
                aria-selected={isActive}
                aria-controls={`right-panel-${id}`}
                onClick={() => onTabChange(id)}
                className={cn(
                  'focus-ring flex flex-1 items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-medium transition',
                  isActive
                    ? 'border-b-2 border-brand-500 text-brand-700'
                    : 'border-b-2 border-transparent text-slate-500 hover:text-slate-800',
                )}
              >
                <Icon className="h-4 w-4" aria-hidden />
                {label}
              </button>
            );
          })}
        </div>
      ) : null}

      <div className="min-h-0 flex-1 overflow-hidden">
        <div
          role="tabpanel"
          id="right-panel-notes"
          hidden={activeTab !== 'notes'}
          className="h-full"
        >
          {activeTab === 'notes' ? notesContent : null}
        </div>
        <div
          role="tabpanel"
          id="right-panel-mentor"
          hidden={activeTab !== 'mentor'}
          className="h-full"
        >
          {activeTab === 'mentor' ? mentorContent : null}
        </div>
      </div>
    </aside>
  );
}
