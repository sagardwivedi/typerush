import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  startTransition,
} from "react";
import type { ReactNode } from "react";

export type Theme = "light" | "dark" | "system";
export type SystemTheme = Exclude<Theme, "system">;

type ThemeProviderProps = {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
  disableTransitionOnChange?: boolean;
  enableSystem?: boolean;
  attribute?: string | false;
  value?: {
    light?: string;
    dark?: string;
  };
};

type ThemeProviderState = {
  theme: Theme;
  systemTheme: SystemTheme;
  resolvedTheme: SystemTheme;
  themes: Theme[];
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

const initialState: ThemeProviderState = {
  theme: "system",
  systemTheme: "light",
  resolvedTheme: "light",
  themes: ["light", "dark", "system"],
  setTheme: () => null,
  toggleTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "ui-theme",
  disableTransitionOnChange = true,
  enableSystem = true,
  attribute = "data-theme",
  value = { light: "light", dark: "dark" },
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === "undefined") return defaultTheme;

    try {
      return (localStorage.getItem(storageKey) as Theme) || defaultTheme;
    } catch (e) {
      return defaultTheme;
    }
  });

  const [systemTheme, setSystemTheme] = useState<SystemTheme>(() => {
    if (typeof window === "undefined") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  const resolvedTheme = useMemo<SystemTheme>(() => {
    return theme === "system" ? systemTheme : theme;
  }, [theme, systemTheme]);

  const themes = useMemo<Theme[]>(() => {
    return enableSystem ? ["light", "dark", "system"] : ["light", "dark"];
  }, [enableSystem]);

  const applyTheme = useCallback(
    (newTheme: Theme) => {
      const root = window.document.documentElement;
      let resolved: SystemTheme;

      // Disable transitions temporarily if enabled
      if (disableTransitionOnChange) {
        const css = document.createElement("style");
        css.textContent = `* {
          -webkit-transition: none !important;
          -moz-transition: none !important;
          -o-transition: none !important;
          transition: none !important;
        }`;
        document.head.appendChild(css);
      }

      // Remove all theme classes
      root.classList.remove(value.light || "light", value.dark || "dark");

      if (attribute !== false) {
        root.removeAttribute(attribute || "data-theme");
      }

      // Determine resolved theme
      if (newTheme === "system") {
        resolved = systemTheme;
      } else {
        resolved = newTheme;
      }

      // Apply the theme
      if (attribute === false) {
        root.classList.add(
          resolved === "light" ? value.light || "light" : value.dark || "dark"
        );
      } else {
        root.setAttribute(
          attribute || "data-theme",
          resolved === "light" ? value.light || "light" : value.dark || "dark"
        );
      }

      // Update meta theme-color if exists
      const themeColorMeta = document.querySelector('meta[name="theme-color"]');
      if (themeColorMeta) {
        themeColorMeta.setAttribute(
          "content",
          resolved === "light" ? "#ffffff" : "#000000"
        );
      }

      // Re-enable transitions after a frame
      if (disableTransitionOnChange) {
        const _ = window.getComputedStyle(root);
        requestAnimationFrame(() => {
          const styles = document.head.querySelectorAll("style");
          styles.forEach((style) => {
            if (style.textContent?.includes("transition: none !important")) {
              document.head.removeChild(style);
            }
          });
        });
      }

      return resolved;
    },
    [systemTheme, disableTransitionOnChange, attribute, value]
  );

  // Set initial theme and listen for system changes
  useEffect(() => {
    const resolved = applyTheme(theme);
    setSystemTheme(resolved);

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      const newSystemTheme = e.matches ? "dark" : "light";
      startTransition(() => {
        setSystemTheme(newSystemTheme);
        if (theme === "system") {
          applyTheme("system");
        }
      });
    };

    mediaQuery.addEventListener("change", handleSystemThemeChange);

    return () => {
      mediaQuery.removeEventListener("change", handleSystemThemeChange);
    };
  }, [theme, applyTheme]);

  const setTheme = useCallback(
    (newTheme: Theme) => {
      try {
        localStorage.setItem(storageKey, newTheme);
      } catch (e) {
        // Storage may be full or blocked
      }
      setThemeState(newTheme);
      applyTheme(newTheme);
    },
    [storageKey, applyTheme]
  );

  const toggleTheme = useCallback(() => {
    setTheme(theme === "light" ? "dark" : "light");
  }, [theme, setTheme]);

  const contextValue = useMemo(
    () => ({
      theme,
      systemTheme,
      resolvedTheme,
      themes,
      setTheme,
      toggleTheme,
    }),
    [theme, systemTheme, resolvedTheme, themes, setTheme, toggleTheme]
  );

  return (
    <ThemeProviderContext.Provider value={contextValue}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
};
