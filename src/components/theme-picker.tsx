"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Check, Palette } from "lucide-react";
import { applyTheme, THEME_KEY, themes } from "@/lib/themes";

const saved = () => {
  try {
    return themes.find((theme) => theme.id === localStorage.getItem(THEME_KEY)) ?? themes[0];
  } catch {
    return themes[0];
  }
};

export function ThemePicker() {
  const [open, setOpen] = useState(false);
  // The swatches only render once the menu is opened, so reading storage here can't cause a hydration mismatch.
  const [current, setCurrent] = useState(() => typeof window === "undefined" ? themes[0].id : saved().id);
  const root = useRef<HTMLDivElement>(null);

  // The inline script in the root layout already applied the saved theme; this re-applies it
  // after React's dev remount resets <html>.
  useLayoutEffect(() => applyTheme(saved()), []);

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false); };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("mousedown", close); document.removeEventListener("keydown", escape); };
  }, [open]);

  const choose = (id: string) => {
    const theme = themes.find((item) => item.id === id) ?? themes[0];
    applyTheme(theme);
    setCurrent(theme.id);
    try { localStorage.setItem(THEME_KEY, theme.id); } catch {}
  };

  return <div className="theme-picker" ref={root}>
    <button type="button" className="theme-toggle" aria-expanded={open} aria-haspopup="true" onClick={() => setOpen(!open)}><Palette size={14} /> <span>Theme</span></button>
    {open && <div className="theme-pop" role="radiogroup" aria-label="Choose a colour theme">
      <p>Choose a colour</p>
      <div className="theme-grid">
        {themes.map((theme) => <button key={theme.id} type="button" role="radio" aria-checked={current === theme.id} className={current === theme.id ? "theme-swatch is-active" : "theme-swatch"} onClick={() => choose(theme.id)} title={theme.name}>
          <span style={{ background: theme.bright, color: theme.ink }}>{current === theme.id && <Check size={14} strokeWidth={3} />}</span>
          <small>{theme.name}</small>
        </button>)}
      </div>
    </div>}
  </div>;
}
