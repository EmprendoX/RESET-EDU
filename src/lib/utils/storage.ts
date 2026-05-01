const NS = 'reset-edu:demo';

function key(name: string) {
  return `${NS}:${name}`;
}

function isBrowser() {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

export const demoStorage = {
  get<T>(name: string, fallback: T): T {
    if (!isBrowser()) return fallback;
    try {
      const raw = localStorage.getItem(key(name));
      if (!raw) return fallback;
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  },
  set<T>(name: string, value: T): void {
    if (!isBrowser()) return;
    try {
      localStorage.setItem(key(name), JSON.stringify(value));
    } catch {
      // ignore quota errors in demo
    }
  },
  remove(name: string): void {
    if (!isBrowser()) return;
    try {
      localStorage.removeItem(key(name));
    } catch {
      // ignore
    }
  },
};
