import { useEffect, useMemo, useRef, useState } from 'react';
import { Document, Page } from 'react-pdf';
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FileText,
  Maximize2,
  Minus,
  Plus,
} from 'lucide-react';
import type { Lesson } from '@/types/lesson';
import { Button } from '@/components/ui/Button';
import { FileLoadingState } from '@/components/common/FileLoadingState';
import { FileErrorState } from '@/components/common/FileErrorState';
import { configurePdfWorker } from '@/lib/files/pdfWorker';
import { getFileNameFromUrl } from '@/lib/files/fileType';
import { cn } from '@/lib/utils/cn';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

configurePdfWorker();

interface Props {
  lesson: Lesson;
  embedded?: boolean;
}

const ZOOM_STEPS = [0.6, 0.75, 0.9, 1.0, 1.15, 1.3, 1.5, 1.75, 2.0];

export function PdfViewer({ lesson, embedded }: Props) {
  const url = lesson.pdf_url ?? lesson.file_url;
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1);
  const [loadError, setLoadError] = useState<Error | null>(null);
  const [pageWidth, setPageWidth] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const fileName = useMemo(
    () => getFileNameFromUrl(url ?? '') ?? 'Documento.pdf',
    [url],
  );

  // file prop must be stable to avoid re-fetches.
  const file = useMemo(() => (url ? { url } : null), [url]);

  useEffect(() => {
    function handleResize() {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      setPageWidth(Math.min(900, Math.max(280, w - 40)));
    }
    handleResize();
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!url) {
    return (
      <FileErrorState
        title="PDF no disponible"
        description="Esta lección no tiene un PDF configurado."
      />
    );
  }

  function handleLoadSuccess({ numPages: n }: { numPages: number }) {
    setNumPages(n);
    setPageNumber((p) => Math.min(Math.max(1, p), n));
  }

  function handleLoadError(err: Error) {
    setLoadError(err);
  }

  function changeScale(direction: 1 | -1) {
    setScale((current) => {
      const idx = ZOOM_STEPS.findIndex((v) => Math.abs(v - current) < 0.01);
      const baseIdx = idx === -1 ? ZOOM_STEPS.indexOf(1) : idx;
      const nextIdx = Math.max(
        0,
        Math.min(ZOOM_STEPS.length - 1, baseIdx + direction),
      );
      return ZOOM_STEPS[nextIdx];
    });
  }

  function requestFullscreen() {
    const el = containerRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void el.requestFullscreen?.();
    }
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        'flex h-full min-h-0 flex-col bg-slate-100',
        embedded ? 'rounded-2xl border border-slate-200 bg-white' : '',
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-white px-3 py-2 md:px-4">
        <div className="flex min-w-0 items-center gap-2 text-sm">
          <FileText className="h-4 w-4 shrink-0 text-rose-500" aria-hidden />
          <span className="truncate font-medium text-slate-800">
            {fileName}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
            disabled={pageNumber <= 1}
            aria-label="Página anterior"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
          </Button>
          <span
            aria-live="polite"
            className="px-1 text-xs tabular-nums text-slate-600"
          >
            {pageNumber} / {numPages ?? '–'}
          </span>
          <Button
            size="sm"
            variant="ghost"
            onClick={() =>
              setPageNumber((p) =>
                numPages ? Math.min(numPages, p + 1) : p + 1,
              )
            }
            disabled={Boolean(numPages && pageNumber >= numPages)}
            aria-label="Página siguiente"
          >
            <ChevronRight className="h-4 w-4" aria-hidden />
          </Button>
          <span className="mx-1 hidden h-5 w-px bg-slate-200 md:inline-block" />
          <Button
            size="sm"
            variant="ghost"
            onClick={() => changeScale(-1)}
            aria-label="Reducir zoom"
          >
            <Minus className="h-4 w-4" aria-hidden />
          </Button>
          <span className="px-1 text-xs tabular-nums text-slate-600">
            {Math.round(scale * 100)}%
          </span>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => changeScale(1)}
            aria-label="Aumentar zoom"
          >
            <Plus className="h-4 w-4" aria-hidden />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={requestFullscreen}
            aria-label="Pantalla completa"
          >
            <Maximize2 className="h-4 w-4" aria-hidden />
          </Button>
          <a href={url} target="_blank" rel="noopener noreferrer">
            <Button size="sm" variant="ghost" aria-label="Abrir en pestaña">
              <ExternalLink className="h-4 w-4" aria-hidden />
            </Button>
          </a>
        </div>
      </div>

      <div
        data-selectable
        data-source-type="pdf"
        data-page={pageNumber}
        data-file-name={fileName}
        className="scrollbar-thin flex min-h-0 flex-1 flex-col items-center overflow-auto bg-slate-200 px-3 py-4"
      >
        {loadError ? (
          <FileErrorState
            title="No pudimos cargar el PDF"
            description="Verifica tu conexión o abre el archivo en una pestaña nueva."
            fallbackUrl={url}
            onRetry={() => {
              setLoadError(null);
              setPageNumber(1);
            }}
          />
        ) : (
          <Document
            file={file}
            onLoadSuccess={handleLoadSuccess}
            onLoadError={handleLoadError}
            loading={<FileLoadingState label="Cargando PDF…" />}
            error={
              <FileErrorState
                title="No pudimos cargar el PDF"
                fallbackUrl={url}
              />
            }
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              width={pageWidth ?? undefined}
              renderAnnotationLayer
              renderTextLayer
              loading={<FileLoadingState label="Renderizando página…" />}
              className="overflow-hidden rounded-lg bg-white shadow"
            />
          </Document>
        )}
      </div>
    </div>
  );
}
