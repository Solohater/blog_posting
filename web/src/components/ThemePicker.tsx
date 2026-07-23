"use client";

import { useState } from "react";
import { useTheme } from "@/lib/theme-context";

export default function ThemePicker() {
  const { theme, setTheme, themes } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open && (
        <div className="mb-3 bg-card border border-border rounded-2xl shadow-xl p-3 max-w-[220px]">
          <p className="text-xs font-medium text-muted mb-2 px-1">Theme</p>
          <div className="grid grid-cols-4 gap-2">
            {themes.map((t) => (
              <button
                key={t.name}
                onClick={() => { setTheme(t.name); setOpen(false); }}
                title={t.label}
                className={`w-9 h-9 rounded-xl border-2 transition-all hover:scale-110 ${
                  theme.name === t.name ? "border-foreground scale-110" : "border-transparent"
                }`}
                style={{ background: t.colors["--primary"] }}
              />
            ))}
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen(!open)}
        className="w-11 h-11 rounded-full bg-primary text-white shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
          />
        </svg>
      </button>
    </div>
  );
}
