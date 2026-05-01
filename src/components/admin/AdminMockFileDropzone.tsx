import { useCallback, useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface AdminMockFileDropzoneProps {
  /** e.g. `image/*` or `.pdf,.ppt,.pptx` */
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  onFilesSelected: (files: File[]) => void;
  /** Secondary line under the title */
  description?: string;
  variant?: 'default' | 'compact';
}

export function AdminMockFileDropzone({
  accept,
  multiple = false,
  disabled = false,
  onFilesSelected,
  description,
  variant = 'default',
}: AdminMockFileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragDepthRef = useRef(0);

  const forwardFiles = useCallback(
    (list: FileList | null) => {
      if (!list?.length || disabled) return;
      const arr = Array.from(list);
      onFilesSelected(multiple ? arr : arr.slice(0, 1));
      if (inputRef.current) inputRef.current.value = '';
    },
    [disabled, multiple, onFilesSelected],
  );

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label="Arrastra un archivo aquí o haz clic para elegirlo"
      className={cn(
        'focus-ring rounded-xl border border-dashed transition-colors outline-none',
        variant === 'default' && 'border-slate-300 bg-slate-50/80 p-6',
        variant === 'compact' && 'border-slate-200 bg-white px-3 py-3',
        isDragging && !disabled && 'border-brand-400 bg-brand-50/40',
        disabled && 'cursor-not-allowed opacity-60',
        !disabled && 'cursor-pointer hover:border-slate-400',
      )}
      onKeyDown={(e) => {
        if (disabled) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
      onClick={() => {
        if (!disabled) inputRef.current?.click();
      }}
      onDragEnter={(e) => {
        e.preventDefault();
        e.stopPropagation();
        dragDepthRef.current += 1;
        setIsDragging(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        e.stopPropagation();
        dragDepthRef.current -= 1;
        if (dragDepthRef.current <= 0) {
          dragDepthRef.current = 0;
          setIsDragging(false);
        }
      }}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        dragDepthRef.current = 0;
        setIsDragging(false);
        forwardFiles(e.dataTransfer.files);
      }}
    >
      <input
        ref={inputRef}
        type="file"
        className="sr-only"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        onChange={(e) => forwardFiles(e.target.files)}
        onClick={(e) => e.stopPropagation()}
      />
      <div
        className={cn(
          'pointer-events-none flex flex-col items-center justify-center gap-2 text-center',
          variant === 'compact' && 'flex-row flex-wrap justify-start text-left',
        )}
      >
        <Upload
          className={cn(
            'shrink-0 text-slate-400',
            variant === 'default' ? 'h-8 w-8' : 'h-5 w-5',
          )}
          aria-hidden
        />
        <div className={cn(variant === 'compact' && 'min-w-0 flex-1')}>
          <p
            className={cn(
              'font-medium text-slate-800',
              variant === 'default' ? 'text-sm' : 'text-xs',
            )}
          >
            Arrastra tu archivo aquí o{' '}
            <span className="text-brand-700 underline decoration-brand-400/60 underline-offset-2">
              elige uno
            </span>
          </p>
          {description ? (
            <p
              className={cn(
                'mt-1 text-slate-500',
                variant === 'default' ? 'text-xs' : 'text-[11px]',
              )}
            >
              {description}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
