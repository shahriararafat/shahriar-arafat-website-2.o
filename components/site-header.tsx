"use client";

import { sections, site } from "@/content/site";
import { Clock } from "./clock";
import { CommandPalette } from "./command-palette";
import { toggleTheme, useTheme } from "./theme";

export function SiteHeader() {
  const theme = useTheme();
  const nextTheme = theme === "dark" ? "light" : "dark";

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3">
        <a href="#top" className="font-serif text-lg tracking-tight">
          <span className="sm:hidden">Shahriar</span>
          <span className="hidden sm:inline">{site.name}</span>
        </a>
        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <Clock />
          <button
            type="button"
            className="hidden min-h-11 items-center rounded-full border border-line px-3 text-sm hover:bg-surface sm:inline-flex"
            aria-label={`Switch to ${nextTheme} theme`}
            onClick={toggleTheme}
          >
            {theme === "dark" ? "Dark" : "Light"}
          </button>
          <CommandPalette theme={theme} onToggleTheme={toggleTheme} />
        </div>
      </div>
      <nav aria-label="Sections" className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-3 pb-3">
        {sections.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            className="shrink-0 rounded-full px-3 py-2 text-sm text-muted hover:bg-surface hover:text-foreground"
          >
            {section.label}
          </a>
        ))}
      </nav>
    </header>
  );
}
