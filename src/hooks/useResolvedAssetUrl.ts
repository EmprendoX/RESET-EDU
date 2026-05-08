import { useEffect, useState } from 'react';
import { getSupabase } from '@/lib/supabase/client';
import {
  getLessonAssetSignedUrl,
  isStoragePath,
} from '@/lib/storage/lessonAssetsRepo';

interface State {
  url: string | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Resuelve un valor de `pdf_url`/`file_url` a una URL utilizable:
 * - URL externa (http/https/blob/data) → se devuelve tal cual.
 * - Storage path (`course_id/lesson_id/...`) → se firma con TTL.
 * - Vacío → `url=null`, sin error.
 */
export function useResolvedAssetUrl(
  raw: string | undefined | null,
  ttl = 3600,
): State {
  const [state, setState] = useState<State>({
    url: null,
    loading: false,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;
    const trimmed = raw?.trim() ?? '';
    if (!trimmed) {
      setState({ url: null, loading: false, error: null });
      return;
    }
    if (!isStoragePath(trimmed)) {
      setState({ url: trimmed, loading: false, error: null });
      return;
    }
    const sb = getSupabase();
    if (!sb) {
      setState({
        url: null,
        loading: false,
        error: new Error('Supabase no está configurado'),
      });
      return;
    }
    setState({ url: null, loading: true, error: null });
    void (async () => {
      try {
        const signed = await getLessonAssetSignedUrl(sb, trimmed, ttl);
        if (!cancelled) {
          setState({ url: signed, loading: false, error: null });
        }
      } catch (err) {
        if (!cancelled) {
          setState({
            url: null,
            loading: false,
            error:
              err instanceof Error ? err : new Error('No se pudo firmar la URL'),
          });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [raw, ttl]);

  return state;
}
