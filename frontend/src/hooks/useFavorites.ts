import { useCallback, useState } from "react";

const KEY = "dealership.favorites";

function read(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

/** Favorites are a per-browser convenience, so they live in localStorage. */
export function useFavorites() {
  const [ids, setIds] = useState<string[]>(read);

  const toggle = useCallback((id: string) => {
    setIds((prev) => {
      const next = prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id];
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        // Storage can be unavailable (private mode); the heart still works for this session.
      }
      return next;
    });
  }, []);

  return { isFavorite: (id: string) => ids.includes(id), toggle };
}
