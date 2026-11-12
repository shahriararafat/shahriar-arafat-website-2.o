"use client";

import { useSyncExternalStore } from "react";

export type ThemeName = "dark" | "light";

const themeEvent = "theme-change";

function subscribe(onStoreChange: () => void) {
  window.addEventListener(themeEvent, onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener(themeEvent, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function readTheme(): ThemeName {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

export function useTheme(): ThemeName {
  return useSyncExternalStore(subscribe, readTheme, () => "dark");
}

export function toggleTheme() {
  const next: ThemeName = readTheme() === "light" ? "dark" : "light";
  document.documentElement.dataset.theme = next;
  try {
    localStorage.setItem("theme", next);
  } catch {
    // Storage can be blocked; the current page still switches.
  }
  window.dispatchEvent(new Event(themeEvent));
}
