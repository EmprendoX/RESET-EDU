import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Trash2 } from 'lucide-react';
import {
  addMockMedia,
  listMockMedia,
  removeMockMedia,
  type MockMediaEntry,
} from '@/data/adminMediaMockStore';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/common/EmptyState';
import { AdminMockFileDropzone } from '@/components/admin/AdminMockFileDropzone';

const LIBRARY_ACCEPT =
  '.pdf,.ppt,.pptx,application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,image/jpeg,image/png,image/webp,image/gif';

export function MockMediaLibrary() {
  const qc = useQueryClient();
  const [items, setItems] = useState<MockMediaEntry[]>(() => listMockMedia());

  const hint = useMemo(
    () =>
      'Las URLs son locales al navegador (blob:). En Supabase irán a Storage con metadata en lesson_assets.',
    [],
  );

  function refresh() {
    setItems(listMockMedia());
  }

  function onPickFiles(files: File[]) {
    if (!files.length) return;
    for (const file of files) {
      const url = URL.createObjectURL(file);
      addMockMedia({
        file_name: file.name,
        file_type: file.type || 'application/octet-stream',
        object_url: url,
      });
    }
    refresh();
    void qc.invalidateQueries({ queryKey: ['admin', 'media-count'] });
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">{hint}</p>
      <AdminMockFileDropzone
        multiple
        accept={LIBRARY_ACCEPT}
        description="PDF, PowerPoint o imagen. Puedes arrastrar varios archivos."
        onFilesSelected={onPickFiles}
      />

      {items.length === 0 ? (
        <EmptyState
          title="Biblioteca vacía"
          description="Sube archivos de prueba para ver URLs blob en la lista."
        />
      ) : (
        <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-slate-900">
                  {item.file_name}
                </p>
                <p className="truncate font-mono text-xs text-slate-500">
                  {item.object_url}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    void navigator.clipboard.writeText(item.object_url);
                  }}
                >
                  Copiar URL
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-rose-600"
                  aria-label="Eliminar"
                  onClick={() => {
                    URL.revokeObjectURL(item.object_url);
                    removeMockMedia(item.id);
                    refresh();
                    void qc.invalidateQueries({
                      queryKey: ['admin', 'media-count'],
                    });
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
