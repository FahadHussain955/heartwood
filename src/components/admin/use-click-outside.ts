import { useEffect, type RefObject } from "react";

export function useClickOutside(ref: RefObject<HTMLElement | null>, onOutside: () => void, active: boolean) {
  useEffect(() => {
    if (!active) return;
    const handle = (event: MouseEvent) => { if (!ref.current?.contains(event.target as Node)) onOutside(); };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") onOutside(); };
    document.addEventListener("mousedown", handle);
    document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("mousedown", handle); document.removeEventListener("keydown", escape); };
  }, [ref, onOutside, active]);
}
