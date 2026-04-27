import { useCallback, useState } from "react";

/**
 * Multi-select toggle for string ids (groups, tags, amenities).
 */
export function useToggleSet(initial: string[] = []) {
  const [selected, setSelected] = useState<string[]>(initial);

  const toggle = useCallback((id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }, []);

  const setAll = useCallback((next: string[]) => {
    setSelected(next);
  }, []);

  return { selected, setSelected: setAll, toggle };
}
