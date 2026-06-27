"use client"

import * as React from "react"

type Theme = "light" | "dark" | "acrylic"

const THEMES: Theme[] = ["light", "dark", "acrylic"]
const DEFAULT_THEME: Theme = "acrylic"
const STORAGE_KEY = "theme"

type ThemeContextValue = {
  theme: Theme
  setTheme: (theme: string) => void
}

const ThemeContext = React.createContext<ThemeContextValue | null>(null)

function readStoredTheme(): Theme {
  if (typeof window === "undefined") {
    return DEFAULT_THEME
  }

  const stored = window.localStorage.getItem(STORAGE_KEY)
  return THEMES.includes(stored as Theme) ? (stored as Theme) : DEFAULT_THEME
}

function applyTheme(theme: Theme) {
  const root = document.documentElement
  root.classList.remove(...THEMES)
  root.classList.add(theme)
  root.style.colorScheme = theme === "light" ? "light" : "dark"
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<Theme>(DEFAULT_THEME)

  React.useEffect(() => {
    const storedTheme = readStoredTheme()
    setThemeState(storedTheme)
    applyTheme(storedTheme)
  }, [])

  const setTheme = React.useCallback((nextTheme: string) => {
    if (!THEMES.includes(nextTheme as Theme)) {
      return
    }

    const theme = nextTheme as Theme
    setThemeState(theme)
    window.localStorage.setItem(STORAGE_KEY, theme)
    applyTheme(theme)
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = React.useContext(ThemeContext)

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider")
  }

  return context
}
