"use client";

import { createContext, useCallback, useContext, useSyncExternalStore } from "react";

const ThemeContext = createContext({ theme: "light", toggle: () => {} });

export const useTheme = () => useContext(ThemeContext);

/**
 * Runs before first paint so the stored theme is applied without a flash of the
 * wrong colours. It is the only thing that decides the initial theme; the
 * provider below reads the class it sets rather than deciding again.
 */
export function ThemeScript() {
  const script = `(function(){try{var t=localStorage.getItem("theme");if(!t){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.classList.toggle("dark",t==="dark")}catch(e){}})();`;
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}

// The <html> class is the source of truth, which makes the theme an external
// store rather than React state. useSyncExternalStore reads it without an
// effect, so there is no extra render after hydration.
const listeners = new Set();

const themeStore = {
  subscribe(listener) {
    listeners.add(listener);
    window.addEventListener("storage", listener);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", listener);
    };
  },
  getSnapshot() {
    return document.documentElement.classList.contains("dark") ? "dark" : "light";
  },
  getServerSnapshot() {
    return "light";
  },
  set(theme) {
    document.documentElement.classList.toggle("dark", theme === "dark");
    try {
      window.localStorage.setItem("theme", theme);
    } catch {
      // Private browsing can reject writes; the toggle still works for this session.
    }
    for (const listener of listeners) listener();
  },
};

export function ThemeProvider({ children }) {
  const theme = useSyncExternalStore(
    themeStore.subscribe,
    themeStore.getSnapshot,
    themeStore.getServerSnapshot,
  );

  const toggle = useCallback(() => {
    themeStore.set(
      document.documentElement.classList.contains("dark") ? "light" : "dark",
    );
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>
  );
}
