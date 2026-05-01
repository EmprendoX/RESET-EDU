import { useEffect, useRef, useState } from 'react';

export type AutosaveStatus = 'idle' | 'pending' | 'saving' | 'saved' | 'error';

interface Options<T> {
  value: T;
  onSave: (value: T) => Promise<void> | void;
  delay?: number;
  enabled?: boolean;
  shouldSave?: (value: T, lastSaved: T | undefined) => boolean;
}

/**
 * Generic debounced autosave. Drives an `AutosaveStatus` you can render in the
 * editor (e.g. "Guardado · hace 2s"). The first render does NOT save: the hook
 * waits until the value actually changes from `lastSaved`.
 */
export function useAutosave<T>({
  value,
  onSave,
  delay = 800,
  enabled = true,
  shouldSave,
}: Options<T>): { status: AutosaveStatus; flush: () => void } {
  const [status, setStatus] = useState<AutosaveStatus>('idle');
  const lastSavedRef = useRef<T | undefined>(undefined);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onSaveRef = useRef(onSave);
  const valueRef = useRef(value);

  onSaveRef.current = onSave;
  valueRef.current = value;

  useEffect(() => {
    if (!enabled) return;

    const last = lastSavedRef.current;
    const changed = shouldSave
      ? shouldSave(value, last)
      : !shallowEqual(value, last);

    if (!changed) return;

    setStatus('pending');
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(async () => {
      try {
        setStatus('saving');
        await onSaveRef.current(valueRef.current);
        lastSavedRef.current = valueRef.current;
        setStatus('saved');
      } catch {
        setStatus('error');
      }
    }, delay);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [value, enabled, delay, shouldSave]);

  function flush() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    void Promise.resolve(onSaveRef.current(valueRef.current))
      .then(() => {
        lastSavedRef.current = valueRef.current;
        setStatus('saved');
      })
      .catch(() => setStatus('error'));
  }

  return { status, flush };
}

function shallowEqual<T>(a: T, b: T | undefined): boolean {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (typeof a !== 'object' || typeof b !== 'object') return false;
  const ak = Object.keys(a as object);
  const bk = Object.keys(b as object);
  if (ak.length !== bk.length) return false;
  for (const k of ak) {
    const av = (a as Record<string, unknown>)[k];
    const bv = (b as Record<string, unknown>)[k];
    if (Array.isArray(av) && Array.isArray(bv)) {
      if (av.length !== bv.length || av.some((v, i) => v !== bv[i]))
        return false;
    } else if (av !== bv) {
      return false;
    }
  }
  return true;
}
