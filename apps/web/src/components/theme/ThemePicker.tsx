'use client';

import { useState, useRef, useEffect } from 'react';
import { useThemeStore, THEMES, type ThemePalette } from '../../store/theme-store';
import { Palette, Check, X } from 'lucide-react';

export default function ThemePicker() {
  const { themeId, setTheme } = useThemeStore();
  const [isOpen, setIsOpen] = useState(false);
  const [panelPos, setPanelPos] = useState({ top: 0, right: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const current = THEMES.find((t) => t.id === themeId) || THEMES[0];

  // Re-measure trigger position whenever panel opens
  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPanelPos({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsOpen(false); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <>
      {/* Trigger button */}
      <button
        id="theme-picker-trigger"
        ref={triggerRef}
        onClick={() => setIsOpen((o) => !o)}
        title="Change color theme"
        aria-label="Change color theme"
        className="relative flex items-center justify-center w-9 h-9 rounded-xl border border-border bg-muted hover:bg-muted/80 active:scale-95 transition-all duration-150"
      >
        <Palette className="w-4 h-4 text-foreground opacity-80" />
        {/* Active color dot */}
        <span
          className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-background transition-colors duration-300"
          style={{ backgroundColor: current.preview[0] }}
        />
      </button>

      {/* Fixed-position dropdown — won't clip inside navbar */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[90]"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div
            className="fixed z-[100] w-72 rounded-2xl border border-border bg-popover shadow-2xl shadow-black/50 overflow-hidden animate-fade-in"
            style={{ top: panelPos.top, right: panelPos.right }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-border">
              <div>
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Palette className="w-4 h-4 text-primary" />
                  Color Theme
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">Pick your palette — saved automatically</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Palette options — grouped */}
            <div className="p-3 space-y-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-1 mb-2">🌑 Dark Themes</p>
              {THEMES.filter(t => t.isDark).map((theme) => (
                <ThemeOption
                  key={theme.id}
                  theme={theme}
                  isActive={themeId === theme.id}
                  onSelect={() => { setTheme(theme.id); setIsOpen(false); }}
                />
              ))}
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-1 mt-3 mb-2">☀️ Light Themes</p>
              {THEMES.filter(t => !t.isDark).map((theme) => (
                <ThemeOption
                  key={theme.id}
                  theme={theme}
                  isActive={themeId === theme.id}
                  onSelect={() => { setTheme(theme.id); setIsOpen(false); }}
                />
              ))}
            </div>

            {/* Live preview hint */}
            <div className="px-4 pb-4 pt-1">
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-muted/50 border border-border/50">
                <span className="text-base">✨</span>
                <p className="text-[11px] text-muted-foreground leading-tight">
                  Changes apply instantly across all pages
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

function ThemeOption({
  theme, isActive, onSelect,
}: {
  theme: ThemePalette;
  isActive: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      id={`theme-option-${theme.id}`}
      onClick={onSelect}
      className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 text-left group ${
        isActive
          ? 'border-primary/60 bg-primary/10 shadow-sm shadow-primary/10'
          : 'border-transparent hover:border-border hover:bg-muted/60'
      }`}
    >
      {/* Stacked color pills */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {theme.preview.map((color, i) => (
          <span
            key={i}
            className="block rounded-full border border-white/10 shadow-sm transition-transform group-hover:scale-110"
            style={{
              backgroundColor: color,
              width: i === 0 ? '18px' : i === 1 ? '14px' : '10px',
              height: i === 0 ? '18px' : i === 1 ? '14px' : '10px',
            }}
          />
        ))}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold leading-tight ${isActive ? 'text-primary' : 'text-foreground'}`}>
          {theme.name}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5 truncate">{theme.description}</p>
      </div>

      {/* Active check */}
      {isActive ? (
        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow-sm shadow-primary/30">
          <Check className="w-3 h-3 text-primary-foreground" />
        </div>
      ) : (
        <div className="flex-shrink-0 w-5 h-5 rounded-full border border-border group-hover:border-primary/40 transition-colors" />
      )}
    </button>
  );
}

