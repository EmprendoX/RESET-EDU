import { useCallback, useEffect, useRef } from 'react';
import { useClassroomStore } from '@/stores/useClassroomStore';
import type { SelectedTextPayload } from '@/types/classroom';
import type { SelectionMeta } from '@/types/notes';

const MIN_SELECTION_LENGTH = 3;

interface SourceMeta {
  sourceType: 'pdf' | 'text' | 'video';
  sourceMeta: SelectionMeta;
}

function readSourceMeta(node: Node | null): SourceMeta | null {
  let el: HTMLElement | null =
    node instanceof HTMLElement
      ? node
      : node?.parentElement ?? null;

  while (el) {
    if (el.dataset.selectable !== undefined) {
      const sourceType = (el.dataset.sourceType ?? 'text') as
        | 'pdf'
        | 'text'
        | 'video';
      const meta: SelectionMeta = {
        sourceType,
        page: el.dataset.page ? Number(el.dataset.page) : undefined,
        slide: el.dataset.slide ? Number(el.dataset.slide) : undefined,
        videoTimestamp: el.dataset.videoTimestamp
          ? Number(el.dataset.videoTimestamp)
          : undefined,
        fileName: el.dataset.fileName,
      };
      return { sourceType, sourceMeta: meta };
    }
    el = el.parentElement;
  }
  return null;
}

export function useSelectedText(): {
  clear: () => void;
} {
  const setSelectedText = useClassroomStore((s) => s.setSelectedText);
  const clearSelectedText = useClassroomStore((s) => s.clearSelectedText);
  const lastTextRef = useRef<string>('');

  useEffect(() => {
    function handleSelectionChange() {
      if (typeof window === 'undefined') return;
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed) {
        if (lastTextRef.current) {
          lastTextRef.current = '';
          clearSelectedText();
        }
        return;
      }
      const text = sel.toString().trim();
      if (text.length < MIN_SELECTION_LENGTH) {
        if (lastTextRef.current) {
          lastTextRef.current = '';
          clearSelectedText();
        }
        return;
      }
      const range = sel.getRangeAt(0);
      const meta = readSourceMeta(range.commonAncestorContainer);
      if (!meta) {
        if (lastTextRef.current) {
          lastTextRef.current = '';
          clearSelectedText();
        }
        return;
      }
      const rect = range.getBoundingClientRect();
      if (!rect || rect.width === 0) return;

      lastTextRef.current = text;
      const payload: SelectedTextPayload = {
        text,
        rect: {
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        },
        sourceType: meta.sourceType,
        sourceMeta: meta.sourceMeta,
      };
      setSelectedText(payload);
    }

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [setSelectedText, clearSelectedText]);

  const clear = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.getSelection()?.removeAllRanges();
    }
    lastTextRef.current = '';
    clearSelectedText();
  }, [clearSelectedText]);

  return { clear };
}
