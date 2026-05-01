import { useEffect } from 'react';

export interface ShortcutHandlers {
  /** Previous lesson — `j` (vim style) */
  onPrevious?: () => void;
  /** Next lesson — `k` (vim style, mirrors j) */
  onNext?: () => void;
  /** Toggle/open notes panel — `n` */
  onNewNote?: () => void;
  /** Toggle/open AI mentor — `i` */
  onOpenMentor?: () => void;
  /** Toggle help — `?` */
  onShowHelp?: () => void;
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  const tag = target.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers) {
  useEffect(() => {
    function handle(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (isEditableTarget(e.target)) return;

      switch (e.key) {
        case 'j':
          if (handlers.onPrevious) {
            e.preventDefault();
            handlers.onPrevious();
          }
          break;
        case 'k':
          if (handlers.onNext) {
            e.preventDefault();
            handlers.onNext();
          }
          break;
        case 'n':
          if (handlers.onNewNote) {
            e.preventDefault();
            handlers.onNewNote();
          }
          break;
        case 'i':
          if (handlers.onOpenMentor) {
            e.preventDefault();
            handlers.onOpenMentor();
          }
          break;
        case '?':
          if (handlers.onShowHelp) {
            e.preventDefault();
            handlers.onShowHelp();
          }
          break;
        default:
          break;
      }
    }

    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [handlers]);
}
