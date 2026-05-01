import { cn } from '@/lib/utils/cn';
import type { MobileTab } from '@/types/classroom';

interface Props {
  topbar: React.ReactNode;
  sidebar: React.ReactNode;
  content: React.ReactNode;
  rightPanel: React.ReactNode;
  mobileTabs: React.ReactNode;
  activeMobileTab: MobileTab;
  className?: string;
}

export function ClassroomLayout({
  topbar,
  sidebar,
  content,
  rightPanel,
  mobileTabs,
  activeMobileTab,
  className,
}: Props) {
  return (
    <div
      className={cn(
        'flex h-[100dvh] min-h-0 w-full flex-col bg-slate-100 text-slate-900',
        className,
      )}
    >
      {topbar}

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <div
          className={cn(
            'h-full w-72 shrink-0 lg:block xl:w-80',
            activeMobileTab === 'syllabus' ? 'block' : 'hidden',
            'lg:!block',
          )}
        >
          {sidebar}
        </div>

        <div
          className={cn(
            'h-full min-w-0 flex-1 lg:block',
            activeMobileTab === 'content' ? 'block' : 'hidden',
            'lg:!block',
          )}
        >
          {content}
        </div>

        <div
          className={cn(
            'h-full w-full shrink-0 lg:w-[360px] xl:w-[400px]',
            activeMobileTab === 'notes' || activeMobileTab === 'mentor'
              ? 'block'
              : 'hidden',
            'lg:!block',
          )}
        >
          {rightPanel}
        </div>
      </div>

      <div className="lg:hidden">{mobileTabs}</div>
    </div>
  );
}
