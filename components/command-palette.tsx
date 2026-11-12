"use client";

import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { sections, site } from "@/content/site";
import { copyText } from "@/lib/copy-text";
import type { ThemeName } from "./theme";

type CommandGroup = "Navigate" | "Actions" | "Social";

type Command = {
  id: string;
  group: CommandGroup;
  label: string;
  hint?: string;
  keepOpen?: boolean;
  run: () => void | Promise<void>;
};

const groups: CommandGroup[] = ["Navigate", "Actions", "Social"];

function jumpTo(id: string) {
  const target = document.getElementById(id);
  if (!target) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  target.focus({ preventScroll: true });
}

export function CommandPalette({
  theme,
  onToggleTheme,
}: {
  theme: ThemeName;
  onToggleTheme: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [notice, setNotice] = useState("");

  const openPalette = useCallback(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (dialog.open) {
      dialog.close();
      return;
    }
    setQuery("");
    setActive(0);
    setNotice("");
    dialog.showModal();
    queueMicrotask(() => inputRef.current?.focus());
  }, []);

  useEffect(() => {
    function onKey(event: globalThis.KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        openPalette();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openPalette]);

  const commands: Command[] = [
    { id: "top", group: "Navigate", label: "Top", run: () => jumpTo("top") },
    ...sections.map((section) => ({
      id: section.id,
      group: "Navigate" as const,
      label: section.label,
      run: () => jumpTo(section.id),
    })),
    {
      id: "copy-email",
      group: "Actions",
      label: "Copy email",
      hint: site.email,
      keepOpen: true,
      run: async () => {
        const copied = await copyText(site.email);
        setNotice(copied ? "Copied email" : "Could not copy the email");
      },
    },
    {
      id: "copy-discord",
      group: "Actions",
      label: "Copy Discord username",
      hint: site.discordUsername,
      keepOpen: true,
      run: async () => {
        const copied = await copyText(site.discordUsername);
        setNotice(copied ? "Copied Discord username" : "Could not copy the username");
      },
    },
    {
      id: "resume",
      group: "Actions",
      label: "Open resume",
      run: () => {
        window.open(site.resume.href, "_blank", "noopener,noreferrer");
      },
    },
    {
      id: "theme",
      group: "Actions",
      label: theme === "dark" ? "Switch to light theme" : "Switch to dark theme",
      run: onToggleTheme,
    },
    ...site.socials.map((item) => ({
      id: `social-${item.label}`,
      group: "Social" as const,
      label: `Open ${item.label}`,
      hint: item.href,
      run: () => {
        window.open(item.href, "_blank", "noopener,noreferrer");
      },
    })),
  ];

  const normalized = query.trim().toLowerCase();
  const visible = commands.filter((command) =>
    `${command.label} ${command.hint ?? ""}`.toLowerCase().includes(normalized),
  );
  const selected = visible.length === 0 ? -1 : Math.min(active, visible.length - 1);

  async function run(command: Command | undefined) {
    if (!command) return;
    await command.run();
    if (!command.keepOpen) dialogRef.current?.close();
  }

  function onInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const next =
        event.key === "ArrowDown"
          ? Math.min(selected + 1, visible.length - 1)
          : Math.max(selected - 1, 0);
      if (next < 0) return;
      setActive(next);
      document.getElementById(`command-${visible[next]?.id}`)?.scrollIntoView({ block: "nearest" });
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      void run(visible[selected]);
    }
  }

  return (
    <>
      <button
        type="button"
        className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line px-3 text-sm hover:bg-surface"
        aria-label="Open command palette"
        aria-keyshortcuts="Control+K Meta+K"
        onClick={openPalette}
      >
        <span className="sm:hidden">Search</span>
        <kbd className="hidden rounded-md border border-line px-1.5 py-0.5 font-sans text-xs sm:inline">
          ⌘K
        </kbd>
      </button>
      <dialog
        ref={dialogRef}
        className="w-[min(36rem,calc(100%-1.5rem))] rounded-2xl border border-line bg-surface p-0 text-foreground shadow-2xl"
        aria-labelledby="command-palette-title"
        onClick={(event) => {
          if (event.target === event.currentTarget) event.currentTarget.close();
        }}
        onClose={() => {
          setQuery("");
          setActive(0);
          setNotice("");
        }}
      >
        <div className="border-b border-line px-4 py-3">
          <h2 id="command-palette-title" className="font-serif text-xl">
            Commands
          </h2>
          <label className="sr-only" htmlFor="command-input">
            Filter commands
          </label>
          <input
            id="command-input"
            ref={inputRef}
            role="combobox"
            aria-autocomplete="list"
            aria-expanded="true"
            aria-controls={listId}
            aria-activedescendant={selected >= 0 ? `command-${visible[selected].id}` : undefined}
            value={query}
            placeholder="Jump, copy, or open"
            spellCheck={false}
            autoCapitalize="off"
            className="mt-3 w-full bg-transparent text-base outline-none placeholder:text-muted"
            onChange={(event) => {
              setQuery(event.target.value);
              setActive(0);
            }}
            onKeyDown={onInputKeyDown}
          />
        </div>
        <div id={listId} role="listbox" aria-label="Commands" className="max-h-80 overflow-y-auto p-2">
          {visible.length === 0 ? (
            <p className="px-3 py-6 text-sm text-muted">No matching commands</p>
          ) : (
            groups.map((group) => {
              const items = visible.filter((command) => command.group === group);
              if (items.length === 0) return null;
              return (
                <div key={group} role="group" aria-label={group}>
                  <p className="px-3 pt-3 pb-1 text-xs tracking-[0.16em] text-muted uppercase">
                    {group}
                  </p>
                  {items.map((command) => {
                    const index = visible.indexOf(command);
                    const isSelected = index === selected;
                    return (
                      <div
                        key={command.id}
                        id={`command-${command.id}`}
                        role="option"
                        aria-selected={isSelected}
                        className={`flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-2 ${
                          isSelected ? "bg-brass text-brass-ink" : "hover:bg-surface-2"
                        }`}
                        onMouseEnter={() => setActive(index)}
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => void run(command)}
                      >
                        <span>{command.label}</span>
                        {command.hint ? (
                          <span
                            className={`max-w-[45%] truncate text-xs ${isSelected ? "opacity-80" : "text-muted"}`}
                          >
                            {command.hint.replace(/^https?:\/\//, "")}
                          </span>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-line px-4 py-3 text-xs text-muted">
          <p>↑↓ navigate · Enter run · Esc close</p>
          <p role="status">{notice}</p>
        </div>
      </dialog>
    </>
  );
}
