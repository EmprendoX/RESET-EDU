const STORAGE_KEY = 'reset-edu:admin:media';

export interface MockMediaEntry {
  id: string;
  file_name: string;
  file_type: string;
  object_url: string;
  created_at: string;
}

interface Snapshot {
  items: MockMediaEntry[];
}

function seed(): Snapshot {
  return { items: [] };
}

let memory: Snapshot = seed();

function load(): void {
  if (typeof localStorage === 'undefined') return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      memory = seed();
      return;
    }
    const data = JSON.parse(raw) as Snapshot;
    if (data?.items && Array.isArray(data.items)) {
      memory = data;
    } else {
      memory = seed();
    }
  } catch {
    memory = seed();
  }
}

function persist(): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(memory));
  } catch {
    /* ignore */
  }
}

if (typeof localStorage !== 'undefined') {
  load();
}

export function listMockMedia(): MockMediaEntry[] {
  return memory.items.map((i) => ({ ...i }));
}

export function addMockMedia(entry: Omit<MockMediaEntry, 'id' | 'created_at'> & { id?: string }): MockMediaEntry {
  const row: MockMediaEntry = {
    id: entry.id ?? `media_${Math.random().toString(36).slice(2, 11)}`,
    file_name: entry.file_name,
    file_type: entry.file_type,
    object_url: entry.object_url,
    created_at: new Date().toISOString(),
  };
  memory.items = [row, ...memory.items];
  persist();
  return row;
}

export function removeMockMedia(id: string): void {
  memory.items = memory.items.filter((i) => i.id !== id);
  persist();
}
